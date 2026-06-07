import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calculator, Newspaper, Sparkles, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';

// Iridescent bubble animation component
const IridescentBubble: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    {/* Animated iridescent bubble */}
    <div className="absolute inset-[-20%] animate-bubble-morph">
      <div
        className="absolute inset-0 animate-bubble-rotate"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 40%, rgba(255, 100, 50, 0.9) 0%, transparent 50%),
            radial-gradient(ellipse 70% 80% at 70% 60%, rgba(50, 150, 255, 0.9) 0%, transparent 50%),
            radial-gradient(ellipse 60% 70% at 50% 30%, rgba(255, 200, 100, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 40% 70%, rgba(150, 50, 255, 0.7) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 60% 50%, rgba(50, 200, 150, 0.6) 0%, transparent 50%)
          `,
          filter: 'blur(8px) contrast(1.2) saturate(1.5)',
        }}
      />
    </div>
    {/* Glass overlay for depth */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: 'radial-gradient(ellipse 100% 100% at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)',
      }}
    />
    {/* Inner glow ring */}
    <div
      className="absolute inset-[2px] rounded-xl border border-white/20"
      style={{
        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)',
      }}
    />
  </div>
);

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
    { to: '/blog', label: t('blog') || 'Blog', icon: FileText },
    { to: '/calculators', label: t('calculators') || 'Calculators', icon: Calculator },
    { to: '/news', label: t('news') || 'News', icon: Newspaper },
  ];

  const baseBackground = isReaderMode ? 'bg-white/95 text-gray-800 shadow-xl shadow-gray-900/5' : 'bg-[#E7EBDF] text-gray-950 shadow-[0_15px_35px_-15px_rgba(71,85,62,0.45)]';
  const inactiveStyles = isReaderMode ? 'text-gray-400' : 'text-gray-600';
  const activeStyles = isReaderMode ? 'bg-gray-900 text-white shadow-inner shadow-gray-900/30' : 'bg-white text-gray-950 shadow-inner shadow-gray-900/15';

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
      <div className="flex w-full max-w-2xl mx-auto items-end gap-3 pointer-events-auto">
        <nav className={`flex-1 flex items-center justify-between rounded-[28px] px-2 py-1 backdrop-blur-xl ${baseBackground}`} aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-2 py-2 rounded-2xl text-[11px] font-semibold uppercase tracking-wide transition-[width,max-width,opacity,transform,background-color,color,box-shadow] duration-200 ${isActive ? `${activeStyles}` : `${inactiveStyles}`
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
