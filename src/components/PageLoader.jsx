import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const DESKTOP_BARS = 20;
const MOBILE_BARS = 10;

const PageLoader = ({ onComplete, logoSrc = "/assets/icons/logo.svg" }) => {
  const loaderRef = useRef(null);
  const barsRef = useRef([]);
  const bgRef = useRef(null);
  const logoRef = useRef(null);
  const numBars =
    typeof window !== "undefined" && window.innerWidth < 768
      ? MOBILE_BARS
      : DESKTOP_BARS;

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const bars = barsRef.current.filter(Boolean);
    const background = bgRef.current;
    const logo = logoRef.current;
    const loaderEl = loaderRef.current;

    // Initial states
    gsap.set(bars, { y: "100%" });
    if (background) gsap.set(background, { opacity: 1 });
    if (logo) gsap.set(logo, { opacity: 0, y: 20 });
    if (loaderEl) gsap.set(loaderEl, { autoAlpha: 1 });

    const timeline = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;

        if (onComplete) onComplete();
      },
    });

    const openTl = gsap.timeline();
    const closeTl = gsap.timeline();

    bars.forEach((bar) => {
      const openDuration = gsap.utils.random(0.4, 0.9);
      const closeDuration = gsap.utils.random(0.4, 0.9);
      const openDelay = gsap.utils.random(0, 0.25);
      const closeDelay = gsap.utils.random(0, 0.25);

      openTl.to(
        bar,
        {
          y: "0%",
          duration: openDuration,
          ease: "power3.out",
          force3D: true,
        },
        openDelay
      );

      closeTl.to(
        bar,
        {
          y: "100%",
          duration: closeDuration,
          ease: "power3.in",
          force3D: true,
        },
        closeDelay
      );
    });

    timeline
      // Bars go up + logo fades in
      .add(openTl, 0)
      .to(
        logo,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        0.1
      )
      // Hold
      .to({}, { duration: 2.5 })
      .addLabel("closing")
      // Logo fades out as bars start coming down
      .to(
        logo,
        {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "closing"
      )
      // Background fades so page shows while bars fall
      .to(
        background,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "closing"
      )
      // Bars fall
      .add(closeTl, "closing")
      // Fade out whole loader for a clean exit
      .to(loaderEl, {
        autoAlpha: 0,
        duration: 0.4,
        ease: "power1.out",
      });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      timeline.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999]"
    >
      {/* White background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-white"
      />

      {/* Bars */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: numBars }).map((_, index) => (
          <div
            key={index}
            ref={(el) => (barsRef.current[index] = el)}
            className="flex-1 bg-black"
          />
        ))}
      </div>

      {/* Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          ref={logoRef}
          src={logoSrc}
          alt="Logo"
          className="w-24 h-24 object-contain"
        />
      </div>
    </div>
  );
};

export default PageLoader;
