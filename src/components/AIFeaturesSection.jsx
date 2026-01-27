import React from "react";
import { useTranslation } from "react-i18next";
import OptimizedImage from "./OptimizedImage.jsx";

const features = [
  {
    icon: "/assets/icons/feature/icon-park-outline_data-arrival.svg",
    key: "real_data",
  },
  {
    icon: "/assets/icons/feature/ix_graph.svg",
    key: "verified_analytics",
  },
  {
    icon: "/assets/icons/feature/iconoir_flash.svg",
    key: "local_insights",
  },
  {
    icon: "/assets/icons/feature/mdi-light_clock.svg",
    key: "save_time",
  },
];

const AIFeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative z-20 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
                {t("sections.ai_features_title")}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-300">
                {t("sections.ai_features_subtitle")}
              </p>
            </div>

            {/* Features Grid 2x2 */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start space-y-3"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    <img
                      src={feature.icon}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-white leading-relaxed">
                    {t(`sections.ai_features_items.${feature.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Phone Mockup with Video */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
              {/* Phone Border Image - Overlay */}
              <OptimizedImage
                src="/assets/images/phone-border.webp"
                alt="Phone mockup"
                className="relative z-10 w-full h-auto pointer-events-none"
                imgClassName="w-full h-auto pointer-events-none"
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 320px, 360px"
              />

              {/* Video Container - Behind phone border, clipped to screen */}
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                {/* Screen window - adjust these values to match the phone screen area */}
                <div className="relative w-[calc(100%-8%)] h-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full "
                  >
                    <source
                      src="/assets/video/2.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;

