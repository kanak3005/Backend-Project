# Vuelo — Frontend

React + Vite + Tailwind frontend for the Backend-Project video platform API.
Every page in this app talks to the real backend — there is no mock/fake data anywhere.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # edit if your backend runs somewhere other than localhost:8000
npm run dev
```

Make sure the backend is running first (`npm run dev` in the project root), with a real
MongoDB URI and Cloudinary credentials in its own `.env`.

## Environment variables

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Base URL the frontend sends all API requests to |

## Project structure

```
src/
├── api/            # one file per backend resource - all Axios calls live here
├── components/     # reusable UI pieces (VideoCard, CommentSection, buttons, states...)
├── context/        # AuthContext (logged-in user) + ToastContext (notifications)
├── layouts/        # MainLayout - Navbar + page outlet
├── pages/          # one file per route
├── routes/         # ProtectedRoute (login-required page guard)
├── utils/          # formatters (dates, counts, durations)
├── App.jsx         # route definitions
└── main.jsx        # app entry point
```

## Authentication

The backend uses httpOnly cookies for accessToken/refreshToken, so the frontend never
touches tokens directly. axiosClient sends withCredentials: true on every request, and
automatically calls /users/refresh-token and retries once if a request comes back 401.

Public pages (Home, Explore, Search, Watch, Channel, reading comments) never require login.
Protected actions (upload, edit/delete video, publish/unpublish, comment, like, subscribe)
redirect to /login only when actually attempted.

## Known backend limitations (not frontend bugs)

- Like buttons cannot show a total like count or the viewer's initial liked state - the
  backend's like-toggle endpoints only return { liked: true/false }. See the chat report
  for details.
- "More videos" on the Watch page is the latest videos list, not a personalized
  recommendation - the backend has no related-videos algorithm.
- Liked-video cards may not show the channel avatar/name - GET /likes/videos doesn't
  populate the video owner (unlike watch history, which does).
