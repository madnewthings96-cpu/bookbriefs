import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('exit intent dialog renders as a labelled modal with named credentials', async () => {
  let dialogModule: typeof import('../components/ExitIntentDialog');

  try {
    dialogModule = await import('../components/ExitIntentDialog');
  } catch {
    assert.fail('the accessible exit intent dialog must exist');
  }

  const markup = renderToStaticMarkup(
    React.createElement(dialogModule.ExitIntentDialog, {
      dialogRef: React.createRef<HTMLDivElement>(),
      email: '',
      password: '',
      isLogin: false,
      loading: false,
      error: null,
      reduceMotion: true,
      onClose: () => undefined,
      onGoogleAuth: () => undefined,
      onSubmit: () => undefined,
      onEmailChange: () => undefined,
      onPasswordChange: () => undefined,
      onToggleMode: () => undefined,
    }),
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /aria-labelledby="exit-popup-title"/);
  assert.match(markup, /<label[^>]*for="exit-popup-email"/);
  assert.match(markup, /<label[^>]*for="exit-popup-password"/);
  assert.match(markup, /aria-label="Close exit prompt"/);
});
