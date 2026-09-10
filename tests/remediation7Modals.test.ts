import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const read = (path: string) => readFile(path, 'utf8');

test('ReceiptScanner uses the shared modal contract and labels every form control', async () => {
  const source = await read('components/ReceiptScanner.tsx');

  assert.match(source, /useModalDialog/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=/);
  assert.match(source, /aria-describedby=/);
  assert.match(source, /initialFocusRef/);
  assert.match(source, /event\.target === event\.currentTarget && handleCancel\(\)/);
  assert.match(source, /aria-label="Close receipt verification dialog"/);
  assert.match(source, /focus-visible:/);
  assert.match(source, /min-h-11/);

  for (const field of ['receipt-file', 'receipt-date', 'receipt-amount', 'receipt-description', 'receipt-category']) {
    assert.match(source, new RegExp(`htmlFor="${field}"`));
    assert.match(source, new RegExp(`id="${field}"`));
  }
});

test('ConfirmDialog renders a labelled modal with a descriptive message and safe initial focus', async () => {
  const source = await read('components/ui/ConfirmDialog.tsx');
  assert.match(source, /useModalDialog/);
  assert.match(source, /useId/);
  assert.match(source, /initialFocusRef/);
  assert.match(source, /event\.target === event\.currentTarget && handleClose\(\)/);
  assert.match(source, /aria-label="Close confirmation dialog"/);
  assert.match(source, /focus-visible:/);
  assert.match(source, /min-h-11/);

  const markup = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isOpen: true,
      onClose: () => undefined,
      onConfirm: () => undefined,
      title: 'Delete this receipt?',
      message: 'This action cannot be undone.',
      variant: 'danger',
    }),
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  const labelledBy = markup.match(/aria-labelledby="([^"]+)"/)?.[1];
  const describedBy = markup.match(/aria-describedby="([^"]+)"/)?.[1];
  assert.ok(labelledBy);
  assert.ok(describedBy);
  assert.match(markup, new RegExp(`id="${labelledBy}"`));
  assert.match(markup, new RegExp(`id="${describedBy}"`));
  assert.match(markup, /aria-label="Close confirmation dialog"/);
  assert.match(markup, /min-h-11/);
  assert.match(markup, /Cancel/);
});

test('ConfirmDialog generated title and description IDs differ across instances', async () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ConfirmDialog, {
        isOpen: true,
        onClose: () => undefined,
        onConfirm: () => undefined,
        title: 'First',
        message: 'First message',
      }),
      React.createElement(ConfirmDialog, {
        isOpen: true,
        onClose: () => undefined,
        onConfirm: () => undefined,
        title: 'Second',
        message: 'Second message',
      }),
    ),
  );

  const titleIds = [...markup.matchAll(/aria-labelledby="([^"]+)"/g)].map(match => match[1]);
  const descriptionIds = [...markup.matchAll(/aria-describedby="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(titleIds).size, 2);
  assert.equal(new Set(descriptionIds).size, 2);
});
