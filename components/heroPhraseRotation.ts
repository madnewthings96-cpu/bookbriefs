export const HERO_PHRASES = [
  'Apply immediately.',
  'Think more clearly.',
  'Remember what matters.',
  'Decide with confidence.',
  'Build better habits.',
  'Put insight to work.',
] as const;

export const getNextHeroPhraseIndex = (currentIndex: number): number =>
  (currentIndex + 1) % HERO_PHRASES.length;
