import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import FeedbackModal from '../FeedbackModal';
import { DashboardMobileNav } from './DashboardMobileNav';
import './DashboardShell.css';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';

const SIDEBAR_KEY = 'ta7leel_dashboard_sidebar_collapsed';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === 'true',
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed(current => {
    const next = !current;
    localStorage.setItem(SIDEBAR_KEY, String(next));
    return next;
  });

  useEffect(() => {
    const resetPreference = () => setCollapsed(false);
    window.addEventListener('dashboard-preference-change', resetPreference);
    return () => window.removeEventListener('dashboard-preference-change', resetPreference);
  }, []);

  return (
    <div className="dashboard-shell" data-sidebar-collapsed={collapsed || undefined}>
      <a className="dashboard-skip-link" href="#dashboard-content">Skip to content</a>
      <DashboardSidebar collapsed={collapsed} onToggle={toggleCollapsed} onFeedback={() => setFeedbackOpen(true)} />
      <div className="dashboard-workspace">
        <DashboardTopbar onOpenMore={() => setMoreOpen(true)} />
        <main id="dashboard-content" className="dashboard-main" tabIndex={-1}><Outlet /></main>
      </div>
      <DashboardMobileNav open={moreOpen} onOpenChange={setMoreOpen} onFeedback={() => setFeedbackOpen(true)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
