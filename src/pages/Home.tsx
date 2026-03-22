import React from "react";
import Hero from "../components/sections/Hero";
import RecommendedServicesSection from "../components/sections/RecommendedServices";
import TopCategoriesSection from "../components/sections/TopCategoriesSection";
import ServiceCategorySection from "../components/sections/ServiceCategorySection";
import useSeo from "../hooks/useSeo";
import { useHomepageContent } from "../hooks/useHomepageContent";

const Home = () => {
  const { content } = useHomepageContent();

  useSeo({
    title: "AfixZ | Trusted Local Services",
    description:
      "Book trusted local home services with AfixZ, from cleaning and repairs to beauty and plant care.",
    canonicalUrl: import.meta.env.VITE_SITE_URL || undefined,
    type: "website",
    keywords: ["home services", "cleaning", "repairs", "beauty at home", "afixz"],
  });

  return (
    <div>
      <Hero content={content.hero} />

      <TopCategoriesSection content={content.topCategories} />

      <RecommendedServicesSection content={content.recommended} />

      <ServiceCategorySection
        content={content.sections.cleaning}
        sectionKey="cleaning"
        layout="grid"
        backgroundClassName="bg-white"
      />

      <ServiceCategorySection
        content={content.sections.repair}
        sectionKey="repair"
        layout="list"
        backgroundClassName="bg-[#f9fafb]"
      />

      <ServiceCategorySection
        content={content.sections.beauty}
        sectionKey="beauty"
        layout="grid"
        backgroundClassName="bg-white"
      />

      <ServiceCategorySection
        content={content.sections.gardening}
        sectionKey="gardening"
        layout="list"
        backgroundClassName="bg-[#f9fafb]"
      />
    </div>
  );
};

export default Home;
