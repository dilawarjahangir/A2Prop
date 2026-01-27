# Images & Assets

## Overview
- All static assets live in `public/assets/...` (icons, images, video); there is no `src/assets` pipeline.
- Components and data reference assets via absolute `/assets/...` URLs, so most files bypass Vite bundling/hashing.
- A few SVGs are imported as ES modules (e.g., in `src/components/SignatureShowcase.jsx`), so those go through Vite’s asset pipeline even though they reside under `public`.
- Globe visuals load textures/topology from external CDNs (unpkg); there is no local fallback.

## Folder Layout
- `public/assets/icons/` – animation parts, arrows, gallery icon, logo, feature icons, footer/social icons.
- `public/assets/images/` – `blogs/` (JPGs), `latest-work/` (PNGs), `listings/property1-4/` (WEBP galleries), `partners/` (PNGs), `SignatureShowCase/` (JPGs), `teams/` (PNGs), `phone-border.webp`.
- `public/assets/video/2.mp4` – single product video.
- No aliasing or additional asset folders in `src/`; `dist/` holds build output only.

## Loading Patterns
- **Public-root references:** Components and datasets point to `/assets/...` (e.g., logos in `src/components/Header.jsx`, galleries in `src/data/properties.js`, blog heroes in `src/data/blogs.js`).
- **ES module imports:** `src/components/SignatureShowcase.jsx` imports `/assets/icons/arrow2.svg` and `/assets/icons/gallery.svg`; these are fingerprinted by Vite on build.
- **Data-driven galleries:** Property and blog images are enumerated in `src/data/properties.js` and `src/data/blogs.js`, then consumed by `SignatureShowcase`, `PropertyDetail`, `BlogSection`, and `BlogDetail`.
- **CSS/background usage:** `src/components/ClientTestimonials.jsx` sets Swiper bullet thumbnails via inline `background-image:url(...)`; no standalone CSS `url(...)` rules exist.
- **Inline SVG:** Many UI icons are defined inline in JSX (headers, buttons, navigation arrows), not pulled from files.
- **Remote assets:** Globe components (`src/components/CountryWiseTrustedWorldwide.jsx`, `src/components/TrustedWorldwide.jsx`) fetch textures from `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg` and `.../earth-topology.png`, plus country data from `https://unpkg.com/world-atlas@2/countries-110m.json`.
- **Video:** `src/components/AIFeaturesSection.jsx` embeds `/assets/video/2.mp4` inside a phone mockup (`autoplay`/`loop`/`muted`/`playsInline`).

## File Types In Use
- `svg` (icons, animation layers, social logos, favicon)
- `png` (partner logos, latest work tiles, team images)
- `jpg` (blog heroes and inline illustrations, signature showcase photos)
- `webp` (property galleries, phone-border frame)
- `mp4` (product video demo)

## Asset Inventory
- **Branding & UI icons**
  - `/assets/icons/logo.svg` — favicon in `index.html`; header logo in `src/components/Header.jsx`; footer logo in `src/components/Footer.jsx`; loader logo default in `src/components/PageLoader.jsx`; agent avatar in `src/data/properties.js`.
  - `/assets/icons/arrow.svg` — slider buttons in `src/components/CountryWiseTrustedWorldwide.jsx` and `src/components/TrustedWorldwide.jsx`.
  - `/assets/icons/arrow2.svg` — carousel controls in `src/components/SignatureShowcase.jsx`.
  - `/assets/icons/gallery.svg` — gallery count badge in `src/components/SignatureShowcase.jsx`.
  - `/assets/icons/feature/*.svg` — feature grid icons in `src/components/AIFeaturesSection.jsx`.
  - `/assets/icons/Footer/*.svg` — social/rating icons in `src/components/Footer.jsx`; TikTok/YouTube/Instagram reused in `src/components/SocialMediaLinks.jsx`.
  - `/assets/icons/AnimationParts/*.svg` — stacked card art in `src/components/AnimatedInvestmentEmpowerSection.jsx`, `src/components/InvestmentEmpowerSection.jsx` (and `.bak` variant).
- **Section imagery**
  - `/assets/images/phone-border.webp` — phone frame in `src/components/AIFeaturesSection.jsx`.
  - `/assets/video/2.mp4` — phone screen video in `src/components/AIFeaturesSection.jsx`.
  - `/assets/images/latest-work/*.png` — tiles in `src/components/LatestWorks.jsx`.
  - `/assets/images/partners/*.png` — logo loop in `src/components/Partners.jsx`.
  - `/assets/images/teams/image*.png` — team photos in `src/components/TeamShowcase.jsx` and testimonial avatars in `src/components/ClientTestimonials.jsx`.
- **Blog imagery** (all referenced in `src/data/blogs.js` and rendered in `src/components/BlogSection.jsx` / `src/pages/guest/Blog/BlogDetail.jsx`)
  - Heroes: `/assets/images/SignatureShowCase/image.jpg`, `image2.jpg`, `image3.jpg`.
  - Inline/section: `/assets/images/blogs/17debf49c38372a93d4af3cdb5c38d95a1b1ca66.jpg`, `a03acea6aab73ae9a8683156c2970824a71b065d.jpg`, `d40bc5a10d8f2fcdfb8777c3008b7b3619b3a4d2.jpg`, `f1da664e1ba21312ae58f7a3f203675b7bc96195.jpg`.
- **Listings imagery** (referenced in `src/data/properties.js`, consumed by `src/components/SignatureShowcase.jsx` and `src/pages/guest/Property/PropertyDetail.jsx`)
  - `/assets/images/listings/property1/1-5.webp`, `/property2/1-5.webp`, `/property3/1-5.webp`, `/property4/1-5.webp` — gallery and thumbnail sources.
  - Agent avatar in the dataset points to `/assets/icons/logo.svg`.
- **Other**
  - `.htaccess` in `public/` for hosting behavior (not referenced in code).
  - No additional fonts or sprites stored locally.

Unused/duplicate notes: No obvious unused files; team/testimonial components share the same three PNGs; blog datasets in English/Arabic reuse the same images; legacy `src/components/InvestmentEmpowerSection.jsx.bak` references the animation SVGs but is not routed.

## Vite Behavior
- No path aliases in `vite.config.js`; all imports are relative or absolute `/...`.
- Assets under `public/` are served verbatim at site root with original names (no hashing or transformation); cache headers depend on hosting.
- ES-module imports of assets (e.g., `/assets/icons/arrow2.svg`) are fingerprinted and inlined by Vite; consider moving such files under `src/` for clarity.
- Absolute `/assets/...` URLs assume the app is hosted at `/`; set Vite `base` or prefix with `import.meta.env.BASE_URL` if deploying under a sub-path.

## Current Optimizations and Gaps
- Present: selective `loading="lazy"`/`decoding="async"`/`fetchPriority` and `sizes` on gallery images; `webp` for listings; video set for autoplay compliance; some icons imported to leverage bundling.
- Missing: no `srcset`/responsive variants; public-folder references skip Vite optimization and hashing; several filenames contain spaces (URL-encoded in code); globe textures depend on external CDNs; no centralized error/fallback handling for broken image URLs.

## Adding a New Image (Project Conventions)
1) Place the asset under `public/assets/` (`images/`, `icons/`, or `video/`) using kebab-case without spaces to avoid `%20` encoding.
2) Reference it as `/assets/...` in JSX/data (matches current pattern), or import it in code if you want Vite to fingerprint/bundle it.
3) For data-driven views, update `src/data/properties.js` or `src/data/blogs.js` so consuming components pick it up automatically.
4) Add `loading="lazy"` (and `decoding="async"`, `sizes`, `fetchPriority` where relevant) on non-critical images; prefer compressed `webp` where possible.
5) If deploying under a sub-path, wrap URLs with `import.meta.env.BASE_URL` or use imports to avoid broken absolute paths.
6) When replacing assets, remove the old references to prevent dead files lingering in `public/assets`.

## Common Pitfalls
- Mixing plain `/assets/...` strings with ESM imports can create inconsistent caching; choose one approach per asset type.
- Public-folder assets are not hashed; rely on hosting cache headers or move critical files into `src/` imports for cache-busting.
- Absolute paths break if `base` changes; prefix with `import.meta.env.BASE_URL` for multi-environment deploys.
- Filenames with spaces (e.g., `Frame 3467.svg`) require URL encoding; prefer renaming to avoid path errors.
- External globe textures/topology require network access; consider vendoring or adding fallbacks if offline resilience is needed.
