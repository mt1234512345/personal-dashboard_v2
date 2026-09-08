"""routes/auth.py -- POST /login (no auth required)."""
from flask import Blueprint, current_app, jsonify, request

from auth import api_error, generate_token, verify_password

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    password = body.get("password")

    if not password:
        return api_error("'password' is required", 400)

    if not verify_password(password):
        return api_error("Invalid password", 401)

    token = generate_token()
    expires_in = current_app.config.get("TOKEN_EXPIRY_SECONDS", 86400)
    return jsonify({"token": token, "expires_in": expires_in})
