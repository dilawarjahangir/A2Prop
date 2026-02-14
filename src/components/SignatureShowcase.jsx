import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocale } from "../hooks/useLocale.js";
import { getPropertiesForLocale } from "../data/properties.js";

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

  // ✅ Keep the listings stable and fallback safely
  const listings = useMemo(() => {
    const localized = getPropertiesForLocale(locale);
    if (Array.isArray(localized) && localized.length > 0) return localized;

    const en = getPropertiesForLocale("en");
    return Array.isArray(en) ? en : [];
  }, [locale]);

  const [featuredSlug, setFeaturedSlug] = useState(null);

  // ✅ Keep featuredSlug valid when locale/list changes
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

  // ✅ Mount heavy media only when near viewport (prevents scroll hitch)
  const sectionRef = useRef(null);
  const [renderMedia, setRenderMedia] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRenderMedia(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!featured) return null;

  const featuredImg = featured.gallery?.[0] || "";

  return (
    <section
      ref={sectionRef}
      className={[
        " px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8",
        // ✅ huge blur shadow was the #1 scroll killer
        // ✅ don’t let any horizontal gesture logic block vertical scroll
        "touch-pan-y",
        // ✅ encourage compositor layer; helps on some devices
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
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#13161b]">
            {renderMedia && featuredImg ? (
              <img
                src={featuredImg}
                alt={featured.title}
                className="h-[360px] w-full object-cover sm:h-[420px]"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
            ) : (
              <div className="h-[360px] w-full sm:h-[420px]" />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1c1c1c]">
              {copy.byBrand}
            </div>
            <div className="absolute left-4 top-14 max-w-[90%] rounded-full bg-[#161616cc] px-3 py-1 text-xs font-semibold text-white">
              {featured.location}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-white/50">
              {copy.eyebrow}
            </p>
            <h3 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
              {featured.title}
            </h3>
            <p className="text-3xl font-semibold text-[#5ce7bf]">
              {featured.priceUSD}
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
            const img = item.gallery?.[0] || "";
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => setFeaturedSlug(item.slug)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-black p-3 text-left transition hover:border-white/20 "
              >
                {renderMedia && img ? (
                  <img
                    src={img}
                    alt={item.title}
                    className="h-20 w-32 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                ) : (
                  <div className="h-20 w-32 shrink-0 rounded-xl bg-[#111]" />
                )}

                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 text-2xl font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-sm font-semibold text-[#5ce7bf]">
                    {item.priceUSD}
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
