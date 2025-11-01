import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-gray-300" style={{ backgroundColor: '#2F4F4F' }}>
      <div className="container mx-auto py-8 px-2 sm:px-3 lg:px-4">
        <div className="border-t border-gray-700 pt-6">
          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://x.com/Ta7leel007" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-all duration-300 hover:scale-110"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@Ta7leeel" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-red-600 transition-all duration-300 hover:scale-110"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://ko-fi.com/ta7leel" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-[#fa9128] transition-all duration-300 hover:scale-110"
              aria-label="Ko-Fi"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
              </svg>
            </a>
          </div>

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