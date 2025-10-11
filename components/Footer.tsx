import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-gray-300" style={{ backgroundColor: '#2F4F4F' }}>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Support Button */}
        <div className="text-center mb-8">
          <a 
            href="https://ko-fi.com/ta7leel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#fa9128' }}
          >
            <span className="mr-2">☕</span>
            Buy me a coffee
          </a>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
          {/* Footer Links */}
          <div className="flex justify-center space-x-6 mb-4">
            <a 
              href="/#/about" 
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              About
            </a>
            <span className="text-gray-600">|</span>
            <a 
              href="/#/privacy-policy" 
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              سياسة الخصوصية
            </a>
            <span className="text-gray-600">|</span>
            <a 
              href="/#/terms-of-use" 
              className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
            >
              شروط الاستخدام
            </a>
          </div>
          
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} BookBriefs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;