import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GradientButton from "./GradientButton.jsx";
import Orb from "./Orb.jsx";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const sectionRef = useRef(null);
  const { t } = useTranslation();

  // Track scroll progress for this section only
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"], 
    // 0 => when top of Hero hits top of viewport
    // 1 => when bottom of Hero hits top of viewport
  });

  // Map scroll progress to scale values
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.8]);
  // tweak [1, 1.8] to [1, 2] or [0.9, 1.6] as you like

  return (
    <section
      ref={sectionRef}
      className="relative z-20 flex items-center justify-center min-h-[80vh] text-center overflow-visible"
    >
      {/* Orb background with scroll scale */}
      <motion.div
        style={{ scale }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={14}
          forceHoverState={false}
        />
      </motion.div>

      {/* Content on top */}
      <div className="relative z-10 flex flex-col items-center px-4">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-semibold italic text-white leading-tight">
            {t("hero.title_line1")}
            <br />
            <span className="text-white/90">{t("hero.title_line2")}</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex justify-center">
            <GradientButton href="#explore" className="px-6 py-3 text-sm">
              {t("hero.cta_explore")}
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
