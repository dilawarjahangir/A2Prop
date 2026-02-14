import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPropertyDetail, getListings } from "../../../api/listings.js";
import { submitListingLead } from "../../../api/leads.js";
import { formatCurrency } from "../../../api/utils.js";

// Normalize Pixxi CDN host to pixxicrm.ae/api for images
const normalizeCdn = (url) => {
  if (!url) return url;
  return url
    .replace("https://dataapi.pixxicrm.ae/", "https://pixxicrm.ae/api/")
    .replace(/^\/+/, "https://pixxicrm.ae/api/");
};

const safeJsonParse = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const getPlanAbbr = (name = "") => {
  const s = String(name).trim().toLowerCase();
  if (!s) return "PL";
  if (s.includes("studio")) return "ST";
  // "1 Bed", "2 Bed", ...
  const bedMatch = s.match(/(\d+)\s*bed/);
  if (bedMatch?.[1]) return `${bedMatch[1]}B`;
  // "4 Bedrooms"
  const brMatch = s.match(/(\d+)\s*bedroom/);
  if (brMatch?.[1]) return `${brMatch[1]}BR`;
  // fallback: initials
  return s
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "PL";
};

const FactItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white mt-1">{value}</p>
    </div>
  );
};

const ListingCard = ({ item, t }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <div className="relative h-44">
      {item.gallery?.[0] && (
        <img src={item.gallery[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
      )}
    </div>
    <div className="p-4 space-y-2 flex-1">
      <p className="text-xs text-white/60 uppercase tracking-wide">
        {item.location || [item.community, item.city].filter(Boolean).join(", ")}
      </p>
      <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2">{item.title}</h3>
      <p className="text-sm text-white/70">
        {[item.beds && `${item.beds} Beds`, item.baths && `${item.baths} Baths`, item.size && `${item.size} sqft`]
          .filter(Boolean)
          .join(" • ")}
      </p>
      <p className="text-base font-bold text-white">
        {item.priceAED ? formatCurrency(item.priceAED) : t("sections.property_listings_price_on_request")}
      </p>
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

const PropertyDetail = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();

  const tx = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback || key : val;
  };

  const [property, setProperty] = useState(null);
  const [raw, setRaw] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadSuccess, setLeadSuccess] = useState(false);

  // gallery slider
  const [activeIndex, setActiveIndex] = useState(0);
  // floor plan tabs
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getPropertyDetail(slug);
        if (cancelled) return;

        const detail = res?.property || res;
        setProperty(detail);
        setRaw(res?.raw || res);

        // fetch recommendations of same type
        const type = detail?.type || "SELL";
        const recRes = await getListings({ type, page: 1, size: 3 });

        const list = Array.isArray(recRes?.list)
          ? recRes.list
              .map((entry) => entry?.property || entry)
              .filter(Boolean)
              .filter((p) => p.slug !== detail.slug)
          : [];

        setRecommendations(list);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || t("errors.generic_error"));
          setRecommendations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  // Reset sliders on slug change
  useEffect(() => {
    setActiveIndex(0);
    setActivePlanIndex(0);
  }, [slug]);

  const gallery = useMemo(() => {
    const imgs =
      (property?.gallery && property.gallery.length && property.gallery) ||
      (raw?.photos && raw.photos.length && raw.photos) ||
      (raw?.gallery && raw.gallery.length && raw.gallery) ||
      [];
    return imgs.map((img) => normalizeCdn(img));
  }, [property, raw]);

  // Clamp index when gallery changes
  useEffect(() => {
    if (activeIndex >= gallery.length) setActiveIndex(0);
  }, [gallery.length, activeIndex]);

  const mainImage = gallery[activeIndex];
  const agent = property?.agent || {};
  const amenities = property?.amenities || [];

  const newParam =
    raw?.newParameter ?? raw?.new_parameter ?? raw?.newParams ?? raw?.new_params ?? null;

  // ✅ Styles come from newParameter.style (your payload), fallback to older fields
  const styles = useMemo(() => {
    const arr = newParam?.style ?? raw?.style ?? property?.style ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [newParam, raw, property]);

  // ✅ Payment plan comes from newParameter.paymentPlan (stringified JSON)
  const paymentPlanObj = useMemo(() => {
    const rawPlan = newParam?.paymentPlan ?? raw?.paymentPlan ?? raw?.payment_plan ?? null;
    const parsed = safeJsonParse(rawPlan);
    return parsed && typeof parsed === "object" ? parsed : null;
  }, [newParam, raw]);

  // Clamp plan index when styles change
  useEffect(() => {
    if (activePlanIndex >= styles.length) setActivePlanIndex(0);
  }, [styles.length, activePlanIndex]);

  const activePlan = styles[activePlanIndex] || null;

  // counts for "(1)" in tabs like screenshot
  const planCounts = useMemo(() => {
    const map = new Map();
    styles.forEach((s) => {
      const name = String(s?.name || "Plan");
      map.set(name, (map.get(name) || 0) + 1);
    });
    return map;
  }, [styles]);

  const facts = [
    {
      label: tx("sections.property_detail_price", "Price"),
      value: property?.priceAED
        ? formatCurrency(property.priceAED)
        : tx("sections.property_detail_price_on_request", "Price on request"),
    },
    { label: tx("sections.property_detail_beds", "Beds"), value: property?.beds },
    { label: tx("sections.property_detail_baths", "Baths"), value: property?.baths },
    {
      label: tx("sections.property_detail_size", "Size"),
      value: property?.size ? `${property.size} sqft` : "",
    },
    {
      label: tx("sections.property_detail_developer", "Developer"),
      value: property?.developer || raw?.developer,
    },
    {
      label: tx("sections.property_detail_city", "City"),
      value: property?.city || raw?.cityName,
    },
    {
      label: tx("sections.property_detail_status", "Status"),
      value: property?.status || raw?.status,
    },
    {
      label: tx("sections.property_detail_type", "Type"),
      value: property?.type || raw?.listingType,
    },
    { label: tx("sections.property_detail_region", "Region"), value: raw?.region },
    { label: tx("sections.property_detail_permit", "Permit"), value: raw?.permitNumber },
  ];

  const locationText = useMemo(() => {
    return property?.location || [property?.community, property?.city].filter(Boolean).join(", ");
  }, [property]);

  const onLeadFieldChange = (event) => {
    const { name, value } = event.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitLead = async (event) => {
    event.preventDefault();
    setLeadSuccess(false);
    setLeadError("");

    const name = leadForm.name.trim();
    const email = leadForm.email.trim();
    const phone = leadForm.phone.trim();
    const message = leadForm.message.trim();

    if (!name || !email || !phone) {
      setLeadError("Please fill in name, email and phone.");
      return;
    }

    setLeadSubmitting(true);
    try {
      await submitListingLead({
        name,
        email,
        phone,
        slug,
        message: message || undefined,
        source: "property_detail_inquiry",
        language: i18n?.language || "en",
        extraData: {
          page: "property_detail",
          propertySlug: property?.slug,
          propertyTitle: property?.title,
          propertyReference: property?.reference || raw?.reference,
        },
      });
      setLeadSuccess(true);
      setLeadForm({ name: "", email: "", phone: "", message: "" });
    } catch (submitError) {
      setLeadError(submitError?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-white space-y-6 animate-pulse">
        <div className="h-72 rounded-3xl bg-white/5" />
        <div className="h-10 w-2/3 rounded bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 rounded bg-white/5" />
          <div className="h-24 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-white">
        <p className="mb-4">{error}</p>
        <Link to="/properties" className="underline text-white">
          {t("sections.property_detail_view_all_listings")}
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 text-white">
        <p className="mb-4">{t("sections.property_detail_not_found")}</p>
        <Link to="/properties" className="underline text-white">
          {t("sections.property_detail_view_all_listings")}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 space-y-10 text-white">
      {/* Hero */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.title || "Property"}
              className="w-full h-[420px] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-white/50 text-sm">
              {tx("sections.property_detail_no_images", "No images available")}
            </div>
          )}

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/20 text-white px-3 py-2 hover:bg-black/70"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % gallery.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/20 text-white px-3 py-2 hover:bg-black/70"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-black/70 border border-white/15 px-3 py-1 text-xs font-semibold text-white">
              {gallery.length ? activeIndex + 1 : 0} / {gallery.length}
            </span>
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {gallery.map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative h-20 w-32 shrink-0 rounded-xl overflow-hidden border ${
                  activeIndex === idx ? "border-white/70 ring-2 ring-white/30" : "border-white/10"
                }`}
              >
                <img src={src} alt={`thumb-${idx}`} className="h-full w-full object-cover" loading="lazy" />
                {activeIndex === idx && (
                  <span className="absolute inset-0 border-2 border-white/40 rounded-xl pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3 px-1">
          <p className="text-sm text-white/60">{locationText}</p>
          <h1 className="text-3xl font-bold leading-tight">{property.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-white/80">
            {property.priceAED ? (
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1">
                {formatCurrency(property.priceAED)}
              </span>
            ) : null}
            {property.status ? (
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1">
                {property.status}
              </span>
            ) : null}
            {property.type ? (
              <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1">
                {property.type}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold">
              {tx("sections.property_detail_facts_heading", "Key facts")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facts.map((fact) => (
                <FactItem key={`${fact.label}-${String(fact.value)}`} label={fact.label} value={fact.value} />
              ))}
            </div>
          </div>

          {/* ✅ Description */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">
              {tx("sections.property_detail_description_heading", "Description")}
            </h2>
            <p className="text-sm text-white/70 whitespace-pre-line">
              {property.description ||
                raw?.description ||
                tx("sections.property_detail_no_description", "No description available")}
            </p>

            {amenities.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t("sections.property_detail_amenities_heading")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {amenities.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#7DF5CA]" />
                      <p className="text-sm text-white/80">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Floor Plan (like screenshot) */}
          {styles.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                  ⬚
                </div>
                <h3 className="text-2xl font-semibold">{tx("sections.property_detail_floorplans_heading", "Floor Plan")}</h3>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {styles.map((s, idx) => {
                  const name = String(s?.name || `Plan ${idx + 1}`);
                  const count = planCounts.get(name) || 1;
                  const active = idx === activePlanIndex;

                  return (
                    <button
                      key={`${s?.id || "style"}-${name}-${idx}`}
                      type="button"
                      onClick={() => setActivePlanIndex(idx)}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-semibold border transition",
                        active
                          ? "border-[#7DF5CA]/70 bg-[#7DF5CA]/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Preview */}
              {activePlan ? (
                <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] items-start">
                  <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                    {Array.isArray(activePlan?.imgUrl) && activePlan.imgUrl[0] ? (
                      <img
                        src={normalizeCdn(activePlan.imgUrl[0])}
                        alt={activePlan.name || "Floor plan"}
                        className="w-full h-[220px] sm:h-[260px] object-contain bg-white"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-[220px] sm:h-[260px] flex items-center justify-center text-white/50 text-sm">
                        {tx("sections.property_detail_no_images", "No images available")}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="text-3xl font-extrabold text-white">
                      {getPlanAbbr(activePlan?.name)}
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-sm text-white/60">{tx("sections.property_detail_price", "Price")}</span>
                        <span className="text-sm font-semibold text-white">
                          {toNum(activePlan?.price) != null ? formatCurrency(toNum(activePlan.price)) : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-sm text-white/60">{tx("sections.property_detail_size", "Size")}</span>
                        <span className="text-sm font-semibold text-white">
                          {toNum(activePlan?.area) != null ? `${toNum(activePlan.area)} sqft` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ✅ Payment Plan (like screenshot) */}
          {paymentPlanObj ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                  ▦
                </div>
                <h3 className="text-2xl font-semibold">{tx("sections.property_detail_payment_plan", "Payment Plan")}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "one", label: tx("sections.payment_first_installment", "First Installment") },
                  { key: "two", label: tx("sections.payment_under_construction", "Under Construction") },
                  { key: "three", label: tx("sections.payment_on_handover", "On Handover") },
                  { key: "four", label: tx("sections.payment_post_handover", "Post Handover") },
                ]
                  .map((it) => {
                    const v = paymentPlanObj?.[it.key];
                    const hasVal = v !== null && v !== undefined && v !== "";
                    if (!hasVal) return null;

                    const num = toNum(v);
                    const valueText = num != null ? `${num}%` : String(v);

                    return (
                      <div
                        key={it.key}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-white/70">{it.label}</span>
                        <span className="text-sm font-semibold text-white">{valueText}</span>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
            </div>
          ) : null}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{t("sections.property_detail_recommended_title")}</h3>
                <Link to="/properties" className="text-sm text-white/70 hover:text-white">
                  {t("sections.property_detail_view_all_listings")}
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((item) => (
                  <ListingCard key={item.slug} item={item} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6 h-fit">
          <div className="space-y-2">
            <p className="text-sm text-white/60">{tx("sections.property_detail_contact_agent", "Contact agent")}</p>
            <h3 className="text-2xl font-semibold">{agent.name || tx("sections.property_detail_agent", "Agent")}</h3>
            {agent.email ? <p className="text-sm text-white/60">{agent.email}</p> : null}
            {agent.phone ? <p className="text-sm text-white/60">{agent.phone}</p> : null}
          </div>

          <div className="space-y-3">
            {agent.phone && (
              <a
                href={`tel:${String(agent.phone).replace(/\s+/g, "")}`}
                className="block w-full text-center rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold py-2"
              >
                {tx("sections.property_detail_call_agent", "Call agent")}
              </a>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="block w-full text-center rounded-full border border-white/20 text-white font-semibold py-2 hover:bg-white/10 transition"
              >
                {tx("sections.property_detail_email_agent", "Email agent")}
              </a>
            )}
          </div>

          <form onSubmit={onSubmitLead} className="space-y-3 border-t border-white/10 pt-5">
            <h4 className="text-lg font-semibold text-white">
              {tx("sections.property_detail_enquiry_heading", "Send an enquiry")}
            </h4>
            <input
              type="text"
              name="name"
              value={leadForm.name}
              onChange={onLeadFieldChange}
              placeholder={tx("sections.contact_form_name_placeholder", "Your name")}
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={leadForm.email}
              onChange={onLeadFieldChange}
              placeholder={tx("sections.contact_form_email_placeholder", "Email")}
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
            />
            <input
              type="tel"
              name="phone"
              value={leadForm.phone}
              onChange={onLeadFieldChange}
              placeholder={tx("sections.contact_form_phone_placeholder", "Phone")}
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
            />
            <textarea
              name="message"
              value={leadForm.message}
              onChange={onLeadFieldChange}
              rows={3}
              placeholder={tx("sections.property_detail_enquiry_message", "Tell us what you need")}
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
            />
            {leadError ? <p className="text-xs text-red-300">{leadError}</p> : null}
            {leadSuccess ? (
              <p className="text-xs text-[#7DF5CA]">
                {tx("sections.property_detail_enquiry_success", "Enquiry submitted successfully.")}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={leadSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#7DF5CA] to-white text-black font-semibold py-2"
            >
              {leadSubmitting
                ? tx("sections.property_detail_enquiry_sending", "Sending...")
                : tx("sections.property_detail_enquiry_submit", "Submit enquiry")}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetail;
