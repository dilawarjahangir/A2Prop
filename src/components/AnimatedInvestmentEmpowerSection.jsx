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

  const stackStageRef = useRef(null);
  const stackRef = useRef(null);

  const topImageRef = useRef(null);
  const middleLayerRef = useRef(null);
  const middleImgRef = useRef(null);
  const taglineRef = useRef(null);
  const bottomImageRef = useRef(null);

  useEffect(() => {
    const container = imageStackContainerRef.current;
    const stack = stackRef.current;
    const stage = stackStageRef.current;

    const top = topImageRef.current;
    const mid = middleLayerRef.current;
    const bottom = bottomImageRef.current;
    const tagline = taglineRef.current;
    const midImg = middleImgRef.current;

    if (!container || !stack || !stage || !top || !mid || !bottom) return;

    // Helps prevent big “catch-up” jumps during mobile scroll/inertia
    gsap.ticker.lagSmoothing(1000, 16);

    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReduced) {
      // Minimal: just show everything
      gsap.set([top, mid, bottom], { clearProps: "all", opacity: 1, y: 0 });
      if (tagline) gsap.set(tagline, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Prep for transform animations (smoothness)
      gsap.set([top, mid, bottom], {
        opacity: 0,
        force3D: true,
        willChange: "transform,opacity",
        backfaceVisibility: "hidden",
        visibility: "visible",
      });
      if (tagline) gsap.set(tagline, { opacity: 1, willChange: "opacity" });

      gsap.set(stack, {
        transformStyle: "preserve-3d",
        willChange: "transform",
        backfaceVisibility: "hidden",
      });

      // Helper for viewport height
      const getVH = () => window.innerHeight || 800;

      // Create the main timeline (one trigger)
      const createTimeline = (scrubValue) => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: container,
            scrub: scrubValue, // <-- key for mobile smoothness
            invalidateOnRefresh: true,
            start: () => `top ${Math.round(window.innerHeight * 0.7)}px`,
            end: () => "bottom top",
          },
        });

        // Pre-fade (small early segment)
        tl.fromTo(
          top,
          { y: () => -getVH() * 1.2, opacity: 0 },
          { y: () => -getVH() * 0.9, opacity: 1, duration: 0.08, ease: "power2.out" },
          0
        );
        tl.fromTo(
          mid,
          { y: () => -getVH() * 0.6, opacity: 0 },
          { y: () => -getVH() * 0.4, opacity: 1, duration: 0.08, ease: "power2.out" },
          0
        );
        tl.fromTo(
          bottom,
          { y: () => getVH() * 1.2, opacity: 0 },
          { y: () => getVH() * 0.8, opacity: 1, duration: 0.08, ease: "power2.out" },
          0
        );

        // Main motion (keyframes are cheaper than many chained fromTo’s)
        tl.to(
          top,
          {
            keyframes: [
              { y: () => getVH() * 0.15, duration: 0.32 },
              { y: () => getVH() * 0.525, duration: 0.52 },
              { y: () => getVH() * 0.5, duration: 0.08 },
            ],
          },
          0.08
        );

        tl.to(
          mid,
          {
            keyframes: [
              { y: () => getVH() * 0.5, duration: 0.32 },
              { y: () => getVH() * 0.535, duration: 0.52 },
              { y: () => getVH() * 0.5, duration: 0.08 },
            ],
          },
          0.08
        );

        tl.to(
          bottom,
          {
            keyframes: [
              { y: () => getVH() * 0.8, duration: 0.18 },
              { y: () => getVH() * 0.62, duration: 0.14 },
              { y: () => getVH() * 0.545, duration: 0.52 },
              { y: () => getVH() * 0.5, duration: 0.08 },
            ],
          },
          0.08
        );

        if (tagline) {
          tl.to(tagline, { opacity: 1, duration: 0.32 }, 0.08);
          tl.to(tagline, { opacity: 0, duration: 0.4 }, 0.4);
        }

        return tl;
      };

      // RAF-throttled refresh (no timeout storms)
      let raf = 0;
      const requestRefresh = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      const ro = new ResizeObserver(requestRefresh);
      ro.observe(container);

      // Refresh after critical images load
      const imgs = [top, midImg, bottom].filter(Boolean);
      let pending = 0;
      const onImg = () => {
        pending -= 1;
        if (pending <= 0) requestRefresh();
      };

      imgs.forEach((img) => {
        if (img && img.tagName === "IMG" && !img.complete) {
          pending += 1;
          img.addEventListener("load", onImg, { once: true });
          img.addEventListener("error", onImg, { once: true });
        }
      });

      // --- MatchMedia: heavy desktop, light mobile ---
      let tiltST = null;
      let glowTween = null;
      let mainTL = null;

      const mm = ScrollTrigger.matchMedia({
        // MOBILE / COARSE POINTER: make it smooth & cheap
        "(hover: none) and (pointer: coarse), (max-width: 768px)": () => {
          // Smooth mobile trick: scrub a number, not `true`
          mainTL = createTimeline(0.35);

          // Disable tilt + pulsing glow (major win)
          // Keep glows static; they’re still visible, just not animated.
          return () => {
            mainTL && mainTL.kill();
            mainTL = null;
          };
        },

        // DESKTOP: full experience
        "all": () => {
          // Desktop can handle scrub:true
          if (!mainTL) mainTL = createTimeline(true);

          // Tilt (quickSetter)
          const setRotateX = gsap.quickSetter(stack, "rotateX", "deg");
          const setRotateY = gsap.quickSetter(stack, "rotateY", "deg");
          const setPerspective = gsap.quickSetter(stack, "transformPerspective", "px");
          setPerspective(1200);

          tiltST = ScrollTrigger.create({
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              setRotateX((0.5 - p) * 10);
              setRotateY((p - 0.5) * 14);
            },
          });

          // Glow pulse (desktop only)
          const glows = stage.querySelectorAll("[data-ambient-glow]");
          if (glows.length) {
            glowTween = gsap.to(glows, {
              opacity: 0.9,
              duration: 2.8,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
              stagger: 0.2,
            });
          }

          return () => {
            tiltST && tiltST.kill();
            tiltST = null;
            glowTween && glowTween.kill();
            glowTween = null;
            mainTL && mainTL.kill();
            mainTL = null;
          };
        },
      });

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        mm && mm.kill && mm.kill();

        imgs.forEach((img) => {
          if (img && img.tagName === "IMG") {
            img.removeEventListener("load", onImg);
            img.removeEventListener("error", onImg);
          }
        });
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="explore" className="relative z-20 py-16 sm:py-20 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="mb-8" />

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight relative" style={{ zIndex: 10 }}>
          {t("sections.investment_heading_line1")}
          <br className="hidden sm:block" />
          <span className="block">{t("sections.investment_heading_line2")}</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto relative" style={{ zIndex: 10 }}>
          {t("sections.investment_body")}
        </p>

        <div className="mt-8 flex justify-center relative" style={{ zIndex: 10 }}>
          <GradientButton href="/properties" className="px-8 py-3 text-sm md:text-base">
            {t("buttons.explore_properties")}
          </GradientButton>
        </div>

        <div
          ref={imageStackContainerRef}
          className="sm:mt-20 flex justify-center items-center overflow-visible"
          style={{ height: "200svh", minHeight: "200vh" }}
        >
          <div
            ref={stackStageRef}
            className="relative w-full max-w-md sm:w-[50vw] md:w-[40vw] lg:w-[30vw] aspect-[416/279] overflow-visible"
            style={{ perspective: "1200px" }}
          >
            <div
              data-ambient-glow
              className="absolute -inset-10 rounded-[48px] blur-3xl opacity-70"
              style={{
                background: "radial-gradient(circle at 50% 40%, rgba(120,140,255,0.35), transparent 60%)",
                zIndex: 0,
              }}
            />
            <div
              data-ambient-glow
              className="absolute -inset-16 rounded-[64px] blur-3xl opacity-50"
              style={{
                background: "radial-gradient(circle at 40% 60%, rgba(0,200,255,0.25), transparent 62%)",
                zIndex: 0,
              }}
            />

            <div ref={stackRef} className="absolute inset-0" style={{ zIndex: 1 }}>
              <img
                ref={topImageRef}
                src="/assets/icons/AnimationParts/Frame%2098.svg"
                alt="A2 Properties logo stack"
                className="absolute inset-0 w-full h-auto"
                style={{
                  zIndex: 3,
                  filter:
                    "drop-shadow(0 14px 30px rgba(120,140,255,0.35)) drop-shadow(0 0 18px rgba(180,200,255,0.25))",
                }}
              />

              <div
                ref={middleLayerRef}
                className="absolute inset-0 w-full h-auto"
                style={{
                  zIndex: 2,
                  filter:
                    "drop-shadow(0 10px 26px rgba(120,140,255,0.28)) drop-shadow(0 0 14px rgba(0,200,255,0.22))",
                }}
              >
                <div
                  className="absolute -inset-6 rounded-[32px] blur-2xl opacity-60"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 60%)",
                  }}
                />

                <img
                  ref={middleImgRef}
                  src="/assets/icons/AnimationParts/Group%2099.svg"
                  alt="A2 Properties middle layer"
                  className="w-full h-auto relative"
                  loading="lazy"
                  decoding="async"
                />

                <div ref={taglineRef} className="absolute inset-0 flex items-center justify-center px-6 text-center pointer-events-none">
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
                  <div
                    className="absolute"
                    style={{
                      width: "48%",
                      height: "32%",
                      borderRadius: "999px",
                      filter: "blur(22px)",
                      opacity: 0.9,
                      background: "radial-gradient(circle at 50% 50%, rgba(180,220,255,0.45), transparent 65%)",
                    }}
                  />

                  <span
                    className="relative text-white italic font-semibold leading-tight text-[30px] sm:text-[40px] md:text-[50px] lg:text-[60px]"
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

              <img
                ref={bottomImageRef}
                src="/assets/icons/AnimationParts/Frame%203467.svg"
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

        <div className="mt-8" />
      </div>
    </section>
  );
};

export default InvestmentEmpowerSection;
