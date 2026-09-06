import assert from 'node:assert/strict';
import test from 'node:test';

test('summary sections normalize mixed heading styles without duplicating the document title', async () => {
  let model: typeof import('../components/summaryReadingModel');

  try {
    model = await import('../components/summaryReadingModel');
  } catch {
    assert.fail('the shared summary reading model must exist');
  }

  const sections = model.extractSummarySections(`
# Atomic Habits

An introduction to small changes.

## The Science Behind Small Changes

Compounding matters.

**Systems Over Goals**

Process beats intention.

## The Science Behind Small Changes
  `);

  assert.deepEqual(sections, [
    { id: 'the-science-behind-small-changes', label: 'The Science Behind Small Changes' },
    { id: 'systems-over-goals', label: 'Systems Over Goals' },
  ]);
});

test('summary lead ignores structural lines and returns clean readable text', async () => {
  let model: typeof import('../components/summaryReadingModel');

  try {
    model = await import('../components/summaryReadingModel');
  } catch {
    assert.fail('the shared summary reading model must exist');
  }

  const lead = model.getSummaryLead(`
# Book title
**A practical field guide**
- First list item

Small changes become remarkable results when repeated consistently. A second sentence follows.
  `);

  assert.equal(lead, 'Small changes become remarkable results when repeated consistently.');
});

test('active summary section follows the last heading above the reading anchor', async () => {
  const model = await import('../components/summaryReadingModel');
  const positions = [
    { id: 'quick-brief', top: -420 },
    { id: 'key-takeaways', top: 64 },
    { id: 'detailed-summary', top: 540 },
  ];

  assert.equal(model.pickActiveSummarySection(positions, 120), 'key-takeaways');
  assert.equal(model.pickActiveSummarySection(positions, -500), 'quick-brief');
});

test('mobile navigation groups article subsections under detailed summary', async () => {
  const model = await import('../components/summaryReadingModel');

  assert.equal(model.getSummaryLandmark('quick-brief'), 'quick-brief');
  assert.equal(model.getSummaryLandmark('key-takeaways'), 'key-takeaways');
  assert.equal(model.getSummaryLandmark('the-science-behind-small-changes'), 'detailed-summary');
});
