"""
init_db.py

Creates the sqlite database (if needed) from schema.sql, and seeds
app_settings with a single admin password hash if the table is empty.

Usage:
    python init_db.py

Password source (first match wins):
    1. PASSWORD_HASH env var  -- used as-is (already hashed).
    2. ADMIN_PASSWORD env var -- hashed with werkzeug on the way in.
    3. Defaults to "changeme" (dev only) with a loud warning.
"""
import os
import sqlite3
import sys

from werkzeug.security import generate_password_hash

from config import config

SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")


def ensure_data_dir(db_path: str) -> None:
    directory = os.path.dirname(db_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def init_schema(conn: sqlite3.Connection) -> None:
    with open(SCHEMA_PATH, "r") as f:
        schema = f.read()
    conn.executescript(schema)


def seed_app_settings(conn: sqlite3.Connection) -> None:
    cur = conn.execute("SELECT COUNT(*) FROM app_settings")
    count = cur.fetchone()[0]
    if count > 0:
        print("app_settings already seeded -- skipping.")
        return

    if config.PASSWORD_HASH:
        password_hash = config.PASSWORD_HASH
        print("Seeding app_settings with PASSWORD_HASH from environment.")
    else:
        if config.ADMIN_PASSWORD == "changeme":
            print(
                "WARNING: no PASSWORD_HASH or ADMIN_PASSWORD set -- seeding "
                "with the default password 'changeme'. Set ADMIN_PASSWORD "
                "(or PASSWORD_HASH) before deploying to production.",
                file=sys.stderr,
            )
        password_hash = generate_password_hash(config.ADMIN_PASSWORD)
        print("Seeding app_settings with a hash of ADMIN_PASSWORD.")

    conn.execute(
        "INSERT INTO app_settings (password_hash) VALUES (?)",
        (password_hash,),
    )
    conn.commit()


def main() -> None:
    db_path = config.DATABASE_PATH
    ensure_data_dir(db_path)

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        init_schema(conn)
        conn.commit()
        seed_app_settings(conn)
    finally:
        conn.close()

    print(f"Database initialized at {db_path}")


if __name__ == "__main__":
    main()
