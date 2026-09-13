import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Timestamp } from 'firebase/firestore';
import type { Trade } from '../utils/tradingUtils';

const createTrade = (id: string, date: string, pnl: number): Trade => {
  const timestamp = Timestamp.fromDate(new Date(`${date}T12:00:00Z`));

  return {
    id,
    symbol: 'XAUUSD',
    direction: pnl >= 0 ? 'LONG' : 'SHORT',
    entryDate: timestamp,
    entryPrice: 2650,
    exitPrice: 2662,
    stopLoss: 2644,
    lotSize: 0.5,
    pnl,
    rr: pnl >= 0 ? 2 : -1,
    status: pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BE',
    setup: pnl >= 0 ? 'Breakout' : 'Resistance',
    emotions: pnl >= 0 ? 'Disciplined' : 'FOMO',
    notes: 'Waited for confirmation and respected the risk plan.',
    createdAt: timestamp,
  };
};

test('monthly PDF renders a multi-page fieldbook from the shared report model', async () => {
  const { createMonthlyReportDocument } = await import('../utils/pdfReportGenerator');
  const doc = await createMonthlyReportDocument({
    trades: [
      createTrade('jan', '2026-01-28', 200),
      createTrade('feb-win', '2026-02-04', 320),
      createTrade('feb-loss', '2026-02-16', -100),
    ],
    startingBalance: 10_000,
    currentBalance: 10_420,
    month: 1,
    year: 2026,
    userEmail: 'reader@example.com',
  });

  assert.ok(doc.getNumberOfPages() >= 3);
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), '%PDF');
  assert.ok(bytes.byteLength > 10_000);
});

test('monthly PDF embeds the official site-logo image in a multi-page A4 fieldbook', async () => {
  const { createMonthlyReportDocument } = await import('../utils/pdfReportGenerator');
  const logoBytes = await readFile(new URL('../public/images/ta7leel-navbar-logo-mind-leaf.png', import.meta.url));
  const doc = await createMonthlyReportDocument({
    trades: [createTrade('official-logo', '2026-02-11', 250)],
    startingBalance: 10_000,
    currentBalance: 10_250,
    month: 1,
    year: 2026,
    userEmail: 'reader@example.com',
  }, {
    officialLogoBase64: logoBytes.toString('base64'),
  });

  const bytes = new Uint8Array(doc.output('arraybuffer'));
  const output = new TextDecoder('latin1').decode(bytes);
  assert.equal(doc.getNumberOfPages(), 3);
  assert.ok(Math.abs(doc.internal.pageSize.getWidth() - 210) < 0.01);
  assert.ok(Math.abs(doc.internal.pageSize.getHeight() - 297) < 0.01);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), '%PDF');
  assert.match(output, /\/Subtype\s*\/Image/);
  assert.ok((output.match(/\/Subtype\s*\/Image/g) ?? []).length >= 3);
});

test('monthly PDF right-aligns the ledger R header and values to one column anchor', async () => {
  const { createMonthlyReportDocument } = await import('../utils/pdfReportGenerator');
  const doc = await createMonthlyReportDocument({
    trades: [createTrade('r-anchor', '2026-02-11', 250)],
    startingBalance: 10_000,
    currentBalance: 10_250,
    month: 1,
    year: 2026,
  });
  const ledgerPage = doc.internal.pages[3]?.join('\n') ?? '';
  const textStartX = (text: string): number => {
    const textIndex = ledgerPage.indexOf(`(${text}) Tj`);
    assert.ok(textIndex >= 0, `ledger page should contain ${text}`);
    const preceding = ledgerPage.slice(0, textIndex);
    const operatorIndex = preceding.lastIndexOf(' Td');
    const operatorLineStart = preceding.lastIndexOf('\n', operatorIndex) + 1;
    return Number(preceding.slice(operatorLineStart, operatorIndex).trim().split(/\s+/)[0]) / doc.internal.scaleFactor;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setCharSpace(0.45);
  const headerRightEdge = textStartX('R') + doc.getTextWidth('R');
  doc.setFontSize(8);
  doc.setCharSpace(0);
  const valueRightEdge = textStartX('2.0R') + doc.getTextWidth('2.0R');

  assert.ok(Math.abs(headerRightEdge - 145) < 0.01);
  assert.ok(Math.abs(valueRightEdge - 145) < 0.01);
});

test('monthly PDF embeds a Unicode font for Arabic journal content', async () => {
  const { createMonthlyReportDocument } = await import('../utils/pdfReportGenerator');
  const fontBytes = await readFile(new URL('../public/fonts/NotoSansArabic-Regular.ttf', import.meta.url));
  const doc = await createMonthlyReportDocument({
    trades: [{
      ...createTrade('arabic', '2026-02-20', 180),
      symbol: 'ذهب',
      setup: 'اختراق المقاومة',
      emotions: 'هادئ ومنضبط',
      notes: 'انتظرت التأكيد واحترمت خطة المخاطرة.',
    }],
    startingBalance: 10_000,
    currentBalance: 10_180,
    month: 1,
    year: 2026,
    userEmail: 'reader@example.com',
  }, {
    unicodeFontBase64: fontBytes.toString('base64'),
  });

  assert.deepEqual(doc.getFontList().NotoSansArabic, ['normal']);
  assert.ok(new Uint8Array(doc.output('arraybuffer')).byteLength > 10_000);
});

test('cancelled report generation does not begin font fetch or download work', async () => {
  const { generateMonthlyReport } = await import('../utils/pdfReportGenerator');
  let fetchStarted = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchStarted = true;
    throw new Error('cancelled report must not fetch');
  }) as typeof fetch;

  try {
    await generateMonthlyReport({
      trades: [],
      startingBalance: 10_000,
      currentBalance: 10_000,
      month: 1,
      year: 2026,
      canCommit: () => false,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(fetchStarted, false);
});
