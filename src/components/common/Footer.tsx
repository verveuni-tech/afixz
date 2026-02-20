import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-2xl font-bold text-white">AfixZ</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              Simplifying home maintenance for modern living. We connect you with the best local professionals for a seamless service experience.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Plumbing</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Electrician</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cleaning</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Appliance Repair</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Salon at Home</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AfixZ. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 md:mt-0">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> for reliable service.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;