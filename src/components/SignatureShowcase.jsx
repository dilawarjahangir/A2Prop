import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { getPropertiesForLocale, properties } from "../data/properties.js";
import { useTranslation } from "react-i18next";
import { getLocale } from "../hooks/useLocale.js";
import OptimizedImage from "./OptimizedImage.jsx";

import "swiper/css";
import "swiper/css/navigation";
import arrowIcon from "/assets/icons/arrow2.svg";
import galleryIcon from "/assets/icons/gallery.svg";

const SignatureShowcase = () => {
  const { t } = useTranslation();
  const locale = getLocale();
  const sectionRef = useRef(null);
  // Outer swiper navigation refs
  const outerPrevRef = useRef(null);
  const outerNextRef = useRef(null);

  // Inner swiper navigation refs (arrays indexed by listing index)
  const innerPrevRefs = useRef([]);
  const innerNextRefs = useRef([]);

  const [hasEnteredView, setHasEnteredView] = useState(false);
  const listings = useMemo(() => {
    const list = getPropertiesForLocale(locale) || properties;
    return list.map((property) => ({
      title: property.priceUSD,
      subtitle: property.title,
      location: property.location,
      images: property.gallery,
      slug: property.slug,
    }));
  }, [locale]);

  // Track active slide index for each listing's inner swiper
  const [activeIndexes, setActiveIndexes] = useState(
    () => new Array(listings.length).fill(0)
  );

  useEffect(() => {
    setActiveIndexes(new Array(listings.length).fill(0));
  }, [listings.length]);

  useEffect(() => {
    if (hasEnteredView) return;
    const node = sectionRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasEnteredView]);

  return (
    <section ref={sectionRef} className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="grid md:grid-cols-[1fr,2fr] gap-4 sm:gap-6 items-center">
        {/* Left column */}
        <div className="space-y-3 sm:space-y-4 text-white">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <p className="uppercase text-[10px] sm:text-xs tracking-[0.2em] text-gray-400">
                {t("sections.signature_kicker")}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                {t("sections.signature_title")}
              </h2>
            </div>

            {/* Swiper navigation buttons for the main listings carousel */}
            <div className="flex items-center gap-1.5 sm:gap-2" dir="ltr">
              <button
                type="button"
                ref={outerPrevRef}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full border border-white/20 text-white hover:border-white/40 transition-colors flex items-center justify-center"
                aria-label="Next listing"
              >
                <img
                  src={arrowIcon}
                  alt=""
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                ref={outerNextRef}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full border border-white/20 text-white hover:border-white/40 transition-colors flex items-center justify-center"
                aria-label="Previous listing"
              >
                <img
                  src={arrowIcon}
                  alt=""
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rotate-180"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {t("sections.signature_body")}
          </p>

          <a
            href="#signatures"
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg bg-white text-black font-medium shadow hover:bg-gray-200 transition-colors"
          >
            {t("sections.signature_cta")}
          </a>
        </div>

        {/* Right column: main Swiper carousel */}
        <div className="relative overflow-hidden" dir="ltr">
          {/* Edge gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-6 md:w-10 bg-gradient-to-r from-[#0e0e0e] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-6 md:w-10 bg-gradient-to-l from-[#0e0e0e] to-transparent" />

          {hasEnteredView ? (
            <Swiper
              dir="ltr"
              modules={[Navigation]}
              onSwiper={(swiper) => {
                setTimeout(() => {
                  if (outerPrevRef.current && outerNextRef.current) {
                    swiper.params.navigation = {
                      ...(swiper.params.navigation || {}),
                      prevEl: outerPrevRef.current,
                      nextEl: outerNextRef.current,
                    };
                    swiper.navigation.destroy();
                    swiper.navigation.init();
                    swiper.navigation.update();
                  }
                });
              }}
              spaceBetween={16}
              slidesPerView={1.1}
              breakpoints={{
                640: { slidesPerView: 1.5 },
                1024: { slidesPerView: 2.2 },
              }}
              className="pb-4"
            >
              {listings.map((listing, index) => (
                <SwiperSlide
                  key={`${listing.title}-${index}`}
                  className="!h-full item flex"
                >
                  <div className="bg-[#161616] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-[280px] sm:max-w-xs mx-auto text-white shadow-[0_10px_50px_-25px_rgba(0,0,0,0.6)] flex flex-col h-full">
                    {/* Inner image carousel with custom overlay */}
                    <div
                      className="relative mx-auto"
                      style={{
                        height: "clamp(200px, 40vw, 303px)",
                        width: "clamp(200px, 40vw, 303px)",
                        maxHeight: "303px",
                        maxWidth: "303px",
                      }}
                    >
                      <Swiper
                        dir="ltr"
                        modules={[Navigation]}
                        loop
                        spaceBetween={8}
                        slidesPerView={1}
                        className="h-full w-full"
                        onSwiper={(swiper) => {
                          setTimeout(() => {
                            const prevEl = innerPrevRefs.current[index];
                            const nextEl = innerNextRefs.current[index];

                            if (prevEl && nextEl) {
                              swiper.params.navigation = {
                                ...(swiper.params.navigation || {}),
                                prevEl,
                                nextEl,
                              };
                              swiper.navigation.destroy();
                              swiper.navigation.init();
                              swiper.navigation.update();
                            }
                          });
                        }}
                        onSlideChange={(swiper) => {
                          setActiveIndexes((prev) => {
                            const next = [...prev];
                            next[index] = swiper.realIndex;
                            return next;
                          });
                        }}
                      >
                        {(listing.images || []).map((image, imgIndex) => {
                          const isLeadImage = index === 0 && imgIndex === 0;

                          return (
                            <SwiperSlide
                              key={`${listing.title}-image-${imgIndex}`}
                            >
                              <OptimizedImage
                                src={image}
                                alt={`${listing.subtitle} image ${imgIndex + 1}`}
                                className="block h-full w-full"
                                imgClassName="object-cover h-full w-full"
                                loading={isLeadImage ? "eager" : "lazy"}
                                decoding="async"
                                fetchPriority={isLeadImage ? "high" : "auto"}
                                sizes="(min-width:1024px) 303px, (min-width:640px) 40vw, 80vw"
                              />
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>

                      {/* Left/right arrows over image */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 sm:px-2">
                        <button
                          type="button"
                          ref={(el) => (innerPrevRefs.current[index] = el)}
                          className="pointer-events-auto h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="Previous image"
                        >
                          <img
                            src={arrowIcon}
                            alt=""
                            className="h-3 w-3 sm:h-4 sm:w-4 z-20"
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          ref={(el) => (innerNextRefs.current[index] = el)}
                          className="pointer-events-auto h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="Next image"
                        >
                          <img
                            src={arrowIcon}
                            alt=""
                            className="h-3 w-3 sm:h-4 sm:w-4 z-20 rotate-180"
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div className="pointer-events-none z-20 absolute inset-x-0 bottom-0 pb-2 sm:pb-3 px-2 sm:px-4">
                        <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-black/70 to-transparent -z-10" />

                        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                          <span className="text-xs sm:text-sm font-medium text-white flex-1">
                            {t("sections.signature_badge_realestate")}
                          </span>

                          <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1">
                            {listing.images.map((_, dotIndex) => (
                              <span
                                key={dotIndex}
                                className={
                                  "h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full " +
                                  (activeIndexes[index] === dotIndex
                                    ? "bg-white"
                                    : "bg-white/40")
                                }
                              />
                            ))}
                          </div>

                          <div className="flex-1 flex items-center justify-end">
                            <div className="flex items-center gap-0.5 sm:gap-1 rounded-full bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[11px] leading-none text-black">
                              <img
                                src={galleryIcon}
                                alt={t("sections.signature_badge_gallery_alt")}
                                className="h-3 w-3 sm:h-4 sm:w-4"
                              />
                              <span>{listing.images.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 overflow-hidden">
                      <p className="text-sm sm:text-base font-semibold truncate">{listing.title}</p>
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 overflow-hidden">
                        {listing.subtitle}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 overflow-hidden">
                        {listing.location}
                      </p>
                    </div>

                    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                      <Link
                        to={`/properties/${listing.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition"
                      >
                        {t("sections.latest_works_view_property")}
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="bg-[#161616] border border-white/10 rounded-2xl h-[360px] sm:h-[420px] w-full animate-pulse" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
};

export default SignatureShowcase;
