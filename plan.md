# Frontend Integration Plan (a2prop ↔ backend)

Goal: wire the Vite/React frontend to the backend APIs for listings, property detail, developers, amenities, and locations with full filtering support and polished UX states.

## Milestone 1 — Foundation & Config
- Add runtime config for API base URL in `.env`/`import.meta.env` (e.g., `VITE_API_BASE_URL`), update README run instructions.
- Create a lightweight API client layer (`src/api/client.js`) with `fetch` wrappers: base URL prefix, default headers, timeout/abort support, JSON parsing, error normalization.
- Define TypeScript-like JSDoc types/constants for backend contracts in `src/api/types.js` (Listing, PropertyDetail, Developer, Amenity, Pagination).
- Introduce shared helpers: querystring builder, slug/id helpers, number formatting, and response guards.

## Milestone 2 — Data Services & Caching
- Implement service functions in `src/api/listings.js`: `getListings(params)`, `getPropertyDetail(slug)`, including `fetchAll`, filters (type, q, price/size ranges, beds, propertyType[], developerIds, cityIds, communityIds, regionIds, sort/sortType, page/size).
- Implement meta services in `src/api/meta.js`: `getDevelopers({ q, page, size })`, `getAmenities()`, `getLocations({ q, page, size })`.
- Add simple client-side caching/memoization (or integrate TanStack Query if desired) for meta endpoints and repeated listing queries; include stale-time and deduping.
- Provide mock fallbacks for dev when backend is unavailable (optional: toggle via env).

## Milestone 3 — UI Wiring: Listings & Filters
- Replace static property data usage (`src/data/properties.js`) in `pages/guest/Property/PropertyListings.jsx` with live data from `getListings`.
- Build filter state model (URL-synced): type tabs, search text, price/size sliders, beds, propertyType chips, developer/amenity/location selectors, sort, page/size, `fetchAll` toggle for “see all”.
- Implement loading, empty, and error states; add skeleton cards; respect backend `total`/`totalAvailable` for pagination and “showing X of Y” messaging.
- Map amenity/developer/location results into filter controls; debounce searches for developer/location lookups.

## Milestone 4 — UI Wiring: Property Detail & Lead CTAs
- Replace static detail view with `getPropertyDetail(slug)` output; display gallery, price, status, location, beds/baths/size, developer, amenities list, and agent contact.
- Ensure slug/id resolution matches backend (`/api/v1/properties/:slug`).
- Wire contact/CTA buttons to correct phone/email; optionally prefill lead forms with property slug/id for submission endpoints if/when enabled.
- Add graceful fallback when a property is not found (404 view with navigation back to listings).

## Milestone 5 — UX Polish, i18n, and Handoff
- i18n: wrap new copy/labels in translations; format numbers/currency per locale.
- Accessibility: alt text for images, focus states on filter controls, keyboard navigation for dropdowns.
- Performance: lazy-load images (already), split code where useful, cache meta data across pages.
- QA checklist: verify all filters hit the backend with correct query params; test RENT/SELL/NEW, fetchAll, pagination, and meta fetches; ensure error toasts/messages are user-friendly.
- Documentation: update `README.md` with API usage, env setup, and examples; add Postman/Insomnia links if used; note backend quirks (e.g., Pixxi RENT sometimes missing in listings feed, detail still works).
