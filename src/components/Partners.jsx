import React, { useMemo } from "react";
import GlassSurface from "./GlassSurface.jsx";
import LogoLoop from "./logo-loop.tsx";
import { useTranslation } from "react-i18next";

const basePartners = [
  {
    name: "Emaar",
    src: "/assets/images/partners/Emaar_f229e25788_black_to_white.png",
  },
  {
    name: "Binghatti",
    src: "/assets/images/partners/binghatti_7c9b5b6084_black_to_white.png",
  },
  {
    name: "Ellington",
    src: "/assets/images/partners/Ellington_58133c54d4_black_to_white.png",
  },
  {
    name: "Majid Al Futtaim",
    src: "/assets/images/partners/Majid_Al_Futtaim_b3d70262eb_black_to_white.png",
  },
  {
    name: "Select Group",
    src: "/assets/images/partners/Select_Group_be8d857695_black_to_white.png",
  },
  {
    name: "Logo 01",
    src: "/assets/images/partners/logo_01_4fd8dc607d_black_to_white.png",
  },
  {
    name: "Logo 02 (Alt 1)",
    src: "/assets/images/partners/logo_02_1_666ef04015_black_to_white.png",
  },
  {
    name: "Logo 02 (Alt 2)",
    src: "/assets/images/partners/logo_02_9c1f49f13a_black_to_white.png",
  },
];

const Partners = () => {
  const { t } = useTranslation();
  const logos = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => {
        const partner = basePartners[idx % basePartners.length];
        return {
          node: (
            <GlassSurface
            height={130}
            width={130}
            >
              <img
                src={partner.src}
                alt={partner.name}
                className="h-[100px] w-[100px] object-contain"
              />
            </GlassSurface>
          ),
          title: partner.name,
        };
      }),
    []
  );

  return (
    <section className="space-y-6 text-center" id="partners">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-semibold text-white">
          {t("sections.partners_heading")}
        </h2>
      </div>

      <div className="space-y-4 w-full overflow-hidden" dir="ltr">
        <LogoLoop
          logos={logos}
          direction="right"
          speed={90}
          logoHeight={150}
          gap={90}
          pauseOnHover={false}
          fadeOut
          scaleOnHover={true}
          ariaLabel={t("sections.partners_aria_label")}
          width="100%"
          className="w-full"
        />
      </div>
    </section>
  );
};

export default Partners;
