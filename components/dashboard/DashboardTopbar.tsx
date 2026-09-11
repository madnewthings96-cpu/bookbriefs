import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DashboardSearch from './DashboardSearch';

interface DashboardTopbarProps {
  onOpenMore: () => void;
}

export function DashboardTopbar({ onOpenMore }: DashboardTopbarProps) {
  const { t } = useLanguage();

  return (
    <header className="dashboard-topbar">
      <Link to="/dashboard" className="dashboard-topbar-brand" aria-label="Ta7leel dashboard">
        <img src="/images/ta7leel-navbar-logo-mind-leaf.png" alt="Ta7leel" />
      </Link>
      <div className="dashboard-topbar-actions">
        <DashboardSearch />
        <button type="button" className="dashboard-topbar-more" onClick={onOpenMore} aria-label={t('dashboardMore') || 'More'}>
          <Menu aria-hidden="true" size={22} />
          <span>{t('dashboardMore') || 'More'}</span>
        </button>
      </div>
    </header>
  );
}
