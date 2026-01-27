import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslation } from "react-i18next";
import "./ClientTestimonials.css";

const MAX_RATING = 5;

const testimonials = [
  {
    id: 1,
    name: "Rafael",
    role: "Marina tenant • Dubai Marina",
    period: "Moved in Jan 2025",
    rating: 5,
    quote:
      "A2 found us a marina-facing apartment that fit our budget and handled the negotiation end-to-end. We moved in within three weeks.",
    photo: "/assets/images/teams/image3.png",
  },
  {
    id: 2,
    name: "John",
    role: "Investor • Palm Jumeirah off-plan",
    period: "Closed in Q2 2024",
    rating: 5,
    quote:
      "Excellent investor shortlist: clear numbers, realistic timelines, and developer comparisons. Closed an off-plan deal with confidence.",
    photo: "/assets/images/teams/image.png",
  },
  {
    id: 3,
    name: "Alex",
    role: "Buyer • Downtown Dubai ready unit",
    period: "Viewings booked within 48h",
    rating: 4,
    quote:
      "Transparent on fees and service charges, and they arranged back-to-back viewings in one afternoon. Felt informed the whole way.",
    photo: "/assets/images/teams/image2.png",
  },
  {
    id: 4,
    name: "Taylor",
    role: "Landlord • Business Bay",
    period: "Listed & leased in 3 weeks",
    rating: 5,
    quote:
      "They priced and leased our unit quickly with quality tenants. Great follow-through and market updates after handover.",
    photo: "/assets/images/teams/image3.png",
  },
  {
    id: 5,
    name: "Jordan",
    role: "Portfolio client",
    period: "Ready + off-plan advisory",
    rating: 5,
    quote:
      "Smart portfolio advice—helped us balance ready and off-plan assets with realistic yield and exit plans.",
    photo: "/assets/images/teams/image.png",
  },
];

const RatingStars = ({ value = MAX_RATING }) => {
  const rating = Math.max(0, Math.min(MAX_RATING, Math.round(value)));
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`${rating} out of ${MAX_RATING} stars`}>
      {Array.from({ length: MAX_RATING }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-white/25"}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 17.27l-5.18 3.05 1.4-5.9L3.5 9.24l6.04-.52L12 3.2l2.46 5.52 6.04.52-4.72 5.18 1.4 5.9z" />
        </svg>
      ))}
    </div>
  );
};

const ClientTestimonials = () => {
  const { t } = useTranslation();

  return (
    <section
      id="testimonials"
      className="w-full text-white pt-12 pb-16 sm:pt-16 sm:pb-24"
    >
      <div className="space-y-3 sm:space-y-4 max-w-3xl">
        <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-white/70">
          {t("nav.testimonials")}
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-[44px] font-semibold leading-tight tracking-tight">
          {t("sections.testimonials_title")}
        </h2>
        <p className="text-sm sm:text-base text-white/70">
          Feedback from buyers, landlords, and investors who trusted A2 to shortlist, negotiate, and close with clarity.
        </p>
      </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-70 mix-blend-screen"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)" }}
          aria-hidden="true"
        />

        {/* Force LTR for Swiper so layout and navigation match English even in RTL locales */}
        <div className="relative px-10 py-24" dir="ltr">
          <div className="testimonial-thumbs mb-8 sm:mb-10" />

          <Swiper
            modules={[Navigation, Pagination, Parallax]}
            navigation={{ prevEl: ".testimonial-prev", nextEl: ".testimonial-next" }}
            pagination={{
              el: ".testimonial-thumbs",
              clickable: true,
              renderBullet: (index, className) => {
                const item = testimonials[index % testimonials.length];
                return `<span class="${className} testimonial-thumb" aria-label="${item.name}">
                  <span class="testimonial-thumb__image" style="background-image:url('${item.photo}')"></span>
                </span>`;
              },
            }}
            parallax
            speed={700}
            slidesPerView={1}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id}>
                <div
                  className="flex flex-col items-center gap-5 text-center"
                  data-swiper-parallax="-200"
                  data-swiper-parallax-opacity="0"
                >
                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-[26px] font-semibold">{item.name}</h3>
                    <RatingStars value={item.rating} />
                    <p className="text-sm sm:text-base text-white/70">{item.role}</p>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">
                      {item.period}
                    </p>
                  </div>

                  <div className="w-full max-w-2xl space-y-4">
                    <div className="mx-auto h-px w-full max-w-sm bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <p className="text-lg sm:text-xl leading-relaxed text-white/85">
                      “{item.quote}”
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mt-10 flex items-center justify-center gap-3 sm:gap-4">
            <button
              className="testimonial-nav testimonial-prev"
              type="button"
              aria-label="Previous testimonial"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="testimonial-nav testimonial-next"
              type="button"
              aria-label="Next testimonial"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="testimonial-quote-icon"
            aria-hidden="true"
          >
            <path d="M15 11h-4a5 5 0 00-5 5v7a5 5 0 005 5h.4L8.2 34.8a1.5 1.5 0 001.6 2.2L16 35l3-7.2V16a5 5 0 00-5-5zm22 0h-4a5 5 0 00-5 5v7a5 5 0 005 5h.4l-3.2 6.8a1.5 1.5 0 001.6 2.2L38 35l3-7.2V16a5 5 0 00-5-5z" />
          </svg>
        </div>
    </section>
  );
};

export default ClientTestimonials;
