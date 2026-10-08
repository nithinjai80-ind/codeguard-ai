import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom, roles_required
from services.analysis_engine.pipeline import AnalysisPipeline

student_bp = Blueprint("student", __name__, url_prefix="/api/student")

@student_bp.route("/stats", methods=["GET"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def get_student_stats():
    """
    Student dashboard statistics:
    - Questions Available
    - Submitted
    - Accepted
    - Pending Review
    - Needs Revision
    """
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None
    user_email = user.get("email") if user else None

    # Available published questions
    questions_available = db.questions.count_documents({"status": "PUBLISHED"})

    # Student submissions query
    sub_query = {
        "$or": [
            {"student_id": user_id},
            {"studentId": user_id},
            {"studentEmail": user_email}
        ]
    }

    submissions = list(db.submissions.find(sub_query))
    total_submitted = len(submissions)
    accepted = sum(1 for s in submissions if s.get("status") in ["ACCEPTED", "RESOLVED_ACCEPTABLE", "Code Accepted"])
    pending = sum(1 for s in submissions if s.get("status") in ["PENDING", "ANALYZED", "REVIEW_REQUIRED", "INVESTIGATING"])
    revision_required = sum(1 for s in submissions if s.get("status") in ["REVISION_REQUIRED", "RESOLVED_VIVA_REQUIRED"])
    rejected = sum(1 for s in submissions if s.get("status") in ["REJECTED", "ESCALATED_DISCIPLINARY"])

    return jsonify({
        "student_name": user.get("name", "Student") if user else "Student",
        "questions_available": questions_available,
        "submitted": total_submitted,
        "accepted": accepted,
        "pending_review": pending,
        "needs_revision": revision_required,
        "rejected": rejected
    }), 200


@student_bp.route("/questions", methods=["GET"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def get_student_questions():
    """List published questions with submission status for the current student."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None
    user_email = user.get("email") if user else None

    questions_cursor = db.questions.find({"status": "PUBLISHED"}).sort("created_at", -1)
    results = []

    for doc in questions_cursor:
        q = serialize_doc(doc)
        # Filter test cases: only show sample test cases, never hidden test cases
        if "test_cases" in q:
            q["test_cases"] = [
                {
                    "input": tc.get("input", ""),
                    "expected_output": tc.get("expected_output", "") if tc.get("is_sample", False) else None,
                    "is_sample": tc.get("is_sample", False),
                    "explanation": tc.get("explanation", "")
                }
                for tc in q["test_cases"]
                if tc.get("is_sample", False)
            ]

        # Check this student's submission status for this question
        q_id = q.get("id") or str(q.get("_id"))
        submission = db.submissions.find_one({
            "$or": [
                {"question_id": q_id, "student_id": user_id},
                {"question_id": q_id, "studentEmail": user_email},
                {"questionId": q_id, "student_id": user_id},
                {"questionId": q_id, "studentEmail": user_email},
                {"assignmentId": q_id, "student_id": user_id},
                {"assignmentId": q_id, "studentEmail": user_email}
            ]
        })

        if submission:
            q["submission_status"] = submission.get("status", "PENDING")
            q["submission_id"] = submission.get("id") or str(submission.get("_id"))
            q["submitted_at"] = submission.get("submitted_at") or submission.get("submittedAt")
            q["teacher_comment"] = submission.get("teacher_comment")
        else:
            q["submission_status"] = None
            q["submission_id"] = None

        results.append(q)

    return jsonify(results), 200


@student_bp.route("/questions/<question_id>", methods=["GET"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def get_student_question(question_id):
    """Retrieve full details for a published question (with only sample test cases)."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None
    user_email = user.get("email") if user else None

    question = db.questions.find_one({
        "$or": [{"id": question_id}, {"_id": question_id}],
        "status": "PUBLISHED"
    })

    if not question:
        # Fallback to check assignment collection
        assign = db.assignments.find_one({"id": question_id})
        if assign:
            question = {
                "id": assign.get("id"),
                "title": assign.get("title"),
                "description": assign.get("description", ""),
                "language": assign.get("language", "Java"),
                "difficulty": "MEDIUM",
                "time_limit": 2000,
                "memory_limit": 256,
                "input_format": "Standard input as specified in problem description.",
                "output_format": "Return or print calculated value.",
                "constraints": ["Array length up to 10^5", "Time limit 2.0s"],
                "examples": [
                    {
                        "input": "arr = [2, 5, 8, 12, 16, 23, 38], target = 23",
                        "output": "5",
                        "explanation": "Target 23 is present at index 5."
                    }
                ],
                "test_cases": [
                    {"input": "23", "expected_output": "5", "is_sample": True}
                ]
            }

    if not question:
        return jsonify({"error": f"Question {question_id} not found or not published"}), 404

    q = serialize_doc(question)
    # Hide hidden test case answers
    if "test_cases" in q:
        q["test_cases"] = [
            {
                "input": tc.get("input", ""),
                "expected_output": tc.get("expected_output", "") if tc.get("is_sample", False) else None,
                "is_sample": tc.get("is_sample", False),
                "explanation": tc.get("explanation", "")
            }
            for tc in q["test_cases"]
        ]

    # Student submission check
    q_id = q.get("id") or str(q.get("_id"))
    submission = db.submissions.find_one({
        "$or": [
            {"question_id": q_id, "student_id": user_id},
            {"question_id": q_id, "studentEmail": user_email},
            {"assignmentId": q_id, "student_id": user_id},
            {"assignmentId": q_id, "studentEmail": user_email}
        ]
    })

    if submission:
        q["submission_status"] = submission.get("status", "PENDING")
        q["submission_id"] = submission.get("id") or str(submission.get("_id"))
        q["submitted_code"] = submission.get("source_code") or submission.get("code")
        q["teacher_comment"] = submission.get("teacher_comment")
    else:
        q["submission_status"] = None
        q["submission_id"] = None
        q["submitted_code"] = None

    return jsonify(q), 200


@student_bp.route("/submissions", methods=["POST"])
@roles_required("STUDENT", "TEACHER", "ADMIN")
def submit_code():
    """
    Student submits solution.
    Submission contains:
    - submission_id
    - student_id
    - question_id
    - language
    - source_code
    - submitted_at
    - test_results
    - status: PENDING
    CRITICAL: Never expose plagiarism or similarity scores to student!
    """
    data = request.get_json() or {}
    source_code = data.get("source_code") or data.get("code", "")
    language = data.get("language", "Java")
    question_id = data.get("question_id") or data.get("assignment_id") or data.get("assignmentId", "Q-0001")
    test_results = data.get("test_results", {})

    if not source_code.strip():
        return jsonify({"error": "Source code cannot be empty"}), 400

    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else "STU-001"
    student_name = user.get("name", "Student") if user else "Student"
    student_email = user.get("email", "student@rox.ai") if user else "student@rox.ai"
    department = user.get("department", "Computer Science and Engineering") if user else "CSE"

    # Get question info
    question = db.questions.find_one({"id": question_id})
    if not question:
        question = db.assignments.find_one({"id": question_id})
    question_title = question.get("title", "Programming Question") if question else "Programming Question"

    count = db.submissions.count_documents({})
    submission_id = f"SUB-{1000 + count + 1}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    now_formatted = datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y — %I:%M %p")

    new_sub = {
        "id": submission_id,
        "submission_id": submission_id,
        "student_id": user_id,
        "studentId": user_id,
        "studentName": student_name,
        "studentEmail": student_email,
        "department": department,
        "question_id": question_id,
        "questionId": question_id,
        "assignmentId": question_id,
        "assignmentTitle": question_title,
        "language": language,
        "source_code": source_code,
        "code": source_code,
        "linesOfCode": len(source_code.splitlines()),
        "test_results": test_results,
        "status": "PENDING",
        "submitted_at": now_formatted,
        "submittedAt": now_formatted,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).timestamp(),
        "created_at": now_iso,
        "reviewed_at": None,
        "reviewer_id": None,
        "teacher_comment": None,
        "review_decision": None
    }

    # Automatically run background similarity analysis against peers for teacher evidence
    # but NEVER attach it to the student response
    peer = db.submissions.find_one({
        "question_id": question_id,
        "id": {"$ne": submission_id}
    })
    if not peer:
        peer = db.submissions.find_one({
            "assignmentId": question_id,
            "id": {"$ne": submission_id}
        })

    if peer:
        try:
            pipeline_res = AnalysisPipeline.execute(new_sub, peer)
            new_sub["overallSimilarity"] = int(pipeline_res["review_score"])
            new_sub["pairedSubmissionId"] = peer.get("id")
            new_sub["analysisDetails"] = {
                "structuralSimilarity": pipeline_res["structural_similarity"],
                "semanticSimilarity": pipeline_res["semantic_similarity"],
                "behavioralSimilarity": pipeline_res["behavioral_similarity"],
                "timelineCorrelation": pipeline_res["timeline_score"],
                "overallReviewScore": pipeline_res["review_score"],
                "flaggedEvidence": {
                    "astStructure": pipeline_res["structural_similarity"] >= 70,
                    "variableRelationships": pipeline_res["semantic_similarity"] >= 75,
                    "controlFlow": pipeline_res["structural_similarity"] >= 70,
                    "algorithmicOperations": pipeline_res["semantic_similarity"] >= 75,
                    "matchingRegionsCount": len(pipeline_res["matching_regions"]),
                    "timelineAnomaly": pipeline_res.get("timeline_details", {}).get("timeline_anomaly", False)
                },
                "matchingRegions": pipeline_res["matching_regions"]
            }

            # Store pair doc for teacher similarity view
            pair_id = f"PAIR-{db.similarity_results.count_documents({}) + 1}"
            pair_doc = {
                "id": pair_id,
                "submissionAId": submission_id,
                "submissionBId": peer.get("id"),
                "studentAName": student_name,
                "studentBName": peer.get("studentName"),
                "questionTitle": question_title,
                "assignmentTitle": question_title,
                "structural": pipeline_res["structural_similarity"],
                "semantic": pipeline_res["semantic_similarity"],
                "behavioral": pipeline_res["behavioral_similarity"],
                "timeline": pipeline_res["timeline_score"],
                "reviewScore": pipeline_res["review_score"],
                "status": "Similarity Review Required" if pipeline_res["review_score"] >= 75 else "Investigate",
                "detectedRegionsCount": len(pipeline_res["matching_regions"]),
                "transformations": pipeline_res.get("transformations", []),
                "evidence": pipeline_res.get("evidence", []),
                "createdAt": now_iso
            }
            db.similarity_results.insert_one(pair_doc)
        except Exception as e:
            # Non-blocking if analysis fails
            pass

    db.submissions.insert_one(new_sub)

    # Log timeline event
    db.timeline_events.insert_one({
        "id": f"TL-{db.timeline_events.count_documents({}) + 1}",
        "time": datetime.datetime.now(datetime.timezone.utc).strftime("%I:%M %p"),
        "date": datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).timestamp(),
        "studentName": student_name,
        "studentId": user_id,
        "submissionId": submission_id,
        "assignmentTitle": question_title,
        "eventType": "INITIAL_SUBMISSION",
        "revisionNumber": 1,
        "details": f"Solution submitted for {question_title}."
    })

    # Return safe student response (NO similarity data)
    return jsonify({
        "message": "Submission received. Your teacher will review it.",
        "submission": {
            "submission_id": submission_id,
            "student_id": user_id,
            "question_id": question_id,
            "question_title": question_title,
            "language": language,
            "source_code": source_code,
            "submitted_at": now_formatted,
            "test_results": test_results,
            "status": "PENDING"
        }
    }), 201


@student_bp.route("/submissions", methods=["GET"])
@roles_required("STUDENT")
def get_student_submissions():
    """List all submissions made by the currently authenticated student."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None
    user_email = user.get("email") if user else None

    sub_query = {
        "$or": [
            {"student_id": user_id},
            {"studentId": user_id},
            {"studentEmail": user_email}
        ]
    }

    cursor = db.submissions.find(sub_query).sort("timestamp", -1)
    results = []

    for doc in cursor:
        s = serialize_doc(doc)
        # Scrub teacher-only/similarity fields
        results.append({
            "id": s.get("id") or s.get("submission_id"),
            "submission_id": s.get("submission_id") or s.get("id"),
            "question_id": s.get("question_id") or s.get("assignmentId"),
            "question_title": s.get("assignmentTitle") or s.get("question_title", "Programming Task"),
            "language": s.get("language", "Java"),
            "submitted_at": s.get("submitted_at") or s.get("submittedAt"),
            "status": s.get("status", "PENDING"),
            "test_results": s.get("test_results", {}),
            "teacher_comment": s.get("teacher_comment"),
            "reviewed_at": s.get("reviewed_at")
        })

    return jsonify(results), 200


@student_bp.route("/submissions/<submission_id>", methods=["GET"])
@roles_required("STUDENT")
def get_student_submission(submission_id):
    """View details for a specific submission of the current student."""
    db = get_database()
    user = getattr(g, "current_user", None)
    user_id = str(user["_id"]) if user else None
    user_email = user.get("email") if user else None

    sub = db.submissions.find_one({
        "$and": [
            {"$or": [{"id": submission_id}, {"submission_id": submission_id}, {"_id": submission_id}]},
            {"$or": [
                {"student_id": user_id},
                {"studentId": user_id},
                {"studentEmail": user_email}
            ]}
        ]
    })

    if not sub:
        return jsonify({"error": "Submission not found or unauthorized access"}), 404

    s = serialize_doc(sub)
    # Strictly sanitized student view: No internal similarity scores or peer details!
    return jsonify({
        "id": s.get("id") or s.get("submission_id"),
        "submission_id": s.get("submission_id") or s.get("id"),
        "question_id": s.get("question_id") or s.get("assignmentId"),
        "question_title": s.get("assignmentTitle") or s.get("question_title", "Programming Question"),
        "language": s.get("language", "Java"),
        "source_code": s.get("source_code") or s.get("code", ""),
        "submitted_at": s.get("submitted_at") or s.get("submittedAt"),
        "status": s.get("status", "PENDING"),
        "test_results": s.get("test_results", {}),
        "teacher_comment": s.get("teacher_comment"),
        "reviewed_at": s.get("reviewed_at")
    }), 200
