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
    amazon: 'https://link.amazon/B0gxXWgZL',
    kindle: 'https://link.amazon/B0bLauC5q',
    audible: 'https://link.amazon/B04la00Rc',
  },
  'trading-in-the-zone': {
    amazon: 'https://link.amazon/B0cQK8a9W',
    kindle: 'https://link.amazon/B0g7qLQve',
  },
  'the-intelligent-investor': {
    amazon: 'https://link.amazon/B0b5VsNVp',
    kindle: 'https://link.amazon/B0bSUnxhF',
    audible: 'https://link.amazon/B07wplSg0',
  },
  educated: {
    amazon: 'https://link.amazon/B0j9o7mIb',
    kindle: 'https://link.amazon/B002NRCIN',
    audible: 'https://link.amazon/B00xiVOA7',
  },
  marketwizards: {
    amazon: 'https://link.amazon/B04iP0SQC',
    kindle: 'https://link.amazon/B0dgWBUMg',
  },
  'best-loser-wins': {
    amazon: 'https://link.amazon/B0ewbeYG3',
    kindle: 'https://link.amazon/B08KQPcJO',
    audible: 'https://link.amazon/B0eJfqDQ8',
  },
  becoming: {
    amazon: 'https://link.amazon/B07xkYF6I',
    kindle: 'https://link.amazon/B06yrMiLK',
    audible: 'https://link.amazon/B0ih7CY01',
  },
  'atomic-habits': {
    amazon: 'https://link.amazon/B07Z4Mby9',
    kindle: 'https://link.amazon/B09U4kcyD',
    audible: 'https://link.amazon/B07Hhl4R8',
  },
  'broken-money': {
    amazon: 'https://link.amazon/B0dWsjm1J',
    kindle: 'https://link.amazon/B0fjza9Ec',
    audible: 'https://link.amazon/B03eO9cZA',
  },
  sapiens: {
    amazon: 'https://link.amazon/B0iMrUKhE',
    kindle: 'https://link.amazon/B01I86ldM',
    audible: 'https://link.amazon/B09vu3VL5',
  },
  'thinking-fast-and-slow': {
    amazon: 'https://link.amazon/B05bezPev',
    kindle: 'https://link.amazon/B0eTsZfuY',
    audible: 'https://link.amazon/B07Fp3aI7',
  },
  'the-alchemist': {
    amazon: 'https://link.amazon/B05WjglgS',
    kindle: 'https://link.amazon/B03ByO5ZR',
    audible: 'https://link.amazon/B0ffltRLl',
  },
  'the-four-agreements': {
    amazon: 'https://link.amazon/B0fKTakMG',
    kindle: 'https://link.amazon/B0178xyZK',
    audible: 'https://link.amazon/B007r9XvI',
  },
  dune: {
    amazon: 'https://link.amazon/B07byoZDh',
    kindle: 'https://link.amazon/B04PntysP',
    audible: 'https://link.amazon/B05xlkYbp',
  },
  'project-hail-mary': {
    amazon: 'https://link.amazon/B0hXTbJIf',
    kindle: 'https://link.amazon/B0fchFcXR',
    audible: 'https://link.amazon/B01M5uzrd',
  },
  'rich-dad-poor-dad': {
    amazon: 'https://link.amazon/B0gZF8L5Q',
    kindle: 'https://link.amazon/B0hQz33te',
    audible: 'https://link.amazon/B058bMtxO',
  },
  'americas-bank': {
    amazon: 'https://link.amazon/B05Os9lve',
    kindle: 'https://link.amazon/B0b37Tzhk',
    audible: 'https://link.amazon/B06guwNrH',
  },
  the33strategiesofwar: {
    amazon: 'https://link.amazon/B067pEd6L',
    kindle: 'https://link.amazon/B07SdaKmB',
    audible: 'https://link.amazon/B06KOxRLB',
  },
  belesszombie: {
    amazon: 'https://link.amazon/B09pP3D6H',
    kindle: 'https://link.amazon/B0ajCRpuk',
  },
  howtodaytradeforaliving: {
    amazon: 'https://link.amazon/B062GweDb',
    kindle: 'https://link.amazon/B0dAAAjD9',
    audible: 'https://link.amazon/B09jWiikE',
  },
  the48lawsofpower: {
    amazon: 'https://link.amazon/B0c5c8zHF',
    kindle: 'https://link.amazon/B09J92TGm',
    audible: 'https://link.amazon/B0e9ruxLK',
  },
  secretsofthemillionairemind: {
    amazon: 'https://link.amazon/B0dcjjPBS',
    kindle: 'https://link.amazon/B0fw8wFLE',
    audible: 'https://link.amazon/B08MKaizU',
  },
  relentless: {
    amazon: 'https://link.amazon/B0a46brzF',
    kindle: 'https://link.amazon/B0cZskrJ6',
    audible: 'https://link.amazon/B0hd2oDgC',
  },
  'one-good-trade': {
    amazon: 'https://link.amazon/B01pnyQWj',
    kindle: 'https://link.amazon/B04MEorA8',
    audible: 'https://link.amazon/B0dXVgMIu',
  },
  'cant-hurt-me': {
    amazon: 'https://link.amazon/B0eQIxtFR',
    kindle: 'https://link.amazon/B0g6zF9VK',
    audible: 'https://link.amazon/B041ETZRN',
  },
  'the-alchemy-of-finance': {
    amazon: 'https://link.amazon/B00xLdcsr',
    audible: 'https://link.amazon/B0i9042wz',
  },
  'competition-demystified': {
    amazon: 'https://link.amazon/B0fWp0QD1',
    kindle: 'https://link.amazon/B085HBrEr',
    audible: 'https://link.amazon/B01vXoMIW',
  },
  'the-4-hour-workweek': {
    amazon: 'https://link.amazon/B06OoZ7W3',
    kindle: 'https://link.amazon/B08nNJ5F0',
    audible: 'https://link.amazon/B062kPjHV',
  },
  'the-4-hour-work-week': {
    amazon: 'https://link.amazon/B06OoZ7W3',
    kindle: 'https://link.amazon/B08nNJ5F0',
    audible: 'https://link.amazon/B062kPjHV',
  },
  'the-black-swan': {
    amazon: 'https://link.amazon/B09pzk2TT',
    kindle: 'https://link.amazon/B00hmn6ab',
    audible: 'https://link.amazon/B03DNR30b',
  },
  'the-chatgpt-millionaire': {
    amazon: 'https://link.amazon/B01OLJcKn',
    kindle: 'https://link.amazon/B0foVpJxW',
    audible: 'https://link.amazon/B0bUoKQrZ',
  },
  'the-first-90-days': {
    amazon: 'https://link.amazon/B0b0vNI10',
    kindle: 'https://link.amazon/B09nZErUE',
    audible: 'https://link.amazon/B00zV2MlX',
  },
  'leading-change': {
    amazon: 'https://link.amazon/B08jFiHBx',
    kindle: 'https://link.amazon/B01IotMNv',
    audible: 'https://link.amazon/B071AIYJg',
  },
  'i-will-teach-you-to-be-rich': {
    amazon: 'https://link.amazon/B0b2P0sF3',
    kindle: 'https://link.amazon/B0hI6OAQY',
    audible: 'https://link.amazon/B0hkBPERj',
  },
  'money-master-the-game': {
    amazon: 'https://link.amazon/B0gQw1VUr',
    kindle: 'https://link.amazon/B09c8IGS8',
    audible: 'https://link.amazon/B0dSdzCSw',
  },
  'the-7-habits-of-highly-effective-people': {
    amazon: 'https://link.amazon/B0auU76SR',
    kindle: 'https://link.amazon/B08duRADY',
    audible: 'https://link.amazon/B0bhFvAIg',
  },
  'how-to-win-friends-and-influence-people': {
    amazon: 'https://link.amazon/B07soJDKk',
    kindle: 'https://link.amazon/B0jj4fwC3',
    audible: 'https://link.amazon/B08UiaGEO',
  },
  'influence-the-psychology-of-persuasion': {
    amazon: 'https://link.amazon/B0bgb9dNa',
    kindle: 'https://link.amazon/B0dql1vLt',
    audible: 'https://link.amazon/B0hMgeJLw',
  },
  'a-random-walk-down-wall-street': {
    amazon: 'https://link.amazon/B05JvZ9vs',
    audible: 'https://link.amazon/B05wmxs0E',
  },
  'the-simple-path-to-wealth': {
    amazon: 'https://link.amazon/B04xqckA5',
    kindle: 'https://link.amazon/B0grp9Ii4',
    audible: 'https://link.amazon/B00aW9anz',
  },
  'basic-economics': {
    amazon: 'https://link.amazon/B0bM18t7i',
    kindle: 'https://link.amazon/B07IkG2D7',
    audible: 'https://link.amazon/B0hHX3M6S',
  },
  'black-rednecks-and-white-liberals': {
    amazon: 'https://link.amazon/B0gvlFjYg',
    kindle: 'https://link.amazon/B0bU6L14L',
    audible: 'https://link.amazon/B085eu3Q3',
  },
  'how-to-trade-in-stocks': {
    amazon: 'https://link.amazon/B0eDJgUGl',
    kindle: 'https://link.amazon/B06b5b2VD',
    audible: 'https://link.amazon/B08IklGMr',
  },
  'one-up-on-wall-street': {
    amazon: 'https://link.amazon/B0fqjsgm9',
    kindle: 'https://link.amazon/B045aay5p',
    audible: 'https://link.amazon/B09SdwtPb',
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
