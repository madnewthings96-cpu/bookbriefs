import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calculator, Newspaper, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isReaderMode } = useReaderMode();

  const navItems: MobileNavItem[] = [
    { to: '/', label: t('home') || 'Home', icon: Home },
    { to: '/summaries', label: t('summaries') || 'Summaries', icon: BookOpen },
    { to: '/calculators', label: t('calculators') || 'Calculators', icon: Calculator },
    { to: '/news', label: t('news') || 'News', icon: Newspaper },
  ];

  const baseBackground = isReaderMode ? 'bg-white/95 text-gray-800 shadow-xl shadow-gray-900/5' : 'bg-gray-900/95 text-white shadow-[0_15px_35px_-15px_rgba(15,23,42,0.8)]';
  const inactiveStyles = isReaderMode ? 'text-gray-400' : 'text-gray-400';
  const activeStyles = isReaderMode ? 'bg-gray-900 text-white shadow-inner shadow-gray-900/30' : 'bg-white text-gray-900 shadow-inner shadow-gray-900/20';

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
      <div className="flex w-full max-w-2xl mx-auto items-end gap-3 pointer-events-auto">
        <nav className={`flex-1 flex items-center justify-between rounded-[28px] px-2 py-1 backdrop-blur-xl ${baseBackground}`} aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-2 py-2 rounded-2xl text-[11px] font-semibold uppercase tracking-wide transition-all duration-200 ${
                  isActive ? `${activeStyles}` : `${inactiveStyles}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-80'}`} />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                      isActive ? 'opacity-100 translate-x-0 max-w-[80px]' : 'opacity-0 -translate-x-1 max-w-0'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/chat"
          className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg shadow-purple-500/40 flex items-center justify-center transition-transform duration-200 hover:scale-105 ${
            isReaderMode ? '' : 'border border-white/10'
          }`}
          aria-label={t('aiChat') || 'AI Chat'}
        >
          <Sparkles className="w-5 h-5" />
        </NavLink>
      </div>
    </div>
  );
};

export default MobileBottomNav;
