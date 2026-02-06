import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import arrowIcon from "/assets/icons/arrow2.svg";
import galleryIcon from "/assets/icons/gallery.svg";

const SignatureListingCard = React.memo(function SignatureListingCard({
  listing,
  index,
  isActiveOuter,
  shouldMountInner,
  onInnerIndexChange,
  activeInnerIndex,
  t,
  setPrevRef,
  setNextRef,
  getNavRefs,
}) {
  return (
    <div className="bg-[#161616] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-[280px] sm:max-w-xs mx-auto text-white shadow-[0_10px_50px_-25px_rgba(0,0,0,0.6)] flex flex-col h-full">
      <div
        className="relative mx-auto"
        style={{
          height: "clamp(200px, 40vw, 303px)",
          width: "clamp(200px, 40vw, 303px)",
          maxHeight: "303px",
          maxWidth: "303px",
        }}
      >
        {shouldMountInner ? (
          <Swiper
            dir="ltr"
            modules={[Navigation]}
            loop
            spaceBetween={8}
            slidesPerView={1}
            className="h-full w-full"
            onBeforeInit={(swiper) => {
              const { prevEl, nextEl } = getNavRefs(index);
              swiper.params.navigation = {
                ...(swiper.params.navigation || {}),
                prevEl,
                nextEl,
              };
            }}
            onSwiper={(swiper) => {
              const { prevEl, nextEl } = getNavRefs(index);

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
            }}
            onSlideChange={(swiper) => {
              if (isActiveOuter) onInnerIndexChange(swiper.realIndex);
            }}
          >
            {listing.images.map((image, imgIndex) => {
              const isLeadImage = index === 0 && imgIndex === 0;
              return (
                <SwiperSlide key={`${listing.slug}-image-${imgIndex}`}>
                  <img
                    src={image}
                    alt={`${listing.subtitle} image ${imgIndex + 1}`}
                    className="object-cover h-full w-full"
                    loading={isLeadImage ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={isLeadImage ? "high" : "auto"}
                    sizes="(min-width:1024px) 303px, (min-width:640px) 40vw, 80vw"
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="h-full w-full bg-black/20" aria-hidden="true" />
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 sm:px-2">
          <button
            type="button"
            ref={setPrevRef}
            className="pointer-events-auto h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            aria-label="Previous image"
          >
            <img src={arrowIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4 z-20" aria-hidden="true" />
          </button>

          <button
            type="button"
            ref={setNextRef}
            className="pointer-events-auto h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            aria-label="Next image"
          >
            <img src={arrowIcon} alt="" className="h-3 w-3 sm:h-4 sm:w-4 z-20 rotate-180" aria-hidden="true" />
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
                    (isActiveOuter && activeInnerIndex === dotIndex ? "bg-white" : "bg-white/40")
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
        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 overflow-hidden">{listing.subtitle}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 overflow-hidden">{listing.location}</p>
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
  );
});

export default SignatureListingCard;

