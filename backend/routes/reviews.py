import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import jwt_required_custom

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")

@reviews_bp.route("", methods=["GET"])
def get_reviews():
    db = get_database()
    cursor = db.similarity_results.find().sort("reviewScore", -1)
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@reviews_bp.route("/<pair_id>", methods=["PATCH"])
def update_review_decision(pair_id):
    data = request.get_json() or {}
    verdict = data.get("verdict", "RESOLVED_ACCEPTABLE")
    notes = data.get("notes", "")
    tutor_name = data.get("tutorName", "Dr. Priya Kumar")

    db = get_database()
    pair = db.similarity_results.find_one({"id": pair_id})
    if not pair:
        return jsonify({"error": f"Review case {pair_id} not found"}), 404

    now_str = datetime.datetime.now().strftime("%b %d, %Y, %I:%M %p")
    tutor_decision = {
        "reviewedBy": tutor_name,
        "reviewedAt": now_str,
        "verdict": verdict,
        "notes": notes
    }

    # Map verdict to new pair status
    new_status = "Reviewed" if verdict in ["RESOLVED_ACCEPTABLE", "RESOLVED_VIVA_REQUIRED"] else "Investigate"

    db.similarity_results.update_one(
        {"id": pair_id},
        {"$set": {
            "tutorDecision": tutor_decision,
            "status": new_status,
            "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }}
    )

    # Also update paired submissions status if applicable
    if "submissionAId" in pair:
        db.submissions.update_one(
            {"id": pair["submissionAId"]},
            {"$set": {"status": verdict}}
        )
    if "submissionBId" in pair:
        db.submissions.update_one(
            {"id": pair["submissionBId"]},
            {"$set": {"status": verdict}}
        )

    # Save to reviews log collection
    review_log = {
        "id": f"REV-{db.reviews.count_documents({}) + 1}",
        "pairId": pair_id,
        "submissionAId": pair.get("submissionAId"),
        "submissionBId": pair.get("submissionBId"),
        "tutorDecision": tutor_decision,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db.reviews.insert_one(review_log)

    updated_pair = db.similarity_results.find_one({"id": pair_id})
    return jsonify(serialize_doc(updated_pair)), 200
