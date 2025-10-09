import React, { useState } from 'react';

// Extend the Window interface to include Kit functions
declare global {
  interface Window {
    kit?: any;
  }
}

interface NewsletterProps {
  trigger?: 'button' | 'auto';
  buttonText?: string;
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({
  trigger = 'button',
  buttonText = 'Subscribe to Newsletter',
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showNewsletterPopup = () => {
    // Kit forms are embedded automatically, so we'll redirect to the form
    // or trigger the Kit form if available
    if (window.kit) {
      // If Kit provides a trigger method, use it
      console.log('Kit form available');
    } else {
      // Fallback: open the form in a new window or redirect
      console.warn('Kit script not loaded yet - form should be embedded automatically');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isChecked) return;

    setIsLoading(true);
    try {
      // Here you would typically send the email to your backend
      // For now, we'll just trigger the Kit popup
      showNewsletterPopup();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger on component mount if specified
  React.useEffect(() => {
    if (trigger === 'auto') {
      // Add a small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        showNewsletterPopup();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (trigger === 'auto') {
    return null; // Don't render anything for auto-trigger
  }

  return (
    <div className={`max-w-2xl mx-auto px-4 py-16 ${className}`}>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 md:p-12 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Markets move fast. We move first.
          </h2>
          <p className="text-gray-700 text-lg">
            Orange Juice Newsletter brings you expert driven insights - not headlines. Every day on your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!email || !isChecked || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 min-w-[120px]"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="promotions"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              required
            />
            <label htmlFor="promotions" className="text-sm text-gray-700 leading-relaxed">
              Yes, I also want to receive FXStreet promotions and offers.
            </label>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By subscribing you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              Terms and conditions
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
