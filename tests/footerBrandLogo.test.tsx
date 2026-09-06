import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.mjs';

import Footer from '../components/Footer';

test('footer uses the shared transparent Ta7leel brand asset', () => {
  const markup = renderToStaticMarkup(
    <StaticRouter location="/">
      <Footer />
    </StaticRouter>,
  );

  assert.match(markup, /src="\/images\/ta7leel-navbar-logo-mind-leaf\.png"/);
  assert.match(markup, /alt="Ta7leel"/);
  assert.match(markup, /BookBriefs · High-Signal Reading/);
});
