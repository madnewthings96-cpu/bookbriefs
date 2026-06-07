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

  const menuItemClassName = "flex w-full items-center px-4 py-3 text-left transition-[background-color,color] duration-200 hover:bg-[#F2F5EC] group";
  const menuIconClassName = "mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F5EC] transition-colors duration-200 group-hover:bg-[#E7EBDF]";
  const menuIconSvgClassName = "h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-gray-950";
  const menuTextClassName = "text-sm font-semibold text-gray-700 transition-colors duration-200 group-hover:text-gray-950";

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] transition-[transform,background-color,color,box-shadow] duration-200 hover:bg-white hover:text-gray-950"
        aria-label="User menu"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white/95 shadow-[0_1px_2px_rgba(17,24,39,0.08),0_22px_48px_rgba(71,85,62,0.18)] ring-1 ring-gray-950/5 backdrop-blur-xl animate-fadeIn">
          {/* User Info Header */}
          {isAuthenticated && user && (
            <div className="border-b border-[#E7EBDF] bg-[#F5F7F1] px-4 py-3">
              <div className="truncate text-sm font-semibold text-gray-950">{user.email}</div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">


            {/* Your Library */}
            {isAuthenticated && (
              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>{t('profile')}</span>
              </NavLink>
            )}

            {/* Reading Challenge */}
            {isAuthenticated && (
              <NavLink
                to="/reading-challenge"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Reading Challenge</span>
              </NavLink>
            )}

            {/* Downloads */}
            {isAuthenticated && (
              <NavLink
                to="/downloads"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Downloads</span>
              </NavLink>
            )}

            {/* Feedback */}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setIsFeedbackModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>Send Feedback</span>
                </button>
                <NavLink
                  to="/feedback"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>View All Feedback</span>
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Sign in to send feedback</span>
              </NavLink>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-[#E7EBDF]"></div>

            {/* Sign Out */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 text-left transition-[background-color,color] duration-200 hover:bg-red-50 group"
              >
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 transition-colors duration-200 group-hover:bg-red-100">
                  <svg className="h-5 w-5 text-red-500 transition-colors duration-200 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-red-600">{t('logout')}</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>{t('login')}</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 transition-colors duration-200 group-hover:bg-orange-100">
                    <svg className="h-5 w-5 text-orange-500 transition-colors duration-200 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>{t('signup')}</span>
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
