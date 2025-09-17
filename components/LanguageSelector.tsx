import React, { useState } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-orange-400 transition-colors duration-300 px-3 py-2 rounded-md text-lg"
        aria-label={`Select language. Current: ${currentLang?.name}`}
      >
        <span className="transform hover:scale-110 transition-transform">{currentLang?.flag}</span>
        <svg 
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-lg hover:bg-gray-100 flex items-center justify-center ${
                currentLanguage === language.code ? 'bg-orange-50' : ''
              }`}
              aria-label={language.name}
            >
              <span className="transform hover:scale-110 transition-transform">
                {language.flag}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
