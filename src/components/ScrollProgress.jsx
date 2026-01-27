import React, { useEffect, useRef } from "react";

const ScrollProgress = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;

    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      el.style.height = `${progress}%`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="scroll-progress-track" aria-hidden>
      <div className="scroll-progress-bar" ref={progressRef} />
    </div>
  );
};

export default ScrollProgress;

