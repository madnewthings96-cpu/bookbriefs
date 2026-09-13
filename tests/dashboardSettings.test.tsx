import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

test('auth identity keeps its linked providers for settings security choices', async () => {
  const authModel = await import('../contexts/authStateModel');
  assert.equal(
    typeof (authModel as { toAuthUser?: unknown }).toAuthUser,
    'function',
    'the auth boundary needs to preserve provider identity',
  );

  const { toAuthUser } = authModel as typeof import('../contexts/authStateModel');
  assert.deepEqual(toAuthUser({
    uid: 'reader-1',
    email: 'reader@example.com',
    displayName: 'Hamza',
    providerData: [{ providerId: 'password' }, { providerId: 'google.com' }],
  }), {
    id: 'reader-1',
    email: 'reader@example.com',
    name: 'Hamza',
    providerIds: ['password', 'google.com'],
  });
});

test('settings model resolves password and Google access without offering an unusable password action', async () => {
  const settingsModule = await import('../components/dashboard/dashboardSettingsModel').catch(() => ({}));
  assert.equal(
    typeof (settingsModule as { getSettingsSignInMethod?: unknown }).getSettingsSignInMethod,
    'function',
    'settings need a sign-in model before the security panel can be rendered',
  );

  const { getSettingsSignInMethod } = settingsModule as typeof import('../components/dashboard/dashboardSettingsModel');

  assert.deepEqual(getSettingsSignInMethod(['password']), {
    label: 'Email and password',
    description: 'Use a secure email link to choose a new password.',
    canResetPassword: true,
  });
  assert.deepEqual(getSettingsSignInMethod(['google.com']), {
    label: 'Google',
    description: 'Password changes are managed by Google.',
    canResetPassword: false,
  });
  assert.equal(getSettingsSignInMethod(['google.com', 'password']).canResetPassword, true);
});

test('settings model trims a useful display name and rejects an empty one', async () => {
  const settingsModule = await import('../components/dashboard/dashboardSettingsModel').catch(() => ({}));
  assert.equal(
    typeof (settingsModule as { validateSettingsDisplayName?: unknown }).validateSettingsDisplayName,
    'function',
    'profile editing needs an explicit validation contract',
  );

  const { validateSettingsDisplayName } = settingsModule as typeof import('../components/dashboard/dashboardSettingsModel');

  assert.deepEqual(validateSettingsDisplayName('  Hamza  '), { value: 'Hamza', error: null });
  assert.deepEqual(validateSettingsDisplayName('   '), { value: '', error: 'Enter a display name.' });
});

test('password accounts see the compact profile, security, privacy, and session settings', async () => {
  const pageModule = await import('../components/dashboard/DashboardSettingsView').catch(() => ({}));
  assert.equal(
    typeof (pageModule as { DashboardSettingsView?: unknown }).DashboardSettingsView,
    'function',
    'settings need a renderable view for account-specific security states',
  );

  const { DashboardSettingsView } = pageModule as typeof import('../components/dashboard/DashboardSettingsView');
  const markup = renderToStaticMarkup(React.createElement(
    StaticRouter,
    { location: '/dashboard/settings' },
    React.createElement(DashboardSettingsView, {
      email: 'reader@example.com',
      nameDraft: 'Hamza',
      signInMethod: {
        label: 'Email and password',
        description: 'Use a secure email link to choose a new password.',
        canResetPassword: true,
      },
      profileStatus: 'idle',
      resetStatus: 'idle',
      logoutError: false,
      onNameChange: () => undefined,
      onSaveProfile: () => undefined,
      onSendPasswordReset: () => undefined,
      onLogout: () => undefined,
    }),
  ));

  assert.match(markup, /<h1>Settings<\/h1>/);
  assert.match(markup, /<h2[^>]*>Profile<\/h2>/);
  assert.match(markup, /<label[^>]*for="settings-display-name"[^>]*>Display name<\/label>/);
  assert.match(markup, /value="Hamza"/);
  assert.match(markup, /reader@example\.com/);
  assert.match(markup, /Security &amp; sign-in/);
  assert.match(markup, />Send reset link<\/button>/);
  assert.match(markup, /Privacy &amp; data/);
  assert.match(markup, /href="\/privacy-policy"/);
  assert.match(markup, /href="\/terms-of-use"/);
  assert.match(markup, />Sign out<\/button>/);
  assert.doesNotMatch(markup, /Dashboard layout|Reset sidebar preference|>Logout</);
});

test('Google-only accounts explain where password changes are managed', async () => {
  const pageModule = await import('../components/dashboard/DashboardSettingsView').catch(() => ({}));
  assert.equal(
    typeof (pageModule as { DashboardSettingsView?: unknown }).DashboardSettingsView,
    'function',
    'settings need a renderable view for provider-specific security copy',
  );

  const { DashboardSettingsView } = pageModule as typeof import('../components/dashboard/DashboardSettingsView');
  const markup = renderToStaticMarkup(React.createElement(
    StaticRouter,
    { location: '/dashboard/settings' },
    React.createElement(DashboardSettingsView, {
      email: 'reader@gmail.com',
      nameDraft: 'Reader',
      signInMethod: {
        label: 'Google',
        description: 'Password changes are managed by Google.',
        canResetPassword: false,
      },
      profileStatus: 'idle',
      resetStatus: 'idle',
      logoutError: false,
      onNameChange: () => undefined,
      onSaveProfile: () => undefined,
      onSendPasswordReset: () => undefined,
      onLogout: () => undefined,
    }),
  ));

  assert.match(markup, /Signed in with Google/);
  assert.match(markup, /Password changes are managed by Google\./);
  assert.doesNotMatch(markup, /Send reset link/);
});

test('profile validation connects its alert to the display-name field', async () => {
  const { DashboardSettingsView } = await import('../components/dashboard/DashboardSettingsView');
  const markup = renderToStaticMarkup(React.createElement(
    StaticRouter,
    { location: '/dashboard/settings' },
    React.createElement(DashboardSettingsView, {
      email: 'reader@example.com',
      nameDraft: '',
      signInMethod: {
        label: 'Email and password',
        description: 'Use a secure email link to choose a new password.',
        canResetPassword: true,
      },
      profileStatus: 'error',
      profileError: 'Enter a display name.',
      resetStatus: 'idle',
      logoutError: false,
      onNameChange: () => undefined,
      onSaveProfile: () => undefined,
      onSendPasswordReset: () => undefined,
      onLogout: () => undefined,
    }),
  ));

  assert.match(markup, /id="settings-display-name"[^>]*aria-invalid="true"/);
  assert.match(markup, /aria-describedby="settings-display-name-hint settings-profile-status"/);
  assert.match(markup, /id="settings-profile-status"[^>]*role="alert"[^>]*>Enter a display name\.<\/p>/);
});
