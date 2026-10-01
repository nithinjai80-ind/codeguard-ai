import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import get_database, is_mock_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(name)s: %(message)s"
)
logger = logging.getLogger("codeguard.app")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend integration
    CORS(
        app,
        resources={r"/api/*": {"origins": [Config.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173", "*"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
    )

    # Initialize Database & Indexes
    with app.app_context():
        db = get_database()
        logger.info(f"Database initialized. In-memory fallback: {is_mock_db()}")
        if db.users.count_documents({}) == 0:
            logger.info("Database is empty. Automatically running initial seed...")
            from seed import seed_all
            seed_all()

    # Import and register route blueprints
    from routes.auth import auth_bp
    from routes.submissions import submissions_bp
    from routes.similarity import similarity_bp
    from routes.reviews import reviews_bp
    from routes.clusters import clusters_bp
    from routes.timeline import timeline_bp
    from routes.assignments import assignments_bp
    from routes.students import students_bp
    from routes.reports import reports_bp
    from routes.settings import settings_bp
    from routes.questions import questions_bp
    from routes.code_execution import code_bp
    from routes.student import student_bp
    from routes.teacher import teacher_bp
    from routes.admin import admin_bp
    from routes.activity import activity_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(similarity_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(clusters_bp)
    app.register_blueprint(timeline_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(questions_bp)
    app.register_blueprint(code_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(activity_bp)

    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "ROX AI — AI-Powered Coding & Integrity Platform",
            "tagline": "Write. Analyze. Verify.",
            "version": "2.0.0",
            "roles": ["STUDENT", "TEACHER", "ADMIN"],
            "db_mode": "mock_memory" if is_mock_db() else "mongodb_connected"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found", "code": "NOT_FOUND"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error", "code": "SERVER_ERROR"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    logger.info(f"Starting ROX AI Flask Server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
