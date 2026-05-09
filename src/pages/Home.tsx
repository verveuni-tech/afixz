import React from "react";
import Hero from "../components/sections/Hero";
import RecommendedServicesSection from "../components/sections/RecommendedServices";
import TopCategoriesSection from "../components/sections/TopCategoriesSection";
import ServiceCategorySection from "../components/sections/ServiceCategorySection";
import useSeo from "../hooks/useSeo";
import { useHomepageContent } from "../hooks/useHomepageContent";

function useLocalBusinessSchema() {
  React.useEffect(() => {
    const scriptId = "afixz-local-business-schema";
    let tag = document.head.querySelector<HTMLScriptElement>(`script#${scriptId}`);
    if (!tag) {
      tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = scriptId;
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "AfixZ",
      description:
        "Book verified home service professionals — gardening, mechanic, home interior, fabrication, and deep cleaning with guaranteed repairs.",
      url: "https://afixz.com",
      areaServed: [
        { "@type": "City", name: "Delhi" },
        { "@type": "City", name: "Noida" },
        { "@type": "City", name: "Gurgaon" },
      ],
      serviceType: [
        "Gardening & Landscaping",
        "Bike & Cycle Mechanic",
        "Home Interior",
        "Custom Fabrication & Welding",
        "Deep Cleaning",
      ],
      priceRange: "$$",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Home Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Doorstep Gardening & Landscaping" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bike & Cycle Mechanic Service" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Interior & Installation" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Fabrication & Welding" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Professional Deep Cleaning" } },
        ],
      },
    });
    return () => { tag?.remove(); };
  }, []);
}

const Home = () => {
  const { content } = useHomepageContent();
  useLocalBusinessSchema();

  useSeo({
    title: "AfixZ — Book Home Services Online | Verified Professionals",
    description:
      "Book verified home service professionals with AfixZ. Doorstep gardening, mechanic, home interior, fabrication & deep cleaning with guaranteed repairs.",
    canonicalUrl: import.meta.env.VITE_SITE_URL || undefined,
    type: "website",
    keywords: [
      "home services",
      "doorstep gardening",
      "bike service at home",
      "home interior service",
      "deep cleaning",
      "fabrication work",
      "AfixZ",
      "trusted home repairs",
      "book home services online",
      "verified professionals",
    ],
  });

  return (
    <div>
      <Hero content={content.hero} />

      <TopCategoriesSection content={content.topCategories} />

      <RecommendedServicesSection content={content.recommended} />

      <ServiceCategorySection
        content={content.sections.gardening}
        sectionKey="gardening"
        layout="grid"
        backgroundClassName="bg-white"
      />

      <ServiceCategorySection
        content={content.sections.mechanic}
        sectionKey="mechanic"
        layout="list"
        backgroundClassName="bg-[#f9fafb]"
      />

      <ServiceCategorySection
        content={content.sections.interior}
        sectionKey="interior"
        layout="grid"
        backgroundClassName="bg-white"
      />

      <ServiceCategorySection
        content={content.sections.fabrication}
        sectionKey="fabrication"
        layout="list"
        backgroundClassName="bg-[#f9fafb]"
      />

      <ServiceCategorySection
        content={content.sections.cleaning}
        sectionKey="cleaning"
        layout="grid"
        backgroundClassName="bg-white"
      />
    </div>
  );
};

export default Home;
