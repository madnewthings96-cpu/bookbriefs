import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDashboardPageTitle } from './dashboardNavigation';

interface DashboardTopbarProps {
  onOpenMore: () => void;
}

export function DashboardTopbar({ onOpenMore }: DashboardTopbarProps) {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const title = getDashboardPageTitle(pathname);

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-topbar-kicker">{t('welcome') || 'Welcome'}</p>
        <h1>{title}</h1>
      </div>
      <button type="button" className="dashboard-topbar-more" onClick={onOpenMore} aria-label={t('dashboardMore') || 'More'}>
        <Menu aria-hidden="true" size={22} />
        <span>{t('dashboardMore') || 'More'}</span>
      </button>
    </header>
  );
}
