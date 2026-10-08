import datetime
from flask import Blueprint, request, jsonify
from database import get_database, serialize_doc

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

@students_bp.route("", methods=["GET"])
def get_students():
    db = get_database()
    cursor = db.students.find()
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@students_bp.route("/<student_id>", methods=["GET"])
def get_student(student_id):
    db = get_database()
    student = db.students.find_one({"id": student_id})
    if not student:
        student = db.students.find_one({"rollNumber": student_id})
    if not student:
        return jsonify({"error": f"Student {student_id} not found"}), 404
    return jsonify(serialize_doc(student)), 200

@students_bp.route("/<student_id>", methods=["PATCH", "PUT"])
def update_student(student_id):
    data = request.get_json() or {}
    db = get_database()

    student = db.students.find_one({"id": student_id}) or db.students.find_one({"rollNumber": student_id})
    if not student:
        return jsonify({"error": f"Student {student_id} not found"}), 404

    allowed_fields = ["name", "email", "department", "batch", "status", "riskTier"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    db.students.update_one({"_id": student["_id"]}, {"$set": update_data})
    
    # Also update in users collection if email matches
    if "email" in student:
        user_update = {k: v for k, v in update_data.items() if k in ["name", "department", "status"]}
        if user_update:
            db.users.update_many({"email": student["email"]}, {"$set": user_update})

    updated = db.students.find_one({"_id": student["_id"]})
    return jsonify(serialize_doc(updated)), 200

@students_bp.route("/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    db = get_database()
    student = db.students.find_one({"id": student_id}) or db.students.find_one({"rollNumber": student_id})
    if not student:
        return jsonify({"error": f"Student {student_id} not found"}), 404

    email = student.get("email")
    db.students.delete_one({"_id": student["_id"]})
    if email:
        db.users.delete_many({"email": email, "role": "STUDENT"})

    return jsonify({"message": f"Student {student_id} deleted successfully"}), 200
