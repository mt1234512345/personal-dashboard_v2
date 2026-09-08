"""routes/weekly.py -- all /api/weekly-planning/* endpoints.

Note: day_of_week is restricted to Monday-Saturday, matching the
weekly_planning table's CHECK constraint as written in BACKEND_SPEC.md
(Sunday is not a valid value -- flagged in the build notes as a likely
spec gap rather than silently "fixed" here).
"""
import sqlite3
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

import models
from auth import api_error, require_auth

weekly_bp = Blueprint("weekly", __name__, url_prefix="/api/weekly-planning")

_VALID_DAYS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}


def _current_week_start() -> str:
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())
    return monday.isoformat()


@weekly_bp.route("", methods=["GET"])
@require_auth
def get_weekly_planning():
    week_start_date = request.args.get("week_start_date") or _current_week_start()
    days = models.get_week(week_start_date)
    return jsonify({"week_start_date": week_start_date, "days": days})


def _upsert(day_of_week):
    if day_of_week not in _VALID_DAYS:
        return api_error(
            f"'{day_of_week}' is not a valid day_of_week "
            f"(must be one of {', '.join(sorted(_VALID_DAYS))})",
            400,
        )

    body = request.get_json(silent=True) or {}
    week_start_date = body.get("week_start_date")
    if not week_start_date:
        return api_error("'week_start_date' is required", 400)

    try:
        day = models.upsert_weekly_day(
            week_start_date=week_start_date,
            day_of_week=day_of_week,
            theme=body.get("theme"),
            quote=body.get("quote"),
            reading_title=body.get("reading_title"),
            reading_source=body.get("reading_source"),
            reading_url=body.get("reading_url"),
            reading_time=body.get("reading_time"),
        )
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid weekly planning data: {e}", 400)

    return jsonify(day)


@weekly_bp.route("/<day_of_week>", methods=["POST"])
@require_auth
def create_day(day_of_week):
    return _upsert(day_of_week)


@weekly_bp.route("/<day_of_week>", methods=["PUT"])
@require_auth
def update_day(day_of_week):
    return _upsert(day_of_week)
