import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import postcss from 'postcss';

test('downloads cabinet stays inside the dashboard content column', async () => {
  const css = await readFile('pages/DownloadsPage.css', 'utf8');
  const root = postcss.parse(css);
  const cabinetRule = root.nodes.find(
    node => node.type === 'rule' && node.selector === '.downloads-cabinet',
  );

  assert.ok(cabinetRule && cabinetRule.type === 'rule');
  const declarations = Object.fromEntries(
    cabinetRule.nodes
      .filter(node => node.type === 'decl')
      .map(node => [node.prop, node.value]),
  );

  assert.equal(declarations.width, '100%');
  assert.equal(declarations.left, undefined);
  assert.equal(declarations['margin-left'], undefined);
});
