import { Book } from '../types';

export type AffiliateFormat = 'amazon' | 'kindle' | 'audible';

export interface AffiliateLink {
  format: AffiliateFormat;
  label: string;
  href: string;
}

type AffiliateUrlSet = Partial<Record<AffiliateFormat, string>>;

const AFFILIATE_ORDER: Array<{ format: AffiliateFormat; label: string }> = [
  { format: 'amazon', label: 'Amazon' },
  { format: 'kindle', label: 'Kindle' },
  { format: 'audible', label: 'Audible' },
];

const LEGACY_AFFILIATE_LINKS: Record<string, AffiliateUrlSet> = {
  'reminiscences-of-a-stock-operator': {
    amazon: 'https://amzn.to/4ppfvAA',
    kindle: 'https://amzn.to/4a8YshR',
    audible: 'https://amzn.to/3M0eW1H',
  },
  'trading-in-the-zone': {
    amazon: 'https://amzn.to/4n8z3I7',
    kindle: 'https://amzn.to/4n1pnPi',
    audible: 'https://amzn.to/43jrnLQ',
  },
  'the-intelligent-investor': {
    amazon: 'https://amzn.to/4nOFXTT',
    kindle: 'https://amzn.to/4763wAi',
    audible: 'https://amzn.to/46QHaUS',
  },
  educated: {
    amazon: 'https://amzn.to/4nJ8jyV',
    kindle: 'https://amzn.to/3KLPRqS',
    audible: 'https://amzn.to/4q4qEIp',
  },
  marketwizards: {
    amazon: 'https://amzn.to/4nRy6oJ',
    kindle: 'https://amzn.to/46SyIEs',
    audible: 'https://amzn.to/4qeGdgM',
  },
  'best-loser-wins': {
    amazon: 'https://amzn.to/3W0goTJ',
    kindle: 'https://amzn.to/47aKyc4',
    audible: 'https://amzn.to/473Agu7',
  },
  becoming: {
    amazon: 'https://amzn.to/4qqFV6D',
    kindle: 'https://amzn.to/46PAZ3d',
    audible: 'https://amzn.to/47jnSHL',
  },
  'atomic-habits': {
    amazon: 'https://amzn.to/42EOe4j',
    kindle: 'https://amzn.to/3KVuXWd',
    audible: 'https://amzn.to/47oavpG',
  },
  'broken-money': {
    amazon: 'https://amzn.to/4n6vfqx',
    kindle: 'https://amzn.to/43cdcbr',
    audible: 'https://amzn.to/4mYRxup',
  },
  sapiens: {
    amazon: 'https://amzn.to/43jv5VM',
    kindle: 'https://amzn.to/4nV4B5w',
    audible: 'https://amzn.to/4qaeVrH',
  },
  'thinking-fast-and-slow': {
    amazon: 'https://amzn.to/46NEyHg',
    kindle: 'https://amzn.to/47miWln',
    audible: 'https://amzn.to/4nL5zRv',
  },
  'the-alchemist': {
    amazon: 'https://amzn.to/46P8QcF',
    kindle: 'https://amzn.to/3KOGW83',
    audible: 'https://amzn.to/4nI5DS4',
  },
  'the-four-agreements': {
    amazon: 'https://amzn.to/48prwAZ',
    kindle: 'https://amzn.to/473bZ7w',
    audible: 'https://amzn.to/4mYS1Rf',
  },
  dune: {
    amazon: 'https://amzn.to/43j0O9z',
    kindle: 'https://amzn.to/4nL63XP',
    audible: 'https://amzn.to/3WFGbRa',
  },
  'project-hail-mary': {
    amazon: 'https://amzn.to/4q8Edq1',
    kindle: 'https://amzn.to/4nLz9X5',
    audible: 'https://amzn.to/473CI3N',
  },
  'rich-dad-poor-dad': {
    amazon: 'https://amzn.to/3Wyk9zU',
    kindle: 'https://amzn.to/48nupSO',
    audible: 'https://amzn.to/470Bczn',
  },
  'americas-bank': {
    amazon: 'https://amzn.to/4og7AVA',
    kindle: 'https://amzn.to/42CZ8aT',
    audible: 'https://amzn.to/42CZ9vt',
  },
  the33strategiesofwar: {
    amazon: 'https://amzn.to/3KM3qXi',
    kindle: 'https://amzn.to/4qnFkCC',
    audible: 'https://amzn.to/4nJcwTf',
  },
  belesszombie: {
    amazon: 'https://amzn.to/4nT4Bmu',
    kindle: 'https://amzn.to/4qavow4',
    audible: 'https://amzn.to/4qavow4',
  },
  howtodaytradeforaliving: {
    amazon: 'https://amzn.to/46WKf4g',
    kindle: 'https://amzn.to/475aqpL',
    audible: 'https://amzn.to/3IMQ6RY',
  },
  the48lawsofpower: {
    amazon: 'https://amzn.to/4n5mDk2',
    kindle: 'https://amzn.to/3L8qOhG',
    audible: 'https://amzn.to/3JcUee1',
  },
  secretsofthemillionairemind: {
    amazon: 'https://amzn.to/4onA4NA',
    kindle: 'https://amzn.to/4ogCQUq',
    audible: 'https://amzn.to/4oelK9L',
  },
  relentless: {
    amazon: 'https://amzn.to/42GMWWB',
    kindle: 'https://amzn.to/3W54Y14',
    audible: 'https://amzn.to/42GgALA',
  },
  'one-good-trade': {
    amazon: 'https://amzn.to/4oiXe7o',
    kindle: 'https://amzn.to/3W6Qk9q',
    audible: 'https://amzn.to/4omIvIW',
  },
  'cant-hurt-me': {
    amazon: 'https://amzn.to/3IYWju7',
    kindle: 'https://amzn.to/4hmAod6',
    audible: 'https://amzn.to/4o4CqRm',
  },
  'the-alchemy-of-finance': {
    amazon: 'https://amzn.to/4nTagZ1',
    kindle: 'https://amzn.to/4oCNZjc',
    audible: 'https://amzn.to/4nSGROh',
  },
  'competition-demystified': {
    amazon: 'https://amzn.to/3KXXScb',
    kindle: 'https://amzn.to/4nWz1nI',
    audible: 'https://amzn.to/4orvbTB',
  },
  'the-4-hour-workweek': {
    amazon: 'https://amzn.to/47DQ2gI',
    kindle: 'https://amzn.to/4hkoK2e',
    audible: 'https://amzn.to/47u42bU',
  },
  'the-4-hour-work-week': {
    amazon: 'https://amzn.to/4ovvsEV',
    kindle: 'https://amzn.to/4hkoK2e',
    audible: 'https://amzn.to/4oDnv0J',
  },
  'the-black-swan': {
    amazon: 'https://amzn.to/49wxssz',
    kindle: 'https://amzn.to/4oKYAsc',
    audible: 'https://amzn.to/444ACjn',
  },
  'the-chatgpt-millionaire': {
    amazon: 'https://amzn.to/4hPWKng',
    kindle: 'https://amzn.to/3LwDaAx',
    audible: 'https://amzn.to/4oyH5LI',
  },
  'the-first-90-days': {
    amazon: 'https://amzn.to/4nH7Ufp',
    kindle: 'https://amzn.to/47wObuj',
    audible: 'https://amzn.to/43jItcL',
  },
  'leading-change': {
    amazon: 'https://amzn.to/4oZOyTV',
    kindle: 'https://amzn.to/49I7BxA',
    audible: 'https://amzn.to/4qQPsDT',
  },
  'i-will-teach-you-to-be-rich': {
    amazon: 'https://amzn.to/49diaJ1',
    kindle: 'https://amzn.to/3LuPi5b',
    audible: 'https://amzn.to/3LwC6N3',
  },
  'money-master-the-game': {
    amazon: 'https://amzn.to/488ydqk',
    kindle: 'https://amzn.to/43lLbP0',
    audible: 'https://amzn.to/3Jw643f',
  },
  'the-7-habits-of-highly-effective-people': {
    amazon: 'https://amzn.to/4hX7zUJ',
    kindle: 'https://amzn.to/4qZ1N99',
    audible: 'https://amzn.to/4nSxRbY',
  },
  'how-to-win-friends-and-influence-people': {
    amazon: 'https://amzn.to/49S117R',
    kindle: 'https://amzn.to/47P9Xs4',
    audible: 'https://amzn.to/3JX2mQe',
  },
  'influence-the-psychology-of-persuasion': {
    amazon: 'https://amzn.to/4nPft41',
    kindle: 'https://amzn.to/482TAsa',
    audible: 'https://amzn.to/4i1cdRG',
  },
  'a-random-walk-down-wall-street': {
    amazon: 'https://amzn.to/4r1BwXZ',
    kindle: 'https://amzn.to/4ravZOX',
    audible: 'https://amzn.to/4ravZOX',
  },
  'the-simple-path-to-wealth': {
    amazon: 'https://amzn.to/4nXYY5s',
    kindle: 'https://amzn.to/4r0iJfs',
    audible: 'https://amzn.to/49WzFNT',
  },
  'basic-economics': {
    amazon: 'https://amzn.to/3WXeqUD',
    kindle: 'https://amzn.to/47LCUXa',
    audible: 'https://amzn.to/3XzY0la',
  },
  'black-rednecks-and-white-liberals': {
    amazon: 'https://amzn.to/3LBV0Cm',
    kindle: 'https://amzn.to/48hjvgJ',
    audible: 'https://amzn.to/43VSfCf',
  },
  'how-to-trade-in-stocks': {
    amazon: 'https://amzn.to/3XGefgA',
    kindle: 'https://amzn.to/49Z3mhm',
    audible: 'https://amzn.to/3JUBzUN',
  },
  'one-up-on-wall-street': {
    amazon: 'https://amzn.to/4owUzHL',
    kindle: 'https://amzn.to/3JNxstA',
    audible: 'https://amzn.to/3JNxstA',
  },
};

const BOOK_ID_ALIASES: Record<string, string> = {
  'market-wizards': 'marketwizards',
  'the-33-strategies-of-war': 'the33strategiesofwar',
  'be-less-zombie': 'belesszombie',
  'how-to-day-trade-for-a-living': 'howtodaytradeforaliving',
  'the-48-laws-of-power': 'the48lawsofpower',
  'secrets-of-the-millionaire-mind': 'secretsofthemillionairemind',
  influence: 'influence-the-psychology-of-persuasion',
};

const getLegacyAffiliateUrls = (bookId: string) => {
  const aliasId = BOOK_ID_ALIASES[bookId];
  return LEGACY_AFFILIATE_LINKS[bookId] || (aliasId ? LEGACY_AFFILIATE_LINKS[aliasId] : {});
};

export const getAffiliateLinksForBook = (book: Book): AffiliateLink[] => {
  const fallback = getLegacyAffiliateUrls(book.id);
  const urls: AffiliateUrlSet = {
    amazon: book.amazonUrl || fallback.amazon,
    kindle: book.kindleUrl || fallback.kindle,
    audible: book.audibleUrl || fallback.audible,
  };
  const seen = new Set<string>();

  return AFFILIATE_ORDER.flatMap(({ format, label }) => {
    const href = urls[format];
    if (!href || seen.has(href)) return [];
    seen.add(href);
    return [{ format, label, href }];
  });
};
