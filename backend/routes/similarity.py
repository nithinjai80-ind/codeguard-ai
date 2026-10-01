import datetime
from flask import Blueprint, request, jsonify
from database import get_database, serialize_doc
from services.analysis_engine.pipeline import AnalysisPipeline

similarity_bp = Blueprint("similarity", __name__, url_prefix="/api/similarity")

@similarity_bp.route("", methods=["GET"])
@similarity_bp.route("/pairs", methods=["GET"])
def get_similarity_pairs():
    db = get_database()
    cursor = db.similarity_results.find().sort("reviewScore", -1)
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@similarity_bp.route("/<pair_id>", methods=["GET"])
def get_similarity_by_id(pair_id):
    db = get_database()
    pair = db.similarity_results.find_one({"id": pair_id})
    if not pair:
        # Check if requested by submissionId
        pair = db.similarity_results.find_one({
            "$or": [{"submissionAId": pair_id}, {"submissionBId": pair_id}]
        })
    if not pair:
        return jsonify({"error": f"Similarity pair {pair_id} not found"}), 404
    return jsonify(serialize_doc(pair)), 200

@similarity_bp.route("/analyze", methods=["POST"])
def analyze_pair():
    data = request.get_json() or {}
    sub_a_id = data.get("submissionAId")
    sub_b_id = data.get("submissionBId")

    if not sub_a_id or not sub_b_id:
        return jsonify({"error": "submissionAId and submissionBId are required"}), 400

    db = get_database()
    sub_a = db.submissions.find_one({"id": sub_a_id})
    sub_b = db.submissions.find_one({"id": sub_b_id})

    if not sub_a or not sub_b:
        return jsonify({"error": "One or both submissions were not found"}), 404

    # Check if pair already exists in DB
    existing_pair = db.similarity_results.find_one({
        "$or": [
            {"submissionAId": sub_a_id, "submissionBId": sub_b_id},
            {"submissionAId": sub_b_id, "submissionBId": sub_a_id}
        ]
    })

    # Run analysis pipeline
    pipeline_res = AnalysisPipeline.execute(sub_a, sub_b)

    pair_id = existing_pair.get("id") if existing_pair else f"PAIR-{db.similarity_results.count_documents({}) + 1}"
    
    pair_doc = {
        "id": pair_id,
        "submissionAId": sub_a_id,
        "submissionBId": sub_b_id,
        "studentAName": sub_a.get("studentName", "Student A"),
        "studentBName": sub_b.get("studentName", "Student B"),
        "assignmentTitle": sub_a.get("assignmentTitle", "Programming Task"),
        "structural": pipeline_res["structural_similarity"],
        "semantic": pipeline_res["semantic_similarity"],
        "behavioral": pipeline_res["behavioral_similarity"],
        "timeline": pipeline_res["timeline_score"],
        "reviewScore": pipeline_res["review_score"],
        "status": existing_pair.get("status", pipeline_res["classification"]) if existing_pair else pipeline_res["classification"],
        "detectedRegionsCount": len(pipeline_res["matching_regions"]),
        "timeDeltaMinutes": pipeline_res.get("timeline_details", {}).get("time_delta_minutes", 9),
        "transformations": pipeline_res["transformations"],
        "evidence": pipeline_res["evidence"],
        "matchingRegions": pipeline_res["matching_regions"],
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    if existing_pair and "tutorDecision" in existing_pair:
        pair_doc["tutorDecision"] = existing_pair["tutorDecision"]

    db.similarity_results.update_one(
        {"id": pair_id},
        {"$set": pair_doc},
        upsert=True
    )

    return jsonify(serialize_doc(pair_doc)), 200
