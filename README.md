# a2prop Frontend (Vite + React)

## Backend connection
- Set `VITE_API_BASE_URL` in `.env` (see `.env.example`). If unset, it will use the current origin (good for same-origin /api proxy) or fall back to `http://localhost:4000`.
- All API calls go through `src/api/client.js`; it handles base URL, querystrings, JSON, and timeouts.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

## AI Map lock
- Access to `/ai-map` is gated by the Unlock AI Map modal. Unlock state lives in `AiMapLockProvider` (`src/hooks/useAiMapLock.js`).
- State persists per device in `localStorage` under `aiMapUnlocked` (contact payload stored in `aiMapContact`).
- Unlock via the navbar AI Map link or the homepage map preview; both reuse the same modal and the unlocked state propagates instantly.

