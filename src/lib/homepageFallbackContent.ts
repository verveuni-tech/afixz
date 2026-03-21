export type HomepageHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  ctaText: string;
  quickServices: string[];
  trustBadge: string;
};

export type HomepageSectionContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  categorySlug: string;
};

export type HomepageContent = {
  hero: HomepageHeroContent;
  topCategories: {
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    featuredCategorySlugs: string[];
  };
  recommended: {
    eyebrow: string;
    title: string;
    description: string;
    ctaText: string;
    featuredServiceIds: string[];
  };
  sections: {
    cleaning: HomepageSectionContent;
    repair: HomepageSectionContent;
    beauty: HomepageSectionContent;
    gardening: HomepageSectionContent;
  };
};

export const homepageFallbackContent: HomepageContent = {
  hero: {
    eyebrow: "Trusted local experts",
    title: "Book verified home services without the back-and-forth.",
    description:
      "From cleaning and repairs to grooming and gardening, choose reliable professionals and book in minutes.",
    searchPlaceholder: "What service do you need?",
    ctaText: "Search services",
    quickServices: [
      "Cleaning",
      "Repair",
      "Haircut",
      "Gardening",
      "Plumbing",
      "Electrical",
    ],
    trustBadge: "4.8 rated professionals",
  },
  topCategories: {
    eyebrow: "Top categories",
    title: "Start with the service category you need most.",
    description:
      "Browse the main categories available on AfixZ and jump straight to the services listed inside each one.",
    ctaText: "Explore all services",
    featuredCategorySlugs: ["cleaning", "gardening", "haircut", "repair-maintainance"],
  },
  recommended: {
    eyebrow: "Recommended services",
    title: "Popular services customers book first.",
    description:
      "A clean, location-aware shortlist of featured services, ready for quick discovery and booking.",
    ctaText: "Browse all services",
    featuredServiceIds: [],
  },
  sections: {
    cleaning: {
      eyebrow: "Home cleaning",
      title: "Cleaning Services",
      subtitle: "Reliable cleaning for homes and apartments.",
      description:
        "Choose from deep cleaning, sofa cleaning, kitchen cleaning, and other essentials for a spotless home.",
      ctaText: "View all cleaning services",
      categorySlug: "cleaning",
    },
    repair: {
      eyebrow: "Repairs",
      title: "Repair & Maintenance",
      subtitle: "Fast-response fixes by trusted professionals.",
      description:
        "Explore repair services for electrical, plumbing, appliance issues, and other common home problems.",
      ctaText: "View all repair services",
      categorySlug: "repair-maintainance",
    },
    beauty: {
      eyebrow: "Beauty at home",
      title: "Beauty & Personal Care",
      subtitle: "Salon-style experiences delivered at home.",
      description:
        "Find haircut, grooming, beauty, and self-care services that fit your routine and schedule.",
      ctaText: "View all beauty services",
      categorySlug: "haircut",
    },
    gardening: {
      eyebrow: "Green spaces",
      title: "Plant & Gardening Services",
      subtitle: "For balconies, lawns, and indoor green corners.",
      description:
        "Book gardening help for setup, maintenance, styling, and one-time care across home spaces.",
      ctaText: "View all gardening services",
      categorySlug: "gardening",
    },
  },
};
