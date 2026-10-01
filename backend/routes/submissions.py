import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom
from services.analysis_engine.pipeline import AnalysisPipeline

submissions_bp = Blueprint("submissions", __name__, url_prefix="/api/submissions")

@submissions_bp.route("", methods=["GET"])
def get_submissions():
    db = get_database()
    assignment_id = request.args.get("assignmentId")
    language = request.args.get("language")
    status = request.args.get("status")
    search = request.args.get("search")

    query = {}
    if assignment_id and assignment_id != "ALL":
        query["assignmentId"] = assignment_id
    if language and language != "ALL":
        query["language"] = language
    if status and status != "ALL":
        query["status"] = status

    cursor = db.submissions.find(query).sort("submittedAt", -1)
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

@submissions_bp.route("/<submission_id>", methods=["GET"])
def get_submission(submission_id):
    db = get_database()
    submission = db.submissions.find_one({"id": submission_id})
    if not submission:
        # Check by _id if needed
        return jsonify({"error": f"Submission {submission_id} not found"}), 404
    return jsonify(serialize_doc(submission)), 200

@submissions_bp.route("", methods=["POST"])
def create_submission():
    data = request.get_json() or {}
    db = get_database()

    count = db.submissions.count_documents({})
    submission_id = data.get("id") or f"SUB-{1000 + count + 1}"
    
    code = data.get("code", "// Solution\npublic class Solution {\n    // Code here\n}")
    student_name = data.get("studentName", "Student Upload")
    student_id = data.get("studentId", "NIT-CS-2024-999")
    assignment_id = data.get("assignmentId", "ASSIGN-01")
    assignment_title = data.get("assignmentTitle", "Binary Search Implementation")
    language = data.get("language", "Java")
    file_name = data.get("fileName", "Solution.java")
    lines_of_code = len(code.splitlines())

    new_sub = {
        "id": submission_id,
        "studentId": student_id,
        "studentName": student_name,
        "studentEmail": f"{student_name.lower().replace(' ', '.')}@student.nehru.ac.in",
        "department": "Computer Science and Engineering",
        "assignmentId": assignment_id,
        "assignmentTitle": assignment_title,
        "language": language,
        "submittedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y — %I:%M %p"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).timestamp(),
        "status": "ANALYZED",
        "overallSimilarity": 22,
        "code": code,
        "revision": 1,
        "fileName": file_name,
        "linesOfCode": lines_of_code,
        "analysisDetails": {
            "structuralSimilarity": 20,
            "semanticSimilarity": 25,
            "behavioralSimilarity": 18,
            "timelineCorrelation": 10,
            "overallReviewScore": 22,
            "flaggedEvidence": {
                "astStructure": False,
                "variableRelationships": False,
                "controlFlow": False,
                "algorithmicOperations": False,
                "matchingRegionsCount": 0,
                "timelineAnomaly": False
            },
            "matchingRegions": []
        }
    }

    # Automatically find another submission in the same assignment to run comparison if available
    peer = db.submissions.find_one({"assignmentId": assignment_id, "id": {"$ne": submission_id}})
    if peer:
        pipeline_res = AnalysisPipeline.execute(new_sub, peer)
        new_sub["overallSimilarity"] = int(pipeline_res["review_score"])
        new_sub["pairedSubmissionId"] = peer.get("id")
        new_sub["status"] = "REVIEW_REQUIRED" if pipeline_res["review_score"] >= 75 else "INVESTIGATING" if pipeline_res["review_score"] >= 50 else "ANALYZED"
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

        # Store similarity pair result
        pair_id = f"PAIR-{db.similarity_results.count_documents({}) + 1}"
        pair_doc = {
            "id": pair_id,
            "submissionAId": submission_id,
            "submissionBId": peer.get("id"),
            "studentAName": student_name,
            "studentBName": peer.get("studentName"),
            "assignmentTitle": assignment_title,
            "structural": pipeline_res["structural_similarity"],
            "semantic": pipeline_res["semantic_similarity"],
            "behavioral": pipeline_res["behavioral_similarity"],
            "timeline": pipeline_res["timeline_score"],
            "reviewScore": pipeline_res["review_score"],
            "status": pipeline_res["classification"],
            "detectedRegionsCount": len(pipeline_res["matching_regions"]),
            "timeDeltaMinutes": pipeline_res.get("timeline_details", {}).get("time_delta_minutes", 10),
            "transformations": pipeline_res["transformations"],
            "evidence": pipeline_res["evidence"],
            "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        db.similarity_results.insert_one(pair_doc)

    db.submissions.insert_one(new_sub)

    # Also log a timeline event
    timeline_event = {
        "id": f"TL-{db.timeline_events.count_documents({}) + 1}",
        "time": datetime.datetime.now(datetime.timezone.utc).strftime("%I:%M %p"),
        "date": datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).timestamp(),
        "studentName": student_name,
        "studentId": student_id,
        "submissionId": submission_id,
        "assignmentTitle": assignment_title,
        "eventType": "INITIAL_SUBMISSION",
        "revisionNumber": 1,
        "details": f"Initial solution for {assignment_title} uploaded ({lines_of_code} LOC)."
    }
    db.timeline_events.insert_one(timeline_event)

    return jsonify(serialize_doc(new_sub)), 201
