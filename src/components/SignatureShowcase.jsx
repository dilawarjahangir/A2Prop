import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SignatureSectionHeader from "./signature/SignatureSectionHeader.jsx";
import SignatureListingsCarousel from "./signature/SignatureListingsCarousel.jsx";
import { getLocale } from "../hooks/useLocale.js";
import { getPropertiesForLocale, properties } from "../data/properties.js";

const SignatureShowcase = () => {
  const { t } = useTranslation();
  const locale = getLocale();

  const listings = useMemo(() => {
    const list = getPropertiesForLocale(locale) || properties;
    return list.map((property) => ({
      title: property.priceUSD,
      subtitle: property.title,
      location: property.location,
      images: property.gallery || [],
      slug: property.slug,
    }));
  }, [locale]);

  return (
    <section className="space-y-6 px-4 sm:px-0">
      <SignatureSectionHeader t={t} />
      <SignatureListingsCarousel listings={listings} t={t} />
    </section>
  );
};

export default SignatureShowcase;
