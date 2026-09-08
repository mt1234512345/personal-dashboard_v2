"""routes/content.py -- all /api/content/* endpoints."""
import sqlite3

from flask import Blueprint, jsonify, request

import models
from auth import api_error, require_auth

content_bp = Blueprint("content", __name__, url_prefix="/api/content")


@content_bp.route("", methods=["GET"])
@require_auth
def list_content():
    status = request.args.get("status")
    priority = request.args.get("priority")
    theme = request.args.get("theme")
    project_id = request.args.get("project_id")

    if project_id is not None:
        try:
            project_id = int(project_id)
        except ValueError:
            return api_error("'project_id' must be an integer", 400)

    content = models.list_content(
        status=status, priority=priority, theme=theme, project_id=project_id
    )
    return jsonify({"content": content})


@content_bp.route("", methods=["POST"])
@require_auth
def create_content():
    body = request.get_json(silent=True) or {}
    url = body.get("url")
    title = body.get("title")
    if not url or not title:
        return api_error("'url' and 'title' are required", 400)

    try:
        item = models.create_content(
            url=url,
            title=title,
            source=body.get("source"),
            read_time=body.get("read_time"),
            priority=body.get("priority", "Medium"),
            theme=body.get("theme"),
            project_id=body.get("project_id"),
            thoughts=body.get("thoughts"),
            status=body.get("status", "Unread"),
        )
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid content data: {e}", 400)

    return jsonify(item), 201


@content_bp.route("/<int:content_id>", methods=["GET"])
@require_auth
def get_content(content_id):
    item = models.get_content(content_id)
    if item is None:
        return api_error("Content not found", 404)
    return jsonify(item)


@content_bp.route("/<int:content_id>", methods=["PUT"])
@require_auth
def update_content(content_id):
    body = request.get_json(silent=True) or {}
    try:
        item = models.update_content(content_id, body)
    except models.NotFound:
        return api_error("Content not found", 404)
    except sqlite3.IntegrityError as e:
        return api_error(f"Invalid content data: {e}", 400)
    return jsonify(item)


@content_bp.route("/<int:content_id>/status", methods=["PATCH"])
@require_auth
def update_status(content_id):
    body = request.get_json(silent=True) or {}
    status = body.get("status")
    if status not in ("Unread", "Reading", "Read"):
        return api_error("'status' must be one of Unread, Reading, Read", 400)
    try:
        item = models.update_content_status(content_id, status)
    except models.NotFound:
        return api_error("Content not found", 404)
    return jsonify(item)


@content_bp.route("/<int:content_id>/thoughts", methods=["PUT"])
@require_auth
def update_thoughts(content_id):
    body = request.get_json(silent=True) or {}
    if "thoughts" not in body:
        return api_error("'thoughts' is required", 400)
    try:
        item = models.update_content_thoughts(content_id, body.get("thoughts"))
    except models.NotFound:
        return api_error("Content not found", 404)
    return jsonify(item)


@content_bp.route("/<int:content_id>", methods=["DELETE"])
@require_auth
def delete_content(content_id):
    try:
        models.delete_content(content_id)
    except models.NotFound:
        return api_error("Content not found", 404)
    return jsonify({"success": True})
