import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import hash_password, jwt_required_custom, roles_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# ===================== ADMIN DASHBOARD STATS =====================

@admin_bp.route("/stats", methods=["GET"])
@roles_required("ADMIN")
def get_admin_stats():
    """
    Platform-wide management statistics:
    - Total Students
    - Total Teachers
    - Questions
    - Assignments
    - Submissions
    - Review Cases
    """
    db = get_database()
    
    total_students = db.users.count_documents({"role": "STUDENT"})
    if total_students == 0:
        total_students = db.students.count_documents({})

    total_teachers = db.users.count_documents({"role": {"$in": ["TEACHER", "TUTOR"]}})
    
    total_questions = db.questions.count_documents({})
    if total_questions == 0:
        total_questions = db.assignments.count_documents({})
        
    total_assignments = db.assignments.count_documents({})
    total_submissions = db.submissions.count_documents({})
    
    review_cases = db.similarity_results.count_documents({"reviewScore": {"$gte": 50}})
    pending_submissions = db.submissions.count_documents({"status": "PENDING"})

    return jsonify({
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_questions": total_questions,
        "total_assignments": total_assignments,
        "total_submissions": total_submissions,
        "review_cases": review_cases,
        "pending_submissions": pending_submissions
    }), 200


# ===================== QUESTION MANAGEMENT =====================

@admin_bp.route("/questions", methods=["GET"])
@roles_required("ADMIN")
def list_questions():
    """Admin question bank: includes Draft and Published questions with submission count."""
    db = get_database()
    cursor = db.questions.find().sort("created_at", -1)
    questions = []
    
    for doc in cursor:
        q = serialize_doc(doc)
        q_id = q.get("id")
        q["submissions_count"] = db.submissions.count_documents({
            "$or": [{"question_id": q_id}, {"assignmentId": q_id}]
        })
        questions.append(q)

    # Fallback to assignments if questions collection is empty
    if not questions:
        for a_doc in db.assignments.find():
            a = serialize_doc(a_doc)
            questions.append({
                "id": a.get("id"),
                "title": a.get("title"),
                "description": a.get("description", ""),
                "language": a.get("language", "Java"),
                "difficulty": "MEDIUM",
                "status": "PUBLISHED",
                "submissions_count": a.get("totalSubmissions", 0),
                "created_by_name": "Academic Admin",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })

    return jsonify(questions), 200


@admin_bp.route("/questions", methods=["POST"])
@roles_required("ADMIN")
def create_question():
    """
    Create a new question:
    Form:
    - Title
    - Description (Problem Statement)
    - Input Format
    - Output Format
    - Constraints
    - Examples
    - Language (Java / Python / C++ / JavaScript)
    - Difficulty (Easy / Medium / Hard)
    - Time Limit (ms)
    - Memory Limit (MB)
    - Test Cases [{input, expected_output, is_sample, explanation}]
    - Allowed Languages
    - Status: Draft / Published
    """
    data = request.get_json() or {}
    db = get_database()
    user = getattr(g, "current_user", None)

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Question title is required"}), 400

    count = db.questions.count_documents({})
    question_id = f"Q-{count + 1:04d}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    question_doc = {
        "id": question_id,
        "title": title,
        "description": data.get("description", ""),
        "input_format": data.get("input_format", ""),
        "output_format": data.get("output_format", ""),
        "constraints": data.get("constraints", []),
        "examples": data.get("examples", []),
        "language": data.get("language", "Java"),
        "allowed_languages": data.get("allowed_languages", ["Java", "Python", "C++", "JavaScript"]),
        "difficulty": data.get("difficulty", "MEDIUM").upper(),
        "time_limit": data.get("time_limit", 2000),
        "memory_limit": data.get("memory_limit", 256),
        "test_cases": data.get("test_cases", []),
        "created_by": str(user["_id"]) if user else "ADMIN",
        "created_by_name": user.get("name", "System Administrator") if user else "System Administrator",
        "status": data.get("status", "PUBLISHED").upper(),
        "created_at": now_iso,
        "updated_at": now_iso
    }

    db.questions.insert_one(question_doc)
    return jsonify(serialize_doc(question_doc)), 201


@admin_bp.route("/questions/<question_id>", methods=["GET"])
@roles_required("ADMIN")
def get_question(question_id):
    db = get_database()
    question = db.questions.find_one({"id": question_id})
    if not question:
        return jsonify({"error": f"Question {question_id} not found"}), 404
    return jsonify(serialize_doc(question)), 200


@admin_bp.route("/questions/<question_id>", methods=["PATCH"])
@roles_required("ADMIN")
def update_question(question_id):
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


@admin_bp.route("/questions/<question_id>", methods=["DELETE"])
@roles_required("ADMIN")
def delete_question(question_id):
    db = get_database()
    question = db.questions.find_one({"id": question_id})
    if not question:
        return jsonify({"error": f"Question {question_id} not found"}), 404

    db.questions.delete_one({"id": question_id})
    return jsonify({"message": f"Question {question_id} deleted successfully"}), 200


# ===================== ASSIGNMENT MANAGEMENT =====================

@admin_bp.route("/assignments", methods=["GET"])
@roles_required("ADMIN")
def list_assignments():
    db = get_database()
    cursor = db.assignments.find().sort("dueDate", 1)
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200


@admin_bp.route("/assignments", methods=["POST"])
@roles_required("ADMIN")
def create_assignment():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Assignment title is required"}), 400

    db = get_database()
    count = db.assignments.count_documents({})
    assign_id = f"ASSIGN-{count + 1:02d}"

    new_assign = {
        "id": assign_id,
        "title": title,
        "courseCode": data.get("courseCode", "CS201"),
        "department": data.get("department", "Computer Science and Engineering"),
        "language": data.get("language", "Java"),
        "questions": data.get("questions", []),
        "targetClass": data.get("targetClass", "CSE-2026-Batch-A"),
        "totalSubmissions": 0,
        "requiringReview": 0,
        "averageSimilarity": 0,
        "dueDate": data.get("dueDate", "Oct 28, 2026"),
        "status": data.get("status", "ACTIVE"),
        "description": data.get("description", "Evaluation guidelines and problem set.")
    }

    db.assignments.insert_one(new_assign)
    return jsonify(serialize_doc(new_assign)), 201


@admin_bp.route("/assignments/<assignment_id>", methods=["PATCH"])
@roles_required("ADMIN")
def update_assignment(assignment_id):
    data = request.get_json() or {}
    db = get_database()

    assign = db.assignments.find_one({"id": assignment_id})
    if not assign:
        return jsonify({"error": f"Assignment {assignment_id} not found"}), 404

    allowed_fields = ["title", "courseCode", "department", "language", "dueDate", "status", "description", "targetClass"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    db.assignments.update_one({"id": assignment_id}, {"$set": update_data})
    updated = db.assignments.find_one({"id": assignment_id})
    return jsonify(serialize_doc(updated)), 200


# ===================== USER MANAGEMENT =====================

@admin_bp.route("/users", methods=["GET"])
@roles_required("ADMIN")
def list_users():
    """
    List all platform users: Students and Teachers.
    SECURITY: NEVER expose password or password_hash!
    """
    db = get_database()
    role_filter = request.args.get("role")
    
    query = {}
    if role_filter:
        query["role"] = "TEACHER" if role_filter in ["TEACHER", "TUTOR"] else role_filter

    cursor = db.users.find(query).sort("createdAt", -1)
    users = []

    for doc in cursor:
        u = serialize_doc(doc)
        # Scrub sensitive credentials
        u.pop("password", None)
        u.pop("password_hash", None)
        
        # Calculate stats for user
        user_id = str(u.get("_id"))
        user_email = u.get("email")

        if u.get("role") == "STUDENT":
            u["submissions_count"] = db.submissions.count_documents({
                "$or": [{"student_id": user_id}, {"studentEmail": user_email}, {"studentId": user_id}]
            })
            u["accepted_count"] = db.submissions.count_documents({
                "$or": [{"student_id": user_id}, {"studentEmail": user_email}],
                "status": "ACCEPTED"
            })
            u["pending_count"] = db.submissions.count_documents({
                "$or": [{"student_id": user_id}, {"studentEmail": user_email}],
                "status": "PENDING"
            })
        elif u.get("role") in ["TEACHER", "TUTOR"]:
            u["reviews_count"] = db.reviews.count_documents({"teacher_id": user_id})

        u["status"] = u.get("status", "ACTIVE")
        users.append(u)

    return jsonify(users), 200


@admin_bp.route("/users", methods=["POST"])
@roles_required("ADMIN")
def create_user():
    """
    Admin creates student or teacher account.
    Passwords must always be securely hashed with bcrypt.
    Never expose password in response.
    """
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    role = data.get("role", "STUDENT").upper()
    department = data.get("department", "Computer Science and Engineering").strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role in ["TEACHER", "TUTOR"]:
        role = "TEACHER"
    elif role not in ["ADMIN", "STUDENT"]:
        role = "STUDENT"

    db = get_database()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "A user with this email already exists"}), 409

    hashed_pw = hash_password(password)
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "role": role,
        "department": department,
        "status": "ACTIVE",
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    result = db.users.insert_one(new_user)
    new_user_id = str(result.inserted_id)

    # Return safe user object (no password or hash)
    return jsonify({
        "id": new_user_id,
        "name": name,
        "email": email,
        "role": role,
        "department": department,
        "status": "ACTIVE",
        "message": f"{role.capitalize()} user created successfully."
    }), 201


@admin_bp.route("/users/<user_id>", methods=["PATCH"])
@roles_required("ADMIN")
def update_user(user_id):
    """Update user information or activate/deactivate account."""
    data = request.get_json() or {}
    db = get_database()

    # Find user by string _id or email
    from bson import ObjectId
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db.users.find_one({"_id": user_id}) or db.users.find_one({"email": user_id})

    if not user:
        return jsonify({"error": f"User {user_id} not found"}), 404

    update_fields = {}
    if "name" in data:
        update_fields["name"] = data["name"].strip()
    if "department" in data:
        update_fields["department"] = data["department"].strip()
    if "status" in data:
        update_fields["status"] = data["status"].upper()
    if "role" in data and data["role"] in ["STUDENT", "TEACHER"]:
        update_fields["role"] = data["role"]
    if "password" in data and data["password"]:
        update_fields["password"] = hash_password(data["password"])

    if update_fields:
        db.users.update_one({"_id": user["_id"]}, {"$set": update_fields})

    updated = db.users.find_one({"_id": user["_id"]})
    u = serialize_doc(updated)
    u.pop("password", None)
    u.pop("password_hash", None)
    return jsonify(u), 200


# ===================== ADMIN REPORTS =====================

@admin_bp.route("/reports", methods=["GET"])
@roles_required("ADMIN")
def get_admin_reports():
    """Retrieve platform-wide integrity and assessment reports."""
    db = get_database()
    
    total_submissions = db.submissions.count_documents({})
    reviewed_submissions = db.submissions.count_documents({
        "status": {"$in": ["ACCEPTED", "REJECTED", "REVISION_REQUIRED"]}
    })
    
    avg_similarity = 24.5
    pairs = list(db.similarity_results.find())
    if pairs:
        avg_similarity = round(sum(p.get("reviewScore", 0) for p in pairs) / len(pairs), 1)

    return jsonify({
        "summary": {
            "total_submissions": total_submissions,
            "reviewed_submissions": reviewed_submissions,
            "average_similarity": avg_similarity,
            "active_questions": db.questions.count_documents({"status": "PUBLISHED"}),
            "total_students": db.users.count_documents({"role": "STUDENT"}),
            "total_teachers": db.users.count_documents({"role": {"$in": ["TEACHER", "TUTOR"]}})
        },
        "integrity_overview": {
            "flagged_cases": db.similarity_results.count_documents({"reviewScore": {"$gte": 75}}),
            "investigating_cases": db.similarity_results.count_documents({"reviewScore": {"$gte": 50, "$lt": 75}}),
            "acceptable_cases": db.similarity_results.count_documents({"reviewScore": {"$lt": 50}})
        }
    }), 200


# ===================== ADMIN SIMILARITY SETTINGS =====================

DEFAULT_SIMILARITY_SETTINGS = {
    "key": "similarity_settings",
    "tokenWeight": 20,
    "structuralWeight": 25,
    "semanticWeight": 30,
    "behavioralWeight": 15,
    "timelineWeight": 10,
    "reviewThreshold": 80.0,
    "highSimilarityThreshold": 60.0,
    "embeddingModel": "text-embedding-004",
    "aiAnalysisEnabled": True,
    "analysisVersion": "1.0"
}

@admin_bp.route("/settings/similarity", methods=["GET"])
@roles_required("ADMIN")
def get_similarity_settings():
    """Retrieve configurable similarity rules and weights."""
    db = get_database()
    doc = db.settings.find_one({"key": "similarity_settings"})
    if not doc:
        db.settings.insert_one(DEFAULT_SIMILARITY_SETTINGS.copy())
        doc = DEFAULT_SIMILARITY_SETTINGS
    return jsonify(serialize_doc(doc)), 200


@admin_bp.route("/settings/similarity", methods=["PATCH", "POST"])
@roles_required("ADMIN")
def update_similarity_settings():
    """Update similarity rules and weights. Validates that weights sum to 100%."""
    data = request.get_json() or {}
    db = get_database()

    # Validate weights total if weights are being updated
    weights_provided = {
        "tokenWeight": data.get("tokenWeight"),
        "structuralWeight": data.get("structuralWeight"),
        "semanticWeight": data.get("semanticWeight"),
        "behavioralWeight": data.get("behavioralWeight"),
        "timelineWeight": data.get("timelineWeight")
    }

    if any(v is not None for v in weights_provided.values()):
        # Fill missing with current
        current = db.settings.find_one({"key": "similarity_settings"}) or DEFAULT_SIMILARITY_SETTINGS
        tw = float(data.get("tokenWeight", current.get("tokenWeight", 20)))
        sw = float(data.get("structuralWeight", current.get("structuralWeight", 25)))
        semw = float(data.get("semanticWeight", current.get("semanticWeight", 30)))
        bw = float(data.get("behavioralWeight", current.get("behavioralWeight", 15)))
        tmw = float(data.get("timelineWeight", current.get("timelineWeight", 10)))

        total = tw + sw + semw + bw + tmw
        if abs(total - 100.0) > 0.01:
            return jsonify({
                "error": f"Similarity weights must total exactly 100%. Current sum: {total}%"
            }), 400

    data["key"] = "similarity_settings"
    db.settings.update_one(
        {"key": "similarity_settings"},
        {"$set": data},
        upsert=True
    )

    updated = db.settings.find_one({"key": "similarity_settings"})
    return jsonify(serialize_doc(updated)), 200

