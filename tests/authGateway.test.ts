import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

type AuthGatewayModule = typeof import('../components/AuthGateway');

async function loadAuthGateway(): Promise<AuthGatewayModule> {
  try {
    return await import('../components/AuthGateway');
  } catch {
    assert.fail('the shared Ta7leel authentication gateway must exist');
  }
}

const sharedProps = {
  email: '',
  password: '',
  error: '',
  success: '',
  isLoading: false,
  isGoogleLoading: false,
  onEmailChange: () => undefined,
  onPasswordChange: () => undefined,
  onSubmit: () => undefined,
  onGoogleAuth: () => undefined,
  onSwitchMode: () => undefined,
  onGoHome: () => undefined,
};

test('login gateway exposes labelled credentials and the correct autofill contract', async () => {
  const { AuthGateway } = await loadAuthGateway();
  const markup = renderToStaticMarkup(
    React.createElement(AuthGateway, {
      ...sharedProps,
      mode: 'login',
    }),
  );

  assert.match(markup, /<label[^>]*for="auth-email"/);
  assert.match(markup, /<label[^>]*for="auth-password"/);
  assert.match(markup, /id="auth-email"[^>]*autocomplete="email"/i);
  assert.match(markup, /id="auth-password"[^>]*autocomplete="current-password"/i);
  assert.doesNotMatch(markup, /id="auth-name"/);
  assert.doesNotMatch(markup, /id="auth-confirm-password"/);
});

test('signup gateway exposes identity and password-confirmation fields', async () => {
  const { AuthGateway } = await loadAuthGateway();
  const markup = renderToStaticMarkup(
    React.createElement(AuthGateway, {
      ...sharedProps,
      mode: 'signup',
      name: '',
      confirmPassword: '',
      onNameChange: () => undefined,
      onConfirmPasswordChange: () => undefined,
    }),
  );

  assert.match(markup, /<label[^>]*for="auth-name"/);
  assert.match(markup, /id="auth-name"[^>]*autocomplete="name"/i);
  assert.match(markup, /<label[^>]*for="auth-confirm-password"/);
  assert.match(markup, /id="auth-password"[^>]*autocomplete="new-password"/i);
  assert.match(markup, /id="auth-confirm-password"[^>]*autocomplete="new-password"/i);
});

test('gateway announces authentication feedback without moving form controls', async () => {
  const { AuthGateway } = await loadAuthGateway();
  const markup = renderToStaticMarkup(
    React.createElement(AuthGateway, {
      ...sharedProps,
      mode: 'login',
      error: 'Check your email and password.',
    }),
  );

  assert.match(markup, /role="alert"/);
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, />Check your email and password\.<\/p>/);
  assert.doesNotMatch(markup, /aria-invalid="true"/);
});

test('gateway leaves the page-level main landmark to the app shell', async () => {
  const { AuthGateway } = await loadAuthGateway();
  const markup = renderToStaticMarkup(
    React.createElement(AuthGateway, {
      ...sharedProps,
      mode: 'login',
    }),
  );

  assert.equal((markup.match(/<main/g) ?? []).length, 0);
});

test('gateway locks every login control while authentication is in flight or redirecting', async () => {
  const { AuthGateway } = await loadAuthGateway();

  for (const state of [
    { isLoading: true, success: '' },
    { isLoading: false, success: 'Signed in. Redirecting…' },
  ]) {
    const markup = renderToStaticMarkup(
      React.createElement(AuthGateway, {
        ...sharedProps,
        mode: 'login',
        ...state,
      }),
    );

    assert.match(markup, /<form[^>]*aria-busy="true"/);
    assert.equal((markup.match(/disabled=""/g) ?? []).length, 6);
  }
});
