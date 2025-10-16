import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FeedbackModal from './FeedbackModal';

const UserMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/80 hover:bg-slate-600 text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        aria-label="User menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          {/* User Info Header */}
          {isAuthenticated && user && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-b border-orange-400/20">
              <div className="text-xs font-semibold truncate">{user.email}</div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-1">
            {/* Buy Me a Coffee */}
            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 group border-b border-gray-50"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors duration-200 mr-2.5">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">Buy Me a Coffee</span>
            </a>

            {/* Your Library */}
            {isAuthenticated && (
              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200 mr-2.5">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">{t('profile')}</span>
              </NavLink>
            )}

            {/* Feedback */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200 mr-2.5">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">Feedback</span>
              </button>
            ) : (
              <a
                href="#"
                className="flex items-center px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200 mr-2.5">
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">Feedback</span>
              </a>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Sign Out */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2.5 hover:bg-red-50 transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors duration-200 mr-2.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-red-600 group-hover:text-red-700">{t('logout')}</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center w-full px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200 mr-2.5">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">{t('login')}</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center w-full px-4 py-2.5 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors duration-200 mr-2.5">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800 group-hover:text-orange-600">{t('signup')}</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />
    </div>
  );
};

export default UserMenu;
