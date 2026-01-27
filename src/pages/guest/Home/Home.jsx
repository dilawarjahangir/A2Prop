import React from "react";
import Hero from "../../../components/Hero.jsx";
import WhyChooseUs from "../../../components/WhyChooseUs.jsx";
import AIFeaturesSection from "../../../components/AIFeaturesSection.jsx";
import LatestWorks from "../../../components/LatestWorks.jsx";
import InvestmentEmpowerSection from "../../../components/AnimatedInvestmentEmpowerSection.jsx";
import Partners from "../../../components/Partners.jsx";
import FAQSection from "../../../components/FAQSection.jsx";
import SocialMediaLinks from "../../../components/SocialMediaLinks.jsx";
import InvestorHighlights from "../../../components/InvestorHighlights.jsx";
import SignatureShowcase from "../../../components/SignatureShowcase.jsx";
import EmbeddedProjectsMap from "../../../components/EmbeddedProjectsMap.jsx";
import BlogSection from "../../../components/BlogSection.jsx";
import ClientTestimonials from "../../../components/ClientTestimonials.jsx";
import TrustedWorldwide from "../../../components/CountryWiseTrustedWorldwide.jsx";
const Home = () => {
  return (
    <div className="space-y-16">
      <Hero />
      <WhyChooseUs />
      <TrustedWorldwide />
      <AIFeaturesSection />
      <EmbeddedProjectsMap />
      <Partners />
      <InvestmentEmpowerSection />
      <SignatureShowcase />
      <ClientTestimonials/>
      <LatestWorks />
      <BlogSection />
      <FAQSection />
      <SocialMediaLinks />
      <InvestorHighlights />
    </div>
  );
};

export default Home;
