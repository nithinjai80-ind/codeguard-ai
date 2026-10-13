"""Quick end-to-end sandbox test for the student-function-only model."""
from routes.code_execution import _build_full_source, _safe_execute_code
from database import get_database

db = get_database()
q = db.questions.find_one({"id": "Q-0001"})
driver = q["driver_templates"]["Python"]
test_cases = q["test_cases"]

student_code = """def search(arr: list, target: int) -> int:
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1"""

full = _build_full_source(student_code, "Python", driver)
print("=== Full source (first 300 chars) ===")
print(full[:300], "\n...")

passed = 0
for i, tc in enumerate(test_cases):
    r = _safe_execute_code(full, "Python", tc["input"])
    ok = r["output"].strip() == tc["expected_output"].strip()
    if ok:
        passed += 1
    label = "PASS" if ok else "FAIL"
    sample = "(sample)" if tc.get("is_sample") else "(hidden)"
    print(f"TC {i+1} {sample}: {label} | got={r['output']!r} expected={tc['expected_output']!r}")

print(f"\nResult: {passed}/{len(test_cases)} test cases passed")
assert passed == len(test_cases), "Some test cases failed!"
print("All tests PASSED ✓")
