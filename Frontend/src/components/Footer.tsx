
import React from 'react';
import { Activity, Heart, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Activity className="w-5 h-5 text-health-primary" />
            <h2 className="text-lg font-semibold text-health-primary">LifePulse</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-health-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-health-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-health-primary transition-colors">Contact Us</a>
            <a href="#" className="flex items-center gap-1 hover:text-health-primary transition-colors">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>© 2025 LifePulse. All rights reserved.</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> for a healthier life
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
