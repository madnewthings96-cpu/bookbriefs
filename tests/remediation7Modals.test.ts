import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConfirmDialog, { getConfirmDialogInitialFocusMode } from '../components/ui/ConfirmDialog';
import ReceiptScanner, { ReceiptScannerModal } from '../components/ReceiptScanner';
import { AsyncIdentityGuard } from '../components/asyncIdentityGuard';
import { getModalFocusWrapTarget } from '../components/modalFocusTrap';

const read = (path: string) => readFile(path, 'utf8');

test('ReceiptScanner uses the shared modal contract and labels every form control', async () => {
  const source = await read('components/ReceiptScanner.tsx');

  assert.match(source, /useModalDialog/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=/);
  assert.match(source, /aria-describedby=/);
  assert.match(source, /initialFocusRef/);
  assert.match(source, /event\.target === event\.currentTarget && onCancel\(\)/);
  assert.match(source, /aria-label="Close receipt verification dialog"/);
  assert.match(source, /focus-visible:/);
  assert.match(source, /min-h-11/);

  assert.match(source, /getReceiptFieldIds|fieldIds/);
});

test('ReceiptScanner server markup keeps two mounted scanners label-safe and unique', () => {
  const props = {
    showModal: true,
    isScanning: false,
    previewUrl: null,
    progress: 0,
    status: '',
    scannedData: { date: '2026-01-01', amount: '12.00', description: '', category: 'Food' },
    onChange: () => undefined,
    onCancel: () => undefined,
    onConfirm: () => undefined,
    closeButtonRef: React.createRef<HTMLButtonElement>(),
    fileInputRef: React.createRef<HTMLInputElement>(),
    onFileChange: () => undefined,
  };
  const markup = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ReceiptScannerModal, { ...props, modalInstanceId: 'scanner-a' }),
      React.createElement(ReceiptScannerModal, { ...props, modalInstanceId: 'scanner-b' }),
    ),
  );

  const fields = ['file', 'date', 'amount', 'description', 'category'];
  const ids = fields.flatMap(field => [...markup.matchAll(new RegExp(`id="([^"]*receipt-${field}[^"]*)"`, 'g'))].map(match => match[1]));
  const labelTargets = fields.flatMap(field => [...markup.matchAll(new RegExp(`for="([^"]*receipt-${field}[^"]*)"`, 'g'))].map(match => match[1]));
  assert.equal(ids.length, fields.length * 2);
  assert.equal(labelTargets.length, fields.length * 2);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(new Set(labelTargets), new Set(ids));

  const mountedScannerMarkup = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ReceiptScanner, { onScanComplete: () => undefined }),
      React.createElement(ReceiptScanner, { onScanComplete: () => undefined }),
    ),
  );
  const mountedFileIds = [...mountedScannerMarkup.matchAll(/id="(receipt-file-[^"]+)"/g)].map(match => match[1]);
  assert.equal(mountedFileIds.length, 2);
  assert.equal(new Set(mountedFileIds).size, 2);
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

test('ConfirmDialog keeps initial focus in the dialog while loading and prefers Cancel otherwise', () => {
  assert.equal(getConfirmDialogInitialFocusMode(false), 'cancel');
  assert.equal(getConfirmDialogInitialFocusMode(true), 'dialog');

  const loadingMarkup = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isOpen: true,
      onClose: () => undefined,
      onConfirm: () => undefined,
      title: 'Delete this receipt?',
      message: 'Saving…',
      isLoading: true,
    }),
  );
  assert.match(loadingMarkup, /role="dialog"/);
  assert.match(loadingMarkup, /<button[^>]*disabled=""[^>]*>Cancel<\/button>/);
});

test('shared modal and OCR cancellation contracts cover production close and stale-work paths', async () => {
  const hook = await read('hooks/useModalDialog.ts');
  assert.match(hook, /event\.key === 'Escape'/);
  assert.match(hook, /document\.addEventListener\('keydown'/);
  assert.match(hook, /previousFocus\?\.focus\(\)/);
  assert.equal(getModalFocusWrapTarget(0, 2, true), 1);
  assert.equal(getModalFocusWrapTarget(1, 2, false), 0);

  const ocrGuard = new AsyncIdentityGuard();
  const token = ocrGuard.begin();
  assert.ok(token);
  assert.equal(ocrGuard.isCurrent(token), true);
  ocrGuard.invalidate();
  assert.equal(ocrGuard.isCurrent(token), false);
});
