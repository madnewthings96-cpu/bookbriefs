import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AddGoalModal from '../components/trading/AddGoalModal';
import AddTradeModal from '../components/trading/AddTradeModal';

const renderTradeDialog = () => renderToStaticMarkup(React.createElement(AddTradeModal, {
  isOpen: true,
  onClose: () => undefined,
  onSave: async () => undefined,
}));

const renderGoalDialog = () => renderToStaticMarkup(React.createElement(AddGoalModal, {
  isOpen: true,
  onClose: () => undefined,
  onSave: async () => undefined,
  currentBalance: 10_000,
}));

test('fieldbook trade and goal dialogs render labelled landmarks, actions, and their existing controls', () => {
  const trade = renderTradeDialog();
  const goal = renderGoalDialog();

  assert.match(trade, /role="dialog"/);
  assert.match(trade, /aria-modal="true"/);
  assert.match(trade, /aria-labelledby="add-trade-modal-title"/);
  assert.match(trade, /Fieldbook entry/);
  assert.match(trade, /Log a trade/);
  assert.match(trade, /Record the execution and decision context\./);
  assert.match(trade, /<section[^>]*aria-labelledby="trade-execution-heading"/);
  assert.match(trade, /id="trade-execution-heading"[^>]*>Execution</);
  assert.match(trade, /<section[^>]*aria-labelledby="trade-review-heading"/);
  assert.match(trade, /id="trade-review-heading"[^>]*>Review context</);
  for (const control of [
    'trade-symbol',
    'trade-entry-date',
    'trade-entry-price',
    'trade-exit-price',
    'trade-stop-loss',
    'trade-lot-size',
    'trade-pnl',
    'trade-setup',
    'trade-emotions',
    'trade-notes',
    'trade-screenshot-url',
  ]) {
    assert.match(trade, new RegExp(`id="${control}"`));
  }
  assert.match(trade, />Cancel</);
  assert.match(trade, />Log trade</);

  assert.match(goal, /role="dialog"/);
  assert.match(goal, /aria-modal="true"/);
  assert.match(goal, /aria-labelledby="add-goal-modal-title"/);
  assert.match(goal, /Trading commitment/);
  assert.match(goal, /Set a new goal/);
  assert.match(goal, /Choose one behavior or outcome to focus on\./);
  for (const goalType of ['Balance Target', 'Win Rate Target', 'Behavior Goal', 'Streak Goal']) {
    assert.match(goal, new RegExp(`>${goalType}<`));
  }
  assert.match(goal, /id="goal-target"/);
  assert.match(goal, /id="goal-title"/);
  assert.match(goal, />Cancel</);
  assert.match(goal, />Create goal</);
});
