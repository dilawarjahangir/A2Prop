import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CountUp from "./CountUp.jsx";
import { useTranslation } from "react-i18next";

const items = [
  {
    key: "years_market",
    value: 1
  },
  {
    key: "properties_listed",
    value: 45
  },
  {
    key: "closed_transactions",
    value: 32
  },
  {
    key: "client_satisfaction",
    value: 98
  },
];

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const cardClasses =
    "group h-full min-h-[190px] flex flex-col rounded-[12px] bg-[#282828] px-6 py-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[linear-gradient(93.6deg,_#999999_28.26%,_#FFFFFF_106.64%)] hover:text-black";

  return (
    <section className="relative z-30 space-y-8">
      <h2 className="text-3xl md:text-4xl font-semibold text-white text-center">
        {t("sections.why_choose_us_title")}
      </h2>
      {/* Mobile: Swiper carousel */}
      <div className="block sm:hidden">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides
          className="pb-2"
        >
          {items.map((item) => (
            <SwiperSlide key={item.title}>
              <div className={`${cardClasses} mx-2`}>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-black">
                  {t(`sections.why_choose_us_items.${item.key}_title`)}
                </h3>

                <div className="text-3xl font-bold my-2 text-white group-hover:text-black">
                  <CountUp to={item.value} duration={2} />
                  <span className="ml-1 text-base font-semibold">
                    {t(`sections.why_choose_us_items.${item.key}_suffix`)}
                  </span>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed group-hover:text-black">
                  {t(`sections.why_choose_us_items.${item.key}_copy`)}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Tablet & Desktop: grid layout */}
      <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.key} className={cardClasses}>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-black">
              {t(`sections.why_choose_us_items.${item.key}_title`)}
            </h3>

            <div className="text-3xl font-bold my-2 text-white group-hover:text-black">
              <CountUp to={item.value} duration={2} />
              <span className="ml-1 text-base font-semibold">
                {t(`sections.why_choose_us_items.${item.key}_suffix`)}
              </span>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed group-hover:text-black">
              {t(`sections.why_choose_us_items.${item.key}_copy`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
