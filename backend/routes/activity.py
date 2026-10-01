"""
Student Coding Activity Monitoring — ROX AI
============================================
Tracks keyboard/editor events (Copy, Paste, Cut, SelectAll, Undo, Redo, Windows key)
recorded ONLY inside the coding editor, during an active coding session.

Privacy Guarantees:
- No clipboard content is stored.
- No actual text copied or pasted is recorded.
- Only event type, timestamp, questionId, sessionId, and source are stored.
- Events are scoped to CODE_EDITOR source only.
"""

import datetime
from flask import Blueprint, request, jsonify, g
from database import get_database, serialize_doc
from services.auth_service import roles_required

activity_bp = Blueprint("activity", __name__, url_prefix="/api")

# Allowed event types — only editor-level keyboard shortcuts
ALLOWED_EVENT_TYPES = {"COPY", "PASTE", "CUT", "SELECT_ALL", "UNDO", "REDO", "WINDOWS_KEY"}


@activity_bp.route("/student/activity", methods=["POST"])
@roles_required("STUDENT")
def log_student_activity():
    """
    Student-side event logging.
    Called by the frontend when a tracked keyboard shortcut is fired inside the code editor.

    Request body:
    {
        "questionId": "Q-0001",
        "sessionId": "SESSION-XYZ",
        "eventType": "PASTE"
    }

    Security:
    - Only ALLOWED_EVENT_TYPES are accepted.
    - No clipboard content is recorded.
    - No text content is stored.
    """
    db = get_database()
    user = getattr(g, "current_user", None)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    student_id = str(user["_id"])
    data = request.get_json() or {}

    question_id = data.get("questionId") or data.get("question_id", "")
    session_id = data.get("sessionId") or data.get("session_id", "")
    event_type = str(data.get("eventType") or data.get("event_type", "")).upper()

    # Validate event type
    if event_type not in ALLOWED_EVENT_TYPES:
        return jsonify({"error": f"Invalid eventType. Allowed: {', '.join(sorted(ALLOWED_EVENT_TYPES))}"}), 400

    if not question_id:
        return jsonify({"error": "questionId is required"}), 400

    now = datetime.datetime.now(datetime.timezone.utc)

    event_doc = {
        "studentId": student_id,
        "questionId": question_id,
        "submissionId": data.get("submissionId") or data.get("submission_id") or None,
        "sessionId": session_id,
        "eventType": event_type,
        "timestamp": now.isoformat(),
        "timestampEpoch": now.timestamp(),
        "source": "CODE_EDITOR"
    }

    db.coding_activity_events.insert_one(event_doc)

    return jsonify({"status": "logged", "eventType": event_type}), 201


@activity_bp.route("/teacher/submissions/<submission_id>/activity", methods=["GET"])
@roles_required("TEACHER", "ADMIN")
def get_submission_activity(submission_id):
    """
    Teacher view: aggregated coding activity for a specific submission.

    Returns:
    {
        "studentId": "...",
        "studentName": "...",
        "questionId": "...",
        "submissionId": "...",
        "copyCount": 3,
        "pasteCount": 5,
        "cutCount": 1,
        "selectAllCount": 2,
        "undoCount": 8,
        "redoCount": 1,
        "windowsKeyCount": 0,
        "totalEvents": 20,
        "sessionDurationMinutes": 42,
        "events": [...]
    }

    IMPORTANT: This data is supporting evidence only.
    Paste activity ≠ plagiarism. The teacher must interpret the evidence.
    """
    db = get_database()

    # Fetch submission to get studentId and questionId
    submission = db.submissions.find_one({"id": submission_id})
    if not submission:
        submission = db.submissions.find_one({"submission_id": submission_id})

    if not submission:
        return jsonify({"error": f"Submission {submission_id} not found"}), 404

    student_id = submission.get("studentId") or submission.get("student_id")
    question_id = submission.get("questionId") or submission.get("question_id") or submission.get("assignmentId")
    student_name = submission.get("studentName", "Student")
    question_title = submission.get("assignmentTitle") or submission.get("question_title", "Question")

    # Query events for this student + question
    query = {"studentId": student_id, "questionId": question_id}
    events_cursor = db.coding_activity_events.find(query).sort("timestampEpoch", 1)
    events = [serialize_doc(e) for e in events_cursor]

    # Count by type
    counts = {
        "copyCount": 0,
        "pasteCount": 0,
        "cutCount": 0,
        "selectAllCount": 0,
        "undoCount": 0,
        "redoCount": 0,
        "windowsKeyCount": 0
    }

    event_type_map = {
        "COPY": "copyCount",
        "PASTE": "pasteCount",
        "CUT": "cutCount",
        "SELECT_ALL": "selectAllCount",
        "UNDO": "undoCount",
        "REDO": "redoCount",
        "WINDOWS_KEY": "windowsKeyCount"
    }

    for e in events:
        etype = e.get("eventType", "")
        key = event_type_map.get(etype)
        if key:
            counts[key] += 1

    # Estimate session duration from first event to submission time
    session_duration_minutes = None
    if events:
        first_event_ts = events[0].get("timestampEpoch")
        submitted_at_str = submission.get("created_at") or submission.get("submitted_at")
        if first_event_ts and submitted_at_str:
            try:
                # Try to parse ISO format
                submitted_dt = datetime.datetime.fromisoformat(submitted_at_str.replace("Z", "+00:00"))
                delta = submitted_dt.timestamp() - first_event_ts
                if delta > 0:
                    session_duration_minutes = int(delta / 60)
            except Exception:
                pass

    # Build clean event list for timeline (no clipboard content)
    timeline_events = []
    for e in events:
        timeline_events.append({
            "eventType": e.get("eventType"),
            "timestamp": e.get("timestamp"),
            "source": e.get("source", "CODE_EDITOR"),
            "sessionId": e.get("sessionId")
        })

    return jsonify({
        "studentId": student_id,
        "studentName": student_name,
        "questionId": question_id,
        "questionTitle": question_title,
        "submissionId": submission_id,
        **counts,
        "totalEvents": len(events),
        "sessionDurationMinutes": session_duration_minutes,
        "events": timeline_events,
        "disclaimer": "Activity data is supporting evidence only. Paste activity does not indicate plagiarism. The teacher must interpret all evidence."
    }), 200
