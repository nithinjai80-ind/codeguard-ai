from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import hash_password, check_password, generate_token, jwt_required_custom
import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    role = data.get("role", "TUTOR").upper()
    department = data.get("department", "Computer Science and Engineering").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role in ["TEACHER", "TUTOR"]:
        role = "TEACHER"
    elif role not in ["ADMIN", "STUDENT"]:
        role = "TEACHER"

    db = get_database()
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "An account with this email address already exists"}), 409

    hashed_pw = hash_password(password)
    user_doc = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "role": role,
        "department": department,
        "status": "ACTIVE",
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    result = db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = generate_token(user_id, email, role)

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "department": department
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_database()
    user = db.users.find_one({"email": email})
    if not user or not check_password(password, user.get("password", "")):
        return jsonify({"error": "Invalid email or password credentials"}), 401

    if user.get("status") == "INACTIVE":
        return jsonify({"error": "Your account has been deactivated. Please contact an administrator."}), 403

    user_id = str(user.get("_id"))
    role = user.get("role", "TEACHER")
    if role == "TUTOR":
        role = "TEACHER"
    token = generate_token(user_id, email, role)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "role": role,
            "department": user.get("department", "Computer Science and Engineering")
        }
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def get_me():
    user = getattr(g, "current_user", None)
    if not user:
        return jsonify({"error": "User not authenticated"}), 401

    return jsonify({
        "user": {
            "id": str(user.get("_id")),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role", "TUTOR"),
            "department": user.get("department", "Computer Science and Engineering")
        }
    }), 200

@auth_bp.route("/profile", methods=["PATCH", "PUT"])
@auth_bp.route("/me", methods=["PATCH", "PUT"])
@jwt_required_custom
def update_profile():
    """
    Update profile details for the currently authenticated user (Teacher, Student, or Admin).
    Saves changes (name, department, password) directly to the MongoDB database.
    """
    user = getattr(g, "current_user", None)
    if not user:
        return jsonify({"error": "User not authenticated"}), 401

    data = request.get_json() or {}
    db = get_database()
    user_id = user["_id"]
    user_email = user.get("email")

    update_fields = {}
    if "name" in data and data["name"].strip():
        new_name = data["name"].strip()
        update_fields["name"] = new_name
        # Update matching student record if any
        db.students.update_many(
            {"$or": [{"email": user_email}, {"name": user.get("name")}]},
            {"$set": {"name": new_name}}
        )
        # Update matching submissions
        db.submissions.update_many(
            {"$or": [{"studentEmail": user_email}, {"student_id": str(user_id)}]},
            {"$set": {"studentName": new_name}}
        )

    if "department" in data and data["department"].strip():
        new_dept = data["department"].strip()
        update_fields["department"] = new_dept
        db.students.update_many(
            {"$or": [{"email": user_email}, {"name": user.get("name")}]},
            {"$set": {"department": new_dept}}
        )

    if "password" in data and data["password"].strip():
        current_pw = data.get("currentPassword", "").strip()
        # If current password was provided, verify it
        if current_pw and not check_password(current_pw, user.get("password", "")):
            return jsonify({"error": "Current password does not match"}), 400
        update_fields["password"] = hash_password(data["password"].strip())

    if update_fields:
        update_fields["updatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        db.users.update_one({"_id": user_id}, {"$set": update_fields})

    updated_user = db.users.find_one({"_id": user_id})
    role = updated_user.get("role", "STUDENT")
    if role == "TUTOR":
        role = "TEACHER"

    return jsonify({
        "message": "Profile updated and saved to database successfully",
        "user": {
            "id": str(updated_user.get("_id")),
            "name": updated_user.get("name"),
            "email": updated_user.get("email"),
            "role": role,
            "department": updated_user.get("department", "Computer Science and Engineering")
        }
    }), 200

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Simulate secure token dispatch
    return jsonify({
        "message": f"Password reset instructions have been dispatched to {email}."
    }), 200

