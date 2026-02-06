import React from "react";

const ListingFilters = ({
  filters,
  tx,
  onInputChange,
  onPriceChange,
  onAdjustPrice,
  onClearPrice,
  onToggleFetchAll,
}) => {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-sm text-white/90">
      <input
        type="text"
        placeholder={tx("forms.search_placeholder", "Search by name...")}
        value={filters.q}
        onChange={onInputChange("q")}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
      />

      <div className="flex gap-2 md:col-span-2 lg:col-span-2">
        <div className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-2 py-1.5 flex items-center gap-1.5 focus-within:border-white/40 transition">
          <span className="shrink-0 text-[11px] text-white/50 px-1">
            {tx("forms.min_price_short", "Min")}
          </span>

          <button
            type="button"
            onClick={() => onAdjustPrice("minPrice", -1)}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition"
            aria-label="Decrease min price"
            title="Decrease"
          >
            −
          </button>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={tx("forms.min_price_placeholder", "Min price")}
            value={filters.minPrice}
            onChange={(e) => onPriceChange("minPrice", e.target.value)}
            className="no-spin min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => onAdjustPrice("minPrice", 1)}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition"
            aria-label="Increase min price"
            title="Increase"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => onClearPrice("minPrice")}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 transition"
            aria-label="Clear min price"
            title="Clear"
          >
            ✕
          </button>

          <span className="shrink-0 hidden sm:inline text-[11px] text-white/50 pr-1">AED</span>
        </div>

        <div className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/10 px-2 py-1.5 flex items-center gap-1.5 focus-within:border-white/40 transition">
          <span className="shrink-0 text-[11px] text-white/50 px-1">
            {tx("forms.max_price_short", "Max")}
          </span>

          <button
            type="button"
            onClick={() => onAdjustPrice("maxPrice", -1)}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition"
            aria-label="Decrease max price"
            title="Decrease"
          >
            −
          </button>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={tx("forms.max_price_placeholder", "Max price")}
            value={filters.maxPrice}
            onChange={(e) => onPriceChange("maxPrice", e.target.value)}
            className="no-spin min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => onAdjustPrice("maxPrice", 1)}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition"
            aria-label="Increase max price"
            title="Increase"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => onClearPrice("maxPrice")}
            className="shrink-0 h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 transition"
            aria-label="Clear max price"
            title="Clear"
          >
            ✕
          </button>

          <span className="shrink-0 hidden sm:inline text-[11px] text-white/50 pr-1">AED</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={tx("forms.beds_placeholder", "Beds (e.g. 1,2,3)")}
          value={filters.beds}
          onChange={onInputChange("beds")}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
        <input
          type="text"
          placeholder={tx("forms.property_type_placeholder", "Property type (comma separated)")}
          value={filters.propertyType}
          onChange={onInputChange("propertyType")}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
        <label className="text-xs text-white/70 flex-1">
          {tx("sections.property_listings_fetch_all_label", "Fetch all pages")}
        </label>
        <input type="checkbox" checked={filters.fetchAll} onChange={onToggleFetchAll} />
      </div>
    </div>
  );
};

export default ListingFilters;
