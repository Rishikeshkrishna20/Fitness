
import React from 'react';
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Link } from "react-router-dom";
import { Activity, Heart, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Activity className="w-5 h-5 text-health-primary" />
            <h2 className="text-lg font-semibold text-health-primary">FitTrack</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
            <Link to="/privacy-policy" className="hover:text-health-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-health-primary transition-colors">Terms of Service</Link>
            <Link to="/contact-us " className="hover:text-health-primary transition-colors">Contact Us</Link>
            <a to="#" className="flex items-center gap-1 hover:text-health-primary transition-colors">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>© 2025 FitTrack. All rights reserved.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for a healthier life
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
