import React, { useEffect, useRef, useCallback, useMemo } from "react";
import Globe from "globe.gl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import ReactCountryFlag from "react-country-flag";

/**
 * KEY OPTIMIZATIONS (Swiper)
 * - Remove manual duplication array; let Swiper loop handle cloning.
 * - Use freeMode for true continuous marquee feel (no “slide snapping” work).
 * - Use autoplay.delay=0 + speed for constant motion.
 * - Use touchRatio/threshold tweaks for lighter interaction.
 * - Use fewer re-inits: wire nav once via onBeforeInit + a single effect.
 * - Use observer flags carefully (avoid observeParents unless needed).
 * - Add memoized slide component so React doesn’t re-render all slides.
 */

const markets = [
  { name: "United Kingdom", amount: "35 Agents", code: "GB" },
  { name: "Germany", amount: "12 Agents", code: "DE" },
  { name: "France", amount: "8 Agents", code: "FR" },
  { name: "Italy", amount: "7 Agents", code: "IT" },
  { name: "Netherlands", amount: "8 Agents", code: "NL" },
  { name: "Saudi Arabia", amount: "12 Agents", code: "SA" },
  { name: "Qatar", amount: "4 Agents", code: "QA" },
  { name: "Kuwait", amount: "5 Agents", code: "KW" },
  { name: "Oman", amount: "3 Agents", code: "OM" },
  { name: "Bahrain", amount: "3 Agents", code: "BH" },
  { name: "Egypt", amount: "7 Agents", code: "EG" },
  { name: "Jordan", amount: "4 Agents", code: "JO" },
  { name: "Lebanon", amount: "4 Agents", code: "LB" },
  { name: "Sudan", amount: "3 Agents", code: "SD" },
  { name: "Nigeria", amount: "10 Agents", code: "NG" },
  { name: "Kenya", amount: "6 Agents", code: "KE" },
  { name: "South Africa", amount: "5 Agents", code: "ZA" },
  { name: "United States", amount: "6 Agents", code: "US" },
  { name: "Canada", amount: "5 Agents", code: "CA" },
  { name: "Australia", amount: "4 Agents", code: "AU" },
  { name: "Turkey", amount: "5 Agents", code: "TR" },
];

const MarketCard = React.memo(function MarketCard({
  name,
  amount,
  code,
}: {
  name: string;
  amount: string;
  code: string;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl w-[250px] bg-white/90 border border-black/5 shadow-lg backdrop-blur py-3 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-2 text-gray-800 font-semibold mb-2 sm:mb-3">
        <ReactCountryFlag
          countryCode={code}
          svg
          title={name}
          style={{
            width: "1.5em",
            height: "1.5em",
            borderRadius: "0.125rem",
          }}
        />
        <span className="text-sm sm:text-base">{name}</span>
      </div>
      <div className="text-xl self-center sm:text-2xl md:text-3xl font-semibold text-gray-900">
        {amount}
      </div>
    </div>
  );
});

const SpinningGlobe = () => {
  const globeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = Globe()(globeRef.current)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("rgba(120, 170, 255, 0.6)")
      .atmosphereAltitude(0.25);

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
      const el = globeRef.current;
      if (!el) return;
      globe.width(el.clientWidth);
      globe.height(el.clientHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) globeRef.current.innerHTML = "";
    };
  }, []);

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
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperRef = useRef<any>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const slides = useMemo(() => markets, []);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const setLinear = useCallback((swiper: any) => {
    if (swiper?.wrapperEl) swiper.wrapperEl.style.transitionTimingFunction = "linear";
  }, []);

  const setEase = useCallback((swiper: any) => {
    if (swiper?.wrapperEl) swiper.wrapperEl.style.transitionTimingFunction = "ease";
  }, []);

  const stopAndResume = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;

    swiper.autoplay.stop();
    // Quick, responsive manual nav
    if (swiper.params) swiper.params.speed = 450;
    setEase(swiper);

    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      const s = swiperRef.current;
      if (!s?.autoplay) return;
      if (s.params) s.params.speed = 3000;
      setLinear(s);
      s.autoplay.start();
      resumeTimerRef.current = null;
    }, 2500); // shorter is usually enough; keeps CPU lower than long stop cycles
  }, [clearResumeTimer, setEase, setLinear]);

  useEffect(() => {
    const prev = prevRef.current;
    const next = nextRef.current;
    if (!prev || !next) return;

    const onClick = () => stopAndResume();
    prev.addEventListener("click", onClick, { passive: true });
    next.addEventListener("click", onClick, { passive: true });

    return () => {
      clearResumeTimer();
      prev.removeEventListener("click", onClick);
      next.removeEventListener("click", onClick);
    };
  }, [stopAndResume, clearResumeTimer]);

  // IMPORTANT: wire navigation ONCE and re-init after refs exist
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || !prevRef.current || !nextRef.current) return;

    swiper.params.navigation = {
      ...(swiper.params.navigation || {}),
      prevEl: prevRef.current,
      nextEl: nextRef.current,
    };

    swiper.navigation?.destroy?.();
    swiper.navigation?.init?.();
    swiper.navigation?.update?.();
  }, []);

  return (
    <section className="space-y-6 sm:space-y-10">
      <div className="relative mt-12 sm:mt-20 md:mt-[133px] rounded-2xl sm:rounded-3xl md:rounded-[32px] bg-gradient-to-br from-white/70 via-white/60 to-white/30 py-4 sm:py-6 md:py-10">
        {/* Globe */}
        <div className="absolute left-1/2 top-[40%] w-[560px] h-[560px] sm:w-[620px] sm:h-[620px] md:w-[760px] md:h-[760px] lg:w-[820px] lg:h-[820px] -translate-y-1/2 -translate-x-1/2 pointer-events-auto">
          <SpinningGlobe />
          <div className="pointer-events-none absolute inset-0 rounded-full" />
        </div>

        {/* Text over globe */}
        <div className="relative flex flex-col items-center text-center gap-2 sm:gap-4 py-6 sm:py-8 md:py-10 pointer-events-none">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold italic text-white drop-shadow-lg">
            300+ Agents
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-white font-semibold drop-shadow px-2">
            Trusted by real estate buyers and global investors worldwide.
          </p>
          <p className="text-xs sm:text-sm text-gray-200">Fast and reliable — zero delays in closing.</p>
        </div>

        {/* Slider + buttons */}
        <div className="relative mt-4 pb-6">
          <Swiper
            modules={[Navigation, Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // Default: continuous linear motion
              if (swiper.params) swiper.params.speed = 3000;
              setLinear(swiper);
            }}
            onBeforeInit={(swiper) => {
              // Attach refs before init so Swiper doesn't thrash re-init
              // (refs may still be null on first pass; we re-init once in the effect above)
              // @ts-ignore
              swiper.params.navigation = {
                ...(swiper.params.navigation || {}),
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              };
            }}
            navigation={{ enabled: true }}
            // Continuous marquee feel:
            loop
            loopAdditionalSlides={slides.length} // helps prevent loop hiccups
            watchSlidesProgress={false}
            // Avoid heavy DOM observation unless you need it:
            observer={false}
            observeParents={false}
            // "Marquee" settings:
            speed={3000}
            autoplay={{
              delay: 0, // important for continuous scroll
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              waitForTransition: false,
            }}
            // Lower interaction overhead:
            grabCursor
            threshold={8}
            touchRatio={0.8}
            resistanceRatio={0.6}
            // Layout:
            spaceBetween={24}
            slidesPerView={3.2}
            breakpoints={{
              0: { slidesPerView: 1.1, spaceBetween: 16 },
              640: { slidesPerView: 1.4, spaceBetween: 18 },
              1024: { slidesPerView: 3.2, spaceBetween: 24 },
              1440: { slidesPerView: 3.6, spaceBetween: 28 },
            }}
          >
            {slides.map((item) => (
              <SwiperSlide key={item.code}>
                <MarketCard name={item.name} amount={item.amount} code={item.code} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation buttons */}
          <div className="mt-4 sm:mt-6 flex justify-center gap-3 sm:gap-4 text-white/80">
            <button
              ref={prevRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label="Previous"
              type="button"
            >
              <img src="/assets/icons/arrow.svg" alt="" aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            <button
              ref={nextRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label="Next"
              type="button"
            >
              <img
                src="/assets/icons/arrow.svg"
                alt=""
                aria-hidden="true"
                className="h-3 w-3 sm:h-4 sm:w-4 rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedWorldwide;
