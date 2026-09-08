# Personal Dashboard

Single-service deploy: Flask serves both the JSON API and the built React
frontend from one Railway service / one URL. Local iteration still works
as two separate dev servers if you want it (see each subfolder's own
README/notes); this top level is about the combined production build.

## Layout

```
personal-dashboard/
  backend/     Flask API (see its own files for endpoint details)
  frontend/    React app (Vite)
  Dockerfile   builds frontend, then serves it + the API from one image
  railway.toml Railway build/deploy config (points at the Dockerfile)
```

## Deploying to Railway

1. **Push this folder to a GitHub repo.** From inside `personal-dashboard/`:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-empty-github-repo-url>
   git push -u origin main
   ```
   (Create the empty repo on github.com first, don't initialize it with a
   README/license there, or the push above will conflict.)

2. **In Railway:** New Project -> Deploy from GitHub repo -> pick this repo.
   Railway will detect `railway.toml` and build from the `Dockerfile`
   automatically -- no other build configuration needed.

3. **Attach a persistent volume.** Without one, the SQLite database lives
   on the container's disk and is wiped on every redeploy. In the
   service's Settings -> Volumes, add a volume mounted at `/app/data`.

4. **Set environment variables** (Service -> Variables):
   - `SECRET_KEY` -- any long random string
   - `ADMIN_PASSWORD` -- your login password (or set `PASSWORD_HASH` instead,
     see backend/.env.example for how to generate one)
   - `DATABASE_URL` -- `sqlite:////app/data/app.db` (four slashes -- this
     is what makes it write into the mounted volume from step 3)
   - `CORS_ORIGINS` -- can leave unset; same-origin requests don't need it
     now that one service serves both

5. Railway assigns you a public URL. That's it -- open it on your phone,
   no laptop or terminal required going forward.

## What I could and couldn't verify here

- Backend: all Python files compile cleanly.
- Frontend: the full module graph (44 files) bundles cleanly with esbuild.
- Dockerfile: valid syntax, correct COPY paths for this build context --
  but I could not actually run `docker build` end-to-end in this sandbox,
  because pulling `node:20-slim` / `python:3.11-slim` from Docker Hub is
  blocked here (the same network restriction that blocked `pip install`
  and `npm install` earlier in this build). Railway builds on its own
  infrastructure with normal registry access, so this should not be an
  issue there -- but it means the first real Docker build test happens on
  Railway's first deploy, not before. Watch the build logs on that first
  deploy for surprises.
- No `frontend/package-lock.json` is committed (couldn't generate one
  without `npm install` working here). The Dockerfile does `npm install`
  rather than `npm ci` because of this -- works, but isn't
  version-locked. Once you can run `npm install` somewhere with working
  registry access, commit the resulting `package-lock.json` and switch
  the Dockerfile's `RUN npm install` to `RUN npm ci` for reproducible builds.
