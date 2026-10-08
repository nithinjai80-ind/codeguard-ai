import datetime
from flask import Blueprint, request, jsonify
from database import get_database, serialize_doc

assignments_bp = Blueprint("assignments", __name__, url_prefix="/api/assignments")

@assignments_bp.route("", methods=["GET"])
def get_assignments():
    db = get_database()
    cursor = db.assignments.find()
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@assignments_bp.route("", methods=["POST"])
def create_assignment():
    data = request.get_json() or {}
    db = get_database()

    count = db.assignments.count_documents({})
    assign_id = data.get("id") or f"ASSIGN-{count + 1 < 10 and '0' or ''}{count + 1}"

    new_assign = {
        "id": assign_id,
        "title": data.get("title", "New Programming Assignment"),
        "courseCode": data.get("courseCode", "CS202"),
        "department": data.get("department", "Computer Science and Engineering"),
        "language": data.get("language", "Java"),
        "totalSubmissions": 0,
        "requiringReview": 0,
        "averageSimilarity": 0,
        "dueDate": data.get("dueDate", "Nov 15, 2026"),
        "status": data.get("status", "ACTIVE"),
        "description": data.get("description", "Assignment problem statement and evaluation guidelines.")
    }

    db.assignments.insert_one(new_assign)
    return jsonify(serialize_doc(new_assign)), 201

@assignments_bp.route("/<assignment_id>", methods=["PATCH", "PUT"])
def update_assignment(assignment_id):
    data = request.get_json() or {}
    db = get_database()

    assign = db.assignments.find_one({"id": assignment_id})
    if not assign:
        return jsonify({"error": f"Assignment {assignment_id} not found"}), 404

    allowed_fields = ["title", "courseCode", "department", "language", "dueDate", "status", "description", "targetClass"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    db.assignments.update_one({"id": assignment_id}, {"$set": update_data})
    updated = db.assignments.find_one({"id": assignment_id})
    return jsonify(serialize_doc(updated)), 200

@assignments_bp.route("/<assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    db = get_database()
    assign = db.assignments.find_one({"id": assignment_id})
    if not assign:
        return jsonify({"error": f"Assignment {assignment_id} not found"}), 404

    db.assignments.delete_one({"id": assignment_id})
    return jsonify({"message": f"Assignment {assignment_id} deleted successfully"}), 200
