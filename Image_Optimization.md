## Image optimization plan (tailored to your current `public/assets` strategy)

### 1) Decide the “source of truth” strategy (stop mixing pipelines)

Right now you mix:

* **Public-root strings** (`/assets/...`) → no hashing, no build-time optimization
* **ESM imports** (some SVGs) → hashed + optimized by Vite

**Plan**

* **Option A (recommended): Move most images to `src/assets` and import them.**
  Use Vite’s pipeline for hashing, tree-shaking, and consistent behavior.
* **Option B: Keep `public/assets` but add a build-time optimizer that outputs versioned files** (more custom work; less automatic).

✅ Recommended:  **A for images used in components/pages** , keep **public/** for truly static/public things (favicon, robots, a few marketing files).

---

### 2) Establish performance budgets (so “optimized” is measurable)

Set budgets per asset class:

* **Icons/SVG:** inline or optimized SVG < 5–15KB each
* **Logos/partner PNGs:** convert to SVG if possible; else WebP/AVIF < 20KB
* **Blog heroes:** AVIF/WebP, target **80–180KB** each
* **Property gallery images:** AVIF/WebP, target **40–120KB** each depending on dimensions
* **Video:** replace heavy mp4 with proper encoding + poster image

Add a simple CI check later (size thresholds) so regressions don’t creep back in.

---

### 3) Convert formats and generate responsive variants (biggest win)

#### Listings & blogs (currently JPG/PNG/WEBP)

Create variants for each “content image”:

* `image@480.avif`, `image@768.avif`, `image@1280.avif`
* same set in `.webp` as fallback (Safari is mostly fine now, but fallback is still safe)
* keep the original only if required

**Rules**

* Use  **AVIF first** , WebP second, original JPG/PNG last.
* Ensure max width matches UI needs:
  * blog hero max 1280 or 1440
  * listing gallery max 1600–2000 depending on zoom/slider

---

### 4) Implement `<picture>` + `srcset/sizes` everywhere you render photos

For all gallery, blog, team, latest-work tiles:

```jsx
<picture>
  <source type="image/avif" srcSet={`${img480Avif} 480w, ${img768Avif} 768w, ${img1280Avif} 1280w`} />
  <source type="image/webp" srcSet={`${img480Webp} 480w, ${img768Webp} 768w, ${img1280Webp} 1280w`} />
  <img
    src={img768Jpg}
    alt={alt}
    loading="lazy"
    decoding="async"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</picture>
```

**Apply by priority**

1. Property gallery + hero images (largest payload)
2. Blog hero + section images
3. Latest-work tiles
4. Team/testimonial avatars

---

### 5) Make a small “Image component” and use it everywhere

Create `src/components/OptimizedImage.jsx` that standardizes:

* `loading`, `decoding`, `fetchPriority`
* `width/height` to prevent layout shift
* `srcset/sizes` handling
* error fallback (broken URL → placeholder)

This prevents each component doing it differently and ensures consistency.

---

### 6) Fix caching properly (public assets currently un-hashed)

If you keep anything in `public/assets`:

* Configure hosting to serve:
  * `Cache-Control: public, max-age=31536000, immutable` **only for hashed filenames**
  * For non-hashed: shorter TTL like `max-age=3600` or use versioned folders (`/assets/v3/...`)

If you move assets into `src/assets` and import them:

* Vite will fingerprint them → safe to cache “forever”.

---

### 7) SVG optimization + consistency

#### Icons

* Run SVGO on all SVG icons/animation parts
* Decide:
  * **Inline SVG** for UI icons that change color/size via CSS
  * **File SVG** for static decorative assets

#### AnimationParts

* Consider converting layered SVG “animation parts” to:
  * a single SVG sprite, or
  * Lottie (only if it truly reduces payload + complexity)

---

### 8) Replace inline `background-image` thumbnails (Swiper bullets) with real images

Your bullet thumbs via inline `background-image:url(...)` can:

* load eagerly
* bypass `<img>` optimizations
* lack `srcset`

**Plan**

* Render bullets using `<img>` (or `<picture>`) so you can lazy-load and size them
* If Swiper needs background-image, still pre-generate tiny thumb versions:
  * `thumb@64.webp`, `thumb@64.avif`

---

### 9) Globe remote textures: self-host + compress + add fallback

Currently fetched from unpkg → fragile + slower.

**Plan**

* Download and store locally under `src/assets/globe/` (or `public/assets/globe/`)
* Convert textures to compressed formats if supported by your loader
* Add fallback retry logic
* Consider serving topology JSON locally too

This improves reliability and allows caching.

---

### 10) Video optimization (mp4 in phone mockup)

* Re-encode `2.mp4`:
  * H.264 baseline/high profile depending on target
  * cap resolution to what’s shown inside phone frame
  * use sane bitrate
* Add a **poster image** (`poster.webp/avif`)
* Consider offering `webm` as alternative if helpful

---

### 11) Remove duplication + unify datasets

You mentioned images reused across Arabic/English blog datasets and team/testimonials.

**Plan**

* Centralize asset constants:
  * `src/assets/index.js` exporting references
* Use same image objects across datasets instead of repeating strings
* Ensure each unique image file exists once (avoid copies under multiple folders)

---

### 12) Tooling & automation (so this stays optimized)

Add scripts:

* `optimize:images` → converts + creates variants + SVGO
* `lint:assets` → checks:
  * spaces in filenames
  * max size thresholds
  * missing width/height metadata for rendered images
  * orphaned files in assets not referenced in code/data

Run them in CI.

---

## Execution order (fast wins → deeper work)

1. **Rename files to remove spaces** + update references (immediate reliability)
2. **Convert big JPG/PNG** to AVIF/WebP + generate responsive sizes
3. Add **OptimizedImage** component + migrate galleries/blog pages
4. Move key assets from `public/assets` → `src/assets` and **import** them
5. Fix caching headers / base path handling (`BASE_URL`)
6. Self-host globe textures/topology
7. Optimize video + add poster
8. Add asset CI checks and keep it clean long-term

---

## “Done” checklist (what “optimized completely” means)

* ✅ All photos served as AVIF/WebP with `srcset/sizes`
* ✅ No large PNGs used where WebP/AVIF would work
* ✅ All images have width/height to prevent layout shift
* ✅ Only one asset pipeline (mostly Vite imports)
* ✅ Long-term caching works via hashed filenames
* ✅ No external CDN dependency for globe assets (or has fallback)
* ✅ No spaces in filenames
* ✅ Automated scripts + CI prevent regressions
