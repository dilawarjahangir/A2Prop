# Frontend Integration Milestones (a2prop ↔ backend)

## Milestone 1 — Foundation & API Client
- Add env config for backend base: `VITE_API_BASE_URL` (document in README, fallback to `http://localhost:4000` for dev).
- Create `src/api/client.js`:
  - `request(path, { method, params, body, signal })` that prefixes base URL, builds querystring, sets JSON headers, parses JSON, and normalizes errors.
  - Timeout via `AbortController`, surface `{ status, message }` on failure.
- Add `src/api/types.js` with JSDoc typedefs for Listing, PropertyDetail, Developer, Amenity, LocationResult, ListingsResponse (total, totalAvailable, list).
- Utilities: `buildQuery(params)`, `safeNumber`, `formatCurrency`, `mergeParamsWithDefaults`.

## Milestone 2 — Data Services & Memoization
- Implement `src/api/listings.js`:
  - `getListings(filters)` → GET `/api/v1/listings` with filters (type, q, price, size, beds, propertyType[], developerIds, cityIds, communityIds, regionIds, sort/sortType, page/size, fetchAll).
  - `getPropertyDetail(slug)` → GET `/api/v1/properties/:slug`.
- Implement `src/api/meta.js`:
  - `getDevelopers({ q, page, size })` → POST/GET `/api/v1/meta/developers`.
  - `getAmenities()` → GET `/api/v1/meta/amenities`.
  - `getLocations({ q, page, size })` → GET `/api/v1/meta/locations`.
- Add lightweight memoization (e.g., Map keyed by URL) for meta calls and repeated listing payloads (short TTL).
- Provide a dev toggle for mock data fallback if backend is unreachable (optional).

## Milestone 3 — Listings Page Integration & Filters
- Replace static `src/data/properties.js` usage in `pages/guest/Property/PropertyListings.jsx` with live `getListings`.
- Build filter state (URL-synced): listing type tabs (NEW/SELL/RENT), search text, price range, size range, beds, propertyType chips, developer/location/amenity selectors, community/city/region IDs, sort/sortType, page/size, `fetchAll` toggle.
- Add filter UI components (dropdowns/chips/inputs) and debounce search for developer/location lookups.
- Render listings grid from API; show `total`/`totalAvailable`, pagination controls, and “showing X of Y” messaging.
- Add loading skeletons, empty state, and error state with retry.

## Milestone 4 — Property Detail & CTA Wiring
- Replace static detail view with `getPropertyDetail(slug)` data: gallery, price, status, location, city/community, beds/baths/size, developer, amenities list, agent contact.
- Ensure slug/id resolution matches backend (`/api/v1/properties/:slug`).
- Wire CTA buttons (call/email) to agent contact; optionally prepare payload shape for lead submission (future).
- Add not-found handling (404) with navigation back to listings/search.

## Milestone 5 — Polish, i18n, QA & Docs
- Wrap new labels in i18n, format currency/numbers per locale.
- Accessibility: alt text, focus states, keyboard navigation for filter controls.
- Performance: memoize meta data across pages, lazy-load media, consider code-splitting heavy routes.
- QA checklist: verify all filters hit backend with correct params; test NEW/SELL/RENT, fetchAll, pagination, meta endpoints; validate amenity/developer/location selectors.
- Update `README.md` with env setup, API usage examples, and known backend quirks (e.g., Pixxi RENT sometimes missing in listings feed).
