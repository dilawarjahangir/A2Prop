import React, { useEffect, useState } from "react";

const getLenis = () => (typeof window !== "undefined" ? window.__lenis : null);

const ScrollTopFab = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const maxScroll = scrollHeight - clientHeight;
      const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setProgress(pct);
      setVisible(scrollTop > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white shadow-[0_14px_40px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 flex items-center justify-center",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <svg className="absolute inset-0 h-full w-full">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeDasharray={125.6}
          strokeDashoffset={125.6 - (progress / 100) * 125.6}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 120ms ease" }}
        />
      </svg>
      <span className="relative z-10 text-xs font-semibold">↑</span>
    </button>
  );
};

export default ScrollTopFab;
