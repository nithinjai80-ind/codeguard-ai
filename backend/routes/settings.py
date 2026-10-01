from flask import Blueprint, request, jsonify
from database import get_database, serialize_doc

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

DEFAULT_SETTINGS = {
    "key": "system_settings",
    "structuralThreshold": 80,
    "semanticThreshold": 85,
    "behavioralThreshold": 80,
    "timelineWindowMinutes": 10,
    "minEvidenceRegions": 3,
    "weights": {
        "structural": 0.30,
        "semantic": 0.30,
        "behavioral": 0.20,
        "timeline": 0.20
    },
    "activeRules": {
        "structural": True,
        "semantic": True,
        "behavioral": True,
        "timeline": True
    },
    "supportedLanguages": [
        {"name": "Java", "status": "Fully Supported", "version": "17 / 21 LTS"},
        {"name": "Python", "status": "Fully Supported", "version": "3.11+"},
        {"name": "C++", "status": "Fully Supported", "version": "C++17 / 20"},
        {"name": "JavaScript", "status": "Fully Supported", "version": "ES2022"}
    ],
    "normalization": {
        "stripComments": True,
        "normalizeVariableNames": True,
        "ignoreFormatting": True,
        "astFlattening": True
    }
}

@settings_bp.route("", methods=["GET"])
def get_settings():
    db = get_database()
    doc = db.settings.find_one({"key": "system_settings"})
    if not doc:
        db.settings.insert_one(DEFAULT_SETTINGS.copy())
        doc = DEFAULT_SETTINGS
    return jsonify(serialize_doc(doc)), 200

@settings_bp.route("", methods=["PATCH", "POST"])
def update_settings():
    data = request.get_json() or {}
    db = get_database()

    # Preserve key
    data["key"] = "system_settings"

    db.settings.update_one(
        {"key": "system_settings"},
        {"$set": data},
        upsert=True
    )

    updated = db.settings.find_one({"key": "system_settings"})
    return jsonify(serialize_doc(updated)), 200
