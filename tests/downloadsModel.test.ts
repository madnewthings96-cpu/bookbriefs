import assert from 'node:assert/strict';
import test from 'node:test';

const loadModel = async () => {
  try {
    return await import('../components/downloads/downloadsModel');
  } catch {
    assert.fail('the downloads library model must exist');
  }
};

const resources = [
  {
    id: 'journal',
    title: 'Ta7leel Trading Journal',
    description: 'Track decisions and review trading behavior.',
    fileUrl: 'https://www.notion.so/example',
    kind: 'notion' as const,
    format: 'Notion template',
    category: 'Trading',
    updatedAt: '2026-09-08',
  },
  {
    id: 'reading-guide',
    title: 'Deep Reading Guide',
    description: 'A practical PDF for retaining useful ideas.',
    fileUrl: '/downloads/deep-reading.pdf',
    kind: 'pdf' as const,
    format: 'PDF · 2.4 MB',
    category: 'Reading',
    updatedAt: '2026-08-10',
  },
];

test('resource filtering combines type and case-insensitive search', async () => {
  const { filterDownloadResources } = await loadModel();

  assert.deepEqual(
    filterDownloadResources(resources, { kind: 'pdf', query: 'RETAINING' }).map((item) => item.id),
    ['reading-guide'],
  );
  assert.deepEqual(filterDownloadResources(resources, { kind: 'notion', query: 'reading' }), []);
});

test('resource actions describe the destination and preserve native downloads', async () => {
  const { getDownloadAction } = await loadModel();

  assert.deepEqual(getDownloadAction(resources[0]), {
    label: 'Open in Notion',
    external: true,
    downloadName: undefined,
  });
  assert.deepEqual(getDownloadAction(resources[1]), {
    label: 'Download PDF',
    external: false,
    downloadName: 'Deep Reading Guide',
  });
});

test('resource date labels are stable calendar dates', async () => {
  const { formatResourceDate } = await loadModel();

  assert.equal(formatResourceDate('2026-09-08'), 'Sep 2026');
  assert.equal(formatResourceDate('not-a-date'), 'Recently updated');
});
