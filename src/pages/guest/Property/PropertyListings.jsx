import React from "react";
import { Link } from "react-router-dom";
import GradientButton from "../../../components/GradientButton.jsx";
import { useTranslation } from "react-i18next";
import { getPropertiesForLocale } from "../../../data/properties.js";
import { getLocale } from "../../../hooks/useLocale.js";

const formatStat = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  return /[a-zA-Z]/.test(text) ? text : `${text} ${label}`;
};

const getHighlights = (item) => {
  if (Array.isArray(item?.highlights) && item.highlights.length) {
    return item.highlights;
  }

  return [
    formatStat(item?.beds, "Beds"),
    formatStat(item?.baths, "Baths"),
    item?.area,
    item?.type,
  ].filter(Boolean);
};

const ListingCard = ({ item, t }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <div className="relative h-52">
      <img src={item.gallery[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
      {item.badge && (
        <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
          {item.badge}
        </span>
      )}
      <span className="absolute top-3 right-3 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
        {item.status}
      </span>
    </div>
    <div className="p-5 space-y-3 flex-1">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wide">{item.location}</p>
          <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">{item.title}</h3>
        </div>
        <p className="text-sm font-semibold text-white/80">{item.priceAED}</p>
      </div>
      <p className="text-lg font-bold text-white">{item.priceUSD}</p>
      <div className="flex flex-wrap gap-2 text-sm text-white/75">
        {getHighlights(item)
          .slice(0, 4)
          .map((highlight, index) => (
            <span
              key={`${item.slug}-highlight-${index}`}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1"
            >
              {highlight}
            </span>
          ))}
      </div>
    </div>
    <div className="p-5 pt-0 flex items-center justify-between gap-3">
      <Link
        to={`/properties/${item.slug}`}
        className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
      >
        {t("buttons.view_details")}
      </Link>
      <a
        href={`tel:${item.agent.phone.replace(/\s+/g, "")}`}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold px-4 py-2 text-sm"
      >
        {t("sections.property_listings_call")}
      </a>
    </div>
  </div>
);

const PropertyListings = () => {
  const { t } = useTranslation();
  const locale = getLocale();
  const items = getPropertiesForLocale(locale);
  return (
    <div className="py-12 space-y-12 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <p className="text-sm text-white/60 uppercase tracking-wide">Listings</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {t("sections.property_listings_heading")}
            </h1>
            <p className="text-white/70 text-base">
              {t("sections.property_listings_subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GradientButton href="#featured">Featured</GradientButton>
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
            {t("sections.property_listings_tag_for_sale")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.property_listings_tag_waterfront")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.property_listings_tag_ready")}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            {t("sections.property_listings_tag_offplan")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ListingCard key={item.slug} item={item} t={t} />
        ))}
      </div>
    </div>
  );
};

export default PropertyListings;
