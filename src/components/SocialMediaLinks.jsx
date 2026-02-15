import React from "react";
import GlassSurface from "./GlassSurface.jsx";
import { useTranslation } from "react-i18next";

const socials = [
  
  {
    name: "TikTok",
    icon: "/assets/icons/Footer/tiktok.svg",
    href: "https://www.tiktok.com/@a2properties.ae",
  },
  {
    name: "YouTube",
    icon: "/assets/icons/Footer/youtube.svg",
    href: "#youtube",
  },
  {
    name: "Instagram",
    icon: "/assets/icons/Footer/instagram.svg",
    href: "https://www.instagram.com/a2properties.ae/",
  },
  
  
];

const SocialMediaLinks = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-4xl font-semibold text-white">
          {t("sections.social_heading")}
        </h2>
        <p className="text-gray-300">
          {t("sections.social_body")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {socials.map((item) => (
          <GlassSurface key={item.name} width={192} height={64} className="p-0">
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex hover:bg-white/5 p-0 items-stretch justify-center w-full h-full text-white rounded-[inherit]"
              aria-label={t("sections.social_follow_on", { name: item.name })}
            >
              <div className="h-full w-full flex justify-center items-center">
                <img
                  src={item.icon}
                  alt={item.name}
                  className="h-7 w-7"
                  loading="lazy"
                />
              </div>
            </a>
          </GlassSurface>
        ))}
      </div>
    </section>
  );
}

export default SocialMediaLinks;
