import React, { useState, useEffect, useRef } from "react";
import GradientButton from "./GradientButton.jsx";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { getLocale, setLocale } from "../hooks/useLocale";
import OptimizedImage from "./OptimizedImage.jsx";

const navItems = [
  { key: "home", href: "/" },
  { key: "offplan", href: "/properties" },
  { key: "ai_map", href: "/#ai-map" },
  { key: "about", href: "/about" },
];

const Header = () => {
  const { t } = useTranslation();
  const currentLocale = getLocale();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Sticky/floating header state
  const [isFloating, setIsFloating] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const menuRef = useRef(null);
  const bottomBarRef = useRef(null);
  const prevMobileRef = useRef(false);
  const contactRef = useRef(null);
  const headerRef = useRef(null);

  // Measure header height (for layout spacer)
  useEffect(() => {
    const measure = () => setHeaderHeight(headerRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Toggle floating header after scrolling past header height
  useEffect(() => {
    const onScroll = () => {
      const threshold = headerHeight || (headerRef.current?.offsetHeight ?? 0);
      setIsFloating(window.scrollY >= threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerHeight]);

  // Check if screen is below 820px
  useEffect(() => {
    const checkMobile = () => {
      const nowMobile = window.innerWidth < 820;
      const wasMobile = prevMobileRef.current;

      if (wasMobile && !nowMobile && isMenuOpen) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
      }

      prevMobileRef.current = nowMobile;
      setIsMobile(nowMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMenuOpen]);

  // Manage scroll lock and click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        isMobile &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        bottomBarRef.current &&
        !bottomBarRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isMobile]);

  const handleNavClick = () => setIsMenuOpen(false);

  const handleToggleLocale = async () => {
    const next = currentLocale === "en" ? "ar" : "en";
    await setLocale(next);
    setIsMenuOpen(false);
  };

  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "z-50 transition-all duration-300",
          isFloating
            ? "fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl"
            : "relative w-full",
          isFloating
            ? "bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <OptimizedImage
                src="/assets/icons/logo.svg"
                alt="A2 Properties logo"
                imgClassName="h-14 w-15"
                loading="lazy"
                decoding="async"
                sizes="80px"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm text-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className="relative transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-md"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Explore button wrapper hover */}
            <div className="transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0">
              <GradientButton href="/properties">
                {t("buttons.explore_properties")}
              </GradientButton>
            </div>

            {/* Contact dropdown */}
            <div
              ref={contactRef}
              className="relative"
              onMouseEnter={openContact}
              onMouseLeave={closeContact}
              onFocus={openContact}
              onBlur={(event) => {
                if (
                  contactRef.current &&
                  event.relatedTarget &&
                  contactRef.current.contains(event.relatedTarget)
                ) {
                  return;
                }
                closeContact();
              }}
            >
              <Link
                to="#contact"
                className={[
                  "group relative px-5 py-2.5 rounded-full text-sm font-semibold",
                  "text-white border border-white/35 bg-white/5",
                  "transition-all duration-300",
                  "hover:border-white/70 hover:bg-white/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
                ].join(" ")}
              >
                <span className="relative z-10">{t("nav.contact")}</span>

                {/* subtle sheen */}
                <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
                </span>
              </Link>

              {/* ✅ Dropdown panel (BLACK background) */}
              <div
                className={[
                  "absolute right-0 mt-3 w-[18rem] rounded-2xl",
                  "border border-white/15 bg-black", // black background
                  "backdrop-blur-xl p-3",
                  "shadow-[0_22px_80px_rgba(0,0,0,0.65)]",
                  "transition-all duration-300 ease-out origin-top-right",
                  isContactOpen
                    ? "opacity-100 translate-y-0 scale-100 rotate-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 scale-[0.98] -rotate-1 pointer-events-none",
                ].join(" ")}
              >
                {/* top glow (nice on black) */}
                <div
                  className={[
                    "pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl",
                    "bg-gradient-to-br from-emerald-400/25 via-cyan-400/15 to-transparent",
                    "transition-opacity duration-300",
                    isContactOpen ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />

                {/* animated divider */}
                <div className="px-1 pb-2">
                  <div
                    className={[
                      "h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent",
                      "transition-all duration-300",
                      isContactOpen ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/971588314825"
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      "group relative overflow-hidden",
                      "flex items-center justify-between rounded-xl",
                      "border border-emerald-400/40 bg-emerald-400/10",
                      "px-4 py-3 text-emerald-50 font-semibold",
                      "transition-all duration-300",
                      "hover:-translate-y-0.5 hover:border-emerald-300/70 hover:bg-emerald-400/15",
                      "hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
                      "active:translate-y-0",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60",
                    ].join(" ")}
                  >
                    {/* moving highlight sweep */}
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute -left-20 top-0 h-full w-40 skew-x-[-20deg] bg-white/15 blur-sm animate-[a2_sweep_1.2s_ease-in-out_infinite]" />
                    </span>

                    <span className="relative z-10 flex items-center gap-2">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-300/10 border border-emerald-300/20">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.01 0C5.39 0 .03 5.37 0 12c0 2.11.55 4.17 1.6 6.01L0 24l6.16-1.57A11.97 11.97 0 0 0 24 12c0-3.19-1.24-6.19-3.48-8.52ZM12 21.86c-1.9 0-3.76-.51-5.39-1.47l-.39-.23-3.66.93.98-3.56-.25-.37A9.88 9.88 0 0 1 2.1 12C2.1 6.53 6.55 2.1 12.01 2.1c2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.89 6.99c0 5.46-4.44 9.87-9.88 9.87Zm5.72-7.39c-.31-.16-1.84-.91-2.13-1.02-.29-.1-.5-.16-.71.16-.21.31-.82 1.02-1.01 1.23-.19.21-.37.23-.68.08-.31-.16-1.33-.49-2.53-1.56-.94-.84-1.58-1.87-1.76-2.18-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.63-.53-.54-.71-.55h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.04 1.29 3.25c.16.21 2.22 3.39 5.38 4.75.75.32 1.33.51 1.78.65.75.24 1.43.2 1.97.12.6-.09 1.84-.75 2.1-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.37Z" />
                        </svg>
                      </span>
                      <span>{t("buttons.contact_whatsapp")}</span>
                    </span>

                    <span className="relative z-10 text-sm font-bold transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:info@a2properties.ae"
                    className={[
                      "group relative overflow-hidden",
                      "flex items-center justify-between rounded-xl",
                      "border border-white/15 bg-white/5",
                      "px-4 py-3 text-white font-semibold",
                      "transition-all duration-300",
                      "hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10",
                      "hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]",
                      "active:translate-y-0",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    ].join(" ")}
                  >
                    {/* subtle pulse glow */}
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-[a2_pulse_1.6s_ease-in-out_infinite]" />
                    </span>

                    <span className="relative z-10 flex items-center gap-2">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/5 border border-white/10">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M4 8l8 5 8-5" />
                          <path d="M4 8v10h16V8" />
                        </svg>
                      </span>
                      <span>{t("buttons.contact_email")}</span>
                    </span>

                    <span className="relative z-10 text-sm font-bold transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>

                {/* Local keyframes */}
                <style>{`
                  @keyframes a2_sweep {
                    0% { transform: translateX(0) skewX(-20deg); opacity: 0; }
                    10% { opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translateX(280px) skewX(-20deg); opacity: 0; }
                  }
                  @keyframes a2_pulse {
                    0%, 100% { transform: scale(0.95); opacity: 0.35; }
                    50% { transform: scale(1.05); opacity: 0.6; }
                  }
                `}</style>
              </div>
            </div>

            {/* Locale button */}
            <button
              type="button"
              onClick={handleToggleLocale}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold",
                "text-white border border-white/35 bg-white/5",
                "transition-all duration-300",
                "hover:border-white/70 hover:bg-white/10 hover:-translate-y-0.5",
                "active:translate-y-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              ].join(" ")}
            >
              {currentLocale === "en" ? t("lang.ar") : t("lang.en")}
            </button>
          </div>
        </div>
      </header>

      {/* prevents layout jump when header becomes fixed */}
      {isFloating && <div style={{ height: headerHeight }} aria-hidden />}

      {/* Bottom Navigation Bar - Mobile Only */}
      {isMobile && (
        <div
          ref={bottomBarRef}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group px-6 py-4 bg-[rgba(24,24,24,0.85)] backdrop-blur-lg border border-white/20 rounded-full flex items-center gap-3 text-white transition-all hover:bg-[rgba(24,24,24,0.95)] shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              style={{
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-white transition-all ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-all ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-all ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
              <span className="text-sm font-medium">{t("nav.navigation")}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleLocale}
              className="px-4 py-3 rounded-full text-sm font-semibold text-white border border-white/35 bg-[rgba(24,24,24,0.85)] hover:bg-[rgba(24,24,24,0.95)] transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {currentLocale === "en" ? t("lang.ar") : t("lang.en")}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Menu Overlay - Mobile Only */}
      {isMobile && (
        <div
          ref={menuRef}
          className={`fixed inset-0 z-40 flex items-center justify-center px-4 transition-opacity duration-300 ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm bg-[rgba(24,24,24,0.9)] backdrop-blur-xl border border-white/20 rounded-3xl transition-all duration-300 ease-out ${
              isMenuOpen
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
            style={{
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex flex-col p-6">
              <nav className="space-y-2 mb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={handleNavClick}
                    className="group block px-4 py-3 text-white text-base font-medium rounded-xl transition-all hover:bg-white/10 active:bg-white/20 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="flex items-center justify-between">
                      <span>{t(`nav.${item.key}`)}</span>
                      <span className="text-sm font-bold opacity-70 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-6 py-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:bg-[rgba(255,255,255,0.15)] hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>{t("buttons.close")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
