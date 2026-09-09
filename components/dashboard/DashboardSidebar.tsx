import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DASHBOARD_NAVIGATION, isDashboardNavItemActive, type DashboardNavItem } from './dashboardNavigation';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onFeedback: () => void;
}

const DashboardNavigationItem = ({ item, pathname, onFeedback }: {
  item: DashboardNavItem;
  pathname: string;
  onFeedback: () => void;
}) => {
  const { t } = useLanguage();
  const Icon = item.icon;
  const label = t(item.labelKey) || item.fallbackLabel;
  const className = `dashboard-nav-item${isDashboardNavItemActive(item, pathname) ? ' is-active' : ''}`;

  if (item.action === 'feedback') {
    return (
      <button type="button" className={className} onClick={onFeedback} aria-label={label} title={label}>
        <Icon aria-hidden="true" size={20} />
        <span className="dashboard-nav-label">{label}</span>
      </button>
    );
  }

  return (
    <NavLink to={item.href} className={className} aria-current={isDashboardNavItemActive(item, pathname) ? 'page' : undefined} title={label}>
      <Icon aria-hidden="true" size={20} />
      <span className="dashboard-nav-label">{label}</span>
    </NavLink>
  );
};

export function DashboardSidebar({ collapsed, onToggle, onFeedback }: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
      <div className="dashboard-sidebar-header">
        <NavLink className="dashboard-brand" to="/dashboard" aria-label="Ta7leel dashboard">
          <img src="/images/ta7leel-navbar-logo-mind-leaf.png" alt="Ta7leel" />
          <span className="dashboard-brand-wordmark">Ta7leel</span>
        </NavLink>
        <button type="button" className="dashboard-icon-button" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight aria-hidden="true" size={20} /> : <ChevronLeft aria-hidden="true" size={20} />}
        </button>
      </div>

      <nav className="dashboard-navigation">
        {DASHBOARD_NAVIGATION.map(group => {
          const groupLabel = group.id === 'tools' ? t('dashboardTools') || group.label : group.label;
          return (
          <section className="dashboard-nav-group" key={group.id} aria-label={groupLabel ?? undefined}>
            {groupLabel && <h2 className="dashboard-nav-group-label">{groupLabel}</h2>}
            {group.items.map(item => <DashboardNavigationItem key={item.id} item={item} pathname={pathname} onFeedback={onFeedback} />)}
          </section>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-footer">
        <div className="dashboard-user" title={user?.email ?? 'Signed-in member'}>
          <span className="dashboard-user-initial" aria-hidden="true">{user?.name?.slice(0, 1).toUpperCase() ?? 'T'}</span>
          <span className="dashboard-nav-label">
            <strong>{user?.name ?? 'Reader'}</strong>
            <small>{user?.email ?? 'Your reading desk'}</small>
          </span>
        </div>
        <button type="button" className="dashboard-nav-item dashboard-sign-out" onClick={logout} aria-label="Sign out" title="Sign out">
          <LogOut aria-hidden="true" size={20} />
          <span className="dashboard-nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
