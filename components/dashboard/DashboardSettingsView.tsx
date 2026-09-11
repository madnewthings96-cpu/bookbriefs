import type { FormEvent } from 'react';
import {
  ArrowUpRight,
  FileText,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SettingsSignInMethod } from './dashboardSettingsModel';

export type SettingsActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface DashboardSettingsViewProps {
  email: string;
  nameDraft: string;
  signInMethod: SettingsSignInMethod;
  profileStatus: SettingsActionStatus;
  resetStatus: SettingsActionStatus;
  logoutError: boolean;
  profileError?: string;
  resetError?: string;
  onNameChange: (name: string) => void;
  onSaveProfile: (event: FormEvent<HTMLFormElement>) => void;
  onSendPasswordReset: () => void;
  onLogout: () => void;
}

const SettingsHeading = ({ icon: Icon, eyebrow, id, title, description }: {
  icon: typeof UserRound;
  eyebrow: string;
  id: string;
  title: string;
  description: string;
}) => (
  <div className="dashboard-settings-heading">
    <span className="dashboard-settings-heading-icon" aria-hidden="true"><Icon size={19} /></span>
    <div>
      <p className="dashboard-settings-kicker">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

export function DashboardSettingsView({
  email,
  nameDraft,
  signInMethod,
  profileStatus,
  resetStatus,
  logoutError,
  profileError,
  resetError,
  onNameChange,
  onSaveProfile,
  onSendPasswordReset,
  onLogout,
}: DashboardSettingsViewProps) {
  const profileBusy = profileStatus === 'pending';
  const profileHasError = profileStatus === 'error';
  const resetBusy = resetStatus === 'pending';

  return (
    <section className="dashboard-page dashboard-workspace-page dashboard-settings-page">
      <header className="dashboard-workspace-intro">
        <p className="dashboard-page-eyebrow">Your account</p>
        <h1>Settings</h1>
        <p>Keep your reader profile and sign-in details up to date.</p>
      </header>

      <div className="dashboard-settings-grid">
        <section className="dashboard-settings-panel" aria-labelledby="profile-settings-heading">
          <SettingsHeading
            icon={UserRound}
            eyebrow="Identity"
            id="profile-settings-heading"
            title="Profile"
            description="The details shown across your reading space."
          />

          <form className="dashboard-settings-form" onSubmit={onSaveProfile}>
            <div className="dashboard-settings-field">
              <label htmlFor="settings-display-name">Display name</label>
              <input
                id="settings-display-name"
                name="displayName"
                type="text"
                autoComplete="name"
                value={nameDraft}
                disabled={profileBusy}
                aria-invalid={profileHasError || undefined}
                aria-describedby={profileHasError ? 'settings-display-name-hint settings-profile-status' : 'settings-display-name-hint'}
                onChange={event => onNameChange(event.target.value)}
              />
              <p id="settings-display-name-hint">This is how we greet you in your dashboard.</p>
            </div>

            <div className="dashboard-settings-readonly-field">
              <span className="dashboard-settings-field-label">Email address</span>
              <strong>{email || 'No email address available'}</strong>
              <p>Used for sign-in and account recovery.</p>
            </div>

            <div className="dashboard-settings-form-footer">
              <button className="dashboard-settings-primary-action" type="submit" disabled={profileBusy}>
                {profileBusy ? 'Saving…' : 'Save changes'}
              </button>
              {profileStatus === 'success' && <p className="dashboard-settings-confirmation" role="status">Profile updated.</p>}
              {profileHasError && <p id="settings-profile-status" className="dashboard-settings-error" role="alert">{profileError || 'We could not update your profile. Try again.'}</p>}
            </div>
          </form>
        </section>

        <section className="dashboard-settings-panel" aria-labelledby="security-settings-heading">
          <SettingsHeading
            icon={KeyRound}
            eyebrow="Access"
            id="security-settings-heading"
            title="Security & sign-in"
            description="Review how you access your account."
          />

          <div className="dashboard-settings-method">
            <span className="dashboard-settings-field-label">Sign-in method</span>
            <strong>Signed in with {signInMethod.label}</strong>
            <p>{signInMethod.description}</p>
          </div>

          {signInMethod.canResetPassword && (
            <div className="dashboard-settings-security-action">
              <button
                className="dashboard-settings-secondary-action"
                type="button"
                disabled={resetBusy || !email}
                onClick={onSendPasswordReset}
              >Send reset link</button>
              {resetStatus === 'success' && <p className="dashboard-settings-confirmation" role="status">Reset link sent to {email}.</p>}
              {resetStatus === 'error' && <p className="dashboard-settings-error" role="alert">{resetError || 'We could not send the reset link. Try again.'}</p>}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-settings-panel dashboard-settings-panel--wide" aria-labelledby="privacy-data-heading">
        <SettingsHeading
          icon={ShieldCheck}
          eyebrow="Your information"
          id="privacy-data-heading"
          title="Privacy & data"
          description="Read how your information is handled."
        />
        <div className="dashboard-settings-links">
          <Link to="/privacy-policy">
            <FileText size={18} aria-hidden="true" />
            <span><strong>Privacy policy</strong><small>How we collect and protect your information.</small></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link to="/terms-of-use">
            <FileText size={18} aria-hidden="true" />
            <span><strong>Terms of use</strong><small>The terms that apply when using Ta7leel.</small></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="dashboard-settings-session" aria-labelledby="settings-session-heading">
        <span className="dashboard-settings-session-icon" aria-hidden="true"><LogOut size={19} /></span>
        <div>
          <h2 id="settings-session-heading">Current session</h2>
          <p>Finished reading on this device?</p>
          {logoutError && <p className="dashboard-settings-error" role="alert">We could not sign you out. Please try again.</p>}
        </div>
        <button className="dashboard-settings-signout-action" type="button" onClick={onLogout}>Sign out</button>
      </section>
    </section>
  );
}
