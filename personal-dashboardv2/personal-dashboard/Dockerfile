# Multi-stage build: compile the React frontend, then serve it (as static
# files) plus the API from a single Python/Flask image. One Railway
# service, one URL, no CORS needed in production.

# ---- Stage 1: build the frontend ------------------------------------------
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json ./
# No package-lock.json is committed (never installed in the sandbox that
# built this), so this does a normal resolve-and-install rather than a
# lockfile-verified `npm ci`. Run `npm install` once locally/in CI and
# commit the resulting package-lock.json, then switch this to
# `npm ci` for reproducible builds.
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: the actual app ------------------------------------------
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend-build /frontend/dist ./static

ENV FLASK_ENV=production
# Railway sets $PORT at runtime; default to 8080 for local `docker run`.
ENV PORT=8080

# Create the database (idempotent -- init_schema uses CREATE TABLE IF NOT
# EXISTS) and start the production server. Runs every deploy; safe on an
# already-initialized volume, and required the very first time.
CMD sh -c "python init_db.py && gunicorn -b 0.0.0.0:${PORT} app:app"
