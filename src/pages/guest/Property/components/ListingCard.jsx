import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../../api/utils.js";

const formatStat = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  return /[a-zA-Z]/.test(text) ? text : `${text} ${label}`;
};

const getHighlights = (item) => {
  if (Array.isArray(item?.highlights) && item.highlights.length) return item.highlights;

  return [
    formatStat(item?.beds, "Beds"),
    formatStat(item?.baths, "Baths"),
    formatStat(item?.size, "Sqft"),
    item?.type,
  ].filter(Boolean);
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

const ListingCard = ({ item, tx }) => {
  const image = item?.coverImage || item?.gallery?.[0] || "";
  const phone = String(item?.agent?.phone || "").replace(/\s+/g, "");

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col"
    >
      <div className="relative h-52">
        {image ? (
          <motion.img
            src={image}
            alt={item.title || "Property"}
            className="h-full w-full object-cover"
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}

        {item.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
            {item.badge}
          </span>
        )}
        {item.status ? (
          <span className="absolute top-3 right-3 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
            {item.status}
          </span>
        ) : null}
      </div>

      <div className="p-5 space-y-3 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">{item.location}</p>
            <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
              {item.title}
            </h3>
          </div>
          <p className="text-sm font-semibold text-white/80">
            {item.priceAED ? formatCurrency(item.priceAED) : ""}
          </p>
        </div>

        <p className="text-lg font-bold text-white">
          {item.priceAED
            ? formatCurrency(item.priceAED)
            : tx("sections.property_listings_price_on_request", "Price on request")}
        </p>

        <div className="flex flex-wrap gap-2 text-sm text-white/75">
          {getHighlights(item)
            .slice(0, 4)
            .map((highlight, index) => (
              <span
                key={`${item.slug || item.id}-highlight-${index}`}
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
          {tx("buttons.view_details", "View details")}
        </Link>

        {phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold px-4 py-2 text-sm"
          >
            {tx("sections.property_listings_call", "Call")}
          </a>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 cursor-not-allowed"
            disabled
          >
            {tx("sections.property_listings_call", "Call")}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;
