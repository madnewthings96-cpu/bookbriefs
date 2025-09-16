import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-gray-300" style={{ backgroundColor: '#2F4F4F' }}>
      {/* Banner Image */}
      <div className="w-full">
        <img 
          src="/images/Website banner bookbriefs 5.png" 
          alt="BookBriefs Banner" 
          className="w-full h-auto object-cover"
        />
      </div>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="/images/logo-white.png" 
            alt="BookBriefs Logo" 
            className="h-12 w-auto mx-auto mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} BookBriefs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;