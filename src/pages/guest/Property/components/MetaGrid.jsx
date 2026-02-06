import React from "react";

const MetaGrid = ({
  activeTab,
  metaLoading,
  metaError,
  developers,
  developerSearch,
  developerLimit,
  selectedDeveloper,
  selectedDeveloperId,
  totalDeveloperMatches,
  filteredDevelopers,
  locations,
  amenities,
  tx,
  onDeveloperSearchChange,
  onSelectDeveloper,
  onClearDeveloperSelection,
  onLoadMoreDevelopers,
  onSelectLocation,
  onSelectAmenity,
}) => {
  if (metaLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {tx("sections.property_listings_loading_meta", "Loading catalog...")}
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
        {metaError}
      </div>
    );
  }

  if (activeTab === "DEVELOPERS") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={developerSearch}
              onChange={(e) => onDeveloperSearchChange(e.target.value)}
              placeholder={`Search developers (${developers.length})...`}
              className="w-full sm:w-96 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />

            {selectedDeveloper && (
              <button
                type="button"
                onClick={onClearDeveloperSelection}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:border-white/40 transition"
              >
                Clear selection
              </button>
            )}

            <span className="text-xs text-white/60">
              Showing {Math.min(developerLimit, totalDeveloperMatches)} of {totalDeveloperMatches}
            </span>
          </div>

          {selectedDeveloper && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
              {selectedDeveloper.logo && (
                <img
                  src={selectedDeveloper.logo}
                  alt={selectedDeveloper.name}
                  className="h-9 w-9 rounded-full object-cover border border-white/10"
                  loading="lazy"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Selected: {selectedDeveloper.name}
                </p>
                <p className="text-xs text-white/60">Click again to unselect.</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDevelopers.map((dev) => {
            const isSelected = String(dev.id) === String(selectedDeveloperId);

            return (
              <button
                key={dev.id || dev.name}
                type="button"
                onClick={() => onSelectDeveloper(dev)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  isSelected
                    ? "border-white/60 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                {dev.logo && (
                  <img
                    src={dev.logo}
                    alt={dev.name}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                    loading="lazy"
                  />
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{dev.name || "Developer"}</p>
                  {dev.country || dev.city ? (
                    <p className="text-xs text-white/60">
                      {[dev.city, dev.country].filter(Boolean).join(" • ")}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}

          {!developers.length && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              {tx("sections.property_listings_no_developers", "No developers found.")}
            </div>
          )}

          {developers.length > 0 && totalDeveloperMatches === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              No matches for “{developerSearch}”.
            </div>
          )}
        </div>

        {developerLimit < totalDeveloperMatches && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLoadMoreDevelopers}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40 transition"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "LOCATIONS") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc, idx) => {
          const title =
            loc.name ||
            loc.areaName ||
            loc.communityName ||
            loc.regionName ||
            loc.cityName ||
            tx("sections.property_listings_location", "Location");

          const subtitle =
            loc.cityName ||
            loc.regionName ||
            [loc.communityName, loc.cityName].filter(Boolean).join(", ") ||
            loc.country;

          return (
            <button
              key={loc.id || loc.regionId || loc.communityId || idx}
              type="button"
              onClick={() => onSelectLocation(loc)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/30 transition"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{title}</p>
                {subtitle ? <p className="text-xs text-white/60">{subtitle}</p> : null}
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase text-white/70">
                {tx("sections.property_listings_filter", "Filter")}
              </span>
            </button>
          );
        })}
        {!locations.length && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {tx("sections.property_listings_no_locations", "No locations found.")}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "AMENITIES") {
    const amenList = amenities.map((a) => (typeof a === "string" ? { name: a } : a));
    return (
      <div className="flex flex-wrap gap-2">
        {amenList.map((amen, idx) => (
          <button
            key={amen.id || amen.code || amen.name || idx}
            type="button"
            onClick={() => onSelectAmenity(amen)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:border-white/40 transition"
          >
            {amen.name || amen.label || tx("sections.property_listings_amenity", "Amenity")}
          </button>
        ))}
        {!amenList.length && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {tx("sections.property_listings_no_amenities", "No amenities found.")}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default MetaGrid;
