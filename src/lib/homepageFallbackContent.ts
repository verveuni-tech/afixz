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
    gardening: HomepageSectionContent;
    mechanic: HomepageSectionContent;
    interior: HomepageSectionContent;
    fabrication: HomepageSectionContent;
  };
};

export const homepageFallbackContent: HomepageContent = {
  hero: {
    eyebrow: "Verified & trained experts",
    title: "Book a fix for everything between A to Z.",
    description:
      "We don't just fix it, we make sure it stays fixed. Verified experts, regular follow-ups, and guaranteed repairs for every home service you need.",
    searchPlaceholder: "",
    ctaText: "Explore services",
    quickServices: [
      "Gardening",
      "Mechanic",
      "Interior",
      "Fabrication",
    ],
    trustBadge: "Verified experts · Regular follow-ups · Guaranteed repairs",
  },
  topCategories: {
    eyebrow: "Service categories",
    title: "Choose a service category that's your priority right now.",
    description:
      "From garden care and vehicle servicing to home interiors and fabrication — pick what your home needs most and book verified professionals near you.",
    ctaText: "Explore all services",
    featuredCategorySlugs: [
      "garden-and-landscaping",
      "mechanic",
      "interior",
      "fabrication",
    ],
  },
  recommended: {
    eyebrow: "Popular services",
    title: "Most booked services by homeowners near you.",
    description:
      "Discover top-rated home services in your area — from doorstep bike repairs to garden maintenance and interior upgrades.",
    ctaText: "Browse all services",
    featuredServiceIds: [],
  },
  sections: {
    gardening: {
      eyebrow: "Garden & landscaping",
      title: "Doorstep Gardening & Landscaping Services",
      subtitle: "Premium plant care by Flying Mali experts.",
      description:
        "Premium plant care, kitchen garden setup, and seasonal garden maintenance at your doorstep. Avail gardening kits and materials alongside professional landscaping services from trained experts.",
      ctaText: "View gardening services",
      categorySlug: "garden--landscaping",
    },
    mechanic: {
      eyebrow: "Doorstep mechanic",
      title: "Bike & Cycle Service at Your Doorstep",
      subtitle: "Flying Mechanic — skip the garage, we come to you.",
      description:
        "Doorstep mechanic service for your vehicle's routine care without waiting outside a garage. Two-wheeler service, washing, puncture repair, and accessories installation or replacement at your home.",
      ctaText: "View mechanic services",
      categorySlug: "mechanic",
    },
    interior: {
      eyebrow: "Home interior",
      title: "End-to-End Home Interior Services",
      subtitle: "Consult-first approach for sustainable home fixes.",
      description:
        "From curtain and wallpaper installation to adding indoor greenery — AfixZ guides you through every possibility. Avail PVC panels, decorative fittings, and accessories installation at your fingertips.",
      ctaText: "View interior services",
      categorySlug: "interior",
    },
    fabrication: {
      eyebrow: "Custom fabrication",
      title: "Custom Fabrication & Welding Work",
      subtitle: "Built to fit your space and budget.",
      description:
        "Customised fabrication beyond basic standards — gates, frames, and structural fixes built as per your home requirements. All types of welding work by skilled professionals.",
      ctaText: "View fabrication services",
      categorySlug: "fabrication",
    },
    cleaning: {
      eyebrow: "Deep cleaning",
      title: "Professional Deep Cleaning Services",
      subtitle: "Reset and refresh your entire space.",
      description:
        "Home, office, washroom, and kitchen deep cleaning by trained professionals. A thorough reset for every corner of your space with AfixZ's verified cleaning experts.",
      ctaText: "View cleaning services",
      categorySlug: "cleaning",
    },
  },
};
