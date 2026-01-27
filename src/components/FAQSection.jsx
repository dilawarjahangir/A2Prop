import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const faqs = [
  "faq_1",
  "faq_2",
  "faq_3",
  "faq_4",
  "faq_5",
  "faq_6",
];

const FAQItem = ({ item, isOpen, onToggle, t }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full text-left bg-[#191919] border border-white/10 rounded-xl px-4 py-5 flex items-start gap-3 hover:border-white/20 transition-colors"
  >
    {/* Animated + / - icon */}
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-lg leading-none
                  transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
    >
      +
    </span>

    <div className="flex-1">
      <p className="text-white">{item.q}</p>
      <p className="text-white">{t(`sections.faq_items.${item}.q`)}</p>

      {/* Animated answer area */}
      <div
        className={`mt-1 grid overflow-hidden transition-all duration-300 ease-out
        ${isOpen ? "grid-rows-[1fr] opacity-100 translate-y-0" : "grid-rows-[0fr] opacity-0 -translate-y-1"}`}
      >
       <p className="text-sm text-gray-300 overflow-hidden">
          {t(`sections.faq_items.${item}.a`)}
        </p>
      </div>
    </div>
  </button>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-semibold text-white">
          {t("sections.faq_title")}
        </h2>
        <p className="text-gray-300">
          {t("sections.faq_subtitle")}
        </p>
      </div>

    <div className="space-y-3 max-w-5xl mx-auto w-full">
      {faqs.map((item, idx) => (
        <FAQItem
          key={item}
          item={item}
          isOpen={openIndex === idx}
          t={t}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        />
      ))}
    </div>
    </section>
  );
};

export default FAQSection;
