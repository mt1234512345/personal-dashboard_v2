# Personal Dashboard -- Frontend

Mobile-first React client for the Flask backend (`project-dashboard-backend`).

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm run dev
```

The dev server runs at http://localhost:5173 by default. Make sure the backend
is running (see the backend's own README/notes) and `VITE_API_BASE_URL` points
at it -- default is `http://localhost:5000`.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Notes

- `index.html` lives at the project root, not in `public/`, because that's
  where Vite expects it in order to process `/src/main.jsx` as the entry
  script. `public/` is kept for static assets (favicon, etc.).
- Auth token is stored in `localStorage` under `authToken` and attached to
  every API call as `Authorization: Bearer <token>`. A 401 response clears
  it and hard-redirects to `/login`.
- `weekly_planning` only accepts Monday-Saturday (see the backend's own
  schema notes) -- the day picker never offers Sunday.
