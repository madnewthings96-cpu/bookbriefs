import { useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useModalDialog } from '../../hooks/useModalDialog';
import { DASHBOARD_NAVIGATION, isDashboardNavItemActive, type DashboardNavGroup, type DashboardNavItem } from './dashboardNavigation';
import { subscribeToDesktopBreakpointFromWindow } from './dashboardMobileNavModel';

interface DashboardMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedback: () => void;
}

const primaryItems = DASHBOARD_NAVIGATION[0].items.slice(0, 4);
const [readingGroup, toolsGroup, utilityGroup] = DASHBOARD_NAVIGATION;
const moreGroups: DashboardNavGroup[] = [
  { ...readingGroup, label: null, items: readingGroup.items.filter(item => item.id === 'challenge') },
  toolsGroup,
  utilityGroup,
];

function MobileNavigationItem({ item, pathname, onNavigate, onFeedback }: {
  item: DashboardNavItem;
  pathname: string;
  onNavigate: () => void;
  onFeedback: () => void;
}) {
  const { t } = useLanguage();
  const Icon = item.icon;
  const label = t(item.labelKey) || item.fallbackLabel;
  const active = isDashboardNavItemActive(item, pathname);
  const className = `dashboard-mobile-nav-item${active ? ' is-active' : ''}`;

  if (item.action === 'feedback') {
    return <button type="button" className={className} onClick={() => { onNavigate(); onFeedback(); }}><Icon aria-hidden="true" size={20} /><span>{label}</span></button>;
  }

  return <NavLink to={item.href} className={className} aria-current={active ? 'page' : undefined} onClick={onNavigate}><Icon aria-hidden="true" size={20} /><span>{label}</span></NavLink>;
}

export function DashboardMobileNav({ open, onOpenChange, onFeedback }: DashboardMobileNavProps) {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const closeDrawer = () => onOpenChange(false);
  const drawerRef = useModalDialog({ open, onClose: closeDrawer });

  useEffect(() => {
    if (!open || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const unsubscribe = subscribeToDesktopBreakpointFromWindow(window.matchMedia.bind(window), (isDesktop) => {
      if (isDesktop) onOpenChange(false);
    });
    return () => unsubscribe();
  }, [onOpenChange, open]);

  return (
    <>
      <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation">
        {primaryItems.map(item => <MobileNavigationItem key={item.id} item={item} pathname={pathname} onNavigate={() => undefined} onFeedback={onFeedback} />)}
        <button
          type="button"
          className="dashboard-mobile-nav-item"
          onClick={() => onOpenChange(true)}
          aria-expanded={open}
          aria-haspopup={open ? 'dialog' : undefined}
          aria-controls={open ? 'dashboard-more-drawer' : undefined}
        >
          <Menu aria-hidden="true" size={20} />
          <span>{t('dashboardMore') || 'More'}</span>
        </button>
      </nav>

      {open && (
        <div className="dashboard-more-drawer-layer">
          <button type="button" className="dashboard-more-drawer-backdrop" aria-label="Close more navigation" onClick={closeDrawer} />
          <div ref={drawerRef} id="dashboard-more-drawer" className="dashboard-more-drawer" role="dialog" aria-modal="true" aria-labelledby="dashboard-more-title" tabIndex={-1}>
            <div className="dashboard-more-drawer-header">
              <h2 id="dashboard-more-title">{t('dashboardMore') || 'More'}</h2>
              <button type="button" className="dashboard-icon-button" onClick={closeDrawer} aria-label="Close more navigation"><X aria-hidden="true" size={20} /></button>
            </div>
            <nav className="dashboard-more-drawer-navigation" aria-label="More dashboard navigation">
              {moreGroups.map(group => {
                const groupLabel = group.id === 'tools' ? t('dashboardTools') || group.label : group.label;
                return (
                  <section className="dashboard-more-drawer-group" key={group.id} aria-label={groupLabel ?? undefined}>
                    {groupLabel && <h3 className="dashboard-more-drawer-group-label">{groupLabel}</h3>}
                    <div className="dashboard-more-drawer-group-items">
                      {group.items.map(item => (
                        <MobileNavigationItem key={item.id} item={item} pathname={pathname} onNavigate={closeDrawer} onFeedback={onFeedback} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
