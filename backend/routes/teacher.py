import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom, roles_required
from services.analysis_engine.pipeline import AnalysisPipeline

teacher_bp = Blueprint("teacher", __name__, url_prefix="/api/teacher")

@teacher_bp.route("/dashboard", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_dashboard():
    """
    Teacher dashboard statistics:
    - Total Questions
    - Total Students
    - Total Submissions
    - Pending Reviews
    - Accepted Submissions
    - Rejected Submissions
    - Review Required
    - Similarity Cases
    """
    db = get_database()

    total_questions = db.questions.count_documents({})
    if total_questions == 0:
        total_questions = db.assignments.count_documents({})

    total_students = db.users.count_documents({"role": "STUDENT"})
    if total_students == 0:
        total_students = db.students.count_documents({})

    total_submissions = db.submissions.count_documents({})
    
    pending_reviews = db.submissions.count_documents({
        "status": {"$in": ["PENDING", "ANALYZED", "REVIEW_REQUIRED", "INVESTIGATING", "Similarity Review Required"]}
    })
    
    accepted_submissions = db.submissions.count_documents({
        "status": {"$in": ["ACCEPTED", "RESOLVED_ACCEPTABLE", "Code Accepted"]}
    })
    
    rejected_submissions = db.submissions.count_documents({
        "status": {"$in": ["REJECTED", "ESCALATED_DISCIPLINARY"]}
    })
    
    review_required = db.submissions.count_documents({
        "status": {"$in": ["REVIEW_REQUIRED", "Similarity Review Required", "Needs Review"]}
    })

    similarity_cases = db.similarity_results.count_documents({
        "reviewScore": {"$gte": 50}
    })

    # Recent review queue items (top 5)
    recent_reviews_cursor = db.submissions.find({
        "status": {"$in": ["PENDING", "REVIEW_REQUIRED", "ANALYZED", "INVESTIGATING"]}
    }).sort("timestamp", -1).limit(6)
    
    queue = []
    for doc in recent_reviews_cursor:
        s = serialize_doc(doc)
        queue.append({
            "id": s.get("id"),
            "student_name": s.get("studentName", "Student"),
            "question_title": s.get("assignmentTitle") or s.get("question_title", "Assessment"),
            "test_results": s.get("test_results", {"passed": 8, "total": 10}),
            "similarity": s.get("overallSimilarity", 0),
            "status": s.get("status", "PENDING"),
            "submitted_at": s.get("submitted_at") or s.get("submittedAt")
        })

    return jsonify({
        "total_questions": total_questions,
        "total_students": total_students,
        "total_submissions": total_submissions,
        "pending_reviews": pending_reviews,
        "accepted_submissions": accepted_submissions,
        "rejected_submissions": rejected_submissions,
        "review_required": review_required,
        "similarity_cases": similarity_cases,
        "review_queue": queue
    }), 200


@teacher_bp.route("/submissions", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_submissions():
    """List submissions with teacher evidence and filtering."""
    db = get_database()
    question_id = request.args.get("question_id") or request.args.get("assignmentId")
    status = request.args.get("status")
    search = request.args.get("search")

    query = {}
    if question_id and question_id != "ALL":
        query["$or"] = [{"question_id": question_id}, {"assignmentId": question_id}]
    if status and status != "ALL":
        query["status"] = status

    cursor = db.submissions.find(query).sort("timestamp", -1)
    results = [serialize_doc(doc) for doc in cursor]

    if search:
        q = search.lower()
        results = [
            s for s in results
            if q in s.get("studentName", "").lower()
            or q in s.get("id", "").lower()
            or q in s.get("assignmentTitle", "").lower()
            or q in s.get("studentId", "").lower()
        ]

    return jsonify(results), 200


@teacher_bp.route("/reviews", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_review_queue():
    """Retrieve queue of submissions and similarity cases requiring teacher review."""
    db = get_database()
    
    # Cases requiring review
    cursor = db.similarity_results.find().sort("reviewScore", -1)
    pair_results = [serialize_doc(doc) for doc in cursor]

    # Submissions requiring review
    sub_cursor = db.submissions.find().sort("overallSimilarity", -1)
    sub_results = [serialize_doc(doc) for doc in sub_cursor]

    return jsonify({
        "similarity_cases": pair_results,
        "submissions": sub_results
    }), 200


@teacher_bp.route("/submissions/<submission_id>", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_submission_detail(submission_id):
    """
    Teacher detailed submission view:
    - Student info
    - Question
    - Submission time
    - Programming language
    - Test results
    - Source code
    - Similarity analysis (Structural, Semantic, Behavioral, Timeline, Overall)
    - Explainable evidence
    """
    db = get_database()
    submission = db.submissions.find_one({"id": submission_id})
    if not submission:
        submission = db.submissions.find_one({"submission_id": submission_id})
    if not submission:
        return jsonify({"error": f"Submission {submission_id} not found"}), 404

    s = serialize_doc(submission)

    # Find paired similarity analysis if exists
    pair = db.similarity_results.find_one({
        "$or": [
            {"submissionAId": s.get("id")},
            {"submissionBId": s.get("id")}
        ]
    })

    if pair:
        s["pairedSimilarity"] = serialize_doc(pair)
    
    return jsonify(s), 200


@teacher_bp.route("/submissions/<submission_id>/analyze", methods=["POST"])
@roles_required("TEACHER", "ADMIN")
def trigger_submission_analysis(submission_id):
    """Run similarity analysis pipeline against peer submissions."""
    db = get_database()
    sub = db.submissions.find_one({"id": submission_id})
    if not sub:
        return jsonify({"error": "Submission not found"}), 404

    # Find peer
    target_q = sub.get("question_id") or sub.get("assignmentId")
    peer = db.submissions.find_one({
        "$or": [{"question_id": target_q}, {"assignmentId": target_q}],
        "id": {"$ne": submission_id}
    })

    if not peer:
        return jsonify({
            "message": "No peer submission available in this question set for comparison.",
            "submission_id": submission_id
        }), 200

    pipeline_res = AnalysisPipeline.execute(sub, peer)

    # Store pair
    pair_id = f"PAIR-{db.similarity_results.count_documents({}) + 1}"
    pair_doc = {
        "id": pair_id,
        "submissionAId": submission_id,
        "submissionBId": peer.get("id"),
        "studentAName": sub.get("studentName", "Student A"),
        "studentBName": peer.get("studentName", "Student B"),
        "assignmentTitle": sub.get("assignmentTitle", "Question"),
        "structural": pipeline_res["structural_similarity"],
        "semantic": pipeline_res["semantic_similarity"],
        "behavioral": pipeline_res["behavioral_similarity"],
        "timeline": pipeline_res["timeline_score"],
        "reviewScore": pipeline_res["review_score"],
        "status": "Similarity Review Required" if pipeline_res["review_score"] >= 75 else "Investigate",
        "detectedRegionsCount": len(pipeline_res["matching_regions"]),
        "transformations": pipeline_res.get("transformations", []),
        "evidence": pipeline_res.get("evidence", []),
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db.similarity_results.insert_one(pair_doc)

    db.submissions.update_one(
        {"id": submission_id},
        {"$set": {
            "overallSimilarity": int(pipeline_res["review_score"]),
            "status": "Similarity Review Required" if pipeline_res["review_score"] >= 75 else "ANALYZED",
            "analysisDetails": {
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
        }}
    )

    return jsonify({
        "message": "Similarity analysis completed successfully.",
        "pair": serialize_doc(pair_doc)
    }), 200


@teacher_bp.route("/submissions/<submission_id>/review", methods=["PATCH"])
@roles_required("TEACHER", "ADMIN")
def review_submission(submission_id):
    """
    Teacher makes academic decision:
    - ACCEPTED: Code Accepted
    - REJECTED: Code Rejected (feedback required)
    - REVISION_REQUIRED: Revision Required (feedback required)
    
    IMPORTANT:
    The AI recommendation NEVER automatically changes the final status.
    The teacher explicitly makes the decision.
    """
    data = request.get_json() or {}
    decision = data.get("decision")  # ACCEPTED | REJECTED | REVISION_REQUIRED
    comment = data.get("comment", "").strip()

    valid_decisions = ["ACCEPTED", "REJECTED", "REVISION_REQUIRED"]
    if decision not in valid_decisions:
        return jsonify({
            "error": f"Invalid decision. Must be one of: {', '.join(valid_decisions)}"
        }), 400

    if decision in ["REJECTED", "REVISION_REQUIRED"] and not comment:
        return jsonify({
            "error": "Teacher feedback comment is required when rejecting or requesting revision."
        }), 400

    db = get_database()
    user = getattr(g, "current_user", None)
    reviewer_id = str(user["_id"]) if user else "TEACHER-001"
    reviewer_name = user.get("name", "Teacher") if user else "Teacher"

    sub = db.submissions.find_one({"id": submission_id})
    if not sub:
        sub = db.submissions.find_one({"submission_id": submission_id})
    if not sub:
        return jsonify({"error": f"Submission {submission_id} not found"}), 404

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    now_formatted = datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y — %I:%M %p")

    # Update submission
    update_fields = {
        "status": decision,
        "reviewed_at": now_formatted,
        "reviewedAt": now_formatted,
        "reviewer_id": reviewer_id,
        "reviewer_name": reviewer_name,
        "teacher_comment": comment,
        "review_decision": decision,
        "updated_at": now_iso
    }

    db.submissions.update_one({"id": submission_id}, {"$set": update_fields})

    # Log review in reviews collection
    review_record = {
        "id": f"REV-{db.reviews.count_documents({}) + 1}",
        "submission_id": submission_id,
        "teacher_id": reviewer_id,
        "teacher_name": reviewer_name,
        "decision": decision,
        "comment": comment,
        "reviewed_at": now_iso
    }
    db.reviews.insert_one(review_record)

    # Log timeline event
    db.timeline_events.insert_one({
        "id": f"TL-{db.timeline_events.count_documents({}) + 1}",
        "time": datetime.datetime.now(datetime.timezone.utc).strftime("%I:%M %p"),
        "date": datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).timestamp(),
        "studentName": sub.get("studentName", "Student"),
        "studentId": sub.get("studentId", "STU"),
        "submissionId": submission_id,
        "assignmentTitle": sub.get("assignmentTitle", "Question"),
        "eventType": "TEACHER_REVIEW",
        "revisionNumber": sub.get("revision", 1),
        "details": f"Teacher decision: {decision}. Comment: {comment or 'None'}"
    })

    return jsonify({
        "message": f"Submission marked as {decision}.",
        "submission_id": submission_id,
        "decision": decision,
        "teacher_comment": comment,
        "reviewed_at": now_formatted
    }), 200


@teacher_bp.route("/similarity/<pair_id>", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_similarity_pair(pair_id):
    """
    Get full comparison pair data including:
    - Side-by-side code of both students
    - Variable transformations (e.g. total -> sum, i -> index)
    - Expression transformations (e.g. total += arr[i] <-> sum = sum + numbers[index])
    - Explainable evidence list
    """
    db = get_database()
    pair = db.similarity_results.find_one({"id": pair_id})
    if not pair:
        pair = db.similarity_results.find_one({
            "$or": [{"submissionAId": pair_id}, {"submissionBId": pair_id}]
        })
    if not pair:
        return jsonify({"error": f"Similarity case {pair_id} not found"}), 404

    pair_data = serialize_doc(pair)

    # Fetch source code of both submissions if available
    sub_a = db.submissions.find_one({"id": pair_data.get("submissionAId")})
    sub_b = db.submissions.find_one({"id": pair_data.get("submissionBId")})

    if sub_a:
        pair_data["codeA"] = sub_a.get("source_code") or sub_a.get("code")
    if sub_b:
        pair_data["codeB"] = sub_b.get("source_code") or sub_b.get("code")

    return jsonify(pair_data), 200


@teacher_bp.route("/questions", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_questions():
    """List questions for teacher reference."""
    db = get_database()
    cursor = db.questions.find().sort("created_at", -1)
    results = [serialize_doc(doc) for doc in cursor]
    if not results:
        # Fallback to assignments
        assign_cursor = db.assignments.find()
        results = [serialize_doc(doc) for doc in assign_cursor]
    return jsonify(results), 200


@teacher_bp.route("/students", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_teacher_students():
    """List students with submission statistics."""
    db = get_database()
    students_cursor = db.users.find({"role": "STUDENT"})
    students = []
    
    for s_doc in students_cursor:
        s = serialize_doc(s_doc)
        student_id = str(s.get("_id"))
        student_email = s.get("email")

        # Get counts
        sub_count = db.submissions.count_documents({
            "$or": [{"student_id": student_id}, {"studentEmail": student_email}, {"studentId": student_id}]
        })
        accepted_count = db.submissions.count_documents({
            "$or": [{"student_id": student_id}, {"studentEmail": student_email}],
            "status": "ACCEPTED"
        })
        pending_count = db.submissions.count_documents({
            "$or": [{"student_id": student_id}, {"studentEmail": student_email}],
            "status": "PENDING"
        })

        students.append({
            "id": student_id,
            "name": s.get("name"),
            "email": s.get("email"),
            "department": s.get("department", "CSE"),
            "submissions": sub_count,
            "accepted": accepted_count,
            "pending": pending_count,
            "status": s.get("status", "ACTIVE")
        })

    # If users table had no students, check students collection
    if not students:
        fallback = db.students.find()
        for f in fallback:
            f_doc = serialize_doc(f)
            students.append({
                "id": f_doc.get("id"),
                "name": f_doc.get("name"),
                "email": f_doc.get("email"),
                "department": f_doc.get("department", "CSE"),
                "submissions": 4,
                "accepted": 3,
                "pending": 1,
                "status": "ACTIVE"
            })

    return jsonify(students), 200


@teacher_bp.route("/submissions/<submission_id>/similarity", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_submission_similarity(submission_id):
    """Retrieve similarity cases related to a given submission ID."""
    db = get_database()
    pairs_cursor = db.similarity_results.find({
        "$or": [{"submissionAId": submission_id}, {"submissionBId": submission_id}]
    }).sort("reviewScore", -1)
    
    results = [serialize_doc(doc) for doc in pairs_cursor]
    return jsonify(results), 200


@teacher_bp.route("/similarity/<pair_id>/compare", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_similarity_compare(pair_id):
    """Side-by-side comparison data for teacher investigation view."""
    return get_teacher_similarity_pair(pair_id)


@teacher_bp.route("/similarity/clusters", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_similarity_clusters():
    """Group submissions by similarity threshold into Similarity Clusters."""
    db = get_database()
    pairs = list(db.similarity_results.find({"reviewScore": {"$gte": 60}}))
    
    # Graph based clustering (Connected Components)
    adjacency = {}
    student_names = {}
    for p in pairs:
        sa = p.get("submissionAId")
        sb = p.get("submissionBId")
        na = p.get("studentAName", "Student A")
        nb = p.get("studentBName", "Student B")
        student_names[sa] = na
        student_names[sb] = nb
        
        adjacency.setdefault(sa, []).append((sb, p.get("reviewScore", 0)))
        adjacency.setdefault(sb, []).append((sa, p.get("reviewScore", 0)))

    visited = set()
    clusters = []
    cluster_idx = 1

    for node in adjacency:
        if node not in visited:
            component = []
            queue = [node]
            visited.add(node)
            scores = []
            
            while queue:
                curr = queue.pop(0)
                component.append({
                    "submissionId": curr,
                    "studentName": student_names.get(curr, "Student")
                })
                for nxt, score in adjacency.get(curr, []):
                    scores.append(score)
                    if nxt not in visited:
                        visited.add(nxt)
                        queue.append(nxt)
            
            if len(component) >= 2:
                avg_score = round(sum(scores) / max(len(scores), 1), 1)
                clusters.append({
                    "clusterId": f"CLUSTER-{cluster_idx}",
                    "label": "Similarity Cluster",
                    "questionTitle": "Code Integrity Group",
                    "memberCount": len(component),
                    "averageSimilarity": avg_score,
                    "members": component
                })
                cluster_idx += 1

    return jsonify(clusters), 200


@teacher_bp.route("/similarity/network", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_similarity_network():
    """Returns nodes and links for the interactive evidence network graph."""
    db = get_database()
    pairs = list(db.similarity_results.find({"reviewScore": {"$gte": 50}}).limit(30))
    
    nodes = []
    links = []
    added_nodes = set()

    for p in pairs:
        sa_id = p.get("submissionAId", "A")
        sb_id = p.get("submissionBId", "B")
        sa_name = p.get("studentAName", "Student A")
        sb_name = p.get("studentBName", "Student B")
        score = p.get("reviewScore", 50)

        if sa_id not in added_nodes:
            nodes.append({"id": sa_id, "label": sa_name, "type": "Student", "val": 10})
            added_nodes.add(sa_id)

        if sb_id not in added_nodes:
            nodes.append({"id": sb_id, "label": sb_name, "type": "Student", "val": 10})
            added_nodes.add(sb_id)

        links.append({
            "source": sa_id,
            "target": sb_id,
            "value": score,
            "label": f"Similarity: {score}%"
        })

    return jsonify({"nodes": nodes, "links": links}), 200

