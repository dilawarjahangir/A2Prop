import React from "react";
import { motion } from "framer-motion";
import GradientButton from "./GradientButton.jsx";

const InvestmentEmpowerSection = () => {
  return (
    <section
      id="explore"
      className="relative z-20 py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
          Empowering Your Investment Decisions in
          <br className="hidden sm:block" />
          <span className="block">
            Leading Property Areas
          </span>
        </h2>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
          Our platform provides buyers and investors with the tools, guidance, and listings
          they need to make confident property decisions.
        </p>

        <div className="mt-8 flex justify-center">
          <GradientButton href="/properties" className="px-8 py-3 text-sm md:text-base">
            Explore Properties
          </GradientButton>
        </div>
      </div>

      <div className="mt-16 sm:mt-20 flex justify-center">
        <motion.div
          className="relative w-[260px] sm:w-[320px] md:w-[360px] aspect-[416/279]"
          initial={{ y: 0, rotate: -8 }}
          animate={{ y: [-4, 4, -4], rotate: [-9, -7, -9] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Bottom layers */}
          <motion.img
            src="/assets/icons/AnimationParts/group-99.svg"
            alt="A2 Properties base layers"
            className="absolute inset-0 h-full w-full object-contain opacity-80"
            initial={{ y: 6 }}
            animate={{ y: [8, 2, 8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src="/assets/icons/AnimationParts/frame-3467.svg"
            alt="A2 Properties middle layer"
            className="absolute inset-0 h-full w-full object-contain"
            initial={{ y: 2 }}
            animate={{ y: [3, -1, 3] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Top logo tile */}
          <motion.img
            src="/assets/icons/AnimationParts/frame-98.svg"
            alt="A2 Properties logo stack"
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
            initial={{ y: -2 }}
            animate={{ y: [-4, 2, -4] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentEmpowerSection;

