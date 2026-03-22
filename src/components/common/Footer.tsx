import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logoImg from "../../assets/AfixZ logo_20260322_144559_0000.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <img
                src={logoImg}
                alt="AfixZ"
                className="h-12 w-auto brightness-0 invert"
              />
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
              <li><a href="#" className="hover:text-accent-light transition-colors">Plumbing</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Electrician</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Cleaning</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Appliance Repair</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Salon at Home</a></li>
              <li><Link to="/blogs" className="hover:text-accent-light transition-colors">Blogs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-accent-light transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-light transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AfixZ. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
