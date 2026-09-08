import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoffeeSupportCardView } from '../components/CoffeeSupportCard';

test('renders a dismissible support region with the Ta7leel cup and Ko-fi destination', () => {
  const markup = renderToStaticMarkup(
    React.createElement(CoffeeSupportCardView, {
      onDismiss: () => undefined,
    }),
  );

  assert.match(markup, /role="region"/);
  assert.match(markup, /aria-labelledby="coffee-support-title"/);
  assert.match(markup, /src="\/images\/ta7leel-coffee-support\.svg"/);
  assert.match(markup, /href="https:\/\/ko-fi\.com\/ta7leel"/);
  assert.match(markup, /aria-label="Dismiss coffee support message"/);
});
