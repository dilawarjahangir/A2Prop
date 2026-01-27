import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const linkCols = [
    {
      title: "Company",
      links: [
        { label: "Term of Use", href: "/terms-of-use" },
        { label: "Contact Us", href: "/contact-us" },
        { label: "Affiliate program", href: "/affiliate-program" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "Blog", href: "/blog" },
        { label: "Brand kit", href: "/brand-kit" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Term & Conditions", href: "/terms-and-conditions" },
        { label: "Privacy policy", href: "/privacy-policy" },
      ],
    },
  ];

  const isoItems = [
    {
      code: "ISO 27001:2022",
      desc: "Information Security Management System - ISMS",
    },
    {
      code: "ISO 22301:2019",
      desc: "Business Continuity Management Systems - BCMS",
    },
    {
      code: "ISO 9001:2015",
      desc: "Quality Management System - QMS",
    },
  ];

  return (
    <footer className="w-full flex justify-center mt-5 bg-[#181818] border-t pb-0 md:pb-10 border-white/10">
      <div
        style={{ maxWidth: "1250px" }}
        className="w-full px-4 md:px-8 lg:px-16 py-10 space-y-12"
      >
        {/* 1. Links + ISO (your existing part) */}
        <div className="flex w-full flex-col justify-between gap-10 pb-10 border-b border-white/10">
          {/* Left: link columns */}
          <nav aria-label="Footer">
            <div className="flex justify-between flex-wrap gap-10">
              {linkCols.map((col) => (
                <div key={col.title}>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-white/60">
                    {col.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          className="text-sm text-white/80 transition hover:text-white"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Right: ISO badges/list */}

        </div>

        {/* 2. Social + rating strip (image 1) */}
        <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-b border-white/10">
          {/* Logo */}
          <div className="text-sm font-semibold tracking-wide text-white">
            <img src="/assets/icons/logo.svg" alt="" />
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-[36px]">
            {/* replace src with your icons */}
            <img
              src="/assets/icons/Footer/linkedin.svg"
              alt="LinkedIn"
              className="h-5 w-5"
            />
            <img
              src="/assets/icons/Footer/facebook.svg"
              alt="Facebook"
              className="h-5 w-5"
            />
            <img
              src="/assets/icons/Footer/youtube.svg"
              alt="YouTube"
              className="h-5 w-5"
            />
            <img
              src="/assets/icons/Footer/instagram.svg"
              alt="Instagram"
              className="h-5 w-5"
            />
            <img
              src="/assets/icons/Footer/discord.svg"
              alt="Discord"
              className="h-5 w-5"
            />
          </div>

          {/* Google rating + Trustpilot */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/assets/icons/Footer/material-icon-theme_google.svg"
                alt="Google"
                className="h-6 w-6"
              />
              <div className="flex flex-col text-xs">
                <span className="font-bold text-white/80">4/5</span>
                <div className="flex gap-0.5">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-white/40 text-sm">★</span>
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/20 md:block" />

            <a
              href="#"
              className="inline-flex items-center rounded-tl-[4px] rounded-bl-[4px]   bg-[#048117] pl-3  text-xs font-normal text-white shadow-sm"
            >
              Trustpilot
              <span className="ml-2 rounded-tr-[4px] rounded-br-[4px]    bg-white text-black px-2 py-2 text-[10px]">
                35.4k reviews
              </span>
            </a>
          </div>
        </div>

        {/* 3. Contact info + form (image 2) */}
        <div className="grid gap-10 md:grid-cols-2 py-6 border-b border-white/10">
          {/* Left: contact text */}
          <div className="space-y-8 text-sm text-white/80">
            <div className="space-y-2">
              <p className="text-base font-medium text-white">Realestate</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white/40">
                {t("sections.contact_office_heading")}
              </p>
              <p>{t("sections.contact_office_line1")}</p>
              <p>{t("sections.contact_office_line2")}</p>
              <p>{t("sections.contact_office_line3")}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white/40">
                {t("sections.contact_call_label")}
              </p>
              <p>{t("sections.contact_phone_display")}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white/40">
                {t("sections.contact_email_label")}
              </p>
              <a
                href={`mailto:${t("sections.contact_email_address")}`}
                className="inline-flex text-white/80 underline-offset-2 hover:underline"
              >
                {t("sections.contact_email_address")}
              </a>
            </div>
          </div>

          {/* Right: form */}
          <form className="space-y-6 max-w-md">
            <h3 className="text-xl font-semibold text-white">
              {t("sections.contact_heading")}
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-white/50">
                {t("sections.contact_form_name_label")}
              </label>
              <input
                type="text"
                placeholder={t("sections.contact_form_name_placeholder")}
                className="w-full border-b border-white/20 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/50">
                {t("sections.contact_form_email_label")}
              </label>
              <input
                type="email"
                placeholder={t("sections.contact_form_email_placeholder")}
                className="w-full border-b border-white/20 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/50">
                {t("sections.contact_form_phone_label")}
              </label>
              <input
                type="tel"
                placeholder={t("sections.contact_form_phone_placeholder")}
                className="w-full border-b border-white/20 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-white/90 to-white/70 px-10 text-sm font-medium text-black shadow"
            >
              {t("sections.contact_form_send")}
            </button>
          </form>
        </div>

        {/* 4. Disclaimer + payment methods (image 3) */}
        <div className="space-y-10 py-6">
          {/* Top text */}
          <div className="space-y-3 max-w-3xl">
            <p className="text-sm text-white/80">
              {t("sections.disclaimer_intro_1")}
            </p>
            <p className="text-sm text-white/60">
              {t("sections.disclaimer_intro_2")}
            </p>
          </div>

          {/* Two-column legal / risk text */}
          <div className="grid gap-10 md:grid-cols-2 text-[11px] leading-relaxed text-white/60">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {t("sections.disclaimer_heading")}
              </h4>

              <p className="font-semibold text-white/70">
                {t("sections.disclaimer_simulated_title")}
              </p>
              <p>
                {t("sections.disclaimer_simulated_body")}
              </p>

              <p className="font-semibold text-white/70">
                {t("sections.disclaimer_no_investment_title")}
              </p>
              <p>
                {t("sections.disclaimer_no_investment_body")}
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>{t("sections.disclaimer_no_investment_list1")}</li>
                <li>{t("sections.disclaimer_no_investment_list2")}</li>
                <li>{t("sections.disclaimer_no_investment_list3")}</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {t("sections.disclaimer_risk_heading")}
              </h4>
              <p>
                {t("sections.disclaimer_risk_body")}
              </p>

              <p className="font-semibold text-white/70">
                {t("sections.disclaimer_corporate_heading")}
              </p>
              <p>
                {t("sections.disclaimer_corporate_body")}
              </p>

              <p>
                {t("sections.disclaimer_restrictions")}
              </p>

              <p className="font-semibold text-white/70">
                {t("sections.disclaimer_related_heading")}
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>{t("sections.disclaimer_related_1")}</li>
                <li>{t("sections.disclaimer_related_2")}</li>
              </ul>
            </div>
          </div>

          {/* Payment methods
          ... */}
        </div>

        <div className="pt-6 text-center text-[11px] leading-relaxed text-white/60">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} A2 Properties. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
