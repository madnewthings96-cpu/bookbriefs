import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timestamp } from 'firebase/firestore';

test('export report builder is an accessible labelled dialog', async () => {
  const { default: ExportReportModal } = await import('../components/trading/ExportReportModal');
  const timestamp = Timestamp.fromDate(new Date('2026-02-05T00:00:00Z'));
  const markup = renderToStaticMarkup(
    React.createElement(ExportReportModal, {
      isOpen: true,
      onClose: () => undefined,
      trades: [{
        id: 'trade-one',
        symbol: 'EURUSD',
        direction: 'LONG',
        entryDate: timestamp,
        entryPrice: 1.1,
        exitPrice: 1.11,
        stopLoss: 1.09,
        lotSize: 1,
        pnl: 100,
        rr: 2,
        status: 'WIN',
        setup: 'Breakout',
        emotions: 'Disciplined',
        notes: '',
        createdAt: timestamp,
      }],
      startingBalance: 10_000,
      currentBalance: 10_000,
      userEmail: 'reader@example.com',
    }),
  );

  assert.match(markup, /role="dialog"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /aria-labelledby="export-report-title"/);
  assert.match(markup, /aria-label="Close report builder"/);
  assert.match(markup, /<label[^>]*for="export-report-month"/);
});

test('empty report builder announces why export is unavailable without a dangling form label', async () => {
  const { default: ExportReportModal } = await import('../components/trading/ExportReportModal');
  const markup = renderToStaticMarkup(React.createElement(ExportReportModal, {
    isOpen: true,
    onClose: () => undefined,
    trades: [],
    startingBalance: 10_000,
    currentBalance: 10_000,
  }));

  assert.match(markup, /role="status"/);
  assert.doesNotMatch(markup, /for="export-report-month"/);
});
