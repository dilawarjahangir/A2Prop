import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAiMapLock } from "../hooks/useAiMapLock.jsx";

const LockIcon = ({ unlocked = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" ry="2" />
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {unlocked && <path d="M15 10c.2-2.2-.6-4-3-4" strokeLinecap="round" />}
      <circle cx="12" cy="15" r="1.35" />
    </svg>
  );
};

const ChainIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-white/80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      d="M9.5 14.5 6.4 17.6a3.5 3.5 0 0 1-5-5l3.2-3.2a3.5 3.5 0 0 1 5 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 9.5 17.6 6.4a3.5 3.5 0 0 1 5 5l-3.2 3.2a3.5 3.5 0 0 1-5 0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.5 15.5 15.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmbeddedProjectsMap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isUnlocked, openUnlockModal } = useAiMapLock();

  const handleActivate = () => {
    if (isUnlocked) {
      navigate("/ai-map");
      return;
    }
    openUnlockModal(() => navigate("/ai-map"));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <section id="ai-map" className="space-y-4">
      <p className="text-sm md:text-base text-gray-300 max-w-3xl">
        {t("sections.map_intro")}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        className="group relative min-w-0 overflow-hidden max-w-[1250px] rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-[0_24px_80px_rgba(0,0,0,0.55)] cursor-pointer"
      >
        <img
          src="/assets/images/map/image.png"
          alt={t("sections.map_iframe_title")}
          className="block max-w-[1250px] w-full h-[520px] md:h-[640px] object-cover"
        />

        <div
          className={[
            "absolute inset-0 flex flex-col items-center justify-center text-center px-6",
            isUnlocked
              ? "bg-black/35 backdrop-blur-[2px]"
              : "bg-black/65 backdrop-blur-md",
            "transition-all duration-300",
          ].join(" ")}
        >
          {!isUnlocked && (
            <div className="mb-4 flex items-center justify-center gap-3 text-white/80">
              <ChainIcon />
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em]">
                <LockIcon />
                <span>Locked</span>
              </div>
            </div>
          )}

          {isUnlocked && (
            <div className="mb-3 flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-50">
              <LockIcon unlocked />
              <span>Unlocked</span>
            </div>
          )}

          <h3 className="text-2xl sm:text-3xl font-semibold text-white">
            {isUnlocked ? "Open the live AI Map" : "Unlock the AI Map"}
          </h3>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-white/75">
            {isUnlocked
              ? "Jump straight into the live Dubai projects map."
              : "Access live Dubai projects, pricing, and availability with one tap."}
          </p>

          <button
            type="button"
            className={[
              "mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold",
              "transition-all duration-200",
              isUnlocked
                ? "bg-white text-[#111] hover:-translate-y-0.5"
                : "bg-white text-[#111] hover:-translate-y-0.5",
            ].join(" ")}
          >
            {isUnlocked ? "Go to AI Map" : "Unlock AI Map"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M5 12h14M13 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default EmbeddedProjectsMap;
