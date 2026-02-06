# A2 Properties Frontend – Project Overview

This repository contains the marketing and discovery site for **A2 Properties**, built as a single‑page React application focused on Dubai real estate discovery, interactive storytelling, and high‑end motion design.

The app is fully client‑side: routing, state, content modelling, and animations all run in the browser, with project and blog data stored as structured JSON-like objects.

---

## Tech Stack

### Core runtime

- **React 19** (with `StrictMode`) for UI.
- **Vite 7** (React template) for dev server, bundling, and HMR.
- **React Router v7** (`react-router-dom`) for client‑side routing.

### Styling & layout

- **Tailwind CSS 3** wired via `tailwind.config.js` and `postcss.config.js`.
- Utility‑first styling across most components, plus a few custom classes in `src/index.css` (scroll progress bar, scrollbar hiding).
- Responsive layout using Tailwind breakpoints and flex/grid utilities.
- Glassmorphism and layered gradient backgrounds combined with `backdrop-filter` and fallbacks (see `GlassSurface.jsx`).

### Internationalization

- **i18next + react-i18next** with browser language detection and localStorage caching (`src/i18n/i18n.js`).
- Locales live in `src/i18n/locales/{en,ar}/common.json`; only `common` namespace is used today.
- `useLocale` helper provides `getLocale()`, `isRTL()`, and `setLocale()`; RTL support toggles for Arabic.

### Animation, motion & graphics

- **Framer Motion** (`framer-motion` / `motion`) for scroll‑driven hero animation (`Hero.jsx`) and orbital background scaling.
- **GSAP 3** + **ScrollTrigger** for:
  - Complex scroll‑linked 3D stack animation in `AnimatedInvestmentEmpowerSection.jsx`.
  - Page entry/exit loader with animated bars and logo (`PageLoader.jsx`).
  - Integration with smooth scrolling via `Lenis` (`useSmoothScroll.js`).
- **Lenis** for smooth scrolling, wired so that Lenis drives `ScrollTrigger` updates and anchor links / hash navigation (`useSmoothScroll.js`).
- **OGL** (`ogl`) + custom GLSL shaders to render a GPU‑driven animated orb background (`Orb.jsx`).
- **Globe.gl** + **topojson-client** to render an interactive 3D Earth that highlights key markets, with animated markers, arcs, and country coloring (`CountryWiseTrustedWorldwide.jsx`).
- **Swiper** (React bindings) for auto‑playing carousels of markets and agents, with custom navigation wiring.

### Data & rich content

- **Backend‑driven data** for properties and meta:
  - Listings, property detail, developers, amenities, and locations are fetched from the backend (`/api/v1/*`) via the API client in `src/api/`.
  - Environment variable: `VITE_API_BASE_URL` (falls back to window origin); requests are JSON and include timeouts + abort handling.
- **Static content** for marketing/blog:
  - `src/data/blogs.js` – blog posts with typed blocks (paragraphs, lists, steps, tables, images, callouts, FAQ groups, etc.).
  - Legacy `src/data/properties.js` remains for some marketing sections (e.g., “SignatureShowcase”) but listing/detail pages now source from the live API.
  - Blog detail and marketing sections render these objects into UI components rather than hard‑coding copy in JSX.

### Tooling & quality

- **ESLint 9** flat config (`eslint.config.js`) with:
  - `@eslint/js` base rules.
  - React Hooks rules.
  - React Refresh rules for Vite.
  - Custom `no-unused-vars` configuration that allows uppercase / constant‑style names to be ignored.
- **Tailwind + PostCSS + Autoprefixer** for the CSS pipeline.
- NPM scripts (see `package.json`):
  - `npm run dev` – start Vite dev server.
  - `npm run build` – build production bundle into `dist/`.
  - `npm run preview` – preview the built site.
  - `npm run lint` – run ESLint across the project.

Vite dev server is configured in `vite.config.js` with custom `allowedHosts` for tunneling:

- `tunnel5173.eigensol.com`
- `4355443b2160.ngrok-free.app`

---

## Top-Level Layout

**Root**

- `index.html` – SPA shell that mounts React into `#root` and sets favicon/title.
- `src/` – main application source (components, pages, routing, data, hooks).
- `public/` – static assets (icons, images, videos) served from `/assets/...`.
- `dist/` – Vite build output (generated, not hand‑edited).
- `_notes/` – internal prompts and notes used while iterating on animations and flows.
- `package.json`, `package-lock.json` – dependencies and scripts.
- `vite.config.js` – Vite + dev server configuration.
- `tailwind.config.js` – Tailwind scanning configuration for `./src/**/*.{html,js,jsx}`.
- `postcss.config.js` – PostCSS pipeline (Tailwind + Autoprefixer).
- `eslint.config.js` – shared linting rules for JS/JSX.
- `README.md` – base Vite template readme (not project‑specific).

---

## `src/` Structure

### Entry & global wiring

- `src/main.jsx`
  - React entrypoint; creates a root on `#root` and renders `<App />` inside `React.StrictMode`.
  - Imports `src/i18n/i18n.js` to initialise locale resources before rendering.
- `src/App.jsx`
  - Top‑level app component.
  - Sets up `BrowserRouter`, generates `<Route>` elements from the route config in `src/routes`.
  - Wraps all guest routes with a shared layout via a higher‑order function (`withGuestLayout` in `guest_routes.jsx`).
  - Shows `PageLoader` on initial load and hides it when animation completes.
  - Resets scroll to top on route changes via `ScrollToTop` (using `useLocation`).
  - Has a hook ready for global smooth scrolling (`useSmoothScroll`) which can be toggled on.
- `src/App.css`
  - Imports Tailwind base, components, and utilities.
- `src/index.css`
  - Global CSS overrides:
    - Hides the default scrollbar for a clean, app‑like feel.
    - Defines `.scroll-progress-track` and `.scroll-progress-bar` styles for the right‑edge scroll indicator.

### Layout

- `src/Layout/GuestLayout.jsx`
  - Shared shell for all “guest” routes.
  - Renders:
    - `ScrollProgress` – fixed right‑edge scroll bar bound to document scroll.
    - `Header` – main navigation and brand.
    - `<main>` – constrained content area (`max-w-6xl`) with padding.
    - `Footer`.
  - Gives all public pages a consistent background (`#181818`) and typography.

### Routing

- `src/routes/index.jsx`
  - Exports the aggregated route groups as an array (currently only `guest_routes`).
- `src/routes/guest_routes.jsx`
  - Imports page components and `GuestLayout`.
  - Defines `withGuestLayout(Component)` HOC that wraps any page in `<GuestLayout>`.
  - Exports `guest_routes`, an object mapping paths to wrapped components:
    - `/`, `/home` → `Home` landing page.
    - `/about` → `About`.
    - `/blog`, `/blog/:slug` → blog listing and detail.
    - `/properties`, `/properties/:slug`, `/property/:slug` → property listing and detail views.
- Routing is generated in `App.jsx` by iterating over these objects and creating `<Route>` components, so the config stays declarative and centralised.

### Pages

- `src/pages/guest/Home/Home.jsx`
  - Composes the landing page by stitching together section‑level components:
    - `Hero`, `WhyChooseUs`, `TrustedWorldwide` (3D globe), `AIFeaturesSection`,
      `EmbeddedProjectsMap`, `Partners`, `InvestmentEmpowerSection` (animated stack),
      `SignatureShowcase`, `ClientTestimonials`, `LatestWorks`, `BlogSection`,
      `FAQSection`, `SocialMediaLinks`, `InvestorHighlights`.
  - Keeps the page itself very thin and declarative; all heavy logic lives in components.

- `src/pages/guest/About/About.jsx`
  - Simple static content describing A2Prop; uses typography and basic layout only.

- `src/pages/guest/Blog/BlogListings.jsx`
  - Lists all blog posts from `blogs.js`.
  - Sorts posts by parsed date, then renders a grid of cards.
  - Each card:
    - Shows image, tag, reading time, title, and excerpt.
    - Links to `/blog/:slug` detail pages.
    - Displays `displayDate` when provided (Arabic) to keep localised date strings.
  - Uses `GradientButton` to link into properties, plus quick filter pills (“Market Reports”, “Off‑plan”, etc.).

- `src/pages/guest/Blog/BlogDetail.jsx`
  - Detail page for a single blog post (found via `useParams` and `getBlogBySlug`).
  - Locale‑aware: pulls posts via `getBlogsForLocale(getLocale())` and falls back to English if missing; uses `displayDate` when available.
  - Implements `BlockRenderer` to render `sections[].blocks[]` from `blogs.js`, supporting:
    - `paragraph`, `list`, `steps`, `image`, `table`, `callout`, and FAQ‑style content.
  - Renders:
    - Hero area with tag, date, reading time, title, subtitle, author metadata, and hero image.
    - “On this page” local table‑of‑contents derived from section IDs and titles.
    - FAQ area derived from `post.faqs`.
    - Related posts, based on other blog entries.
    - Sidebar newsletter call‑to‑action.
  - Includes a robust `tryCopyToClipboard` helper that falls back to `document.execCommand` when `navigator.clipboard` is unavailable.

- `src/pages/guest/Property/PropertyListings.jsx`
  - Grid of property cards powered by live backend data (`getListings` from `src/api/listings.js`).
  - Filters: type (SELL/RENT/NEW), search `q`, min/max price, beds, propertyType, fetchAll toggle, pagination (page/size).
  - Each card shows hero image, status, location, title, AED price, highlights, “view details” link, and `tel:` CTA.
  - Error/empty/loading states included; pagination controls at bottom with styled “per page” selector.

- `src/pages/guest/Property/PropertyDetail.jsx`
  - Fetches property detail by slug from the backend (`getPropertyDetail`).
  - Normalizes gallery URLs to Pixxi CDN host; renders swipeable/thumbnail gallery.
  - Renders facts (price, beds, baths, size, developer, city, status, type, region, permit), description, amenities, payment plan/timeline, agent contact buttons, and Google Maps embed.
  - Shows floorplan/styles (from `raw.style`) when available, and recommended listings from the API response.

- `src/pages/NotFoundPage.jsx`
  - Fallback “404” page rendered for unmatched routes.

- `src/pages/admin/`
  - Currently empty placeholder for future admin‑only pages.

### Components

Most of the application’s behavior lives in `src/components/`. Highlights:

- **Layout & shell**
  - `Header.jsx` – top navigation bar:
    - Desktop: inline nav items and CTAs.
    - Mobile: floating bottom “Navigation” pill that opens a full‑screen overlay menu, with scroll locking and click‑outside handling.
  - `Footer.jsx` – site footer with links, legal text, and social areas.
  - `ScrollProgress.jsx` – vertical scroll indicator at the right edge, computing progress based on `document.documentElement` scroll metrics.

- **Hero & visual primitives**
  - `Hero.jsx` – main hero section:
    - Uses `useScroll` + `useTransform` from Framer Motion to scale the background orb as the hero scrolls out of view.
    - Renders primary tagline and CTA using `GradientButton`.
  - `Orb.jsx` – GPU shader‑based orb:
    - Uses OGL to create a full‑screen triangle and custom vertex/fragment shaders.
    - Implements noise‑based color fields, hue shifting, and hover‑driven distortion.
    - Responds to pointer movement and animates over time with `requestAnimationFrame`.
  - `GlassSurface.jsx` – advanced glassmorphism container:
    - Generates displacement maps via dynamically created SVGs.
    - Uses SVG filters (`feDisplacementMap`, `feColorMatrix`, `feGaussianBlur`) to create refracted edges.
    - Adapts styling based on dark mode preference and browser support for `backdrop-filter`.

- **Sections & marketing components**
  - `AIFeaturesSection.jsx` – highlights AI‑powered features with cards and icons.
  - `AnimatedInvestmentEmpowerSection.jsx` – flagship animated stack:
    - Uses GSAP + ScrollTrigger for multi‑phase scroll animations of stacked tiles and taglines.
    - Adds subtle 3D tilt and ambient glow pulses as the section enters and leaves the viewport.
  - `WhyChooseUs.jsx`, `Partners.jsx`, `InvestorHighlights.jsx`, `SignatureShowcase.jsx`, `LatestWorks.jsx`, `TeamShowcase.jsx`, `BlogSection.jsx`, `SocialMediaLinks.jsx` – additional storytelling and CTA‑oriented sections (e.g., `SignatureShowcase` now reads localized property data).
  - `FAQSection.jsx` – accordion FAQ:
    - Maintains an `openIndex` in state.
    - Uses CSS transitions with `grid-rows` tricks to smoothly expand/collapse answers.

- **Data‑driven visuals**
  - `CountryWiseTrustedWorldwide.jsx` – “Trusted worldwide” global presence:
    - Builds an array of `markets` with lat/lng metadata.
    - Uses `Globe.gl` to render countries and market points, with custom color mapping.
    - Uses `topojson-client` to derive country geometries and match them to markets.
    - Integrates `Swiper` to horizontally scroll through markets, and `ReactCountryFlag` for visual flags.
  - `EmbeddedProjectsMap.jsx` – embeds an external interactive map from `map.estate` in an iframe, styled as a glowing glass panel.
  - `ClientTestimonials.jsx` – testimonials, often using animated layouts and scroll reveals.

- **System & utilities**
  - `GradientButton.jsx` – gradient CTA button that can behave as React Router `<Link>` for internal routes or `<a>` for external URLs, with hover‑driven gradient direction changes.
  - `CountUp.jsx` – animated counting component (e.g., for KPIs or stats).
  - `PageLoader.jsx` – full‑screen GSAP loader:
    - Renders a set of vertical bars whose entrance/exit are individually randomized.
    - Locks body scroll while the loader plays.
    - Fades the logo in/out and then the loader itself, finally invoking `onComplete` passed from `App`.
  - `ScrollFadeIn.jsx` – currently a simple passthrough wrapper used to group sections likely to get scroll animations; makes future animation upgrades easier without touching page code.
  - `components/dev/ScrollProgressBar.jsx` – simple horizontal scroll progress bar component used in earlier prototypes.

### Hooks

- `src/hooks/useSmoothScroll.js`
  - Sets up `Lenis` for smooth scrolling.
  - Wires Lenis into GSAP’s `ScrollTrigger.update` so scroll‑linked animations stay in sync.
  - Adds document‑level click handler to intercept anchor links (`href="#section"`) and route them through Lenis with an offset (for fixed header).
  - Handles initial URL hashes and `hashchange` events to ensure smooth scrolling even when navigating via browser controls.
  - Cleans up animation frame loop and event listeners on unmount.

- `src/hooks/useLocale.js`
  - `getLocale()` returns resolved language from i18next; `setLocale(lng)` persists to `localStorage` and calls `i18n.changeLanguage`.
  - `isRTL(lng)` flags RTL languages (Arabic) for layout direction handling.

### Data

- `src/data/blogs.js`
  - Exports:
    - `blogs` / `blogsAr` – arrays of blog objects per locale.
    - `blogsByLocale`, `getBlogsForLocale(locale)` – locale‑aware lists.
    - `getBlogBySlug(slug, locale?)` – helper for case‑insensitive slug lookup.
  - Each blog object includes:
    - `slug`, `tag`, `title`, `subtitle`, `date` (`displayDate` for localized display), `readingTime`.
    - `author` (name, role).
    - `image` path, `excerpt`.
    - `sections` – array of `{ id, title, blocks }`, where `blocks` is a typed content model consumed by `BlockRenderer`.
    - Optional `faqs`.

- `src/api/`
  - `client.js` – base API client with `request(path, { method, params, body, timeout })`, shared `API_BASE_URL`, JSON parsing, and abortable timeouts.
  - `utils.js` – `buildQuery`, `safeNumber`, `formatCurrency`, `mergeParamsWithDefaults`.
  - `listings.js` – `getListings(filters)` and `getPropertyDetail(slug)` hitting `/api/v1/listings` and `/api/v1/properties/:slug`.
  - `meta.js` – memoized fetchers for `/api/v1/meta/developers`, `/api/v1/meta/amenities`, `/api/v1/meta/locations` with TTL caching.
  - `types.js` (if present) – shared typedefs/utilities for API shapes.

- `src/data/properties.js`
  - Legacy structured property content used by some marketing components; listing/detail pages now rely on the backend API instead.

---

## Key Implementation Patterns & Techniques

- **Configuration‑driven routing**
  - Paths and page components live in `src/routes/guest_routes.jsx` as a plain object, rather than spread across JSX.
  - `withGuestLayout` wraps pages so the layout is applied consistently from a single place.

- **Data‑driven content rendering**
  - Blog and property pages read from `data/` files and render sections based on type, making it easy to add/edit content without touching JSX logic.
  - Helpers like `parseBlogDate`, `formatStat`, and `getHighlights` keep transformation logic centralized.

- **Advanced motion & scroll orchestration**
  - Lenis‑driven smooth scrolling is integrated with GSAP’s `ScrollTrigger`, keeping animation and scroll physics in sync.
  - Scroll progress is visualised via a fixed right‑edge bar (`ScrollProgress`) and can be reused on any layout.
  - Hero and orb backgrounds use Framer Motion and WebGL shaders to react to scroll and pointer movement.

- **Responsive, mobile‑first navigation**
  - Header dynamically changes behavior below ~820px:
    - Introduces a floating bottom pill for opening the menu.
    - Locks body scroll and closes on outside clicks or nav item selection.

- **Third‑party embeds**
  - External map providers and Google Maps are embedded securely in iframes with controlled styling and lazy loading.
  - `react-country-flag` and `Swiper` add rich internationalization and motion to the “Trusted worldwide” section.

---

## How to Work With This Project

- **Run locally**
  - Install dependencies: `npm install`
  - Start dev server: `npm run dev` (Vite on port `5173` by default).
  - Ensure `VITE_API_BASE_URL` is set (e.g., `http://localhost:4000`) so property listing/detail calls reach the backend; otherwise the client will fall back to the current window origin.

- **Build & preview**
  - Production build: `npm run build`
  - Preview build: `npm run preview`

- **Where to add things**
  - New sections on the home page: create a component in `src/components/`, then import and compose it in `src/pages/guest/Home/Home.jsx`.
  - New blogs: add entries to `src/data/blogs.js`; `BlogListings` and `BlogDetail` will pick them up automatically.
  - New properties: add entries to `src/data/properties.js`; listing and detail pages will automatically expose them via slug.
  - New public routes: extend `guest_routes` in `src/routes/guest_routes.jsx` and, if needed, create a new page component under `src/pages/guest/`.

This document should be a good starting point for navigating the codebase, understanding the tech stack, and extending the project safely.
