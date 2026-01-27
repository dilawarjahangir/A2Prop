import React from "react";
import { useTranslation } from "react-i18next";

const EmbeddedProjectsMap = () => {
  const { t } = useTranslation();
  const mapUrl = "https://a2-properties.map.estate/en/map/uae-dubai/projects";

  return (
    <section id="ai-map" className="space-y-4">
      <p className="text-sm md:text-base text-gray-300 max-w-3xl">
        {t("sections.map_intro")}
      </p>

      <div className="relative min-w-0 overflow-hidden max-w-[1250px] rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/10" />

        <iframe
          title={t("sections.map_iframe_title")}
          src={mapUrl}
          loading="lazy"
          // "scrolling" is legacy but still helps in some browsers (hides scrollbars)
          scrolling="no"
          className="relative z-10 block max-w-[1250px] w-full h-[760px] rounded-3xl border-0"
        />
      </div>
    </section>
  );
};

export default EmbeddedProjectsMap;
