import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom, roles_required

questions_bp = Blueprint("questions", __name__, url_prefix="/api")

# ===================== ADMIN QUESTION MANAGEMENT =====================

@questions_bp.route("/admin/questions", methods=["GET"])
@roles_required("ADMIN")
def admin_get_questions():
    db = get_database()
    cursor = db.questions.find().sort("created_at", -1)
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@questions_bp.route("/admin/questions", methods=["POST"])
@roles_required("ADMIN")
def admin_create_question():
    data = request.get_json() or {}
    db = get_database()
    user = getattr(g, "current_user", None)

    count = db.questions.count_documents({})
    question_id = f"Q-{count + 1:04d}"

    question_doc = {
        "id": question_id,
        "title": data.get("title", "Untitled Question"),
        "description": data.get("description", ""),
        "input_format": data.get("input_format", ""),
        "output_format": data.get("output_format", ""),
        "constraints": data.get("constraints", []),
        "examples": data.get("examples", []),
        "language": data.get("language", "Java"),
        "allowed_languages": data.get("allowed_languages", ["Java", "Python", "C++", "JavaScript"]),
        "difficulty": data.get("difficulty", "MEDIUM"),
        "time_limit": data.get("time_limit", 2000),
        "memory_limit": data.get("memory_limit", 256),
        "test_cases": data.get("test_cases", []),
        "created_by": str(user["_id"]) if user else None,
        "created_by_name": user.get("name", "Admin") if user else "Admin",
        "status": data.get("status", "DRAFT"),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    db.questions.insert_one(question_doc)
    return jsonify(serialize_doc(question_doc)), 201

@questions_bp.route("/admin/questions/<question_id>", methods=["GET"])
@roles_required("ADMIN")
def admin_get_question(question_id):
    db = get_database()
    question = db.questions.find_one({"id": question_id})
    if not question:
        return jsonify({"error": f"Question {question_id} not found"}), 404
    return jsonify(serialize_doc(question)), 200

@questions_bp.route("/admin/questions/<question_id>", methods=["PATCH"])
@roles_required("ADMIN")
def admin_update_question(question_id):
    data = request.get_json() or {}
    db = get_database()

    question = db.questions.find_one({"id": question_id})
    if not question:
        return jsonify({"error": f"Question {question_id} not found"}), 404

    allowed_fields = [
        "title", "description", "input_format", "output_format",
        "constraints", "examples", "language", "allowed_languages",
        "difficulty", "time_limit", "memory_limit", "test_cases",
        "status"
    ]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    db.questions.update_one({"id": question_id}, {"$set": update_data})
    updated = db.questions.find_one({"id": question_id})
    return jsonify(serialize_doc(updated)), 200

@questions_bp.route("/admin/questions/<question_id>", methods=["DELETE"])
@roles_required("ADMIN")
def admin_delete_question(question_id):
    db = get_database()
    question = db.questions.find_one({"id": question_id})
    if not question:
        return jsonify({"error": f"Question {question_id} not found"}), 404

    db.questions.delete_one({"id": question_id})
    return jsonify({"message": f"Question {question_id} deleted successfully"}), 200

# ===================== STUDENT QUESTIONS VIEW =====================

@questions_bp.route("/student/questions", methods=["GET"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def student_get_questions():
    """Students and faculty can see PUBLISHED questions."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None

    cursor = db.questions.find({"status": "PUBLISHED"}).sort("created_at", -1)
    questions = []
    for doc in cursor:
        q = serialize_doc(doc)
        # Remove test case expected outputs from student view
        if "test_cases" in q:
            q["test_cases"] = [
                {"input": tc.get("input", ""), "is_sample": tc.get("is_sample", False)}
                for tc in q["test_cases"]
                if tc.get("is_sample", False)
            ]
        # Check if student has submitted for this question
        submission = db.submissions.find_one({
            "student_id": user_id,
            "question_id": q.get("id")
        })
        q["submission_status"] = submission.get("status") if submission else None
        q["submission_id"] = submission.get("id") if submission else None
        questions.append(q)

    return jsonify(questions), 200

@questions_bp.route("/student/questions/<question_id>", methods=["GET"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def student_get_question(question_id):
    """Student view of a single question - no hidden test case outputs."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None

    question = db.questions.find_one({"id": question_id, "status": "PUBLISHED"})
    if not question:
        return jsonify({"error": "Question not found"}), 404

    q = serialize_doc(question)
    # Only show sample test cases with expected output, hide hidden ones
    if "test_cases" in q:
        visible = []
        for tc in q["test_cases"]:
            if tc.get("is_sample", False):
                visible.append(tc)
            else:
                visible.append({"input": tc.get("input", ""), "is_sample": False})
        q["test_cases"] = visible

    # Check submission status
    submission = db.submissions.find_one({
        "student_id": user_id,
        "question_id": question_id
    })
    q["submission_status"] = submission.get("status") if submission else None
    q["submission_id"] = submission.get("id") if submission else None

    return jsonify(q), 200
