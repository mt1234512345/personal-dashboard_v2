"""
config.py

Loads configuration from environment variables (via a .env file locally,
or real environment variables in production/Railway).

DATABASE_URL follows the sqlite:// URL convention:
    sqlite:///relative/path.db   -> relative path "relative/path.db"
    sqlite:////absolute/path.db  -> absolute path "/absolute/path.db"
"""
import os
from dotenv import load_dotenv

load_dotenv()


def _sqlite_url_to_path(url: str) -> str:
    """Convert a sqlite:// URL into a filesystem path."""
    prefix = "sqlite://"
    if not url.startswith(prefix):
        # Not a sqlite:// URL -- assume it's already a plain path.
        return url

    remainder = url[len(prefix):]  # e.g. "//app/data/app.db" or "/app.db"
    if remainder.startswith("//"):
        # Four slashes total -> absolute path.
        return remainder[1:]
    # Three slashes total -> relative path.
    return remainder.lstrip("/")


def _split_origins(raw: str) -> list:
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Config:
    # --- Core Flask ---
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = FLASK_ENV != "production"
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")

    # --- Database ---
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///data/app.db")
    DATABASE_PATH = _sqlite_url_to_path(DATABASE_URL)

    # --- CORS ---
    # Default matches Vite's dev server port (5173), not CRA's 3000 --
    # the frontend here is built with Vite.
    CORS_ORIGINS = _split_origins(
        os.environ.get("CORS_ORIGINS", "http://localhost:5173")
    )

    # --- Auth / tokens ---
    # Bearer tokens are signed with SECRET_KEY and expire after TOKEN_EXPIRY_SECONDS.
    TOKEN_EXPIRY_SECONDS = int(os.environ.get("TOKEN_EXPIRY_SECONDS", 86400))
    # Optional: set a password hash directly via env instead of interactively
    # at init_db time (used to seed app_settings on first run).
    PASSWORD_HASH = os.environ.get("PASSWORD_HASH")
    # Fallback plaintext password used only if PASSWORD_HASH is not set,
    # purely for local/dev convenience.
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")

    # --- Email (Flask-Mail) ---
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER")

    # --- Journal notification ---
    JOURNAL_EMAIL = os.environ.get("JOURNAL_EMAIL")
    JOURNAL_APP_URL = os.environ.get("JOURNAL_APP_URL", "http://localhost:5000/journal")


config = Config()
