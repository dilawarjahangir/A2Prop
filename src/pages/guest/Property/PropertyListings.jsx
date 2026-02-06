// PropertyListings.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getListings } from "../../../api/listings.js";
import {
  getAmenities,
  getDevelopers,
  getLocations,
} from "../../../api/meta.js";
import { safeNumber } from "../../../api/utils.js";
import ListingCard from "./components/ListingCard";

const TYPE_OPTIONS = [
  {
    key: "NEW",
    labelKey: "sections.property_listings_tab_new",
    fallback: "New",
  },
  {
    key: "RENT",
    labelKey: "sections.property_listings_tab_rent",
    fallback: "Rent",
  },
  {
    key: "SELL",
    labelKey: "sections.property_listings_tab_sell",
    fallback: "Sell",
  },
];

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalMotion = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: 12, scale: 0.99, transition: { duration: 0.14 } },
};

const pageVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.18,
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(2px)",
    transition: {
      duration: 0.14,
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.12 } },
};

const normalizeDeveloper = (d) => ({
  id: d?.id ?? d?.developerId ?? d?.value ?? d?.code,
  name: String(d?.name ?? d?.developerName ?? d?.label ?? "").trim(),
  logo: d?.logo ?? d?.logoUrl ?? d?.logoURL ?? d?.image ?? d?.avatar,
  city: d?.city,
  country: d?.country,
});

const normalizeAmenity = (a) => (typeof a === "string" ? { name: a } : a);

const normalizePositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const normalizeCountNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// ---- Location normalization ----
const toId = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeLocation = (loc = {}) => {
  const locationType = String(loc.locationType ?? loc.type ?? "").toUpperCase();

  const cityId = toId(loc.cityId ?? loc.city?.id);
  const regionId = toId(loc.regionId ?? loc.region?.id);
  const communityId = toId(loc.communityId ?? loc.community?.id);

  const name = String(
    loc.shortName ??
      loc.name ??
      loc.areaName ??
      loc.communityName ??
      loc.regionName ??
      loc.cityName ??
      "",
  ).trim();

  const fullName = String(loc.fullName ?? loc.full_name ?? name).trim();

  return {
    ...loc,
    locationType,
    cityId,
    regionId,
    communityId,
    name,
    fullName,
  };
};

const Pill = ({ active, children, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
      active
        ? "border-white/50 bg-white/10 text-white"
        : "border-white/15 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

const ModalShell = ({ open, title, subtitle, onClose, children, footer }) => {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    const scrollbarW = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;

      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const scrollRoot = bodyRef.current;
    if (!scrollRoot) return undefined;

    const findScrollable = (node) => {
      let el = node;
      while (el && el !== scrollRoot) {
        if (el.scrollHeight > el.clientHeight + 2) return el;
        el = el.parentElement;
      }
      return scrollRoot;
    };

    const onWheel = (e) => {
      const targetEl = findScrollable(e.target);
      if (!targetEl) return;
      if (targetEl.scrollHeight <= targetEl.clientHeight + 1) return;
      targetEl.scrollTop += e.deltaY;
      e.preventDefault();
    };

    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches?.[0]?.clientY ?? 0;
    };

    const onTouchMove = (e) => {
      const targetEl = findScrollable(e.target);
      if (!targetEl) return;
      if (targetEl.scrollHeight <= targetEl.clientHeight + 1) return;
      const currentY = e.touches?.[0]?.clientY ?? 0;
      const delta = touchStartY - currentY;
      if (delta === 0) return;
      targetEl.scrollTop += delta;
      touchStartY = currentY;
      e.preventDefault();
    };

    scrollRoot.addEventListener("wheel", onWheel, { passive: false });
    scrollRoot.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollRoot.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      scrollRoot.removeEventListener("wheel", onWheel);
      scrollRoot.removeEventListener("touchstart", onTouchStart);
      scrollRoot.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50" {...overlayMotion}>
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="relative h-full min-h-screen w-full flex items-start sm:items-center justify-center p-4 sm:p-6">
            <motion.div
              {...modalMotion}
              className="
                relative w-full max-w-3xl
                max-h-[90vh]
                overflow-hidden
                rounded-3xl border border-white/10
                bg-[#0B0F14]/95 shadow-2xl
                flex flex-col min-h-0
              "
              role="dialog"
              aria-modal="true"
            >
              <div className="shrink-0 p-5 sm:p-6 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    {subtitle ? (
                      <p className="mt-1 text-sm text-white/60">{subtitle}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 w-9 rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30 transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                ref={bodyRef}
                className="
                  flex-1 min-h-0 overflow-y-auto p-5 sm:p-6
                  overscroll-contain
                  touch-pan-y
                  [-webkit-overflow-scrolling:touch]
                "
                data-lenis-prevent="true"
                data-scroll-lock-scrollable="true"
              >
                {children}
              </div>

              {footer ? (
                <div className="shrink-0 p-5 sm:p-6 border-t border-white/10 bg-white/[0.02]">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

// ✅ Stable key for cards (NO idx)
const getListingKey = (item) => {
  const base =
    item?.slug ?? item?.id ?? item?.reference ?? item?.propertyId ?? "";
  const type = item?.type ?? "";
  return base
    ? `${type}:${String(base)}`
    : `${type}:fallback:${String(item?.title ?? "")}:${String(item?.priceAED ?? "")}`;
};

// ✅ Reusable Pagination UI (top + bottom)
const PaginationBar = ({
  tx,
  pagination,
  loading,
  goToPrevPage,
  goToNextPage,
  goToPage,
}) => {
  if (!pagination) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-white/60">
        <span>
          {pagination.totalPages
            ? `${tx("sections.property_listings_page", "Page")} ${pagination.currentPage} / ${pagination.totalPages}`
            : `${tx("sections.property_listings_page", "Page")} ${pagination.currentPage}`}
        </span>
        {pagination.totalCount != null ? (
          <span className="text-white/40">
            • {pagination.totalCount}{" "}
            {tx("sections.property_listings_total", "total")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={goToPrevPage}
          disabled={!pagination.hasPrev || loading}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:border-white/35 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tx("buttons.previous", "Previous")}
        </button>

        {(pagination.pages.length
          ? pagination.pages
          : [pagination.currentPage]
        ).map((page, idx) => {
          if (page === "left-ellipsis" || page === "right-ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-white/40 select-none"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          const pageNumber = Number(page);
          const isActive = pageNumber === pagination.currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              disabled={loading}
              className={[
                "rounded-full border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "border-white/70 bg-white/15 text-white"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10",
              ].join(" ")}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={goToNextPage}
          disabled={!pagination.hasNext || loading}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:border-white/35 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tx("buttons.next", "Next")}
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading page…</div>
      ) : null}
    </div>
  );
};

const PropertyListings = () => {
  const { t } = useTranslation();
  const tx = useCallback(
    (key, fallback) => t(key, { defaultValue: fallback ?? key }),
    [t],
  );

  const resultsTopRef = useRef(null);
  const lastQueryKeyRef = useRef("");
  const requestIdRef = useRef(0);

  // Results
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [totalAvailable, setTotalAvailable] = useState(null);
  const [pageMeta, setPageMeta] = useState({
    page: null,
    totalPages: null,
    pageSize: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ controls page swap animation (only changes after data arrives)
  const [renderKey, setRenderKey] = useState("init");
  // ✅ show a subtle overlay while paging (no scroll)
  const [pendingPage, setPendingPage] = useState(null);

  // Meta
  const [developers, setDevelopers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState("");

  // UI
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [picker, setPicker] = useState(null); // "developer" | "location" | "amenity" | null

  // Filters
  const [filters, setFilters] = useState({
    type: "NEW",
    q: "",
    amenity: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    propertyType: "",
    page: 1,
    size: 12,
    fetchAll: false,
    developerIds: undefined,
    cityIds: undefined,
    regionIds: undefined,
    communityIds: undefined,
  });

  // Picker UI state
  const [developerSearch, setDeveloperSearch] = useState("");
  const [developerLimit, setDeveloperLimit] = useState(48);
  const [locationSearch, setLocationSearch] = useState("");
  const [amenitySearch, setAmenitySearch] = useState("");

  const selectedDeveloperId = filters.developerIds?.[0];
  const selectedDeveloper = useMemo(() => {
    if (!selectedDeveloperId) return null;
    return (
      developers.find((d) => String(d.id) === String(selectedDeveloperId)) ||
      null
    );
  }, [developers, selectedDeveloperId]);

  const hasLocationSelection = useMemo(
    () =>
      !!(
        filters.cityIds?.length ||
        filters.regionIds?.length ||
        filters.communityIds?.length
      ),
    [filters.cityIds, filters.regionIds, filters.communityIds],
  );

  const selectedLocationLabel = useMemo(() => {
    const cityId = filters.cityIds?.[0];
    const regionId = filters.regionIds?.[0];
    const communityId = filters.communityIds?.[0];

    if (communityId != null) {
      const found = locations.find(
        (l) =>
          l.locationType === "COMMUNITY" &&
          String(l.communityId) === String(communityId),
      );
      return found?.name || found?.fullName || null;
    }

    if (regionId != null) {
      const found = locations.find(
        (l) =>
          l.locationType === "REGION" &&
          String(l.regionId) === String(regionId),
      );
      return found?.name || found?.fullName || null;
    }

    if (cityId != null) {
      const found = locations.find(
        (l) => l.locationType === "CITY" && String(l.cityId) === String(cityId),
      );
      return found?.name || found?.fullName || null;
    }

    return null;
  }, [locations, filters.cityIds, filters.regionIds, filters.communityIds]);

  const combinedQuery = useMemo(() => {
    return [filters.q, filters.amenity]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(" ");
  }, [filters.q, filters.amenity]);

  const parsedFilters = useMemo(() => {
    const beds = filters.beds
      ? filters.beds
          .split(",")
          .map((b) => Number(b.trim()))
          .filter(Number.isFinite)
      : undefined;

    const propertyType = filters.propertyType
      ? filters.propertyType
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : undefined;

    return {
      type: filters.type,
      q: combinedQuery || undefined,
      amenity: filters.amenity || undefined,
      minPrice: safeNumber(filters.minPrice),
      maxPrice: safeNumber(filters.maxPrice),
      beds,
      propertyType,
      page: filters.page,
      size: filters.size,
      fetchAll: filters.fetchAll || undefined,
      developerIds:
        Array.isArray(filters.developerIds) && filters.developerIds.length
          ? filters.developerIds
          : undefined,
      cityIds:
        Array.isArray(filters.cityIds) && filters.cityIds.length
          ? filters.cityIds
          : undefined,
      regionIds:
        Array.isArray(filters.regionIds) && filters.regionIds.length
          ? filters.regionIds
          : undefined,
      communityIds:
        Array.isArray(filters.communityIds) && filters.communityIds.length
          ? filters.communityIds
          : undefined,
    };
  }, [filters, combinedQuery]);

  const queryKey = useMemo(() => {
    const { page, ...rest } = parsedFilters;
    return JSON.stringify(rest);
  }, [parsedFilters]);

  const normalizeListingResponse = useCallback((res) => {
    const listCandidates = [
      res?.list,
      res?.data?.list,
      res?.data?.data?.list,
      res?.items,
      res?.data?.items,
      res?.records,
      res?.data?.records,
      res?.results,
      res?.data?.results,
      res?.pagination?.items,
      res?.data?.pagination?.items,
      res?.pagination?.list,
      res?.data?.pagination?.list,
    ];

    const rawList = listCandidates.find(Array.isArray) || [];

    const toListing = (entry) => {
      const p = entry?.property ?? entry ?? {};
      const r = entry?.raw ?? {};

      const gallery =
        (Array.isArray(p.gallery) && p.gallery.length ? p.gallery : null) ??
        (Array.isArray(r.photos) && r.photos.length ? r.photos : null) ??
        [];

      const agent =
        (p.agent && Object.keys(p.agent).length ? p.agent : null) ??
        (r.agent && Object.keys(r.agent).length ? r.agent : null) ??
        {};

      return {
        ...p,
        priceAED: p.priceAED ?? r.price ?? null,
        gallery,
        coverImage: p.coverImage ?? gallery?.[0] ?? null,
        agent,
        status: p.status ?? r.status ?? null,
        badge: p.badge ?? r.tag ?? null,
        type: p.type ?? r.listingType ?? null,
        beds: p.beds ?? r.bedRooms ?? null,
        baths:
          p.baths ?? r.sellParam?.bathrooms ?? r.rentParam?.bathrooms ?? null,
        location: p.location ?? r.region ?? r.cityName ?? null,
        size: p.size ?? r.size ?? null,
        id: p.id ?? r.propertyId ?? r.id ?? p.id,
        slug: p.slug ?? p.id ?? r.propertyId ?? undefined,
      };
    };

    const list = (Array.isArray(rawList) ? rawList : [])
      .map(toListing)
      .filter(Boolean);

    const pickNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const pickFirstNumber = (...vals) => {
      for (const v of vals) {
        const n = pickNumber(v);
        if (n !== null) return n;
      }
      return null;
    };

    const metaCandidates = [
      res?.meta,
      res?.pagination,
      res?.data?.meta,
      res?.data?.pagination,
      res?.data,
      res?.data?.data,
    ];
    const metaField = (field) =>
      pickFirstNumber(...metaCandidates.map((m) => m?.[field]));

    const totalFromApi = pickFirstNumber(
      res?.total,
      res?.data?.total,
      res?.data?.data?.total,
      metaField("total"),
      metaField("count"),
      metaField("totalRecords"),
    );

    const totalAvailableFromApi = pickFirstNumber(
      res?.totalAvailable,
      res?.data?.totalAvailable,
      res?.data?.data?.totalAvailable,
      metaField("totalAvailable"),
      totalFromApi,
    );

    const page = pickFirstNumber(
      res?.page,
      res?.currentPage,
      res?.pageNumber,
      metaField("page"),
      metaField("currentPage"),
      metaField("pageNumber"),
    );

    const totalPages = pickFirstNumber(
      res?.totalPages,
      res?.data?.totalPages,
      res?.data?.data?.totalPages,
      metaField("totalPages"),
    );

    const pageSize = pickFirstNumber(
      res?.size,
      res?.pageSize,
      metaField("size"),
      metaField("pageSize"),
    );

    return {
      list,
      total: totalFromApi,
      totalAvailable: totalAvailableFromApi,
      page,
      totalPages,
      pageSize,
    };
  }, []);

  const dedupeListings = useCallback((list) => {
    const seen = new Set();
    return (Array.isArray(list) ? list : []).filter((item) => {
      const key = item?.slug ?? item?.id ?? item?.reference ?? item?.propertyId;
      if (key === undefined || key === null) return true;
      const dedupeKey = `${item?.type || ""}:${String(key)}`;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  }, []);

  // ---- Load listings ----
  useEffect(() => {
    let cancelled = false;
    const reqId = ++requestIdRef.current;

    const isNewQuery =
      parsedFilters.page === 1 && lastQueryKeyRef.current !== queryKey;
    if (isNewQuery) {
      setItems([]);
      setTotal(null);
      setTotalAvailable(null);
      setPageMeta({
        page: null,
        totalPages: null,
        pageSize: normalizePositiveNumber(parsedFilters.size) || null,
      });
      setRenderKey(`reset:${queryKey}`);
    }

    const load = async () => {
      setError("");
      setLoading(true);

      try {
        const res = await getListings(parsedFilters);
        if (cancelled || reqId !== requestIdRef.current) return;

        const {
          list,
          total: apiTotal,
          totalAvailable: apiAvail,
          page,
          totalPages,
          pageSize,
        } = normalizeListingResponse(res);

        const normalizedList = Array.isArray(list) ? list : [];
        const dedupedList = dedupeListings(normalizedList);

        const resolvedPageSize =
          normalizePositiveNumber(pageSize) ??
          normalizePositiveNumber(parsedFilters.size) ??
          (dedupedList.length || null);

        const inferredTotalCount =
          normalizeCountNumber(apiAvail) ??
          (apiTotal != null
            ? apiTotal === 0 || apiTotal > (dedupedList.length || 0)
              ? normalizeCountNumber(apiTotal)
              : null
            : null);

        const nextPage =
          normalizePositiveNumber(page) ?? parsedFilters.page ?? 1;

        const computedTotalPages =
          inferredTotalCount != null && resolvedPageSize
            ? Math.max(1, Math.ceil(inferredTotalCount / resolvedPageSize))
            : null;

        const resolvedTotalPages =
          normalizePositiveNumber(totalPages) ?? computedTotalPages;

        setItems(dedupedList);
        setPageMeta({
          page: nextPage,
          totalPages: resolvedTotalPages,
          pageSize: resolvedPageSize,
        });

        const safeTotal =
          normalizeCountNumber(apiTotal) ?? dedupedList.length ?? null;
        setTotal(safeTotal);
        setTotalAvailable(inferredTotalCount ?? null);

        setRenderKey(`page:${queryKey}:${nextPage}:${dedupedList.length}`);
        lastQueryKeyRef.current = queryKey;
      } catch (err) {
        if (cancelled || reqId !== requestIdRef.current) return;
        setError(
          err?.message || tx("errors.generic_error", "Something went wrong."),
        );
        if (parsedFilters.page === 1) {
          setItems([]);
          setTotal(null);
          setTotalAvailable(null);
          setPageMeta({
            page: null,
            totalPages: null,
            pageSize: normalizePositiveNumber(parsedFilters.size) || null,
          });
        }
      } finally {
        if (!cancelled && reqId === requestIdRef.current) {
          setLoading(false);
          setPendingPage(null);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [parsedFilters, queryKey, tx, normalizeListingResponse, dedupeListings]);

  // ---- Lazy-load meta when opening picker ----
  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      if (!picker) return;
      setMetaError("");
      setMetaLoading(true);

      try {
        if (picker === "developer" && developers.length === 0) {
          const devRes = await getDevelopers();
          const rawList =
            devRes?.data?.list ||
            devRes?.data?.data?.list ||
            devRes?.list ||
            devRes?.data ||
            devRes?.records ||
            devRes?.items ||
            [];

          const normalized = (Array.isArray(rawList) ? rawList : [])
            .map(normalizeDeveloper)
            .filter((d) => d.id && d.name);

          if (!cancelled) setDevelopers(normalized);
        }

        if (picker === "location" && locations.length === 0) {
          const locRes = await getLocations({ size: 200 });
          const payload =
            locRes?.data && !Array.isArray(locRes.data) ? locRes.data : locRes;

          const list =
            payload?.data?.list ??
            payload?.list ??
            payload?.areas ??
            payload?.data ??
            payload?.records ??
            payload?.items ??
            [];

          const seen = new Set();
          const normalized = (Array.isArray(list) ? list : [])
            .map(normalizeLocation)
            .filter((l) => l.name)
            .filter((l) => {
              const key = `${l.locationType}:${l.communityId ?? l.regionId ?? l.cityId ?? l.id}:${l.fullName}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });

          if (!cancelled) setLocations(normalized);
        }

        if (picker === "amenity" && amenities.length === 0) {
          const amenRes = await getAmenities();
          const list =
            amenRes?.data?.list ||
            amenRes?.list ||
            amenRes?.data ||
            amenRes?.records ||
            amenRes?.items ||
            [];
          if (!cancelled) setAmenities(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!cancelled)
          setMetaError(
            err?.message || tx("errors.generic_error", "Something went wrong."),
          );
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [picker, developers.length, locations.length, amenities.length, tx]);

  // ---- Derived lists for pickers ----
  const filteredDevelopers = useMemo(() => {
    const q = developerSearch.trim().toLowerCase();
    const base = q
      ? developers.filter((d) => (d.name || "").toLowerCase().includes(q))
      : developers;
    const sorted = [...base].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
    return sorted.slice(0, developerLimit);
  }, [developers, developerSearch, developerLimit]);

  const totalDeveloperMatches = useMemo(() => {
    const q = developerSearch.trim().toLowerCase();
    if (!q) return developers.length;
    return developers.filter((d) => (d.name || "").toLowerCase().includes(q))
      .length;
  }, [developers, developerSearch]);

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    const base = q
      ? locations.filter((loc) =>
          String(loc.fullName || loc.name || "")
            .toLowerCase()
            .includes(q),
        )
      : locations;
    return base.slice(0, 180);
  }, [locations, locationSearch]);

  const filteredAmenities = useMemo(() => {
    const q = amenitySearch.trim().toLowerCase();
    const base = amenities.map(normalizeAmenity);
    if (!q) return base.slice(0, 220);
    return base
      .filter((a) =>
        String(a?.name || a?.label || "")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 220);
  }, [amenities, amenitySearch]);

  // ---- Actions ----
  const scrollToResults = () => {
    setTimeout(() => {
      resultsTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const setType = (type) => setFilters((prev) => ({ ...prev, type, page: 1 }));
  const setSearch = (value) =>
    setFilters((prev) => ({ ...prev, q: value, page: 1 }));
 
  const setPriceValue = (key, rawValue) => {
    setFilters((prev) => {
      const next = { ...prev, page: 1, [key]: rawValue };

      const min = safeNumber(key === "minPrice" ? rawValue : prev.minPrice);
      const max = safeNumber(key === "maxPrice" ? rawValue : prev.maxPrice);

      if (min != null && max != null && min > max) {
        if (key === "minPrice") next.maxPrice = String(min);
        if (key === "maxPrice") next.minPrice = String(max);
      }
      return next;
    });
  };

  const clearAll = () => {
    setFilters((prev) => ({
      ...prev,
      q: "",
      amenity: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      propertyType: "",
      page: 1,
      fetchAll: false,
      developerIds: undefined,
      cityIds: undefined,
      regionIds: undefined,
      communityIds: undefined,
    }));
    setDeveloperSearch("");
    setDeveloperLimit(48);
    setLocationSearch("");
    setAmenitySearch("");
    scrollToResults();
  };

  const clearDeveloper = () =>
    setFilters((prev) => ({ ...prev, developerIds: undefined, page: 1 }));

  const clearLocation = () => {
    setFilters((prev) => ({
      ...prev,
      cityIds: undefined,
      regionIds: undefined,
      communityIds: undefined,
      page: 1,
    }));
    scrollToResults();
  };

  const clearAmenity = () => {
    setFilters((prev) => ({ ...prev, amenity: "", page: 1 }));
    scrollToResults();
  };

  const pickDeveloper = (dev) => {
    if (!dev?.id) return;
    setFilters((prev) => ({ ...prev, developerIds: [dev.id], page: 1 }));
    setPicker(null);
  };

  const pickLocation = (loc) => {
    if (!loc) return;

    const type = String(loc.locationType || "").toUpperCase();
    const cityId = toId(loc.cityId);
    const regionId = toId(loc.regionId);
    const communityId = toId(loc.communityId);

    setFilters((prev) => {
      if (type === "CITY")
        return {
          ...prev,
          cityIds: cityId ? [cityId] : undefined,
          regionIds: undefined,
          communityIds: undefined,
          page: 1,
        };
      if (type === "REGION")
        return {
          ...prev,
          cityIds: cityId ? [cityId] : undefined,
          regionIds: regionId ? [regionId] : undefined,
          communityIds: undefined,
          page: 1,
        };
      if (type === "COMMUNITY")
        return {
          ...prev,
          cityIds: cityId ? [cityId] : undefined,
          regionIds: regionId ? [regionId] : undefined,
          communityIds: communityId ? [communityId] : undefined,
          page: 1,
        };
      return { ...prev, page: 1 };
    });

    setPicker(null);
    scrollToResults();
  };

  const pickAmenity = (amen) => {
    const name = String(amen?.name || amen?.label || "").trim();
    if (!name) return;
    setFilters((prev) => ({ ...prev, amenity: name, page: 1 }));
    setPicker(null);
    scrollToResults();
  };

  const pagination = useMemo(() => {
    const totalCount = normalizeCountNumber(totalAvailable ?? total);
    const requestedPage = normalizePositiveNumber(filters.page) ?? 1;
    const pageSize =
      normalizePositiveNumber(pageMeta.pageSize) ??
      normalizePositiveNumber(filters.size) ??
      (items.length || null);

    const effectivePageSize = pageSize || 1;
    const currentPage = normalizePositiveNumber(pageMeta.page) ?? requestedPage;

    const computedTotalPages =
      totalCount != null && effectivePageSize
        ? Math.max(1, Math.ceil(totalCount / effectivePageSize))
        : null;

    const resolvedTotalPages =
      normalizePositiveNumber(pageMeta.totalPages) ?? computedTotalPages;

    const pages = [];
    if (resolvedTotalPages) {
      const window = 2;
      const start = Math.max(1, currentPage - window);
      const end = Math.min(resolvedTotalPages, currentPage + window);

      const pushPage = (value) => {
        if (!pages.includes(value)) pages.push(value);
      };

      pushPage(1);
      if (start > 2) pages.push("left-ellipsis");
      for (let p = start; p <= end; p += 1) pushPage(p);
      if (end < resolvedTotalPages - 1) pages.push("right-ellipsis");
      if (resolvedTotalPages > 1) pushPage(resolvedTotalPages);
    }

    const hasPrev = currentPage > 1;
    const hasNext =
      resolvedTotalPages != null
        ? currentPage < resolvedTotalPages
        : items.length > 0 && items.length >= effectivePageSize;

    return {
      currentPage,
      totalPages: resolvedTotalPages,
      pageSize: effectivePageSize,
      totalCount,
      hasPrev,
      hasNext,
      pages,
    };
  }, [
    filters.page,
    filters.size,
    items.length,
    total,
    totalAvailable,
    pageMeta.page,
    pageMeta.totalPages,
    pageMeta.pageSize,
  ]);

  // ✅ NO SCROLL ON PAGE CHANGE
  const goToPage = (pageNumber) => {
    const limit = pagination.totalPages ?? pageNumber;
    const targetPage = Math.max(1, Math.min(pageNumber, limit));
    setPendingPage(targetPage);
    setPageMeta((prev) => ({ ...prev, page: targetPage }));
    setFilters((prev) => ({ ...prev, page: targetPage }));
  };

  const goToPrevPage = () => {
    if (pagination.hasPrev && !loading) goToPage(pagination.currentPage - 1);
  };

  const goToNextPage = () => {
    if (pagination.hasNext && !loading) goToPage(pagination.currentPage + 1);
  };

  const showingLabel = useMemo(() => {
    if (pagination.totalCount != null) {
      const from = items.length
        ? (pagination.currentPage - 1) * pagination.pageSize + 1
        : 0;
      const to = items.length ? from + items.length - 1 : pagination.totalCount;
      const range = items.length ? `${from}-${to}` : `${pagination.totalCount}`;
      return `${tx("sections.property_listings_showing", "Showing")} ${range} / ${pagination.totalCount}`;
    }
    if (items.length)
      return `${tx("sections.property_listings_showing", "Showing")} ${items.length}`;
    return tx("sections.property_listings_showing", "Showing");
  }, [
    tx,
    pagination.totalCount,
    pagination.currentPage,
    pagination.pageSize,
    items.length,
  ]);

  const hasAnyFilters = useMemo(() => {
    return !!(
      filters.q ||
      filters.amenity ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.beds ||
      filters.propertyType ||
      selectedDeveloperId ||
      hasLocationSelection
    );
  }, [
    filters.q,
    filters.amenity,
    filters.minPrice,
    filters.maxPrice,
    filters.beds,
    filters.propertyType,
    selectedDeveloperId,
    hasLocationSelection,
  ]);

  const DeveloperButtonLabel = () => {
    if (selectedDeveloper) {
      return (
        <span className="inline-flex items-center gap-2">
          {selectedDeveloper.logo ? (
            <img
              src={selectedDeveloper.logo}
              alt={selectedDeveloper.name}
              className="h-5 w-5 rounded-full object-cover border border-white/10"
              loading="lazy"
            />
          ) : null}
          <span className="truncate max-w-[160px]">
            {selectedDeveloper.name}
          </span>
        </span>
      );
    }
    return (
      <span>
        {tx("sections.property_listings_tab_developers", "Developer")}
      </span>
    );
  };

  return (
    <div className="text-white">
      {/* Top hero */}
      <div className="px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-white/55 uppercase tracking-widest">
            {tx("sections.property_listings_label", "Listings")}
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                {tx(
                  "sections.property_listings_heading",
                  "Curated properties across Dubai",
                )}
              </h1>
              <p className="mt-3 text-white/70">
                {tx(
                  "sections.property_listings_subtitle",
                  "Explore curated lakefront, marina, and beachfront homes.",
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">{showingLabel}</span>
              {hasAnyFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:border-white/40 hover:bg-white/10 transition"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>

          {/* Sticky toolbar */}
          <div className="mt-7 sticky top-0 z-20">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 shadow-lg shadow-black/30">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Segmented control */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/50 uppercase tracking-widest mr-1">
                    {tx("sections.property_listings_type", "Type")}
                  </span>
                  <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setType(opt.key)}
                        className={[
                          "px-4 py-2 rounded-full text-sm font-semibold transition",
                          filters.type === opt.key
                            ? "bg-white/10 text-white border border-white/20"
                            : "text-white/70 hover:text-white hover:bg-white/5",
                        ].join(" ")}
                      >
                        {tx(opt.labelKey, opt.fallback)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search + Quick pickers */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2">
                  <div className="relative">
                    <input
                      value={filters.q}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={tx(
                        "forms.search_placeholder",
                        "Search by name...",
                      )}
                      className="w-full lg:w-[360px] rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                    />
                    {filters.q ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Pill
                      active={!!selectedDeveloperId}
                      onClick={() => setPicker("developer")}
                    >
                      <DeveloperButtonLabel />
                    </Pill>

                    <Pill
                      active={hasLocationSelection}
                      onClick={() => setPicker("location")}
                    >
                      {selectedLocationLabel
                        ? `Location: ${selectedLocationLabel}`
                        : tx(
                            "sections.property_listings_tab_locations",
                            "Location",
                          )}
                    </Pill>

                    <Pill
                      active={!!filters.amenity}
                      onClick={() => setPicker("amenity")}
                    >
                      {filters.amenity
                        ? `Amenity: ${filters.amenity}`
                        : tx(
                            "sections.property_listings_tab_amenities",
                            "Amenity",
                          )}
                    </Pill>

                    <Pill
                      active={advancedOpen}
                      onClick={() => setAdvancedOpen((v) => !v)}
                    >
                      {advancedOpen
                        ? tx("forms.hide_filters", "Hide filters")
                        : tx("forms.more_filters", "More filters")}
                    </Pill>
                  </div>
                </div>
              </div>

              {/* Advanced panel */}
              <AnimatePresence initial={false}>
                {advancedOpen ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">
                          Price (AED)
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            value={filters.minPrice}
                            onChange={(e) =>
                              setPriceValue("minPrice", e.target.value)
                            }
                            placeholder="Min"
                            className="no-spin w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                          />
                          <input
                            type="number"
                            min="0"
                            value={filters.maxPrice}
                            onChange={(e) =>
                              setPriceValue("maxPrice", e.target.value)
                            }
                            placeholder="Max"
                            className="no-spin w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 lg:px-8 pb-14 pt-10">
        <div className="mx-auto max-w-7xl">
          <div ref={resultsTopRef} />

          {/* ✅ TOP Pagination (above listings) */}
          {items.length > 0 ? (
            <div className="mb-6">
              <PaginationBar
                tx={tx}
                pagination={pagination}
                loading={loading}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
                goToPage={goToPage}
              />
            </div>
          ) : null}

          {/* Developer context card */}
          {selectedDeveloper ? (
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {selectedDeveloper.logo ? (
                  <img
                    src={selectedDeveloper.logo}
                    alt={selectedDeveloper.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-white/10 bg-white/5"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60">
                    D
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-widest">
                    Selected developer
                  </p>
                  <h2 className="text-xl font-bold text-white">
                    {selectedDeveloper.name}
                  </h2>
                  <p className="text-sm text-white/60">
                    {tx(
                      "sections.property_listings_dev_hint",
                      "Showing listings from this developer.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPicker("developer")}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Change developer
                </button>
                <button
                  type="button"
                  onClick={clearDeveloper}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          {/* ✅ nice paging overlay (no scroll) */}
          {pendingPage != null && items.length > 0 ? (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 flex items-center justify-between">
              <span>Loading page {pendingPage}…</span>
              <span className="text-white/45">Please wait</span>
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100"
              >
                {error}
              </motion.div>
            ) : loading && items.length === 0 ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                aria-busy="true"
              >
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-white/10 bg-white/5 h-80 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70"
              >
                {tx("sections.property_listings_empty", "No properties found.")}
              </motion.div>
            ) : (
              <motion.div
                key={renderKey}
                variants={pageVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className={[
                  "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  pendingPage != null ? "opacity-70" : "",
                ].join(" ")}
                layout
              >
                {items.map((item) => (
                  <motion.div
                    key={getListingKey(item)}
                    variants={cardVariants}
                    layout
                  >
                    <ListingCard item={item} tx={tx} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ BOTTOM Pagination (below listings) */}
          {items.length > 0 ? (
            <div className="mt-10">
              <PaginationBar
                tx={tx}
                pagination={pagination}
                loading={loading}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
                goToPage={goToPage}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* ---- Pickers (modals) ---- */}
      <ModalShell
        open={picker === "developer"}
        title={tx(
          "sections.property_listings_tab_developers",
          "Choose a developer",
        )}
        subtitle="Search and select a developer to filter results."
        onClose={() => setPicker(null)}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              Showing {Math.min(developerLimit, totalDeveloperMatches)} of{" "}
              {totalDeveloperMatches}
            </div>
            <div className="flex gap-2">
              {selectedDeveloperId ? (
                <button
                  type="button"
                  onClick={() => {
                    clearDeveloper();
                    setPicker(null);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Clear
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setPicker(null)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                Done
              </button>
            </div>
          </div>
        }
      >
        {metaLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {tx(
              "sections.property_listings_loading_meta",
              "Loading catalog...",
            )}
          </div>
        ) : metaError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            {metaError}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <input
                  value={developerSearch}
                  onChange={(e) => {
                    setDeveloperSearch(e.target.value);
                    setDeveloperLimit(48);
                  }}
                  placeholder={`Search developers (${developers.length})...`}
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                />
                {developerSearch ? (
                  <button
                    type="button"
                    onClick={() => setDeveloperSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {totalDeveloperMatches > developerLimit ? (
                <button
                  type="button"
                  onClick={() => setDeveloperLimit((n) => n + 48)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Load more
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDevelopers.map((dev) => {
                const isSelected =
                  String(dev.id) === String(selectedDeveloperId);
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => pickDeveloper(dev)}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-white/60 bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {dev.logo ? (
                      <img
                        src={dev.logo}
                        alt={dev.name}
                        className="h-11 w-11 rounded-2xl object-cover border border-white/10 bg-white/5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60">
                        D
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {dev.name}
                      </p>
                      {dev.city || dev.country ? (
                        <p className="text-xs text-white/55 truncate">
                          {[dev.city, dev.country].filter(Boolean).join(" • ")}
                        </p>
                      ) : (
                        <p className="text-xs text-white/45">Tap to filter</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!developers.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {tx(
                  "sections.property_listings_no_developers",
                  "No developers found.",
                )}
              </div>
            ) : null}

            {developers.length > 0 && totalDeveloperMatches === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No matches for “{developerSearch}”.
              </div>
            ) : null}
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={picker === "location"}
        title={tx(
          "sections.property_listings_tab_locations",
          "Choose a location",
        )}
        subtitle="Search and select a location to filter results."
        onClose={() => setPicker(null)}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              {locations.length ? `${locations.length} locations loaded` : ""}
            </div>
            <div className="flex gap-2">
              {hasLocationSelection ? (
                <button
                  type="button"
                  onClick={() => {
                    clearLocation();
                    setPicker(null);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                Done
              </button>
            </div>
          </div>
        }
      >
        {metaLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {tx(
              "sections.property_listings_loading_meta",
              "Loading catalog...",
            )}
          </div>
        ) : metaError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            {metaError}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search locations..."
                className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
              />
              {locationSearch ? (
                <button
                  type="button"
                  onClick={() => setLocationSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((loc, idx) => {
                const title = loc.name || "Location";
                const subtitleParts = [];
                if (loc.locationType) subtitleParts.push(loc.locationType);
                if (loc.fullName && loc.fullName !== title)
                  subtitleParts.push(loc.fullName);
                const subtitle = subtitleParts.join(" • ");

                const key = `${loc.locationType || "LOC"}-${loc.communityId ?? loc.regionId ?? loc.cityId ?? loc.id ?? idx}`;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickLocation(loc)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-white/30 hover:bg-white/10 transition"
                  >
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {title}
                    </p>
                    {subtitle ? (
                      <p className="text-xs text-white/55 line-clamp-2 mt-1">
                        {subtitle}
                      </p>
                    ) : (
                      <p className="text-xs text-white/45 mt-1">
                        Tap to filter
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {!locations.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {tx(
                  "sections.property_listings_no_locations",
                  "No locations found.",
                )}
              </div>
            ) : null}
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={picker === "amenity"}
        title={tx(
          "sections.property_listings_tab_amenities",
          "Choose an amenity",
        )}
        subtitle="Pick an amenity — we’ll apply it as a keyword filter."
        onClose={() => setPicker(null)}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-white/60">
              {amenities.length ? `${amenities.length} loaded` : ""}
            </div>
            <div className="flex gap-2">
              {filters.amenity ? (
                <button
                  type="button"
                  onClick={() => {
                    clearAmenity();
                    setPicker(null);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:border-white/35 hover:bg-white/10 transition"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setPicker(null)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                Done
              </button>
            </div>
          </div>
        }
      >
        {metaLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            {tx(
              "sections.property_listings_loading_meta",
              "Loading catalog...",
            )}
          </div>
        ) : metaError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            {metaError}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
                placeholder="Search amenities..."
                className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
              />
              {amenitySearch ? (
                <button
                  type="button"
                  onClick={() => setAmenitySearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredAmenities.map((amen, idx) => {
                const name = String(amen?.name || amen?.label || "").trim();
                if (!name) return null;

                const isSelected = filters.amenity === name;

                return (
                  <button
                    key={amen.id || amen.code || name || idx}
                    type="button"
                    onClick={() => pickAmenity({ name })}
                    className={[
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      isSelected
                        ? "border-white/60 bg-white/10 text-white"
                        : "border-white/15 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {!amenities.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {tx(
                  "sections.property_listings_no_amenities",
                  "No amenities found.",
                )}
              </div>
            ) : null}
          </div>
        )}
      </ModalShell>
    </div>
  );
};

export default PropertyListings;
