import React, { useEffect, useRef, useCallback, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import OptimizedImage from "./OptimizedImage.jsx";

const members = [
  {
    name: "Rafael",
    role: "Investor",
    payout: "$698,000",
    img: "/assets/images/teams/image3.png",
  },
  {
    name: "John",
    role: "Analyst",
    payout: "$589,000",
    img: "/assets/images/teams/image.png",
  },
  {
    name: "Alex",
    role: "Advisor",
    payout: "$603,000",
    img: "/assets/images/teams/image2.png",
  },
  {
    name: "Taylor",
    role: "Partner",
    payout: "$515,000",
    img: "/assets/images/teams/image3.png",
  },
  {
    name: "Jordan",
    role: "Lead",
    payout: "$560,000",
    img: "/assets/images/teams/image.png",
  },
];

const TeamShowcase = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  // Clear resume timer
  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  // Handle navigation - pause autoplay and set timer to resume
  const handleNavigation = useCallback(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      // Stop autoplay
      swiperRef.current.autoplay.stop();
      setIsAutoplayPaused(true);
      
      // Change speed to normal for manual navigation
      if (swiperRef.current.params) {
        swiperRef.current.params.speed = 500;
      }
      if (swiperRef.current.wrapperEl) {
        swiperRef.current.wrapperEl.style.transitionTimingFunction = 'ease';
      }
      
      // Clear any existing timer
      clearResumeTimer();
      
      // Set timer to resume autoplay after 5 seconds
      resumeTimerRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          // Restore continuous scrolling settings
          if (swiperRef.current.params) {
            swiperRef.current.params.speed = 3000;
          }
          if (swiperRef.current.wrapperEl) {
            swiperRef.current.wrapperEl.style.transitionTimingFunction = 'linear';
          }
          swiperRef.current.autoplay.start();
          setIsAutoplayPaused(false);
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

    // Add click listeners to pause autoplay when buttons are clicked
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
    <section className="w-full text-white px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14">
      {/* Header + navigation */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] leading-none tracking-tight">
        Our Team
      </h2>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prev */}
          <button
            ref={prevRef}
            className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/30 bg-transparent text-white/80 hover:bg-white hover:text-black transition"
            type="button"
          >
            <span className="sr-only">Previous</span>
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Next */}
          <button
            ref={nextRef}
            className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/30 bg-transparent text-white/80 hover:bg-white hover:text-black transition"
            type="button"
          >
            <span className="sr-only">Next</span>
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        spaceBetween={28}
        slidesPerView={3.4} // shows last card cut off like in screenshot
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
          // Apply linear timing function for smooth continuous scrolling
          if (swiper.wrapperEl) {
            swiper.wrapperEl.style.transitionTimingFunction = 'linear';
          }
          // Initialize navigation after swiper is ready
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
      {members.map((member) => (
        <SwiperSlide key={member.name}>
          <div className="group relative h-[180px] sm:h-[200px] md:h-[220px] rounded-2xl sm:rounded-3xl md:rounded-[32px] overflow-hidden ">
            <OptimizedImage
              src={member.img}
              alt={member.name}
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Dark gradient at bottom like the design */}
            <div className="pointer-events-none absolute inset-0 " />

            {/* Text content on image bottom-left */}
            <div className="absolute left-4 right-4 sm:left-6 sm:right-6 md:left-8 md:right-8 bottom-4 sm:bottom-5 md:bottom-7">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-semibold mb-1 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                {member.name}
              </p>

              <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                Payout : {member.payout}
              </p>

              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/80 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                <span>India</span>
                <span role="img" aria-label="India">
                  🇮🇳
                </span>
                <span className="h-[3px] w-[3px] rounded-full bg-white/60" />
                <span className="opacity-80">UPI</span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
      </Swiper>
      </section>
  );
};

export default TeamShowcase;
