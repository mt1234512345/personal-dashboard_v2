"""
models.py

All database access for the main app lives here. Route handlers should
never write raw SQL themselves -- they call into these functions.

Connections are request-scoped via flask.g (see get_db / close_db, wired
up in app.py's teardown). Every multi-statement write that touches more
than one row/table runs inside an explicit transaction.
"""
import sqlite3
from datetime import datetime, timezone

from flask import g

from config import config

# --- Connection management -------------------------------------------------


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(config.DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exception=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


# --- Serialization helpers --------------------------------------------------


def _iso(value):
    """Normalize a sqlite CURRENT_TIMESTAMP string ('YYYY-MM-DD HH:MM:SS')
    into ISO-8601 UTC with a 'Z' suffix. Passes through anything else."""
    if value is None:
        return None
    if isinstance(value, str) and " " in value and "T" not in value:
        return value.replace(" ", "T") + "Z"
    return value


def row_to_dict(row: sqlite3.Row) -> dict:
    if row is None:
        return None
    d = dict(row)
    for key in ("created_at", "updated_at"):
        if key in d:
            d[key] = _iso(d[key])
    return d


def rows_to_dicts(rows) -> list:
    return [row_to_dict(r) for r in rows]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class NotFound(Exception):
    """Raised by update/delete helpers when the target row doesn't exist."""


# =============================================================================
# Projects
# =============================================================================

_PROJECT_UPDATABLE_FIELDS = {"title", "description", "status"}


def create_project(title, description=None, status="Active") -> dict:
    db = get_db()
    cur = db.execute(
        "INSERT INTO projects (title, description, status) VALUES (?, ?, ?)",
        (title, description, status),
    )
    db.commit()
    return get_project_row(cur.lastrowid)


def get_project_row(project_id) -> dict:
    """Bare project row, no nested tasks/content."""
    db = get_db()
    row = db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    return row_to_dict(row)


def list_projects(status=None) -> list:
    db = get_db()
    query = """
        SELECT p.*,
               (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
               (SELECT COUNT(*) FROM content c WHERE c.project_id = p.id) AS content_count
        FROM projects p
    """
    params = []
    if status:
        query += " WHERE p.status = ?"
        params.append(status)
    query += " ORDER BY p.created_at DESC"
    rows = db.execute(query, params).fetchall()
    return rows_to_dicts(rows)


def get_project_with_children(project_id):
    db = get_db()
    row = db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if row is None:
        return None
    project = row_to_dict(row)
    project["tasks"] = rows_to_dicts(
        db.execute(
            "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
            (project_id,),
        ).fetchall()
    )
    project["content"] = rows_to_dicts(
        db.execute(
            "SELECT * FROM content WHERE project_id = ? ORDER BY created_at DESC",
            (project_id,),
        ).fetchall()
    )
    return project


def update_project(project_id, fields: dict) -> dict:
    db = get_db()
    updates = {k: v for k, v in fields.items() if k in _PROJECT_UPDATABLE_FIELDS}
    if not updates:
        row = db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if row is None:
            raise NotFound()
        return row_to_dict(row)

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    params = list(updates.values()) + [project_id]
    cur = db.execute(
        f"UPDATE projects SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params,
    )
    if cur.rowcount == 0:
        db.rollback()
        raise NotFound()
    db.commit()
    return get_project_row(project_id)


def delete_project(project_id) -> None:
    """Deletes the project and nulls out project_id on related tasks/content,
    all inside one transaction (spec: relations remain, just detached)."""
    db = get_db()
    try:
        cur = db.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if cur.fetchone() is None:
            raise NotFound()
        db.execute("UPDATE tasks SET project_id = NULL WHERE project_id = ?", (project_id,))
        db.execute("UPDATE content SET project_id = NULL WHERE project_id = ?", (project_id,))
        db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        db.commit()
    except Exception:
        db.rollback()
        raise


# =============================================================================
# Tasks
# =============================================================================

_TASK_UPDATABLE_FIELDS = {
    "title", "due_date", "due_date_type", "priority", "theme", "status", "project_id",
}
_DUE_DATE_BUCKETS = {"Today", "Tomorrow", "This week", "Backlog"}


def create_task(
    title, due_date_type=None, due_date=None, priority="Medium",
    theme=None, project_id=None, status="Open",
) -> dict:
    db = get_db()
    cur = db.execute(
        """INSERT INTO tasks (title, due_date, due_date_type, priority, theme, status, project_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (title, due_date, due_date_type, priority, theme, status, project_id),
    )
    db.commit()
    return get_task(cur.lastrowid)


def get_task(task_id) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return row_to_dict(row)


def list_tasks(due_date=None, project_id=None, status=None) -> list:
    db = get_db()
    query = "SELECT * FROM tasks WHERE 1=1"
    params = []
    if due_date:
        if due_date in _DUE_DATE_BUCKETS:
            query += " AND due_date_type = ?"
            params.append(due_date)
        else:
            # Treat anything else as a specific ISO date.
            query += " AND due_date = ?"
            params.append(due_date)
    if project_id is not None:
        query += " AND project_id = ?"
        params.append(project_id)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return rows_to_dicts(rows)


def group_tasks_by_due_date(tasks: list) -> dict:
    grouped = {"Today": [], "Tomorrow": [], "This week": [], "Backlog": []}
    for task in tasks:
        bucket = task.get("due_date_type")
        if bucket in grouped:
            grouped[bucket].append(task)
        elif bucket == "Specific" and task.get("due_date"):
            grouped.setdefault(task["due_date"], []).append(task)
    return grouped


def update_task(task_id, fields: dict) -> dict:
    db = get_db()
    updates = {k: v for k, v in fields.items() if k in _TASK_UPDATABLE_FIELDS}
    if not updates:
        row = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if row is None:
            raise NotFound()
        return row_to_dict(row)

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    params = list(updates.values()) + [task_id]
    cur = db.execute(
        f"UPDATE tasks SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params,
    )
    if cur.rowcount == 0:
        db.rollback()
        raise NotFound()
    db.commit()
    return get_task(task_id)


def toggle_task(task_id) -> dict:
    db = get_db()
    row = db.execute("SELECT status FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        raise NotFound()
    new_status = "Completed" if row["status"] == "Open" else "Open"
    db.execute(
        "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (new_status, task_id),
    )
    db.commit()
    return get_task(task_id)


def delete_task(task_id) -> None:
    db = get_db()
    cur = db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    if cur.rowcount == 0:
        db.rollback()
        raise NotFound()
    db.commit()


# =============================================================================
# Content
# =============================================================================

_CONTENT_UPDATABLE_FIELDS = {
    "url", "title", "source", "read_time", "priority", "theme",
    "status", "thoughts", "project_id",
}


def create_content(
    url, title, source=None, read_time=None, priority="Medium",
    theme=None, project_id=None, thoughts=None, status="Unread",
) -> dict:
    db = get_db()
    cur = db.execute(
        """INSERT INTO content (url, title, source, read_time, priority, theme, status, thoughts, project_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (url, title, source, read_time, priority, theme, status, thoughts, project_id),
    )
    db.commit()
    return get_content(cur.lastrowid)


def get_content(content_id) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM content WHERE id = ?", (content_id,)).fetchone()
    return row_to_dict(row)


def list_content(status=None, priority=None, theme=None, project_id=None) -> list:
    db = get_db()
    query = "SELECT * FROM content WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if priority:
        query += " AND priority = ?"
        params.append(priority)
    if theme:
        query += " AND theme = ?"
        params.append(theme)
    if project_id is not None:
        query += " AND project_id = ?"
        params.append(project_id)
    query += " ORDER BY created_at DESC"
    rows = db.execute(query, params).fetchall()
    return rows_to_dicts(rows)


def update_content(content_id, fields: dict) -> dict:
    db = get_db()
    updates = {k: v for k, v in fields.items() if k in _CONTENT_UPDATABLE_FIELDS}
    if not updates:
        row = db.execute("SELECT * FROM content WHERE id = ?", (content_id,)).fetchone()
        if row is None:
            raise NotFound()
        return row_to_dict(row)

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    params = list(updates.values()) + [content_id]
    cur = db.execute(
        f"UPDATE content SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params,
    )
    if cur.rowcount == 0:
        db.rollback()
        raise NotFound()
    db.commit()
    return get_content(content_id)


def update_content_status(content_id, status) -> dict:
    return update_content(content_id, {"status": status})


def update_content_thoughts(content_id, thoughts) -> dict:
    return update_content(content_id, {"thoughts": thoughts})


def delete_content(content_id) -> None:
    db = get_db()
    cur = db.execute("DELETE FROM content WHERE id = ?", (content_id,))
    if cur.rowcount == 0:
        db.rollback()
        raise NotFound()
    db.commit()


# =============================================================================
# Daily intentions
# =============================================================================


def upsert_daily_intention(date, goal1=None, goal2=None, goal3=None) -> dict:
    db = get_db()
    db.execute(
        """
        INSERT INTO daily_intentions (date, goal1, goal2, goal3)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            goal1 = excluded.goal1,
            goal2 = excluded.goal2,
            goal3 = excluded.goal3,
            updated_at = CURRENT_TIMESTAMP
        """,
        (date, goal1, goal2, goal3),
    )
    db.commit()
    return get_daily_intention(date)


def get_daily_intention(date) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM daily_intentions WHERE date = ?", (date,)).fetchone()
    return row_to_dict(row)


# =============================================================================
# Weekly planning
# =============================================================================

_WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


def get_week(week_start_date) -> list:
    db = get_db()
    rows = db.execute(
        "SELECT * FROM weekly_planning WHERE week_start_date = ?",
        (week_start_date,),
    ).fetchall()
    by_day = {r["day_of_week"]: row_to_dict(r) for r in rows}

    days = []
    for day_name in _WEEK_DAYS:
        record = by_day.get(day_name)
        if record:
            days.append({
                "day_of_week": day_name,
                "theme": record["theme"],
                "quote": record["quote"],
                "reading": (
                    {
                        "title": record["reading_title"],
                        "source": record["reading_source"],
                        "url": record["reading_url"],
                        "read_time": record["reading_time"],
                    }
                    if record["reading_title"] or record["reading_url"]
                    else None
                ),
            })
        else:
            days.append({
                "day_of_week": day_name,
                "theme": None,
                "quote": None,
                "reading": None,
            })
    return days


def get_day_row(week_start_date, day_of_week) -> dict:
    db = get_db()
    row = db.execute(
        "SELECT * FROM weekly_planning WHERE week_start_date = ? AND day_of_week = ?",
        (week_start_date, day_of_week),
    ).fetchone()
    return row_to_dict(row)


def upsert_weekly_day(
    week_start_date, day_of_week, theme=None, quote=None,
    reading_title=None, reading_source=None, reading_url=None, reading_time=None,
) -> dict:
    db = get_db()
    db.execute(
        """
        INSERT INTO weekly_planning
            (week_start_date, day_of_week, theme, quote, reading_title, reading_source, reading_url, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(week_start_date, day_of_week) DO UPDATE SET
            theme = excluded.theme,
            quote = excluded.quote,
            reading_title = excluded.reading_title,
            reading_source = excluded.reading_source,
            reading_url = excluded.reading_url,
            reading_time = excluded.reading_time,
            updated_at = CURRENT_TIMESTAMP
        """,
        (week_start_date, day_of_week, theme, quote, reading_title, reading_source, reading_url, reading_time),
    )
    db.commit()
    row = get_day_row(week_start_date, day_of_week)
    return {
        "day_of_week": row["day_of_week"],
        "theme": row["theme"],
        "quote": row["quote"],
        "reading": (
            {
                "title": row["reading_title"],
                "source": row["reading_source"],
                "url": row["reading_url"],
                "read_time": row["reading_time"],
            }
            if row["reading_title"] or row["reading_url"]
            else None
        ),
    }


# =============================================================================
# App settings
# =============================================================================


def get_password_hash():
    db = get_db()
    row = db.execute(
        "SELECT password_hash FROM app_settings ORDER BY id LIMIT 1"
    ).fetchone()
    return row["password_hash"] if row else None
