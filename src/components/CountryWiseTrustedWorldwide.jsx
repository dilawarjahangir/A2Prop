import React, { useEffect, useRef, useCallback, useState } from "react";
import Globe from "globe.gl";
import { feature } from "topojson-client"; // npm i topojson-client
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import GlassSurface from "./GlassSurface.jsx";

const markets = [
  { name: "United Kingdom", amount: "35 Agents", code: "GB", lat: 51.5074, lng: -0.1278 },
  { name: "Germany", amount: "12 Agents", code: "DE", lat: 52.52, lng: 13.405 },
  { name: "France", amount: "8 Agents", code: "FR", lat: 48.8566, lng: 2.3522 },
  { name: "Italy", amount: "7 Agents", code: "IT", lat: 41.9028, lng: 12.4964 },
  { name: "Netherlands", amount: "8 Agents", code: "NL", lat: 52.3676, lng: 4.9041 },
  { name: "Saudi Arabia", amount: "12 Agents", code: "SA", lat: 24.7136, lng: 46.6753 },
  { name: "Qatar", amount: "4 Agents", code: "QA", lat: 25.2854, lng: 51.531 },
  { name: "Kuwait", amount: "5 Agents", code: "KW", lat: 29.3759, lng: 47.9774 },
  { name: "Oman", amount: "3 Agents", code: "OM", lat: 23.5859, lng: 58.4059 },
  { name: "Bahrain", amount: "3 Agents", code: "BH", lat: 26.0667, lng: 50.5577 },
  { name: "Egypt", amount: "7 Agents", code: "EG", lat: 30.0444, lng: 31.2357 },
  { name: "Jordan", amount: "4 Agents", code: "JO", lat: 31.9519, lng: 35.9106 },
  { name: "Lebanon", amount: "4 Agents", code: "LB", lat: 33.8938, lng: 35.5018 },
  { name: "Sudan", amount: "3 Agents", code: "SD", lat: 15.5007, lng: 32.5599 },
  { name: "Nigeria", amount: "10 Agents", code: "NG", lat: 6.5244, lng: 3.3792 },
  { name: "Kenya", amount: "6 Agents", code: "KE", lat: -1.2921, lng: 36.8219 },
  { name: "South Africa", amount: "5 Agents", code: "ZA", lat: -26.2041, lng: 28.0473 },
  { name: "United States", amount: "6 Agents", code: "US", lat: 38.9072, lng: -77.0369 },
  { name: "Canada", amount: "5 Agents", code: "CA", lat: 45.4215, lng: -75.6972 },
  { name: "Australia", amount: "4 Agents", code: "AU", lat: -33.8688, lng: 151.2093 },
  { name: "Turkey", amount: "5 Agents", code: "TR", lat: 41.0082, lng: 28.9784 },
];

const loopedMarkets = [...markets, ...markets];
const marketNamesList = markets.map((market) => market.name).join(", ");

// Helps match market names to dataset names (Natural Earth via world-atlas)
const COUNTRY_NAME_ALIAS = {
  "United States": "United States of America",
};

// “Country color” (flag-dominant style). Feel free to tweak.
const COUNTRY_COLORS = {
  GB: "#012169",
  DE: "#DD0000",
  FR: "#0055A4",
  IT: "#009246",
  NL: "#AE1C28",
  SA: "#006C35",
  QA: "#8A1538",
  KW: "#007A3D",
  OM: "#C8102E",
  BH: "#CE1126",
  EG: "#C8102E",
  JO: "#007A3D",
  LB: "#ED1C24",
  SD: "#007A3D",
  NG: "#008751",
  KE: "#006600",
  ZA: "#007749",
  US: "#3C3B6E",
  CA: "#FF0000",
  AU: "#00247D",
  TR: "#E30A17",
};

const hexToRgb = (hex) => {
  const h = (hex || "").replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (full.length !== 6) return null;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgba = (hex, a) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex; // fallback
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
};

const getCountryHex = (code) => COUNTRY_COLORS[(code || "").toUpperCase()] || "#10B981";

const normalizeName = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

const nameMatches = (featureName, marketName) => {
  const fn = normalizeName(featureName);
  const mn = normalizeName(COUNTRY_NAME_ALIAS[marketName] || marketName);
  if (!fn || !mn) return false;
  return fn === mn || fn.startsWith(mn) || mn.startsWith(fn);
};

const SpinningGlobe = ({ points, active }) => {
  const globeRef = useRef(null);
  const globeInstance = useRef(null);
  const countryFeaturesRef = useRef([]); // selected market countries only

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = Globe()(globeRef.current)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(false)

      // Points + labels
      .pointLat("lat")
      .pointLng("lng")
      .pointLabel((d) => `${d.name} — ${d.amount}`)
      .pointAltitude(() => 0.03)
      .pointRadius(0.6) // base (we override in effect)
      .pointColor(() => "rgba(0,0,0,0)") // start hidden

      .labelLat("lat")
      .labelLng("lng")
      .labelText("name")
      .labelSize(1.6) // base (we override in effect)
      .labelColor(() => "rgba(0,0,0,0)") // start hidden
      .labelResolution(3)
      .labelDotRadius(0.55)
      .labelAltitude(0.07)

      // Pulse ring (for active market)
      .ringLat("lat")
      .ringLng("lng")
      .ringAltitude(() => 0.03)
      .ringMaxRadius(() => 6)
      .ringPropagationSpeed(() => 3)
      .ringRepeatPeriod(() => 900)
      .ringColor(() => ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"]) // start hidden

      // Country polygons (filled area)
      .polygonAltitude(() => 0.02)
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(() => "rgba(0,0,0,0)")
      .polygonCapColor(() => "rgba(0,0,0,0)")
      .polygonLabel((d) => d?.properties?.name || "")
      .polygonsTransitionDuration(350);

    globeInstance.current = globe;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.enablePan = false;

    const renderer = globe.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const handleResize = () => {
      if (!globeRef.current) return;
      const { clientWidth, clientHeight } = globeRef.current;
      globe.width(clientWidth);
      globe.height(clientHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) globeRef.current.innerHTML = "";
    };
  }, []);

  // Load & cache market country polygons once (do NOT render all at once)
  useEffect(() => {
    if (!globeInstance.current || !points?.length) return;

    let cancelled = false;

    const loadCountries = async () => {
      try {
        const res = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json");
        const topo = await res.json();
        const geo = feature(topo, topo.objects.countries); // FeatureCollection

        // Cache ONLY the countries in your markets list
        const selected = (geo.features || []).filter((f) => {
          const fname = f?.properties?.name || "";
          return points.some((m) => nameMatches(fname, m.name));
        });

        if (cancelled) return;

        countryFeaturesRef.current = selected;

        // Important: don't show all countries here
        globeInstance.current.polygonsData([]);
      } catch (e) {
        // ignore (globe still works)
      }
    };

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, [points]);

  // Show ONLY active country (polygon + point + label + ring) and color it by country color
  useEffect(() => {
    if (!globeInstance.current) return;

    const hasActive = !!active?.name;
    const activeHex = getCountryHex(active?.code);
    const strong = rgba(activeHex, 0.95);
    const softFill = rgba(activeHex, 0.28);
    const softStroke = rgba(activeHex, 0.75);
    const side = rgba(activeHex, 0.06);

    // ONLY active point/label
    const activePointArr = hasActive ? [active] : [];
    globeInstance.current
      .pointsData(activePointArr)
      .labelsData(activePointArr)
      .ringsData(activePointArr)

      .pointColor(() => strong)
      .pointRadius(() => 0.75)

      .labelColor(() => strong)
      .labelSize(() => 2.0)

      .ringColor(() => [rgba(activeHex, 0.0), rgba(activeHex, 0.9), rgba(activeHex, 0.0)]);

    // ONLY active polygon (whole country)
    const selected = countryFeaturesRef.current || [];
    const activeFeature = hasActive
      ? selected.find((f) => nameMatches(f?.properties?.name || "", active.name))
      : null;

    globeInstance.current
      .polygonsData(activeFeature ? [activeFeature] : [])
      .polygonCapColor(() => softFill)
      .polygonStrokeColor(() => softStroke)
      .polygonSideColor(() => side)
      .polygonAltitude(() => 0.02);

    // Optional: gently move camera toward active point
    if (hasActive && active?.lat != null && active?.lng != null) {
      globeInstance.current.pointOfView({ lat: active.lat, lng: active.lng, altitude: 1.7 }, 900);
    }
  }, [active]);

  return (
    <div
      ref={globeRef}
      className="h-full w-full rounded-full overflow-hidden"
      aria-label="Spinning globe"
      role="img"
    />
  );
};

const TrustedWorldwide = () => {
  const { t } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeMarket = markets[activeIdx];

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const handleNavigation = useCallback(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();

      if (swiperRef.current.params) swiperRef.current.params.speed = 500;
      if (swiperRef.current.wrapperEl) swiperRef.current.wrapperEl.style.transitionTimingFunction = "ease";

      clearResumeTimer();

      resumeTimerRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          if (swiperRef.current.params) swiperRef.current.params.speed = 3000;
          if (swiperRef.current.wrapperEl) swiperRef.current.wrapperEl.style.transitionTimingFunction = "linear";
          swiperRef.current.autoplay.start();
        }
        resumeTimerRef.current = null;
      }, 5000);
    }
  }, [clearResumeTimer]);

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current && swiperRef.current.params.navigation) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }

    const prevButton = prevRef.current;
    const nextButton = nextRef.current;

    const handleButtonInteraction = () => handleNavigation();

    if (prevButton) prevButton.addEventListener("click", handleButtonInteraction);
    if (nextButton) nextButton.addEventListener("click", handleButtonInteraction);

    return () => {
      clearResumeTimer();
      if (prevButton) prevButton.removeEventListener("click", handleButtonInteraction);
      if (nextButton) nextButton.removeEventListener("click", handleButtonInteraction);
    };
  }, [handleNavigation, clearResumeTimer]);

  const jumpTo = (idx) => {
    setActiveIdx(idx);
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(idx, 600);
    }
    handleNavigation();
  };

  return (
    <section className="space-y-6 sm:space-y-10">
      <div className="relative mt-12 sm:mt-20 md:mt-[133px] rounded-2xl sm:rounded-3xl md:rounded-[32px] bg-gradient-to-br from-white/70 via-white/60 to-white/30 py-4 sm:py-6 md:py-10">
        {/* Globe */}
        <div className="absolute left-1/2 top-[40%] w-[460px] h-[460px] sm:w-[420px] sm:h-[420px] md:w-[760px] md:h-[760px] lg:w-[720px] lg:h-[720px] -translate-y-1/2 -translate-x-1/2 pointer-events-auto">
          <SpinningGlobe points={markets} active={activeMarket} />
          <div className="pointer-events-none absolute inset-0 rounded-full" />
        </div>

        {/* Text over globe */}
        <div className="relative flex flex-col items-center text-center gap-2 sm:gap-4 py-6 sm:py-8 md:py-10 pointer-events-none">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold italic text-white drop-shadow-lg">
            {t("sections.trusted_worldwide_heading", { count: 300 })}
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-white font-semibold drop-shadow px-2">
            {t("sections.trusted_worldwide_subheading")}
          </p>
          <p className="text-xs sm:text-sm text-gray-200">
            {t("sections.trusted_worldwide_note")}
          </p>

          {/* Country Spotlight Badge */}
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-black/30 px-4 py-2 backdrop-blur shadow-lg">
              <ReactCountryFlag
                countryCode={activeMarket.code}
                svg
                title={t(`sections.trusted_worldwide_markets.${activeMarket.code}.name`, {
                  defaultValue: activeMarket.name,
                })}
                style={{ width: "2em", height: "2em", borderRadius: "0.25rem" }}
              />
            <div className="text-left">
              <div className="text-sm sm:text-base font-semibold text-white">
                {t(`sections.trusted_worldwide_markets.${activeMarket.code}.name`, {
                  defaultValue: activeMarket.name,
                })}
              </div>
              <div className="text-xs text-white/80">
                {(() => {
                  const count = parseInt(activeMarket.amount, 10);
                  return Number.isFinite(count)
                    ? t("sections.trusted_worldwide_agents_label", { count })
                    : activeMarket.amount;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Slider + buttons */}
        <div className="relative mt-4 pb-6" dir="ltr">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            spaceBetween={10}
            slidesPerView={3.4}
            grabCursor
            loop={true}
            speed={3000}
            autoplay={{
              delay: 1,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
            }}
            slidesPerGroup={1}
            breakpoints={{
              0: { slidesPerView: 1.1, spaceBetween: 16 },
              640: { slidesPerView: 1.4, spaceBetween: 18 },
              1024: { slidesPerView: 3.2, spaceBetween: 24 },
              1440: { slidesPerView: 3.6, spaceBetween: 28 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;

              if (swiper.wrapperEl) swiper.wrapperEl.style.transitionTimingFunction = "linear";
              setActiveIdx(swiper.realIndex % markets.length);

              setTimeout(() => {
                if (swiper.params.navigation && prevRef.current && nextRef.current) {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.destroy();
                  swiper.navigation.init();
                  swiper.navigation.update();
                }
              }, 100);
            }}
            onSlideChange={(swiper) => {
              setActiveIdx(swiper.realIndex % markets.length);
            }}
          >
            {loopedMarkets.map((item, idx) => {
              const isActive = idx % markets.length === activeIdx;
              const count = parseInt(item.amount, 10);
              const displayName = t(
                `sections.trusted_worldwide_markets.${item.code}.name`,
                { defaultValue: item.name },
              );
              const displayAmount = Number.isFinite(count)
                ? t("sections.trusted_worldwide_agents_label", { count })
                : item.amount;

              return (
                <SwiperSlide key={`${item.name}-${idx}`}>
                  <GlassSurface
                    width={250}
                    height="auto"
                    borderRadius={16}
                    // backgroundOpacity={0.12}
                    className={[
                      "w-[250px] h-full",
                      isActive ? "ring-2 ring-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.4)]" : "",
                    ].join(" ")}
                  >
                    <div className="w-full h-full rounded-[inherit] px-4 py-3 sm:py-4 flex flex-col items-center justify-center bg-white/70 text-gray-900 border border-white/40 shadow-lg">
                      <div className="flex items-center justify-center gap-2 font-semibold mb-2 sm:mb-3">
                        <ReactCountryFlag
                          countryCode={item.code}
                          svg
                          title={displayName}
                          style={{ width: "1.5em", height: "1.5em", borderRadius: "0.125rem" }}
                        />
                        <span className="text-sm sm:text-base">{displayName}</span>
                      </div>
                      <div className="text-xl self-center sm:text-2xl md:text-3xl font-semibold">
                        {displayAmount}
                      </div>
                    </div>
                  </GlassSurface>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation buttons */}
          <div className="mt-4 sm:mt-6 flex justify-center gap-3 sm:gap-4 text-white/80">
            <button
              ref={prevRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label={t("buttons.previous")}
            >
              <img src="/assets/icons/arrow.svg" alt="" aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              ref={nextRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label={t("buttons.next")}
            >
              <img
                src="/assets/icons/arrow.svg"
                alt=""
                aria-hidden="true"
                className="h-3 w-3 sm:h-4 sm:w-4 rotate-180"
              />
            </button>
          </div>

          {/* All Countries “Flag Cloud”
          <div className="mt-6 px-4 sm:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {markets.map((m, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => jumpTo(idx)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 border backdrop-blur transition",
                      "bg-white/70 border-black/10 hover:bg-white/90",
                      isActive
                        ? "ring-2 ring-emerald-400/80 shadow-[0_0_18px_rgba(16,185,129,0.55)]"
                        : "opacity-90",
                    ].join(" ")}
                    aria-pressed={isActive}
                    aria-label={`Spotlight ${m.name}`}
                  >
                    <ReactCountryFlag
                      countryCode={m.code}
                      svg
                      title={m.name}
                      style={{ width: "1.2em", height: "1.2em", borderRadius: "0.2rem" }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-800">{m.name}</span>
                    <span className="text-[10px] sm:text-xs text-gray-600">{m.amount}</span>
                  </button>
                );
              })}
            </div>
          </div> */}

          {/* <p className="mt-4 text-center text-xs sm:text-sm text-gray-700 px-6">
            Countries represented: {marketNamesList}.
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default TrustedWorldwide;
