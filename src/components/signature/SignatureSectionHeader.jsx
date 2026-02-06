import React from "react";
import { Link } from "react-router-dom";

const SignatureSectionHeader = ({ t }) => (
  <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between text-white">
    <div className="space-y-2 max-w-3xl">
      <p className="uppercase text-[10px] sm:text-xs tracking-[0.2em] text-gray-400">
        {t("sections.signature_kicker")}
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
        {t("sections.signature_title")}
      </h2>
      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
        {t("sections.signature_body")}
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <Link
        to="/properties"
        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-90 transition"
      >
        {t("sections.latest_works_view_property")}
      </Link>
      <a
        href="#ai-map"
        className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition"
      >
        {t("sections.map_cta", { defaultValue: "Explore map" })}
      </a>
    </div>
  </div>
);

export default SignatureSectionHeader;
