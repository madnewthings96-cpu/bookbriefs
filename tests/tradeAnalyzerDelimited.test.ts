import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDelimited, parseMoney } from '../features/trade-analyzer/delimited';

test('quoted CSV preserves delimiters, escaped quotes, and line breaks', () => {
  assert.deepEqual(
    parseDelimited('Symbol,Comment,Profit\r\nEURUSD,"a,""b""\nsecond line",12.50', ','),
    [['Symbol', 'Comment', 'Profit'], ['EURUSD', 'a,"b"\nsecond line', '12.50']],
  );
});

test('tab and semicolon input retain trailing empty cells', () => {
  assert.deepEqual(parseDelimited('\uFEFFSymbol\tNet\tFee\nEURUSD\t12\t', '\t'), [
    ['Symbol', 'Net', 'Fee'], ['EURUSD', '12', ''],
  ]);
  assert.deepEqual(parseDelimited('Symbol;Net\nEURUSD;12', ';'), [['Symbol', 'Net'], ['EURUSD', '12']]);
});

test('numeric parsing respects the stated decimal convention', () => {
  assert.equal(parseMoney('1,234.56', '.'), 1234.56);
  assert.equal(parseMoney('1.234,56', ','), 1234.56);
  assert.equal(parseMoney('(42,50)', ','), -42.5);
  assert.equal(parseMoney('', '.'), null);
  assert.equal(parseMoney('not money', '.'), null);
});

test('malformed or excessive delimited input is rejected', () => {
  assert.throws(() => parseDelimited('a,"unterminated', ','), /quote/i);
  assert.throws(() => parseDelimited('h\n1\n2', ',', 1), /row limit/i);
});
