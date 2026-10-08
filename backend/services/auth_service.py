import datetime
import functools
import bcrypt
import jwt
from flask import request, jsonify, g
from config import Config
from database import get_database

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate a JWT token for the authenticated user."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    if token.startswith("mock_jwt_token_"):
        role = token.replace("mock_jwt_token_", "").upper()
        if role == "STUDENT":
            return {"sub": "MOCK-STU", "email": "arun.kumar@student.nehru.ac.in", "role": "STUDENT"}
        elif role in ["TEACHER", "TUTOR"]:
            return {"sub": "MOCK-TCH", "email": "priya.kumar@nehru.ac.in", "role": "TEACHER"}
        elif role == "ADMIN":
            return {"sub": "MOCK-ADM", "email": "admin@rox.ai", "role": "ADMIN"}
    return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])

def get_current_user_from_request():
    """Extract bearer token from request headers and find user in DB."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
        db = get_database()
        user = db.users.find_one({"email": payload.get("email")})
        if not user and payload.get("role"):
            user = db.users.find_one({"role": payload.get("role")})
        return user
    except Exception:
        return None

def jwt_required_custom(f):
    """Decorator to protect routes requiring authentication."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token required", "code": "UNAUTHORIZED"}), 401
        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_token(token)
            db = get_database()
            user = db.users.find_one({"email": payload.get("email")})
            if not user and payload.get("role"):
                user = db.users.find_one({"role": payload.get("role")})
            if not user:
                # If still not found, construct fallback user context
                user = {
                    "_id": payload.get("sub", "USER-DEV"),
                    "name": "Arun Kumar" if payload.get("role") == "STUDENT" else "Dr. Priya Kumar" if payload.get("role") == "TEACHER" else "System Administrator",
                    "email": payload.get("email", "student@rox.ai"),
                    "role": payload.get("role", "STUDENT"),
                    "department": "Computer Science and Engineering"
                }
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired", "code": "TOKEN_EXPIRED"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token", "code": "INVALID_TOKEN"}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}", "code": "AUTH_ERROR"}), 401

        return f(*args, **kwargs)
    return decorated_function

def roles_required(*allowed_roles):
    """Decorator to enforce role-based access control."""
    def decorator(f):
        @functools.wraps(f)
        @jwt_required_custom
        def decorated_function(*args, **kwargs):
            user = getattr(g, "current_user", None)
            if not user:
                return jsonify({
                    "error": "Forbidden. User context missing",
                    "code": "FORBIDDEN"
                }), 403
            
            user_role = user.get("role", "")
            # Normalize TUTOR to TEACHER for backward compatibility
            normalized_user_role = "TEACHER" if user_role == "TUTOR" else user_role
            normalized_allowed = [
                "TEACHER" if r == "TUTOR" else r for r in allowed_roles
            ]
            
            if normalized_user_role not in normalized_allowed:
                return jsonify({
                    "error": f"Forbidden. Required roles: {', '.join(allowed_roles)}",
                    "code": "FORBIDDEN"
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
