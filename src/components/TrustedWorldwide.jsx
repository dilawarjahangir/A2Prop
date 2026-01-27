import React, { useEffect, useRef, useCallback } from "react";
import Globe from "globe.gl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import ReactCountryFlag from "react-country-flag";

const markets = [
  {
    name: "United Kingdom",
    amount: "35 Agents",
    code: "GB",
  },
  {
    name: "Germany",
    amount: "12 Agents",
    code: "DE",
  },
  {
    name: "France",
    amount: "8 Agents",
    code: "FR",
  },
  {
    name: "Italy",
    amount: "7 Agents",
    code: "IT",
  },
  {
    name: "Netherlands",
    amount: "8 Agents",
    code: "NL",
  },
  {
    name: "Saudi Arabia",
    amount: "12 Agents",
    code: "SA",
  },
  {
    name: "Qatar",
    amount: "4 Agents",
    code: "QA",
  },
  {
    name: "Kuwait",
    amount: "5 Agents",
    code: "KW",
  },
  {
    name: "Oman",
    amount: "3 Agents",
    code: "OM",
  },
  {
    name: "Bahrain",
    amount: "3 Agents",
    code: "BH",
  },
  {
    name: "Egypt",
    amount: "7 Agents",
    code: "EG",
  },
  {
    name: "Jordan",
    amount: "4 Agents",
    code: "JO",
  },
  {
    name: "Lebanon",
    amount: "4 Agents",
    code: "LB",
  },
  {
    name: "Sudan",
    amount: "3 Agents",
    code: "SD",
  },
  {
    name: "Nigeria",
    amount: "10 Agents",
    code: "NG",
  },
  {
    name: "Kenya",
    amount: "6 Agents",
    code: "KE",
  },
  {
    name: "South Africa",
    amount: "5 Agents",
    code: "ZA",
  },
  {
    name: "United States",
    amount: "6 Agents",
    code: "US",
  },
  {
    name: "Canada",
    amount: "5 Agents",
    code: "CA",
  },
  {
    name: "Australia",
    amount: "4 Agents",
    code: "AU",
  },
  {
    name: "Turkey",
    amount: "5 Agents",
    code: "TR",
  },
];

// Duplicate list just for Swiper so loop feels continuous like Team
const loopedMarkets = [...markets, ...markets];

const SpinningGlobe = () => {
  const globeRef = useRef(null);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

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
      if (!globeRef.current) {
        return;
      }
      const { clientWidth, clientHeight } = globeRef.current;
      globe.width(clientWidth);
      globe.height(clientHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) {
        globeRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={globeRef} className="h-full w-full rounded-full overflow-hidden" aria-label="Spinning globe" role="img" />;
};

const TrustedWorldwide = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const handleNavigation = useCallback(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();

      // Normal speed on manual navigation
      if (swiperRef.current.params) {
        swiperRef.current.params.speed = 500;
      }
      if (swiperRef.current.wrapperEl) {
        swiperRef.current.wrapperEl.style.transitionTimingFunction = "ease";
      }

      clearResumeTimer();

      // Resume continuous scroll after 5s
      resumeTimerRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          if (swiperRef.current.params) {
            swiperRef.current.params.speed = 3000;
          }
          if (swiperRef.current.wrapperEl) {
            swiperRef.current.wrapperEl.style.transitionTimingFunction = "linear";
          }
          swiperRef.current.autoplay.start();
        }
        resumeTimerRef.current = null;
      }, 5000);
    }
  }, [clearResumeTimer]);

  useEffect(() => {
    if (
      swiperRef.current &&
      prevRef.current &&
      nextRef.current &&
      swiperRef.current.params.navigation
    ) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }

    const prevButton = prevRef.current;
    const nextButton = nextRef.current;

    const handleButtonInteraction = () => {
      handleNavigation();
    };

    if (prevButton) {
      prevButton.addEventListener("click", handleButtonInteraction, { passive: true });
    }
    if (nextButton) {
      nextButton.addEventListener("click", handleButtonInteraction, { passive: true });
    }

    return () => {
      clearResumeTimer();
      if (prevButton) {
        prevButton.removeEventListener("click", handleButtonInteraction);
      }
      if (nextButton) {
        nextButton.removeEventListener("click", handleButtonInteraction);
      }
    };
  }, [handleNavigation, clearResumeTimer]);

  return (
    <section className="space-y-6 sm:space-y-10">
      <div className="relative mt-12 sm:mt-20 md:mt-[133px] rounded-2xl sm:rounded-3xl md:rounded-[32px] bg-gradient-to-br from-white/70 via-white/60 to-white/30 py-4 sm:py-6 md:py-10">
        {/* Globe */}
        <div className="absolute left-1/2 top-[40%] w-[560px] h-[560px] sm:w-[620px] sm:h-[620px] md:w-[760px] md:h-[760px] lg:w-[820px] lg:h-[820px] -translate-y-1/2 -translate-x-1/2 pointer-events-auto">
          <SpinningGlobe />
          <div
            className="
              pointer-events-none
              absolute inset-0
              rounded-full
            "
          />
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
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            spaceBetween={10  }
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
              // Same continuous scroll as team
              if (swiper.wrapperEl) {
                swiper.wrapperEl.style.transitionTimingFunction = "linear";
              }
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
          >
            {loopedMarkets.map((item, idx) => (
              <SwiperSlide key={`${item.name}-${idx}`}>
                <div className=" rounded-xl sm:rounded-2xl w-[250px] bg-white/90 border border-black/5 shadow-lg backdrop-blur py-3 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-2 text-gray-800 font-semibold mb-2 sm:mb-3"  >
                    <ReactCountryFlag
                      countryCode={item.code}
                      svg
                      title={item.name}
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                        borderRadius: "0.125rem",
                      }}
                    />
                    <span className="text-sm sm:text-base">{item.name}</span>
                  </div>
                  <div className="text-xl self-center sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {item.amount}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation buttons */}
          <div className="mt-4 sm:mt-6 flex justify-center gap-3 sm:gap-4 text-white/80">
            <button
              ref={prevRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label="Previous"
            >
              <img
                src="/assets/icons/arrow.svg"
                alt=""
                aria-hidden="true"
                className="h-3 w-3 sm:h-4 sm:w-4"
              />
            </button>
            <button
              ref={nextRef}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-white/50 bg-white/20 backdrop-blur flex items-center justify-center hover:border-white transition-colors"
              aria-label="Next"
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
