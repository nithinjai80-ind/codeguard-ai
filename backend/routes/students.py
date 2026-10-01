from flask import Blueprint, jsonify
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
