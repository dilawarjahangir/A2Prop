# a2prop Frontend (Vite + React)

## Backend connection
- Set `VITE_API_BASE_URL` in `.env` (see `.env.example`). If unset, it will use the current origin (good for same-origin /api proxy) or fall back to `http://localhost:4000`.
- All API calls go through `src/api/client.js`; it handles base URL, querystrings, JSON, and timeouts.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint
