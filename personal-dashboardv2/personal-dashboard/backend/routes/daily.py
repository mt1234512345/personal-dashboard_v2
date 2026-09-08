"""
routes/daily.py -- GET /dashboard, GET/POST /morning.

Assumptions made where the spec was ambiguous (see build notes):
  - "today" defaults to the current UTC date; callers can override with
    ?date=YYYY-MM-DD on GET /dashboard and GET /morning.
  - dashboard.tasks / morning.tasks_for_today priority is returned as the
    schema's own High/Medium/Low (the spec's dashboard example shows
    "P2"/"P3", which doesn't match the tasks table's CHECK constraint).
  - is_priority_task on a morning task == priority == "High".
  - content_preview is the 5 highest-priority Unread items.
  - POST /morning's task_ids_checked is accepted and validated as a list
    but not persisted -- daily_intentions has no column for it, and the
    spec explicitly says this endpoint "doesn't create/complete tasks."
"""
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

import models
from auth import api_error, require_auth

daily_bp = Blueprint("daily", __name__)

_WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _today_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _resolve_date() -> str:
    return request.args.get("date") or _today_iso()


def _week_context(date_str: str):
    """Returns (week_start_date, day_of_week) for the Monday-anchored week
    containing date_str. Saturday/Sunday map to a day_of_week the
    weekly_planning table can't store (schema only allows Mon-Sat) --
    for Sunday we fall back to None so callers just get an empty day."""
    d = datetime.strptime(date_str, "%Y-%m-%d").date()
    monday = d - timedelta(days=d.weekday())
    weekday_name = _WEEKDAY_NAMES[d.weekday()]
    if weekday_name == "Sunday":
        return monday.isoformat(), None
    return monday.isoformat(), weekday_name


def _goals_list(intention, key_name):
    if not intention:
        return []
    goals = []
    for i, field in enumerate(("goal1", "goal2", "goal3"), start=1):
        text = intention.get(field)
        if text:
            goals.append({key_name: i, "text": text})
    return goals


@daily_bp.route("/dashboard", methods=["GET"])
@require_auth
def dashboard():
    date_str = _resolve_date()

    intention = models.get_daily_intention(date_str)
    goals = _goals_list(intention, "id")

    today_tasks = models.list_tasks(due_date="Today", status="Open")
    tasks = [
        {
            "id": t["id"],
            "title": t["title"],
            "priority": t["priority"],
            "status": t["status"],
        }
        for t in today_tasks
    ]

    unread = models.list_content(status="Unread")
    priority_rank = {"High": 0, "Medium": 1, "Low": 2}
    unread.sort(key=lambda c: priority_rank.get(c["priority"], 3))
    content_preview = [
        {
            "id": c["id"],
            "title": c["title"],
            "source": c["source"],
            "read_time": c["read_time"],
            "status": c["status"],
            "priority": c["priority"],
        }
        for c in unread[:5]
    ]

    return jsonify({
        "date": date_str,
        "goals": goals,
        "tasks": tasks,
        "content_preview": content_preview,
    })


@daily_bp.route("/morning", methods=["GET"])
@require_auth
def morning_get():
    date_str = _resolve_date()

    intention = models.get_daily_intention(date_str)
    goals = _goals_list(intention, "order")

    today_tasks = models.list_tasks(due_date="Today", status="Open")
    tasks_for_today = [
        {
            "id": t["id"],
            "title": t["title"],
            "priority": t["priority"],
            "is_priority_task": t["priority"] == "High",
        }
        for t in today_tasks
    ]

    week_start_date, day_of_week = _week_context(date_str)
    quote = None
    reading = None
    if day_of_week:
        day = models.get_day_row(week_start_date, day_of_week)
        if day:
            quote = day["quote"]
            if day["reading_title"] or day["reading_url"]:
                reading = {
                    "title": day["reading_title"],
                    "source": day["reading_source"],
                    "read_time": day["reading_time"],
                    "url": day["reading_url"],
                }

    return jsonify({
        "date": date_str,
        "goals": goals,
        "tasks_for_today": tasks_for_today,
        "quote": quote,
        "reading": reading,
    })


@daily_bp.route("/morning", methods=["POST"])
@require_auth
def morning_post():
    body = request.get_json(silent=True) or {}
    date_str = body.get("date") or _today_iso()

    task_ids_checked = body.get("task_ids_checked", [])
    if task_ids_checked is not None and not isinstance(task_ids_checked, list):
        return api_error("'task_ids_checked' must be a list", 400)

    models.upsert_daily_intention(
        date_str,
        goal1=body.get("goal1"),
        goal2=body.get("goal2"),
        goal3=body.get("goal3"),
    )

    return jsonify({"success": True, "date": date_str})
