"""routes/projects.py -- all /api/projects/* endpoints."""
import sqlite3

from flask import Blueprint, jsonify, request

import models
from auth import api_error, require_auth

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.route("", methods=["GET"])
@require_auth
def list_projects():
    status = request.args.get("status")
    projects = models.list_projects(status=status)
    return jsonify({"projects": projects})


@projects_bp.route("", methods=["POST"])
@require_auth
def create_project():
    body = request.get_json(silent=True) or {}
    title = body.get("title")
    if not title:
        return api_error("'title' is required", 400)

    try:
        project = models.create_project(
            title=title,
            description=body.get("description"),
            status=body.get("status", "Active"),
        )
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid project data: {e}", 400)

    return jsonify(project), 201


@projects_bp.route("/<int:project_id>", methods=["GET"])
@require_auth
def get_project(project_id):
    project = models.get_project_with_children(project_id)
    if project is None:
        return api_error("Project not found", 404)
    return jsonify(project)


@projects_bp.route("/<int:project_id>", methods=["PUT"])
@require_auth
def update_project(project_id):
    body = request.get_json(silent=True) or {}
    try:
        project = models.update_project(project_id, body)
    except models.NotFound:
        return api_error("Project not found", 404)
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid project data: {e}", 400)
    return jsonify(project)


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
@require_auth
def delete_project(project_id):
    try:
        models.delete_project(project_id)
    except models.NotFound:
        return api_error("Project not found", 404)
    return jsonify({"success": True})
