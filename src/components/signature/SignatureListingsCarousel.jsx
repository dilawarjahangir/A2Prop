import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const SignatureListingsCarousel = ({ listings, t }) => {
  const featured = listings?.[0];
  const secondary = useMemo(() => (listings || []).slice(1, 4), [listings]);

  if (!featured) return null;

  const featuredImage = featured.images?.[0];

  return (
    <div className="relative overflow-hidden text-white">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <Link
          to={`/properties/${featured.slug}`}
          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111]"
        >
          {featuredImage ? (
            <img
              src={featuredImage}
              alt={featured.subtitle}
              className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px] transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-[280px] sm:h-[360px] lg:h-[420px] w-full bg-gradient-to-br from-white/5 to-white/0" />
          )}

          <div className="absolute left-6 top-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-white/25 px-4 py-2 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/10">
              {t("sections.signature_title")}
            </span>
            {featured.location && (
              <span className="inline-flex items-center rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10">
                {featured.location}
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-black/10" />
        </Link>

        <div className="flex flex-col justify-center gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">
              {t("sections.signature_kicker")}
            </p>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug">
              {featured.subtitle}
            </h3>
            <p className="text-xl md:text-2xl font-semibold text-[#7DF5CA]">
              {featured.title}
            </p>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-prose">
              {featured.excerpt ||
                t("sections.signature_body", {
                  defaultValue:
                    "Discover curated residences and investments designed to balance lifestyle, location, and long-term value.",
                })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/properties/${featured.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-sm transition hover:opacity-90"
            >
              {t("sections.latest_works_view_property")}
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              {t("sections.blog_home_more_insights")}
            </Link>
          </div>
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {secondary.map((item, idx) => {
            const image = item.images?.[0];
            return (
              <Link
                key={`${item.slug}-${idx}`}
                to={`/properties/${item.slug}`}
                className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10"
              >
                <div className="shrink-0 overflow-hidden rounded-xl bg-[#111]">
                  {image ? (
                    <img
                      src={image}
                      alt={item.subtitle}
                      className="h-[92px] w-[140px] object-cover sm:h-[110px] sm:w-[170px] transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-[92px] w-[140px] sm:h-[110px] sm:w-[170px] bg-gradient-to-br from-white/10 to-white/0" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <h4 className="text-base md:text-lg font-medium leading-snug text-white/95 line-clamp-2">
                    {item.subtitle}
                  </h4>
                  <p className="text-sm text-[#7DF5CA] font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.location}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SignatureListingsCarousel;

