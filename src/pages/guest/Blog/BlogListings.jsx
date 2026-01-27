import React from "react";
import { Link } from "react-router-dom";
import GradientButton from "../../../components/GradientButton.jsx";
import { useTranslation } from "react-i18next";
import { getBlogsForLocale } from "../../../data/blogs.js";
import { getLocale } from "../../../hooks/useLocale.js";

const parseBlogDate = (value) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const BlogCard = ({ post, t }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <Link to={`/blog/${post.slug}`} className="relative h-52 block">
      <img
        src={post.image}
        alt={post.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {post.tag && (
        <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
          {post.tag}
        </span>
      )}
      <span className="absolute top-3 right-3 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
        {post.readingTime}
      </span>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
    </Link>

    <div className="p-5 space-y-3 flex-1">
      <p className="text-xs text-white/60 uppercase tracking-wide">{post.displayDate || post.date}</p>
      <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      )}
    </div>

    <div className="p-5 pt-0 flex items-center justify-between gap-3">
      <Link
        to={`/blog/${post.slug}`}
        className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
      >
        {t("buttons.read_article")}
      </Link>
      <Link
        to="/properties"
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold px-4 py-2 text-sm"
      >
        {t("buttons.explore")}
      </Link>
    </div>
  </div>
);

const BlogListings = () => {
  const { t } = useTranslation();
  const locale = getLocale();

  const sorted = [...getBlogsForLocale(locale)].sort(
    (a, b) => parseBlogDate(b.date) - parseBlogDate(a.date)
  );

  return (
    <div className="py-12 space-y-12 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <p className="text-sm text-white/60 uppercase tracking-wide">
              {t("sections.blog_listings_insights")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {t("sections.blog_listings_heading")}
            </h1>
            <p className="text-white/70 text-base">
              {t("sections.blog_listings_subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <GradientButton href="/properties">
              {t("buttons.explore_properties")}
            </GradientButton>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              {t("buttons.back_to_home")}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-white/80">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.blog_listings_tag_market_reports")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.blog_listings_tag_offplan")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.blog_listings_tag_secondary")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.blog_listings_tag_infrastructure")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((post) => (
          <BlogCard key={post.slug} post={post} t={t} />
        ))}
      </div>
    </div>
  );
};

export default BlogListings;
