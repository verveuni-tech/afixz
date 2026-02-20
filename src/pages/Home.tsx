import React from 'react'
import Hero from '../components/sections/Hero'
import PlantSection from '../components/sections/PlantSection'
import BeautySection from '../components/sections/BeautySection'
import RepairSection from '../components/sections/RepairSection'
import CleaningSection from '../components/sections/CleaningSection'
import MostBookedSection from '../components/sections/MostBookedSection'

const Home = () => {
  return (
    <div>
         <Hero />
               <MostBookedSection/>
            <CleaningSection/>
            <RepairSection/>
            <BeautySection/>
            <PlantSection/>
      
    </div>
  )
}

export default Home
