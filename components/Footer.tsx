import React, { useState } from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    } else {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <footer className="bg-slate-800 text-gray-300" style={{ backgroundColor: '#2F4F4F' }}>
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

        <div className="md:flex md:justify-end md:items-center">
          <div className="text-right mb-6 md:mb-0">
            <h2 className="text-lg font-semibold text-white">Join Our Newsletter</h2>
            <p className="text-sm text-gray-400 mt-1">Get the latest market news and books delivered to your inbox.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email for newsletter"
              required
              className="w-full sm:w-auto flex-grow appearance-none px-4 py-2 text-gray-800 bg-white border border-transparent rounded-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="mt-2 sm:mt-0 px-6 py-2 text-white font-semibold rounded-md sm:rounded-l-none transition-colors duration-300"
              style={{ backgroundColor: '#FF7F50' }}
            >
              Subscribe
            </button>
          </form>
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