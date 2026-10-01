from flask import Blueprint, jsonify
from database import get_database, serialize_doc

timeline_bp = Blueprint("timeline", __name__, url_prefix="/api/timeline")

@timeline_bp.route("", methods=["GET"])
def get_timeline():
    db = get_database()
    cursor = db.timeline_events.find().sort("timestamp", -1)
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200
