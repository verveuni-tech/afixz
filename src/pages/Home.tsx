import React from 'react'
import Hero from '../components/sections/Hero'
import PlantSection from '../components/sections/PlantSection'
import BeautySection from '../components/sections/BeautySection'
import RepairSection from '../components/sections/RepairSection'
import CleaningSection from '../components/sections/CleaningSection'
import RecommendedServicesSection from '../components/sections/RecommendedServices'
import useSeo from '../hooks/useSeo'

const Home = () => {
  useSeo({
    title: "AfixZ | Trusted Local Services",
    description:
      "Book trusted local home services with AfixZ, from cleaning and repairs to beauty and plant care.",
    canonicalUrl:
      import.meta.env.VITE_SITE_URL || undefined,
    type: "website",
    keywords: ["home services", "cleaning", "repairs", "beauty at home", "afixz"],
  });

  return (
    <div>
         <Hero />
              <RecommendedServicesSection/>
            <CleaningSection/>
            <RepairSection/>
            <BeautySection/>
            <PlantSection/>
      
    </div>
  )
}

export default Home
