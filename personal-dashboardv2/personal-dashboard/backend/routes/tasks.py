"""routes/tasks.py -- all /api/tasks/* endpoints."""
import sqlite3

from flask import Blueprint, jsonify, request

import models
from auth import api_error, require_auth

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


@tasks_bp.route("", methods=["GET"])
@require_auth
def list_tasks():
    due_date = request.args.get("due_date")
    project_id = request.args.get("project_id")
    status = request.args.get("status")

    if project_id is not None:
        try:
            project_id = int(project_id)
        except ValueError:
            return api_error("'project_id' must be an integer", 400)

    tasks = models.list_tasks(due_date=due_date, project_id=project_id, status=status)
    grouped = models.group_tasks_by_due_date(tasks)
    return jsonify({"tasks": tasks, "grouped_by_due_date": grouped})


@tasks_bp.route("", methods=["POST"])
@require_auth
def create_task():
    body = request.get_json(silent=True) or {}
    title = body.get("title")
    if not title:
        return api_error("'title' is required", 400)

    try:
        task = models.create_task(
            title=title,
            due_date_type=body.get("due_date_type"),
            due_date=body.get("due_date"),
            priority=body.get("priority", "Medium"),
            theme=body.get("theme"),
            project_id=body.get("project_id"),
            status=body.get("status", "Open"),
        )
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid task data: {e}", 400)

    return jsonify(task), 201


@tasks_bp.route("/<int:task_id>", methods=["GET"])
@require_auth
def get_task(task_id):
    task = models.get_task(task_id)
    if task is None:
        return api_error("Task not found", 404)
    return jsonify(task)


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@require_auth
def update_task(task_id):
    body = request.get_json(silent=True) or {}
    try:
        task = models.update_task(task_id, body)
    except models.NotFound:
        return api_error("Task not found", 404)
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid task data: {e}", 400)
    return jsonify(task)


@tasks_bp.route("/<int:task_id>/toggle", methods=["PATCH"])
@require_auth
def toggle_task(task_id):
    try:
        task = models.toggle_task(task_id)
    except models.NotFound:
        return api_error("Task not found", 404)
    return jsonify({"id": task["id"], "status": task["status"]})


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@require_auth
def delete_task(task_id):
    try:
        models.delete_task(task_id)
    except models.NotFound:
        return api_error("Task not found", 404)
    return jsonify({"success": True})
