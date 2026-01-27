import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const reels = [
  {
    src: "/assets/images/latest-work/Frame%203360.png",
    duration: "0:54",
    slug: "selvara-phase-2",
  },
  {
    src: "/assets/images/latest-work/Frame%203361.png",
    duration: "3:11",
    slug: "samana-hills-south-phase-3",
  },
  {
    src: "/assets/images/latest-work/Frame%203362.png",
    duration: "0:19",
    slug: "sera-by-emaar",
  },
  {
    src: "/assets/images/latest-work/Frame%203364.png",
    duration: "1:37",
    slug: "soulever",
  },
];

const LatestWorks = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-semibold text-white">
          {t("sections.latest_works_title")}
        </h2>
        <p className="text-gray-300">
          {t("sections.latest_works_subtitle")}
        </p>
      </div>

      <div className="relative">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reels.map((item, idx) => (
            <Link
              key={idx}
              to={`/properties/${item.slug}`}
              className="relative block h-[400px] rounded-3xl overflow-hidden bg-black group focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <img
                src={item.src}
                alt={`Latest work ${idx + 1}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-semibold text-sm">
                <span
                  className="inline-block h-0 w-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-white"
                  aria-hidden="true"
                />
                <span>{item.duration}</span>
              </div>
              <div className="absolute bottom-4 right-4 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                {t("sections.latest_works_view_property")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestWorks;
