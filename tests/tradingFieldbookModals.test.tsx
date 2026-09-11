import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AddGoalModal, { GoalFormDetails } from '../components/trading/AddGoalModal';
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
  assert.match(goal, /class="grid grid-cols-1 gap-3 sm:grid-cols-2"/);
  assert.match(goal, /id="goal-target"/);
  assert.match(goal, /id="goal-title"/);
  assert.match(goal, />Cancel</);
  assert.match(goal, />Create goal</);
});

test('editing a trade keeps the edit action, direction controls, and manual P&L mode', () => {
  const trade = renderToStaticMarkup(React.createElement(AddTradeModal, {
    isOpen: true,
    onClose: () => undefined,
    onSave: async () => undefined,
    editingTrade: {
      id: 'trade-1',
      symbol: 'EURUSD',
      direction: 'SHORT',
      entryDate: {} as never,
      entryPrice: 1.1,
      exitPrice: 1.09,
      stopLoss: 1.11,
      lotSize: 1,
      pnl: 100,
      status: 'WIN',
      setup: 'Breakout',
      emotions: 'Disciplined',
      notes: '',
      createdAt: {} as never,
    },
  }));

  assert.match(trade, />Edit trade</);
  assert.match(trade, />Update trade</);
  assert.match(trade, />LONG</);
  assert.match(trade, />SHORT</);
  assert.match(trade, />Manual</);
});

test('goal detail fields render the behavior selector and the selected target unit', () => {
  const renderDetails = (selectedType: 'behavior' | 'streak') => renderToStaticMarkup(React.createElement(GoalFormDetails, {
    selectedType,
    target: '',
    title: '',
    behaviorToAvoid: 'FOMO',
    currentBalance: 10_000,
    targetInputRef: React.createRef<HTMLInputElement>(),
    onTargetChange: () => undefined,
    onTitleChange: () => undefined,
    onBehaviorChange: () => undefined,
  }));

  const behavior = renderDetails('behavior');
  assert.match(behavior, /id="goal-behavior"/);
  assert.match(behavior, />days</);
  assert.match(behavior, /Days to Avoid/);

  const streak = renderDetails('streak');
  assert.doesNotMatch(streak, /id="goal-behavior"/);
  assert.match(streak, />trades</);
  assert.match(streak, /Streak Length \(trades\)/);
});
