import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardSettingsView, type SettingsActionStatus } from '../components/dashboard/DashboardSettingsView';
import { completeDashboardLogout } from '../components/dashboard/dashboardLogout';
import { getSettingsSignInMethod, validateSettingsDisplayName } from '../components/dashboard/dashboardSettingsModel';
import './DashboardPages.css';

export default function DashboardSettingsPage() {
  const { user, logout, sendPasswordReset, updateName } = useAuth();
  const navigate = useNavigate();
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [profileStatus, setProfileStatus] = useState<SettingsActionStatus>('idle');
  const [profileError, setProfileError] = useState('');
  const [resetStatus, setResetStatus] = useState<SettingsActionStatus>('idle');
  const [resetError, setResetError] = useState('');
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => setNameDraft(user?.name || ''), [user?.name]);

  const signInMethod = useMemo(
    () => getSettingsSignInMethod(user?.providerIds ?? []),
    [user?.providerIds],
  );

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError('');
    const validation = validateSettingsDisplayName(nameDraft);
    if (validation.error) {
      setProfileError(validation.error);
      setProfileStatus('error');
      return;
    }

    if (validation.value === user?.name) {
      setNameDraft(validation.value);
      setProfileStatus('success');
      return;
    }

    setProfileStatus('pending');
    try {
      await updateName(validation.value);
      setNameDraft(validation.value);
      setProfileStatus('success');
    } catch (error) {
      console.error('Profile update failed:', error);
      setProfileError('We could not update your profile. Try again.');
      setProfileStatus('error');
    }
  };

  const handleSendPasswordReset = async () => {
    setResetError('');
    setResetStatus('pending');
    try {
      await sendPasswordReset();
      setResetStatus('success');
    } catch (error) {
      console.error('Password reset email failed:', error);
      setResetError('We could not send the reset link. Try again.');
      setResetStatus('error');
    }
  };

  const handleLogout = async () => {
    setLogoutError(false);
    const didLogout = await completeDashboardLogout(logout, (path, options) => navigate(path, options));
    if (!didLogout) setLogoutError(true);
  };

  return <DashboardSettingsView
    email={user?.email || ''}
    nameDraft={nameDraft}
    signInMethod={signInMethod}
    profileStatus={profileStatus}
    resetStatus={resetStatus}
    logoutError={logoutError}
    profileError={profileError}
    resetError={resetError}
    onNameChange={value => {
      setNameDraft(value);
      if (profileStatus !== 'idle') setProfileStatus('idle');
    }}
    onSaveProfile={event => { void handleSaveProfile(event); }}
    onSendPasswordReset={() => { void handleSendPasswordReset(); }}
    onLogout={() => { void handleLogout(); }}
  />;
}
