"""
app.py -- Flask application factory.

Registers all blueprints, wires up CORS, JSON error handling, the
per-request database connection teardown, and -- for the combined-service
Railway deploy -- serves the built React frontend as static files with an
SPA fallback so client-side routes (e.g. /tasks, /projects/5) work on a
hard refresh.

Email/APScheduler: the spec calls for a 9 PM email job pointing at the
local journal app, but also says to "defer email service setup until
routes are stable." A scheduler hook is wired up below (init_scheduler)
but left inert -- no job is added yet. Wire up email_service.py and the
actual 9 PM job once the CRUD routes are verified end-to-end.
"""
import os
import sqlite3

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import config
import models
from routes.auth import auth_bp
from routes.content import content_bp
from routes.daily import daily_bp
from routes.health import health_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.weekly import weekly_bp


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="")
    app.config.from_object(config)

    # Harmless in the combined single-origin deploy (the browser never
    # even triggers a CORS check for same-origin requests) -- kept so the
    # Vite dev server (npm run dev, a different origin) can still talk to
    # this backend during local iteration if you ever want that again.
    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(daily_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(weekly_bp)

    app.teardown_appcontext(models.close_db)

    register_error_handlers(app)
    register_frontend_routes(app)
    init_scheduler(app)

    return app


def register_frontend_routes(app: Flask) -> None:
    """Serves the built React app (frontend/dist, copied into backend/static
    by the Dockerfile) and falls back to index.html for any non-API,
    non-file path so React Router's client-side routes survive a refresh.
    If no build is present (e.g. running the backend alone locally without
    the Docker build step), every path just falls through to a normal JSON
    404 instead of erroring."""

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        # Never let the SPA fallback swallow a genuinely missing API route.
        if path.startswith("api/"):
            return jsonify({"error": "Not found"}), 404

        static_dir = app.static_folder
        if static_dir:
            target = os.path.join(static_dir, path) if path else None
            if target and os.path.isfile(target):
                return send_from_directory(static_dir, path)

            index_path = os.path.join(static_dir, "index.html")
            if os.path.isfile(index_path):
                return send_from_directory(static_dir, "index.html")

        return jsonify({"error": "Not found"}), 404


def register_error_handlers(app: Flask) -> None:
    """Every error path returns JSON, never Flask's default HTML page."""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": getattr(e, "description", "Bad request")}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": getattr(e, "description", "Unauthorized")}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(sqlite3.IntegrityError)
    def integrity_error(e):
        return jsonify({"error": f"Database constraint violated: {e}"}), 400

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(Exception)
    def unhandled_exception(e):
        if isinstance(e, HTTPException):
            return jsonify({"error": e.description or e.name}), e.code
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "Internal server error"}), 500


def init_scheduler(app: Flask) -> None:
    """Placeholder for the APScheduler-driven 9 PM journal-reminder email.
    Intentionally not starting a scheduler yet -- see module docstring."""
    pass


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=config.DEBUG)
