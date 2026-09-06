import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FeedbackModal from './FeedbackModal';

const UserMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const menuItemClassName =
    'group mx-1.5 flex min-h-12 w-[calc(100%-0.75rem)] items-center rounded-[16px] px-3 py-2 text-left outline-none transition-[background-color,color,transform] duration-150 hover:bg-[#F0EADF] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]';
  const menuIconClassName =
    'mr-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#E5ECE6] text-[#2B654F] shadow-[inset_0_0_0_1px_rgba(18,61,47,0.05)] transition-[background-color,color,transform] duration-150 group-hover:-rotate-2 group-hover:bg-[#123D2F] group-hover:text-[#FBF8F1]';
  const menuIconSvgClassName = 'h-[18px] w-[18px] text-current';
  const menuTextClassName =
    'text-[13px] font-semibold text-[#334B40] transition-colors duration-150 group-hover:text-[#09251C]';

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        ref={menuButtonRef}
        type="button"
        id="user-menu-button"
        onClick={() => setIsMenuOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#F0EADF] text-[#123D2F] shadow-[0_0_0_1px_rgba(18,61,47,0.07)] outline-none transition-[background-color,box-shadow,transform] duration-150 hover:bg-[#E8DFD0] hover:shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_5px_12px_rgba(9,37,28,0.07)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        aria-controls="user-account-menu"
      >
        <span className="font-['Bricolage_Grotesque'] text-xs font-extrabold uppercase tracking-[-0.03em]">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'T'}
        </span>
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C49552] shadow-[0_0_0_2px_#F0EADF]" aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          id="user-account-menu"
          className="absolute right-0 z-[96] mt-2 w-72 overflow-hidden rounded-[24px] bg-[#FBF8F1]/95 p-1.5 shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_3px_8px_rgba(9,37,28,0.06),0_22px_52px_rgba(9,37,28,0.16)] backdrop-blur-2xl animate-fadeIn"
        >
          {/* User Info Header */}
          {isAuthenticated && user && (
            <div className="mb-1 rounded-[17px] bg-[#F0EADF] px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#715B38]">Signed in</div>
              <div className="mt-1 truncate text-[13px] font-semibold text-[#09251C]">{user.email}</div>
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
                  type="button"
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
            <div className="mx-3 my-2 border-t border-[#123D2F]/10"></div>

            {/* Sign Out */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="group mx-1.5 flex min-h-12 w-[calc(100%-0.75rem)] items-center rounded-[16px] px-3 py-2 text-left outline-none transition-[background-color,transform] duration-150 hover:bg-[#FBEDEA] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C95F4E]"
              >
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#FBEDEA] transition-colors duration-150 group-hover:bg-[#F6DCD6]">
                  <svg className="h-[18px] w-[18px] text-[#B44D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-[13px] font-semibold text-[#A94336]">{t('logout')}</span>
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
