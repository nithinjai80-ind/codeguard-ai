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
