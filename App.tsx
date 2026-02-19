import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/sections/Hero';
import Footer from './components/Footer';
import MostBookedSection from './components/sections/MostBookedSection';
import CleaningSection from './components/sections/CleaningSection';
import RepairSection from './components/sections/RepairSection';
import BeautySection from './components/sections/BeautySection';


function App() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
         <MostBookedSection/>
      <CleaningSection/>
      <RepairSection/>
      <BeautySection/>
      </main>
      <Footer />
    </div>
  );
}

export default App;