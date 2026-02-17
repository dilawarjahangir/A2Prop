import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocale } from "../hooks/useLocale.js";
import { getListings } from "../api/listings.js";

/**
 * Finds the nearest scrollable parent (works when your page scrolls inside a wrapper
 * instead of window). If none found, returns null (viewport root).
 */
const getScrollParent = (node) => {
  if (!node) return null;
  let parent = node.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const canScroll =
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight;

    if (canScroll) return parent;
    parent = parent.parentElement;
  }

  return null;
};

const formatAED = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return String(value);

  try {
    return `AED ${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(num)}`;
  } catch {
    return `AED ${num}`;
  }
};

const SignatureShowcase = () => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || getLocale();

  const copy = useMemo(() => {
    return locale === "ar"
      ? {
          eyebrow: "سيغنتشر",
          title: "من A2 Properties",
          subtitle:
            "قسم عملائنا من أصحاب الثروات العالية والقطاع الخاص. تبدأ عروض سيغنتشر من AED 987,778.",
          viewProperty: "عرض العقار",
          exploreMap: "استكشف الخريطة",
          moreInsights: "مزيد من التفاصيل",
          byBrand: "by A2 Properties",
        }
      : {
          eyebrow: "SIGNATURE",
          title: "by A2 Properties",
          subtitle:
            "Our high-net-worth and private client division. Signature property listings starting from AED 987,778.",
          viewProperty: "View property",
          exploreMap: "Explore map",
          moreInsights: "More insights",
          byBrand: "by A2 Properties",
        };
  }, [locale]);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredSlug, setFeaturedSlug] = useState(null);

  const normalizeListing = (item) => {
    const property = item?.property || item;
    const raw = item?.raw || {};
    if (!property) return null;

    const price =
      property.priceAED ??
      property.priceAEDText ??
      raw.price ??
      property.priceUsd ??
      property.priceUSD ??
      property.price?.aed ??
      property.price?.usd ??
      property.price ??
      property.amount ??
      "";

    const location =
      property.location ||
      property.community ||
      property.region ||
      raw.community ||
      raw.region ||
      raw.cityName ||
      property.city ||
      property.region ||
      property.area ||
      property.areaName ||
      property.locationName ||
      "";

    const gallery =
      Array.isArray(property.gallery) && property.gallery.length
        ? property.gallery
        : [];

    const photos =
      Array.isArray(property.photos) && property.photos.length
        ? property.photos
        : Array.isArray(raw.photos) && raw.photos.length
          ? raw.photos
          : [];

    const coverImage =
      property.coverImage ||
      property.cover_image ||
      gallery[0] ||
      photos[0] ||
      "";

    const mergedGallery = [coverImage, ...gallery, ...photos].filter(Boolean);

    const mapped = {
      slug:
        property.slug ||
        property.id ||
        property.reference ||
        raw.propertyId ||
        "",
      title: property.title || property.name || raw.title || "Property",
      priceAED: formatAED(price),
      location,
      coverImage,
      gallery: mergedGallery,
    };

    // ✅ DEBUG: mapping output
    console.log("[SignatureShowcase] normalizeListing ->", {
      slug: mapped.slug,
      title: mapped.title,
      coverImage: mapped.coverImage,
      galleryCount: mapped.gallery?.length,
      location: mapped.location,
      priceAED: mapped.priceAED,
    });

    return mapped;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getListings({ type: "NEW", page: 1, size: 6 });
        if (cancelled) return;

        // ✅ DEBUG: raw API response
        console.log("[SignatureShowcase] getListings response ->", res);

        const rawList = Array.isArray(res?.list)
          ? res.list
          : Array.isArray(res?.data?.list)
            ? res.data.list
            : Array.isArray(res?.items)
              ? res.items
              : [];

        // ✅ DEBUG: list length
        console.log("[SignatureShowcase] rawList length ->", rawList.length);

        const mapped = rawList
          .map(normalizeListing)
          .filter(Boolean)
          .slice(0, 4);

        // ✅ DEBUG: mapped listings
        console.log("[SignatureShowcase] mapped listings ->", mapped);

        if (mapped.length === 0) {
          setError("No listings available right now.");
        }

        setListings(mapped);
        setFeaturedSlug((prev) => prev || mapped[0]?.slug || null);
      } catch (err) {
        if (cancelled) return;

        console.error("[SignatureShowcase] getListings error ->", err);

        setError(err?.message || "Unable to load listings.");
        setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep featuredSlug valid when list changes
  useEffect(() => {
    if (!listings.length) return;

    if (!featuredSlug) {
      setFeaturedSlug(listings[0].slug);
      return;
    }

    const stillExists = listings.some((item) => item.slug === featuredSlug);
    if (!stillExists) setFeaturedSlug(listings[0].slug);
  }, [featuredSlug, listings]);

  const featured =
    listings.find((item) => item.slug === featuredSlug) || listings[0];

  const compactCards = listings
    .filter((item) => item.slug !== featured?.slug)
    .slice(0, 3);

  const sectionRef = useRef(null);
  const [renderMedia, setRenderMedia] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // ✅ DEBUG: check scroll parent
    const root = getScrollParent(el);
    console.log("[SignatureShowcase] scroll root ->", root);

    const rect = el.getBoundingClientRect();
    console.log("[SignatureShowcase] section rect ->", rect);

    if (rect.top < window.innerHeight + 500) {
      console.log("[SignatureShowcase] renderMedia -> true (already near view)");
      setRenderMedia(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      console.log("[SignatureShowcase] no IntersectionObserver; renderMedia -> true");
      setRenderMedia(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        console.log("[SignatureShowcase] IO entry ->", entry);
        if (entry.isIntersecting) {
          console.log("[SignatureShowcase] renderMedia -> true (intersecting)");
          setRenderMedia(true);
          io.disconnect();
        }
      },
      { root, rootMargin: "500px 0px" }
    );

    io.observe(el);

    const t = window.setTimeout(() => {
      console.log("[SignatureShowcase] timeout fallback; renderMedia -> true");
      setRenderMedia(true);
    }, 1500);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("[SignatureShowcase] renderMedia changed ->", renderMedia);
  }, [renderMedia]);

  useEffect(() => {
    console.log("[SignatureShowcase] featuredSlug changed ->", featuredSlug);
  }, [featuredSlug]);

  useEffect(() => {
    console.log("[SignatureShowcase] listings changed ->", listings);
  }, [listings]);

  if (!featured) {
    return (
      <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-white/10 p-8 text-white/80">
          {loading
            ? "Loading signature listings..."
            : error || "No listings available."}
        </div>
      </section>
    );
  }

  const featuredImg = featured.coverImage || featured.gallery?.[0] || "";

  // ✅ DEBUG: final featured image decision
  console.log("[SignatureShowcase] featured ->", featured);
  console.log("[SignatureShowcase] featuredImg ->", featuredImg);

  return (
    <section
      ref={sectionRef}
      className={[
        "px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8",
        "touch-pan-y",
        "transform-gpu",
      ].join(" ")}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "1px 980px",
        contain: "layout paint style",
        touchAction: "pan-y",
      }}
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-white/50">
              {copy.eyebrow}
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {copy.title}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/70">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/property/${featured.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111] transition hover:bg-white/90"
            >
              {copy.viewProperty}
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              {copy.exploreMap}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10">
              <img
                src={featuredImg}
                alt={featured.title}
                className="h-[360px] w-full object-cover sm:h-[420px]"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                onLoad={() => {
                  console.log("[SignatureShowcase] featured image loaded ✅", featuredImg);
                }}
                onError={(e) => {
                  console.error("[SignatureShowcase] featured image failed ❌", featuredImg);
                  e.currentTarget.style.display = "none";
                }}
              />
          

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1c1c1c]">
              {copy.byBrand}
            </div>

            {!!featured.location && (
              <div className="absolute left-4 top-14 max-w-[90%] rounded-full bg-[#161616cc] px-3 py-1 text-xs font-semibold text-white">
                {featured.location}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-white/50">
              {copy.eyebrow}
            </p>
            <h3 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
              {featured.title}
            </h3>
            <p className="text-3xl font-semibold text-[#5ce7bf]">
              {featured.priceAED}
            </p>
            <p className="max-w-xl text-2xl leading-relaxed text-white/70">
              {copy.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/property/${featured.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111] transition hover:bg-white/90"
              >
                {copy.viewProperty}
              </Link>
              <Link
                to="/properties"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {copy.moreInsights}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {compactCards.map((item) => {
            const img = item.coverImage || item.gallery?.[0] || "";
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => setFeaturedSlug(item.slug)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/10  p-3 text-left transition hover:border-white/20"
              >
                  <img
                    src={img}
                    alt={item.title}
                    className="h-20 w-32 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    onLoad={() => {
                      console.log("[SignatureShowcase] card image loaded ✅", img);
                    }}
                    onError={(e) => {
                      console.error("[SignatureShowcase] card image failed ❌", img);
                      e.currentTarget.style.display = "none";
                    }}
                  />
            

                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 text-base font-semibold text-white sm:text-lg">
                    {item.title}
                  </p>
                  <p className="text-sm font-semibold text-[#5ce7bf]">
                    {item.priceAED}
                  </p>
                  <p className="line-clamp-2 text-xs text-white/65">
                    {item.location}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SignatureShowcase;
