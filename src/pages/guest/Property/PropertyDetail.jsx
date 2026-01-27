import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GradientButton from "../../../components/GradientButton.jsx";
import { properties, getPropertyBySlug, getPropertiesForLocale } from "../../../data/properties.js";
import { getLocale } from "../../../hooks/useLocale.js";
import OptimizedImage from "../../../components/OptimizedImage.jsx";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const toNumber = (val) => {
  if (val === null || val === undefined) return 0;
  const str = String(val).replace(/,/g, "").trim();
  const cleaned = str.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatInt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const formatStat = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  return /[a-zA-Z]/.test(text) ? text : `${text} ${label}`;
};

const isPastDate = (value) => {
  if (!value) return false;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  return parsed < Date.now();
};

const getHighlights = (item) => {
  if (Array.isArray(item?.highlights) && item.highlights.length) {
    return item.highlights;
  }

  return [
    formatStat(item?.beds, "Beds"),
    formatStat(item?.baths, "Baths"),
    item?.area,
    formatStat(item?.parking, "Parking"),
    item?.type,
  ].filter(Boolean);
};

const getHighlightText = (item, maxItems = 3) =>
  getHighlights(item).slice(0, maxItems).join(" • ");

const MortgageField = ({
  label,
  suffix,
  value,
  onChange,
  onBlur,
  placeholder,
  inputMode = "decimal",
}) => (
  <label className="block space-y-2">
    <span className="text-sm font-semibold text-white/80">{label}</span>
    <div className="flex items-stretch rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
      />
      <div className="px-4 flex items-center text-xs font-semibold text-white/60 border-l border-white/10 bg-black/10">
        {suffix}
      </div>
    </div>
  </label>
);

const MortgageCalculator = ({ property }) => {
  const { t } = useTranslation();
  const [priceInput, setPriceInput] = useState("");
  const [downPctInput, setDownPctInput] = useState("25");
  const [yearsInput, setYearsInput] = useState("25");
  const [rateInput, setRateInput] = useState("3.75");

  useEffect(() => {
    const seededPrice =
      toNumber(property?.priceUSD) ||
      toNumber(property?.mortgage?.total) ||
      toNumber(property?.mortgage?.loanAmount) ||
      0;

    const seededDown = toNumber(property?.mortgage?.downPayment) || 25;
    const seededYears = toNumber(property?.mortgage?.duration) || 25;
    const seededRate = toNumber(property?.mortgage?.rate) || 3.75;

    setPriceInput(seededPrice ? formatInt(seededPrice) : "");
    setDownPctInput(String(seededDown));
    setYearsInput(String(seededYears));
    setRateInput(String(seededRate));
  }, [property?.slug]);

  const { totalPrice, downPct, years, annualRate, loanAmount, monthly } =
    useMemo(() => {
      const total = toNumber(priceInput);
      const down = clamp(toNumber(downPctInput), 0, 100);
      const yrs = clamp(toNumber(yearsInput), 1, 60);
      const rate = clamp(toNumber(rateInput), 0, 100);

      const loan = total * (1 - down / 100);
      const n = Math.round(yrs * 12);
      const r = rate / 100 / 12;

      let m = 0;
      if (loan > 0 && n > 0) {
        if (r === 0) {
          m = loan / n;
        } else {
          const pow = Math.pow(1 + r, n);
          m = (loan * r * pow) / (pow - 1);
        }
      }

      return {
        totalPrice: total,
        downPct: down,
        years: yrs,
        annualRate: rate,
        loanAmount: loan,
        monthly: m,
      };
    }, [priceInput, downPctInput, yearsInput, rateInput]);

  const handleMoneyChange = (setter) => (e) => {
    const next = e.target.value.replace(/[^\d.,]/g, "");
    setter(next);
  };

  const handleSimpleNumberChange = (setter) => (e) => {
    const next = e.target.value.replace(/[^\d.]/g, "");
    setter(next);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">
          {t("sections.property_detail_mortgage_calc_title")}
        </h3>
        <p className="text-sm text-white/60">
          {t("sections.property_detail_mortgage_calc_body")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/10 p-5 sm:p-6 space-y-5">
          <MortgageField
            label={t("sections.property_detail_mortgage_field_total_price_label")}
            suffix={t("sections.property_detail_mortgage_field_total_price_suffix")}
            value={priceInput}
            onChange={handleMoneyChange(setPriceInput)}
            onBlur={() => {
              const n = toNumber(priceInput);
              setPriceInput(n ? formatInt(n) : "");
            }}
            placeholder={t("sections.property_detail_mortgage_field_total_price_placeholder")}
            inputMode="numeric"
          />

          <MortgageField
            label={t("sections.property_detail_mortgage_field_down_payment_label")}
            suffix="%"
            value={downPctInput}
            onChange={handleSimpleNumberChange(setDownPctInput)}
            onBlur={() => {
              const n = clamp(toNumber(downPctInput), 0, 100);
              setDownPctInput(String(n));
            }}
            placeholder={t("sections.property_detail_mortgage_field_down_payment_placeholder")}
            inputMode="decimal"
          />

          <MortgageField
            label={t("sections.property_detail_mortgage_field_loan_period_label")}
            suffix={t("sections.property_detail_mortgage_field_loan_period_suffix")}
            value={yearsInput}
            onChange={handleSimpleNumberChange(setYearsInput)}
            onBlur={() => {
              const n = clamp(toNumber(yearsInput), 1, 60);
              setYearsInput(String(n));
            }}
            placeholder={t("sections.property_detail_mortgage_field_loan_period_placeholder")}
            inputMode="numeric"
          />

          <MortgageField
            label={t("sections.property_detail_mortgage_field_rate_label")}
            suffix="%"
            value={rateInput}
            onChange={handleSimpleNumberChange(setRateInput)}
            onBlur={() => {
              const n = clamp(toNumber(rateInput), 0, 100);
              setRateInput(String(n));
            }}
            placeholder={t("sections.property_detail_mortgage_field_rate_placeholder")}
            inputMode="decimal"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 flex flex-col">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white">
              AED {formatInt(monthly)}
            </div>
            <div className="text-sm text-white/60">
              {t("sections.property_detail_mortgage_summary_per_month")}
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="space-y-5 text-sm">
              <div>
                <p className="text-white/60">
                  {t("sections.property_detail_mortgage_summary_total_loan")}
                </p>
                <p className="font-semibold text-white">
                  AED {formatInt(loanAmount)}
                </p>
              </div>

              <div>
                <p className="text-white/60">
                  {t("sections.property_detail_mortgage_summary_duration")}
                </p>
                <p className="font-semibold text-white">{years}</p>
              </div>

              <div className="pt-2 text-white/70">
                <p className="text-xs">
                  {t("sections.property_detail_mortgage_summary_down_payment")}{" "}
                  <span className="text-white/90 font-semibold">
                    {downPct}%
                  </span>{" "}
                  (
                  {totalPrice
                    ? `AED ${formatInt(totalPrice * (downPct / 100))}`
                    : "—"}
                  )
                </p>
                <p className="text-xs">
                  {t("sections.property_detail_mortgage_summary_rate")}{" "}
                  <span className="text-white/90 font-semibold">
                    {annualRate}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          <a
            href="mailto:info@a2properties.ae"
            className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition"
          >
            {t("sections.property_detail_mortgage_consult_cta")}
          </a>
        </div>
      </div>
    </div>
  );
};

const FactItem = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <p className="text-xs text-white/50">{label}</p>
    <p className="text-sm font-semibold text-white mt-1">{value}</p>
  </div>
);

const RecommendationCard = ({ item }) => {
  const { t } = useTranslation();

  return (
  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <div className="relative">
      <OptimizedImage
        src={item.gallery[0]}
        alt={item.title}
        className="block h-44 w-full"
        imgClassName="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 100vw, 50vw"
      />
      {item.badge && (
        <span className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
          {item.badge}
        </span>
      )}
    </div>
    <div className="p-4 space-y-2 flex-1">
      <p className="text-xs text-white/60 uppercase tracking-wide">
        {item.location}
      </p>
      <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">
        {item.title}
      </h3>
      <p className="text-sm text-white/70">
        {getHighlightText(item)}
      </p>
      <p className="text-base font-bold text-white">{item.priceUSD}</p>
    </div>
    <div className="p-4 pt-0">
      <Link
        to={`/properties/${item.slug}`}
        className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
      >
        {t("buttons.view_details")}
      </Link>
    </div>
  </div>
  );
};

/**
 * ✅ Improved ExpandableDescription
 * - No ugly overlay band
 * - Uses mask-image to fade text nicely when collapsed
 * - Smooth height animation
 * - Only shows button if overflow exists
 */
const ExpandableDescription = ({
  description,
  resetKey,
  collapsedHeight = 280, // slightly taller so the collapsed view looks nicer
}) => {
  const { t } = useTranslation();
  const paragraphs = Array.isArray(description)
    ? description.filter(Boolean)
    : description
    ? [String(description)]
    : [];

  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [maxHeight, setMaxHeight] = useState(`${collapsedHeight}px`);

  const contentRef = useRef(null);
  const topRef = useRef(null);

  // Reset when property changes
  useEffect(() => {
    setExpanded(false);
  }, [resetKey]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const full = el.scrollHeight;
      const shouldExpand = full > collapsedHeight + 8;

      setCanExpand(shouldExpand);
      setMaxHeight(
        expanded || !shouldExpand ? `${full}px` : `${collapsedHeight}px`
      );
    };

    update();

    // Keep it correct on responsive changes / font loading
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, [expanded, paragraphs, collapsedHeight]);

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;

      // When collapsing, scroll back to the top of the description block
      if (prev && topRef.current) {
        requestAnimationFrame(() => {
          topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }

      return next;
    });
  };

  if (!paragraphs.length) return null;

  // Fade only when collapsed and expandable
  const maskStyle =
    canExpand && !expanded
      ? {
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)",
        }
      : undefined;

  return (
    <div ref={topRef} className="space-y-3 scroll-mt-24">
      <div
        id="property-description"
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out will-change-[max-height]"
        style={{ maxHeight }}
      >
        <div
          ref={contentRef}
          className="space-y-4 text-sm text-white/70 leading-relaxed"
          style={maskStyle}
        >
          {paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls="property-description"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          {expanded ? t("sections.property_detail_show_less") : t("sections.property_detail_read_more")}
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const PaymentPlan = ({ plan }) => {
  if (!plan?.steps?.length) return null;

  const steps = plan.steps;
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-white/60 uppercase tracking-wide">
          {t("sections.property_detail_payment_plan_tag")}
        </p>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="text-2xl font-semibold">
            {t("sections.property_detail_payment_plan_heading")}
          </h3>
          {plan.ratio && (
            <span className="text-sm text-white/60">
              {t("sections.property_detail_payment_plan_ratio", { ratio: plan.ratio })}
            </span>
          )}
        </div>
      </div>

      {/* Equal-width cards on desktop, stacked on mobile */}
      <div className="grid gap-4 xl:grid-cols-[repeat(var(--steps),minmax(0,1fr))]">
        <div
          className="grid gap-4 xl:grid-cols-[repeat(var(--steps),minmax(0,1fr))]"
          style={{ ["--steps"]: steps.length }}
        >
          {steps.map((step, index) => (
            <div key={`${step.label}-${index}`} className="relative">
              {/* Card (equal size because it's 1fr column) */}
              <div className="h-full rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
                <p className="text-2xl font-semibold text-white">
                  {step.percent}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {step.label}
                </p>
                {step.detail && (
                  <p className="mt-1 text-xs text-white/60">{step.detail}</p>
                )}
              </div>

              {/* Arrow overlay (doesn't affect sizing) */}
              {index < steps.length - 1 && (
                <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 items-center justify-center text-white/40 pointer-events-none">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectTimeline = ({ timeline }) => {
  if (!timeline?.steps?.length) return null;
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-white/60 uppercase tracking-wide">
          {t("sections.property_detail_timeline_tag")}
        </p>
        <h3 className="text-2xl font-semibold">
          {t("sections.property_detail_timeline_heading")}
        </h3>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <div className="relative pl-8">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10" />
          <div className="space-y-6">
            {timeline.steps.map((step, index) => {
              const isComplete =
                step.status === "complete" || isPastDate(step.date);

              return (
                <div key={`${step.title}-${index}`} className="relative">
                  <div className="absolute left-0 top-0.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        isComplete
                          ? "bg-[#7DF5CA] text-black"
                          : "border border-white/30 bg-black/10"
                      }`}
                    >
                      {isComplete && (
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M7.6 13.2 3.9 9.5l-1.1 1.1 4.8 4.8 9.1-9.1-1.1-1.1z" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="pl-8 space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-xs sm:text-sm text-white/60">
                      {step.date}
                    </p>
                    {step.note && (
                      <p className="text-xs text-white/50">{step.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const locale = getLocale();

  const list = useMemo(() => getPropertiesForLocale(locale), [locale]);
  const selected = useMemo(() => getPropertyBySlug(slug, locale), [slug, locale]);
  const property = selected || list[0] || properties[0];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [property.slug]);

  const mainImage = property.gallery?.[activeIndex] || property.gallery?.[0];

  const recommendations = useMemo(() => {
    const pool = list.length ? list : properties;
    return pool.filter((p) => p.slug !== property.slug).slice(0, 3);
  }, [list, property.slug]);

  const galleryHeight = "h-[320px] sm:h-[420px]";
  const thumbs = property.gallery?.slice(0, 4) || [];
  const highlightItems = getHighlights(property).slice(0, 4);

  return (
    <div className="py-12 space-y-10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <button
          type="button"
          onClick={() =>
            setActiveIndex((prev) =>
              property.gallery?.length
                ? (prev + 1) % property.gallery.length
                : 0
            )
          }
          className={`md:col-span-2 ${galleryHeight} rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group text-left`}
        >
          {mainImage && (
            <OptimizedImage
              src={mainImage}
              alt={`Gallery image ${activeIndex + 1}`}
              className="block w-full h-full"
              imgClassName="w-full h-full object-cover transition duration-300 group-hover:scale-[1.01]"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {property.gallery?.length || 0}
            </span>
            {property.badge && (
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                {property.badge}
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs sm:text-sm text-white">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15">
              {t("sections.property_detail_gallery_hint")}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 hidden sm:inline-flex">
              {property.location}
            </span>
          </div>
        </button>

        <div className={`${galleryHeight} overflow-hidden`}>
          <div className="grid grid-cols-2 gap-4 auto-rows-fr h-full md:flex md:flex-col">
            {thumbs.map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-full h-full md:flex-1 md:min-h-0 rounded-2xl overflow-hidden border bg-white/5 ${
                  activeIndex === idx
                    ? "border-white/70 ring-2 ring-white/40"
                    : "border-white/10"
                }`}
              >
                <OptimizedImage
                  src={src}
                  alt={`Gallery ${idx + 1}`}
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover transition duration-200 hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  sizes="140px"
                />
                {activeIndex === idx && (
                  <span className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl sm:text-4xl font-bold">
                {property.priceUSD}
              </span>
              <span className="text-white/60 text-lg">{property.priceAED}</span>
            </div>
            <p className="text-sm text-white/70">{property.location}</p>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              {highlightItems.map((highlight, index) => (
                <span
                  key={`${property.slug}-highlight-${index}`}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.facts.map((fact) => (
              <FactItem
                key={fact.label}
                label={fact.label}
                value={fact.value}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-4">
            <OptimizedImage
              src={property.agent.avatar}
              alt={property.agent.name}
              className="h-14 w-13"
              imgClassName="h-14 w-13 object-cover"
              loading="lazy"
              decoding="async"
              sizes="56px"
            />
            <div>
              <p className="text-lg font-semibold">{property.agent.name}</p>
              <p className="text-sm text-white/60">{property.agent.title}</p>
              <p className="text-xs text-white/50">{property.agent.brn}</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${property.agent.phone.replace(/\s+/g, "")}`}
              className="block w-full text-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold py-2"
            >
              Call
            </a>
            <a
              href={`mailto:${property.agent.email}`}
              className="block w-full text-center rounded-full border border-white/20 text-white font-semibold py-2 hover:bg-white/10 transition"
            >
              Email Agent
            </a>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm text-white/70">
              {t("sections.property_detail_need_guidance_body")}
            </p>
            <input
              type="text"
              placeholder={t("forms.name_placeholder")}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            <input
              type="email"
              placeholder={t("forms.email_placeholder")}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            <input
              type="tel"
              placeholder={t("forms.phone_placeholder")}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder={t("forms.message_placeholder")}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            <GradientButton className="w-full justify-center">
              {t("sections.property_detail_request_info")}
            </GradientButton>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">
              {t("sections.property_detail_description_heading")}
            </h2>

            <ExpandableDescription
              description={property.description}
              resetKey={property.slug}
              collapsedHeight={280}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              {t("sections.property_detail_amenities_heading")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <div className="h-2 w-2 rounded-full bg-[#7DF5CA]" />
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentPlan plan={property.paymentPlan} />
        <ProjectTimeline timeline={property.timeline} />
      </div>

      <div>
        <h3 className="text-xl font-semibold">
          {t("sections.property_detail_mortgage_snapshot_heading")}
        </h3>
        <MortgageCalculator property={property} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/60 uppercase tracking-wide">
              {t("sections.property_detail_location")}
            </p>
            <h3 className="text-2xl font-semibold">{property.location}</h3>
          </div>
          <GradientButton
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              property.mapQuery
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            {t("sections.property_detail_open_in_maps")}
          </GradientButton>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              property.mapQuery
            )}&output=embed`}
            title="Map"
            className="w-full h-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">
            {t("sections.property_detail_recommended_title")}
          </h3>
          <Link
            to="/properties"
            className="text-sm text-white/70 hover:text-white"
          >
            {t("sections.property_detail_view_all_listings")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((item) => (
            <RecommendationCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
