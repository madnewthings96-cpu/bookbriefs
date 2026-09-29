import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import FeedbackModal from '../FeedbackModal';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardMobileNav } from './DashboardMobileNav';
import './DashboardShell.css';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { completeDashboardLogout } from './dashboardLogout';
import { readSidebarCollapsed, SIDEBAR_PREFERENCE_EVENT, writeSidebarCollapsed } from './sidebarPreference';

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);
  const [moreOpen, setMoreOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  const toggleCollapsed = () => setCollapsed(current => {
    const next = !current;
    writeSidebarCollapsed(next);
    return next;
  });

  const handleLogout = useCallback(async () => {
    setLogoutError(false);
    const didLogout = await completeDashboardLogout(logout, (path, options) => navigate(path, options));
    if (!didLogout) setLogoutError(true);
  }, [logout, navigate]);

  useEffect(() => {
    const resetPreference = () => setCollapsed(false);
    window.addEventListener(SIDEBAR_PREFERENCE_EVENT, resetPreference);
    return () => window.removeEventListener(SIDEBAR_PREFERENCE_EVENT, resetPreference);
  }, []);

  return (
    <div className="dashboard-shell" data-sidebar-collapsed={collapsed || undefined}>
      <a className="dashboard-skip-link" href="#dashboard-content">Skip to content</a>
      <DashboardSidebar collapsed={collapsed} onToggle={toggleCollapsed} onFeedback={() => setFeedbackOpen(true)} onLogout={handleLogout} />
      <div className="dashboard-workspace">
        <DashboardTopbar onOpenMore={() => setMoreOpen(true)} />
        {logoutError && <p className="dashboard-logout-error" role="alert">We could not sign you out. Please try again.</p>}
        <main id="dashboard-content" className="dashboard-main" tabIndex={-1}><Outlet /></main>
      </div>
      <DashboardMobileNav open={moreOpen} onOpenChange={setMoreOpen} onFeedback={() => setFeedbackOpen(true)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
