"""
auth.py (project root)

Password hashing/verification and bearer-token helpers shared by every
route module. routes/auth.py handles the POST /login HTTP endpoint itself
and calls into these functions.

Token format: we use itsdangerous.URLSafeTimedSerializer rather than a
full JWT library. For a single-user app this gives the same guarantee
(a signed, expiring, tamper-proof token) without adding a JWT dependency
or JWT's extra surface area (alg confusion, claim validation, etc.) --
see the build notes for why this was chosen over PyJWT.
"""
from functools import wraps

from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

import models

TOKEN_SALT = "auth-token"


def hash_password(plaintext: str) -> str:
    return generate_password_hash(plaintext)


def verify_password(plaintext: str) -> bool:
    stored_hash = models.get_password_hash()
    if not stored_hash:
        return False
    return check_password_hash(stored_hash, plaintext)


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt=TOKEN_SALT)


def generate_token() -> str:
    return _serializer().dumps({"authenticated": True})


def verify_token(token: str) -> bool:
    if not token:
        return False
    try:
        _serializer().loads(
            token, max_age=current_app.config.get("TOKEN_EXPIRY_SECONDS", 86400)
        )
    except (BadSignature, SignatureExpired):
        return False
    return True


def api_error(message: str, status_code: int = 400):
    response = jsonify({"error": message})
    response.status_code = status_code
    return response


def require_auth(view_func):
    """Decorator: requires 'Authorization: Bearer <token>'. Aborts with a
    JSON 401 if missing/invalid/expired."""

    @wraps(view_func)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return api_error("Missing or malformed Authorization header", 401)
        token = header[len("Bearer "):].strip()
        if not verify_token(token):
            return api_error("Invalid or expired token", 401)
        g.authenticated = True
        return view_func(*args, **kwargs)

    return wrapped
