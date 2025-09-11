import React from 'react';

// Extend the Window interface to include the ml function
declare global {
  interface Window {
    ml?: (action: string, ...args: any[]) => void;
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
  const showNewsletterPopup = () => {
    if (window.ml) {
      // Trigger the MailerLite popup
      window.ml('show', 'form', 'popup');
    } else {
      console.warn('MailerLite script not loaded yet');
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
    <button
      onClick={showNewsletterPopup}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${className}`}
    >
      {buttonText}
    </button>
  );
};

export default Newsletter;
