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
