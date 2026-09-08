export const HERO_PHRASES = [
  'Act on it.',
  'Think more clearly.',
  'Make it stick.',
  'Think sharper.',
  'Build better habits.',
  'Put insight to work.',
] as const;

export const getNextHeroPhraseIndex = (currentIndex: number): number =>
  (currentIndex + 1) % HERO_PHRASES.length;
