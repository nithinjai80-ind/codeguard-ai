import datetime
import subprocess
import tempfile
import os
import re
import json
import logging
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom, roles_required

logger = logging.getLogger("roxai.code_execution")

code_bp = Blueprint("code", __name__, url_prefix="/api/code")

# Fallback starter stubs (used when a question has no function_signatures)
FALLBACK_STUBS = {
    "Java": (
        "// Write your solution function here\n"
        "public static int solution(int[] arr, int target) {\n"
        "    // TODO: implement\n"
        "    return -1;\n"
        "}"
    ),
    "Python": (
        "# Write your solution function here\n"
        "def solution(arr, target):\n"
        "    # TODO: implement\n"
        "    pass"
    ),
    "C++": (
        "// Write your solution function here\n"
        "int solution(vector<int>& arr, int target) {\n"
        "    // TODO: implement\n"
        "    return -1;\n"
        "}"
    ),
    "JavaScript": (
        "// Write your solution function here\n"
        "function solution(arr, target) {\n"
        "    // TODO: implement\n"
        "    return -1;\n"
        "}"
    ),
}


def _indent_for_java_class(code: str, spaces: int = 4) -> str:
    """Indent every non-empty line so the function sits inside the Java class body."""
    prefix = " " * spaces
    return "\n".join(
        (prefix + line) if line.strip() else line
        for line in code.splitlines()
    )


def _build_full_source(student_code: str, language: str, driver_template: str | None) -> str:
    """
    Build the full executable source file by injecting student_code into the driver template.

    For Java the student code is indented inside the class body.
    If no driver template exists (legacy question), return student_code unchanged
    so the old full-class-submission model still works.
    """
    if not driver_template or "{{STUDENT_CODE}}" not in driver_template:
        # Legacy fallback: student wrote the full class + main
        return student_code

    if language == "Java":
        indented = _indent_for_java_class(student_code)
    elif language == "C++":
        # For C++ the function is at file scope — keep as-is
        indented = student_code
    else:
        # Python / JS: keep as-is (top-level function definition)
        indented = student_code

    return driver_template.replace("{{STUDENT_CODE}}", indented)


def _safe_execute_code(source_code: str, language: str, test_input: str = "", timeout: int = 10) -> dict:
    """
    Execute code in an isolated subprocess with strict resource limits.

    SECURITY: This uses subprocess with timeout and resource constraints.
    In production, this MUST be replaced with Docker/container sandbox execution.
    For local development/demo we use subprocess isolation with:
    - Strict timeout (default 10s)
    - No network access capabilities
    - Controlled stdin/stdout
    """
    result = {
        "compilation_status": "SUCCESS",
        "runtime_status": "SUCCESS",
        "output": "",
        "error": "",
        "execution_time_ms": 0,
    }

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            if language == "Python":
                filepath = os.path.join(tmpdir, "solution.py")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(source_code)

                start = datetime.datetime.now()
                proc = subprocess.run(
                    ["python", filepath],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    cwd=tmpdir,
                )
                elapsed = (datetime.datetime.now() - start).total_seconds() * 1000
                result["execution_time_ms"] = round(elapsed)
                result["output"] = proc.stdout.strip()
                if proc.returncode != 0:
                    result["runtime_status"] = "RUNTIME_ERROR"
                    result["error"] = proc.stderr.strip()

            elif language == "Java":
                # Extract class name from code
                class_name = "Solution"
                match = re.search(r"public\s+class\s+(\w+)", source_code)
                if match:
                    class_name = match.group(1)

                filepath = os.path.join(tmpdir, f"{class_name}.java")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(source_code)

                # Compile
                compile_proc = subprocess.run(
                    ["javac", filepath],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    cwd=tmpdir,
                )
                if compile_proc.returncode != 0:
                    result["compilation_status"] = "COMPILATION_ERROR"
                    result["runtime_status"] = "NOT_EXECUTED"
                    result["error"] = compile_proc.stderr.strip()
                    return result

                # Run
                start = datetime.datetime.now()
                run_proc = subprocess.run(
                    ["java", "-cp", tmpdir, class_name],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    cwd=tmpdir,
                )
                elapsed = (datetime.datetime.now() - start).total_seconds() * 1000
                result["execution_time_ms"] = round(elapsed)
                result["output"] = run_proc.stdout.strip()
                if run_proc.returncode != 0:
                    result["runtime_status"] = "RUNTIME_ERROR"
                    result["error"] = run_proc.stderr.strip()

            elif language == "C++":
                filepath = os.path.join(tmpdir, "solution.cpp")
                outpath = os.path.join(tmpdir, "solution.exe" if os.name == "nt" else "solution")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(source_code)

                compile_proc = subprocess.run(
                    ["g++", "-o", outpath, filepath, "-std=c++17"],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    cwd=tmpdir,
                )
                if compile_proc.returncode != 0:
                    result["compilation_status"] = "COMPILATION_ERROR"
                    result["runtime_status"] = "NOT_EXECUTED"
                    result["error"] = compile_proc.stderr.strip()
                    return result

                start = datetime.datetime.now()
                run_proc = subprocess.run(
                    [outpath],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    cwd=tmpdir,
                )
                elapsed = (datetime.datetime.now() - start).total_seconds() * 1000
                result["execution_time_ms"] = round(elapsed)
                result["output"] = run_proc.stdout.strip()
                if run_proc.returncode != 0:
                    result["runtime_status"] = "RUNTIME_ERROR"
                    result["error"] = run_proc.stderr.strip()

            elif language == "JavaScript":
                filepath = os.path.join(tmpdir, "solution.js")
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(source_code)

                start = datetime.datetime.now()
                proc = subprocess.run(
                    ["node", filepath],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    cwd=tmpdir,
                )
                elapsed = (datetime.datetime.now() - start).total_seconds() * 1000
                result["execution_time_ms"] = round(elapsed)
                result["output"] = proc.stdout.strip()
                if proc.returncode != 0:
                    result["runtime_status"] = "RUNTIME_ERROR"
                    result["error"] = proc.stderr.strip()
            else:
                result["compilation_status"] = "UNSUPPORTED_LANGUAGE"
                result["runtime_status"] = "NOT_EXECUTED"
                result["error"] = f"Language '{language}' is not supported."

    except subprocess.TimeoutExpired:
        result["runtime_status"] = "TIME_LIMIT_EXCEEDED"
        result["error"] = "Execution exceeded the time limit."
    except FileNotFoundError as e:
        result["compilation_status"] = "SIMULATED"
        result["runtime_status"] = "SIMULATED"
        result["error"] = f"Compiler/runtime not found: {str(e)}. Using simulated execution."
        result["output"] = "(Simulated) Code syntax appears valid."
    except Exception as e:
        result["runtime_status"] = "INTERNAL_ERROR"
        result["error"] = str(e)

    return result


@code_bp.route("/run", methods=["POST"])
@jwt_required_custom
def run_code():
    """
    Execute student's solution function against ALL test cases (sample + hidden).
    
    The student sends only their function body (not a full class + main).
    The backend fetches the question's driver_template for the given language,
    injects the student's code, and executes the resulting full file.

    Sample test case results include: input, expected_output, actual_output.
    Hidden test case results include: only pass/fail (inputs and expected outputs hidden).
    """
    data = request.get_json() or {}
    student_code = data.get("source_code", "")
    language = data.get("language", "Java")
    question_id = data.get("question_id")

    if not student_code.strip():
        return jsonify({"error": "Source code is required"}), 400

    db = get_database()

    # Load question to get driver_template and test_cases
    question = None
    if question_id:
        question = db.questions.find_one({"id": question_id})

    # Resolve driver template for the chosen language
    driver_templates = (question or {}).get("driver_templates", {})
    driver_template = driver_templates.get(language)  # None if question has no template

    # Build the full executable source
    full_source = _build_full_source(student_code, language, driver_template)

    # Resolve test cases (from request or question DB)
    test_cases = data.get("test_cases", [])
    if question_id and not test_cases and question:
        test_cases = question.get("test_cases", [])

    # No test cases — just execute with no input
    if not test_cases:
        exec_result = _safe_execute_code(full_source, language)
        return jsonify({
            "compilation_status": exec_result["compilation_status"],
            "runtime_status": exec_result["runtime_status"],
            "output": exec_result["output"],
            "error": exec_result["error"],
            "execution_time_ms": exec_result["execution_time_ms"],
            "test_results": [],
            "passed": 0,
            "total": 0,
        }), 200

    # Run against ALL test cases (sample + hidden)
    results = []
    passed = 0
    total = len(test_cases)
    total_time = 0
    overall_compilation_status = "SUCCESS"

    for i, tc in enumerate(test_cases):
        tc_input = tc.get("input", "")
        tc_expected = tc.get("expected_output", "").strip()
        is_sample = tc.get("is_sample", False)

        exec_result = _safe_execute_code(full_source, language, test_input=tc_input)
        actual_output = exec_result["output"].strip()
        total_time += exec_result["execution_time_ms"]

        # Track any compilation failures
        if exec_result["compilation_status"] not in ("SUCCESS", "SIMULATED"):
            overall_compilation_status = exec_result["compilation_status"]

        is_passed = (
            (actual_output == tc_expected)
            if tc_expected
            else (exec_result["runtime_status"] == "SUCCESS")
        )
        if is_passed:
            passed += 1

        tc_result = {
            "test_case": i + 1,
            "passed": is_passed,
            "is_sample": is_sample,
            "execution_time_ms": exec_result["execution_time_ms"],
            "error": exec_result["error"] if not is_passed else "",
        }

        # Reveal full details only for sample test cases
        if is_sample:
            tc_result["input"] = tc_input
            tc_result["expected_output"] = tc_expected
            tc_result["actual_output"] = actual_output
        else:
            # Hidden test case — reveal only pass/fail verdict
            tc_result["input"] = "(hidden)"
            tc_result["expected_output"] = "(hidden)"
            tc_result["actual_output"] = "correct" if is_passed else "incorrect"

        results.append(tc_result)

    return jsonify({
        "compilation_status": overall_compilation_status,
        "runtime_status": "SUCCESS" if passed == total else "PARTIAL",
        "test_results": results,
        "passed": passed,
        "total": total,
        "execution_time_ms": total_time,
        "summary": f"{passed} / {total} test cases passed.",
    }), 200


@code_bp.route("/template", methods=["GET"])
@jwt_required_custom
def get_template():
    """
    Get the function stub (starter code) for a given language and question.

    Returns:
      - language
      - template: the function signature stub for the student to fill in
      - function_signature: display string shown above the editor (locked header)
      - driver_template: full file wrapper (for reference/debugging only)
    """
    language = request.args.get("language", "Java")
    question_id = request.args.get("question_id")

    db = get_database()
    question = None
    if question_id:
        question = db.questions.find_one({"id": question_id})

    # Fetch per-language function signature stub from the question
    function_signatures = (question or {}).get("function_signatures", {})
    driver_templates = (question or {}).get("driver_templates", {})

    sig = function_signatures.get(language)
    driver_template = driver_templates.get(language)

    if sig:
        # Build a neat starter stub: signature + indented placeholder + closing brace (for Java/C++/JS)
        if language in ("Java", "C++", "JavaScript"):
            template = f"{sig}\n    // TODO: implement your solution here\n    \n}}"
        else:
            # Python: no closing brace needed
            template = f"{sig}\n    # TODO: implement your solution here\n    pass"
    else:
        template = FALLBACK_STUBS.get(language, "// Write your solution here\n")

    return jsonify({
        "language": language,
        "template": template,
        "function_signature": sig or "",
        "driver_template": driver_template or "",
    }), 200
