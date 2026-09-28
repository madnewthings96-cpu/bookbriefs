export function parseDelimited(text: string, delimiter: ',' | ';' | '\t', maxRows = 20_000): string[][] {
  const input = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  let afterQuote = false;

  const finishRow = () => {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
      if (rows.length - 1 > maxRows) throw new Error(`Input exceeds the ${maxRows} row limit`);
    }
    row = [];
    cell = '';
    afterQuote = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
        afterQuote = true;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      if (cell.trim() || afterQuote) throw new Error('Unexpected quote in delimited input');
      cell = '';
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
      afterQuote = false;
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      finishRow();
    } else if (afterQuote && !/\s/.test(char)) {
      throw new Error('Unexpected text after quoted cell');
    } else if (!afterQuote) {
      cell += char;
    }
  }
  if (quoted) throw new Error('Unclosed quote in delimited input');
  if (row.length > 0 || cell !== '' || afterQuote) finishRow();
  return rows;
}

export function parseMoney(value: string, decimal: '.' | ','): number | null {
  let raw = value.trim().replace(/[\u00a0\u202f\s]/g, '');
  if (!raw) return null;
  const negativeParens = raw.startsWith('(') && raw.endsWith(')');
  if (negativeParens) raw = raw.slice(1, -1);
  raw = raw.replace(/^[^\d+\-.,]*/, '').replace(/[^\d.,]*$/, '');
  const separator = decimal === '.' ? ',' : '.';
  const pattern = decimal === '.'
    ? /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/
    : /^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/;
  if (!pattern.test(raw)) return null;
  const parsed = Number(raw.replaceAll(separator, '').replace(decimal, '.'));
  return Number.isFinite(parsed) ? (negativeParens ? -parsed : parsed) : null;
}
