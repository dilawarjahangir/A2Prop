import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogs, getBlogsForLocale } from "../data/blogs.js";
import { getLocale } from "../hooks/useLocale.js";
import OptimizedImage from "./OptimizedImage.jsx";

const parseBlogDate = (value) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const Partners = () => {
  const { t } = useTranslation();
  const locale = getLocale();

  const sorted = [...getBlogsForLocale(locale)].sort(
    (a, b) => parseBlogDate(b.date) - parseBlogDate(a.date)
  );

  const featured = sorted[0];
  const secondary = sorted.slice(1, 4);

  if (!featured) return null;

  return (
    <section
      id="latest-news"
      className="w-full  text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Header row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t("sections.blog_home_title")}
          </h2>

          <Link
            to="/blog"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black shadow-sm transition hover:opacity-90"
            aria-label="More insights"
          >
            {t("sections.blog_home_more_insights")}
          </Link>
        </div>

        {/* Featured block */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Featured image */}
          <Link
            to={`/blog/${featured.slug}`}
            className="group relative overflow-hidden rounded-[28px] bg-[#111]"
          >
            <OptimizedImage
              src={featured.image}
              alt={featured.title}
              className="block h-[280px] w-full sm:h-[360px] lg:h-[420px]"
              imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            />

            {/* Tag pill */}
            <div className="absolute left-6 top-6">
              <span
                className="inline-flex items-center rounded-full bg-white/25 px-4 py-2 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/10"
              >
                {featured.tag}
              </span>
            </div>

            {/* Soft vignette for readability (subtle) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10" />
          </Link>

          {/* Featured text */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug">
              {featured.title}
            </h3>

            <p className="mt-4 text-sm text-gray-300">
              {featured.displayDate || featured.date}
            </p>

            <p className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-prose">
              {featured.excerpt}
            </p>

            <div className="mt-8">
              <Link
                to={`/blog/${featured.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {t("sections.blog_home_continue_reading")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom secondary cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {secondary.map((item, idx) => (
            <Link
              key={`${item.title}-${idx}`}
              to={`/blog/${item.slug}`}
              className="group flex items-center gap-5"
            >
              <div className="shrink-0 overflow-hidden rounded-2xl bg-[#111]">
                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  className="block h-[92px] w-[140px] sm:h-[110px] sm:w-[170px]"
                  imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  sizes="170px"
                />
              </div>

              <div className="min-w-0">
                <h4 className="text-base md:text-lg font-medium leading-snug text-white/95 line-clamp-3">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-gray-400">
                  {item.displayDate || item.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
