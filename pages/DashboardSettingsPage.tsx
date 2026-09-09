import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPages.css';

const SIDEBAR_PREFERENCE_KEY = 'ta7leel_dashboard_sidebar_collapsed';

export default function DashboardSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [preferenceReset, setPreferenceReset] = useState(false);

  const resetSidebarPreference = () => {
    localStorage.removeItem(SIDEBAR_PREFERENCE_KEY);
    window.dispatchEvent(new Event('dashboard-preference-change'));
    setPreferenceReset(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section className="dashboard-page dashboard-workspace-page dashboard-settings-page">
      <header className="dashboard-workspace-intro">
        <p className="dashboard-page-eyebrow">Account</p>
        <h1>Settings</h1>
        <p>Manage your account details and dashboard preferences.</p>
      </header>

      <section className="dashboard-settings-card" aria-labelledby="account-details-heading">
        <h2 id="account-details-heading">Account details</h2>
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user?.name?.trim() || 'Reader'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || 'No email address available'}</dd>
          </div>
        </dl>
      </section>

      <section className="dashboard-settings-card" aria-labelledby="workspace-preference-heading">
        <h2 id="workspace-preference-heading">Dashboard layout</h2>
        <p>Restore the sidebar to its default expanded state.</p>
        <button className="dashboard-empty-action" type="button" onClick={resetSidebarPreference}>Reset sidebar preference</button>
        {preferenceReset && <p className="dashboard-settings-confirmation" role="status">Sidebar preference reset.</p>}
      </section>

      <section className="dashboard-settings-card" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy</h2>
        <p><Link className="dashboard-text-action" to="/privacy-policy">Read our privacy policy</Link></p>
      </section>

      <section className="dashboard-settings-card dashboard-settings-card--logout" aria-labelledby="logout-heading">
        <h2 id="logout-heading">Sign out</h2>
        <p>Sign out of this device when you have finished reading.</p>
        <button className="dashboard-danger-action" type="button" onClick={handleLogout}>Logout</button>
      </section>
    </section>
  );
}
