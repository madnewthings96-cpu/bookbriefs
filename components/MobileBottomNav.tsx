import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calculator, Newspaper, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';

export const getMobileBottomNavAppearance = (isReaderMode: boolean) =>
  isReaderMode
    ? ({ surface: 'reader', showSparkles: false } as const)
    : ({ surface: 'forest', showSparkles: true } as const);

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isReaderMode } = useReaderMode();
  const appearance = getMobileBottomNavAppearance(isReaderMode);

  const navItems: MobileNavItem[] = [
    { to: '/', label: t('home') || 'Home', icon: Home },
    { to: '/summaries', label: t('summaries') || 'Summaries', icon: BookOpen },
    { to: '/blog', label: t('blog') || 'Blog', icon: FileText },
    { to: '/calculators', label: t('calculators') || 'Calculators', icon: Calculator },
    { to: '/news', label: t('news') || 'News', icon: Newspaper },
  ];

  const baseBackground = appearance.surface === 'reader'
    ? 'bg-white/95 text-gray-800 shadow-xl shadow-gray-900/5'
    : 'mobile-bottom-nav--forest text-[#FBF8F1]';
  const inactiveStyles = appearance.surface === 'reader' ? 'text-gray-400' : 'text-[#FBF8F1]/80 hover:text-white';
  const activeStyles = appearance.surface === 'reader'
    ? 'bg-gray-900 text-white shadow-inner shadow-gray-900/30'
    : 'bg-[#FBF8F1] text-[#304529] shadow-[0_1px_2px_rgba(9,37,28,0.18),0_5px_14px_rgba(9,37,28,0.16)]';

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
      <div className="flex w-full max-w-2xl mx-auto items-end gap-3 pointer-events-auto">
        <nav className={`relative isolate flex min-h-14 flex-1 items-center justify-between overflow-hidden rounded-[28px] px-2 py-1 backdrop-blur-xl ${baseBackground}`} aria-label="Primary">
          {appearance.showSparkles && <span className="mobile-bottom-nav-sparkles" aria-hidden="true" />}
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative z-10 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[22px] px-2 py-2 text-[11px] font-semibold uppercase tracking-wide outline-none transition-[width,max-width,opacity,transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#F3D7A0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#304529] ${isActive ? `${activeStyles}` : `${inactiveStyles}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-80'}`} />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${isActive ? 'opacity-100 translate-x-0 max-w-[80px]' : 'opacity-0 -translate-x-1 max-w-0'
                      }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileBottomNav;
