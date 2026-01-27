import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientButton from "./GradientButton.jsx";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

const InvestmentEmpowerSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const imageStackContainerRef = useRef(null);

  // 3D stage + stack wrapper
  const stackStageRef = useRef(null);
  const stackRef = useRef(null);

  const topImageRef = useRef(null);

  // Middle wrapper + img + text
  const middleLayerRef = useRef(null);
  const middleImgRef = useRef(null);
  const taglineRef = useRef(null);

  const bottomImageRef = useRef(null);

  useEffect(() => {
    const imageStackContainer = imageStackContainerRef.current;
    if (!imageStackContainer) return;

    let resizeObserver;
    let resizeTimeout;

    let topTileTimeline;
    let middleTileTimeline;
    let bottomTileTimeline;

    let topTilePreFadeTimeline;
    let middleTilePreFadeTimeline;
    let bottomTilePreFadeTimeline;

    let taglineTimeline;

    // 3D + ambient glow
    let tiltTrigger;
    let glowPulseTween;

    const isCoarsePointer =
      window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ??
      false;

    ScrollTrigger.config({ ignoreMobileResize: true });

    let lastWindowWidth = window.innerWidth;
    let lastObservedWidth = imageStackContainer.getBoundingClientRect().width;

    const setupOpeningScene = () => {
      const topImage = topImageRef.current;
      const middleLayer = middleLayerRef.current;
      const bottomImage = bottomImageRef.current;
      const tagline = taglineRef.current;

      if (!topImage || !middleLayer || !bottomImage) return;

      const vh = window.innerHeight;

      gsap.set(topImage, {
        y: -vh * 1.2,
        opacity: 0,
        immediateRender: true,
        force3D: true,
        visibility: "visible",
      });

      gsap.set(middleLayer, {
        y: -vh * 0.6,
        opacity: 0,
        immediateRender: true,
        force3D: true,
        visibility: "visible",
      });

      gsap.set(bottomImage, {
        y: vh * 1.2,
        opacity: 0,
        immediateRender: true,
        force3D: true,
        visibility: "visible",
      });

      if (tagline) {
        gsap.set(tagline, { opacity: 1, immediateRender: true });
      }
    };

    const refreshTriggers = () => {
      ScrollTrigger.refresh();
    };

    // 3D tilt applied to wrapper (won't fight tile Y animations)
    const create3DTilt = () => {
      const stack = stackRef.current;
      if (!stack) return;

      gsap.set(stack, {
        transformStyle: "preserve-3d",
        willChange: "transform",
      });

      tiltTrigger?.kill();
      tiltTrigger = ScrollTrigger.create({
        trigger: imageStackContainer,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const rotateX = (0.5 - p) * 10; // subtle
          const rotateY = (p - 0.5) * 14;

          gsap.set(stack, {
            rotateX,
            rotateY,
            transformPerspective: 1200,
          });
        },
      });
    };

    // Ambient glow breathing
    const createGlowPulse = () => {
      const stage = stackStageRef.current;
      if (!stage) return;

      const glows = stage.querySelectorAll("[data-ambient-glow]");
      if (!glows.length) return;

      glowPulseTween?.kill();
      glowPulseTween = gsap.to(glows, {
        opacity: 0.9,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.2,
      });
    };

    const createTileAnimations = () => {
      const topImage = topImageRef.current;
      const middleLayer = middleLayerRef.current;
      const bottomImage = bottomImageRef.current;
      const tagline = taglineRef.current;

      if (!topImage || !middleLayer || !bottomImage) return;

      const vh = window.innerHeight;

      // Kill old timelines
      topTileTimeline?.kill();
      middleTileTimeline?.kill();
      bottomTileTimeline?.kill();
      topTilePreFadeTimeline?.kill();
      middleTilePreFadeTimeline?.kill();
      bottomTilePreFadeTimeline?.kill();
      taglineTimeline?.kill();

      const APPEAR_AT_TOP_PROGRESS = 0.3;
      const PRE_FADE_SPACE = 0.08;

      const calculateMainAnimationStart = () => {
        const rect = imageStackContainer.getBoundingClientRect();
        const containerTop = rect.top + window.pageYOffset;
        const topOffsetInViewport =
          window.innerHeight * (1 - APPEAR_AT_TOP_PROGRESS);
        return containerTop - topOffsetInViewport;
      };

      const calculatePreFadeStart = () => {
        const rect = imageStackContainer.getBoundingClientRect();
        const containerTop = rect.top + window.pageYOffset;
        const topOffsetInViewport =
          window.innerHeight * (1 - APPEAR_AT_TOP_PROGRESS);
        const mainStart = containerTop - topOffsetInViewport;
        return mainStart - window.innerHeight * PRE_FADE_SPACE;
      };

      const calculateEnd = () => {
        const rect = imageStackContainer.getBoundingClientRect();
        return rect.bottom + window.pageYOffset;
      };

      const preFadeStartPoint = calculatePreFadeStart;
      const startPoint = calculateMainAnimationStart;
      const endPoint = calculateEnd;

      const phase1End = 0.4;
      const phase2End = 0.92;
      const phase3End = 1.0;

      const phase1Duration = phase1End;
      const phase2Duration = phase2End - phase1End;
      const phase3Duration = phase3End - phase2End;

      const bottomAppearStart = 0.18;
      const bottomPhase1StartDuration = bottomAppearStart;
      const bottomPhase1AnimateDuration = phase1End - bottomAppearStart;

      // PRE-FADE
      topTilePreFadeTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: preFadeStartPoint,
            end: startPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          topImage,
          { y: -vh * 1.2, opacity: 0 },
          { y: -vh * 0.9, opacity: 1, ease: "power2.out", immediateRender: true }
        );

      middleTilePreFadeTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: preFadeStartPoint,
            end: startPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          middleLayer,
          { y: -vh * 0.6, opacity: 0 },
          { y: -vh * 0.4, opacity: 1, ease: "power2.out", immediateRender: true }
        );

      bottomTilePreFadeTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: preFadeStartPoint,
            end: startPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          bottomImage,
          { y: vh * 1.2, opacity: 0 },
          { y: vh * 0.8, opacity: 1, ease: "power2.out", immediateRender: true }
        );

      // MAIN
      topTileTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: startPoint,
            end: endPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          topImage,
          { y: -vh * 0.9, opacity: 1 },
          { y: vh * 0.15, opacity: 1, duration: phase1Duration, ease: "none" },
          0
        )
        .fromTo(
          topImage,
          { y: vh * 0.15, opacity: 1 },
          { y: vh * 0.525, opacity: 1, duration: phase2Duration, ease: "none" },
          phase1End
        )
        .fromTo(
          topImage,
          { y: vh * 0.525, opacity: 1 },
          { y: vh * 0.5, opacity: 1, duration: phase3Duration, ease: "none" },
          phase2End
        );

      middleTileTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: startPoint,
            end: endPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          middleLayer,
          { y: -vh * 0.4, opacity: 1 },
          { y: vh * 0.5, opacity: 1, duration: phase1Duration, ease: "none" },
          0
        )
        .fromTo(
          middleLayer,
          { y: vh * 0.5, opacity: 1 },
          { y: vh * 0.535, opacity: 1, duration: phase2Duration, ease: "none" },
          phase1End
        )
        .fromTo(
          middleLayer,
          { y: vh * 0.535, opacity: 1 },
          { y: vh * 0.5, opacity: 1, duration: phase3Duration, ease: "none" },
          phase2End
        );

      bottomTileTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: startPoint,
            end: endPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          bottomImage,
          { y: vh * 0.8, opacity: 1 },
          {
            y: vh * 0.8,
            opacity: 1,
            duration: bottomPhase1StartDuration,
            ease: "none",
          },
          0
        )
        .fromTo(
          bottomImage,
          { y: vh * 0.8, opacity: 1 },
          {
            y: vh * 0.62,
            opacity: 1,
            duration: bottomPhase1AnimateDuration,
            ease: "none",
          },
          bottomAppearStart
        )
        .fromTo(
          bottomImage,
          { y: vh * 0.62, opacity: 1 },
          {
            y: vh * 0.545,
            opacity: 1,
            duration: phase2Duration,
            ease: "none",
          },
          phase1End
        )
        .fromTo(
          bottomImage,
          { y: vh * 0.545, opacity: 1 },
          { y: vh * 0.5, opacity: 1, duration: phase3Duration, ease: "none" },
          phase2End
        );

      // TAGLINE fade out during close
      if (tagline) {
        taglineTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: imageStackContainer,
            start: startPoint,
            end: endPoint,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        taglineTimeline.fromTo(
          tagline,
          { opacity: 1 },
          { opacity: 1, duration: phase1Duration, ease: "none" },
          0
        );

        taglineTimeline.to(
          tagline,
          { opacity: 0, duration: phase2Duration * 0.75, ease: "none" },
          phase1End
        );

        taglineTimeline.to(
          tagline,
          { opacity: 0, duration: phase3Duration, ease: "none" },
          phase2End
        );
      }

      ScrollTrigger.refresh();
    };

    // Image loading
    const images = [
      topImageRef.current,
      middleImgRef.current,
      bottomImageRef.current,
    ].filter(Boolean);

    let loadedImages = 0;

    const handleImageLoad = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        setupOpeningScene();
        createTileAnimations();
        create3DTilt();
        createGlowPulse();
        refreshTriggers();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener("load", handleImageLoad);
        img.addEventListener("error", handleImageLoad);
      }
    });

    if (loadedImages === images.length) {
      setupOpeningScene();
      createTileAnimations();
      create3DTilt();
      createGlowPulse();
      refreshTriggers();
    }

    // Resize observer
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries?.[0];
      const nextWidth =
        entry?.contentRect?.width ??
        imageStackContainer.getBoundingClientRect().width;

      if (
        isCoarsePointer &&
        Math.round(nextWidth) === Math.round(lastObservedWidth)
      ) {
        return;
      }

      lastObservedWidth = nextWidth;

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(refreshTriggers, 100);
    });
    resizeObserver.observe(imageStackContainer);

    const handleResize = () => {
      if (isCoarsePointer) {
        const nextWidth = window.innerWidth;
        if (nextWidth === lastWindowWidth) return;
        lastWindowWidth = nextWidth;
      }

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupOpeningScene();
        createTileAnimations();
        create3DTilt();
        createGlowPulse();
        refreshTriggers();
      }, 100);
    };
    window.addEventListener("resize", handleResize);

    refreshTriggers();

    return () => {
      tiltTrigger?.kill();
      glowPulseTween?.kill();

      topTileTimeline?.kill();
      middleTileTimeline?.kill();
      bottomTileTimeline?.kill();

      topTilePreFadeTimeline?.kill();
      middleTilePreFadeTimeline?.kill();
      bottomTilePreFadeTimeline?.kill();

      taglineTimeline?.kill();

      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);

      images.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
        img.removeEventListener("error", handleImageLoad);
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="explore"
      className="relative z-20 py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Top Progress Bar */}
        <div className="mb-8">
          {/* <ScrollProgressBar progress={topProgress} /> */}
        </div>

        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight relative"
          style={{ zIndex: 10 }}
        >
          {t("sections.investment_heading_line1")}
          <br className="hidden sm:block" />
          <span className="block">{t("sections.investment_heading_line2")}</span>
        </h2>

        <p
          className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto relative"
          style={{ zIndex: 10 }}
        >
          {t("sections.investment_body")}
        </p>

        <div className="mt-8 flex justify-center relative" style={{ zIndex: 10 }}>
          <GradientButton href="/properties" className="px-8 py-3 text-sm md:text-base">
            {t("buttons.explore_properties")}
          </GradientButton>
        </div>

        {/* Image Stack Container */}
        <div
          ref={imageStackContainerRef}
          className="sm:mt-20 flex justify-center items-center overflow-visible"
          style={{ height: "200svh", minHeight: "200vh" }}
        >
          {/* 3D STAGE */}
          <div
            ref={stackStageRef}
            className="relative w-full max-w-md sm:w-[50vw] md:w-[40vw] lg:w-[30vw] aspect-[416/279] overflow-visible"
            style={{ perspective: "1200px" }}
          >
            {/* Ambient glow behind the whole stack */}
            <div
              data-ambient-glow
              className="absolute -inset-10 rounded-[48px] blur-3xl opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(120,140,255,0.35), transparent 60%)",
                zIndex: 0,
              }}
            />
            <div
              data-ambient-glow
              className="absolute -inset-16 rounded-[64px] blur-3xl opacity-50"
              style={{
                background:
                  "radial-gradient(circle at 40% 60%, rgba(0,200,255,0.25), transparent 62%)",
                zIndex: 0,
              }}
            />

            {/* STACK WRAPPER (gets 3D tilt) */}
            <div ref={stackRef} className="absolute inset-0" style={{ zIndex: 1 }}>
              {/* TOP */}
              <img
                ref={topImageRef}
                src="/assets/icons/AnimationParts/frame-98.svg"
                alt="A2 Properties logo stack"
                className="absolute inset-0 w-full h-auto"
                style={{
                  zIndex: 3,
                  filter:
                    "drop-shadow(0 14px 30px rgba(120,140,255,0.35)) drop-shadow(0 0 18px rgba(180,200,255,0.25))",
                }}
              />

              {/* MIDDLE WRAPPER (image + text) */}
              <div
                ref={middleLayerRef}
                className="absolute inset-0 w-full h-auto"
                style={{
                  zIndex: 2,
                  filter:
                    "drop-shadow(0 10px 26px rgba(120,140,255,0.28)) drop-shadow(0 0 14px rgba(0,200,255,0.22))",
                }}
              >
                {/* Local glow for the middle tile */}
                <div
                  className="absolute -inset-6 rounded-[32px] blur-2xl opacity-60"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 60%)",
                  }}
                />

                <img
                  ref={middleImgRef}
                  src="/assets/icons/AnimationParts/group-99.svg"
                  alt="A2 Properties middle layer"
                  className="w-full h-auto relative"
                />

                {/* Tagline overlay (with blue glow plate behind text) */}
                <div
                  ref={taglineRef}
                  className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none"
                >
                  {/* Blue glow bloom behind text */}
                  <div
                    className="absolute"
                    style={{
                      width: "78%",
                      height: "52%",
                      borderRadius: "999px",
                      filter: "blur(34px)",
                      opacity: 0.85,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(80,140,255,0.55), rgba(0,180,255,0.25) 40%, transparent 70%)",
                    }}
                  />

                  {/* Tighter core glow */}
                  <div
                    className="absolute"
                    style={{
                      width: "48%",
                      height: "32%",
                      borderRadius: "999px",
                      filter: "blur(22px)",
                      opacity: 0.9,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(180,220,255,0.45), transparent 65%)",
                    }}
                  />

                  <span
                    className="
                      relative
                      text-white italic font-semibold leading-tight
                      text-[30px] sm:text-[40px] md:text-[50px] lg:text-[60px]
                    "
                    style={{
                      textShadow:
                        "0 0 10px rgba(255,255,255,0.35), 0 0 28px rgba(120,140,255,0.5), 0 0 70px rgba(0,180,255,0.35)",
                    }}
                  >
                    Your trust is
                    <br />
                    our priority
                  </span>
                </div>
              </div>

              {/* BOTTOM */}
              <img
                ref={bottomImageRef}
                src="/assets/icons/AnimationParts/frame-3467.svg"
                alt="A2 Properties base layers"
                className="absolute inset-0 w-full h-auto"
                style={{
                  zIndex: 1,
                  filter:
                    "drop-shadow(0 12px 28px rgba(120,140,255,0.25)) drop-shadow(0 0 12px rgba(180,200,255,0.18))",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          {/* <ScrollProgressBar progress={bottomProgress} /> */}
        </div>
      </div>
    </section>
  );
};

export default InvestmentEmpowerSection;
