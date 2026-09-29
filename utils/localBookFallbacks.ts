import type { Language } from '../contexts/LanguageContext';
import { book as dieWithZero } from '../scripts/library/die-with-zero';
import { book as dailyTradingCoach } from '../scripts/library/the-daily-trading-coach';
import { book as thinkAndTradeLikeAChampion } from '../scripts/library/think-and-trade-like-a-champion';
import { book as scienceOfScaling } from '../scripts/library/the-science-of-scaling';
import { book as weinsteinSecrets } from '../scripts/library/secrets-for-profiting-in-bull-and-bear-markets';
import { book as neverSplitTheDifference } from '../scripts/library/never-split-the-difference';
import { book as psychoCybernetics } from '../scripts/library/psycho-cybernetics';
import { book as situated } from '../scripts/library/situated';
import { book as unreasonableHospitality } from '../scripts/library/unreasonable-hospitality';
import { book as psychologyOfMoney } from '../scripts/library/the-psychology-of-money';
import { book as neverFinished } from '../scripts/library/never-finished';
import { book as alchemist } from '../scripts/library/the-alchemist';
import { book as fourAgreements } from '../scripts/library/the-four-agreements';
import { book as intelligentInvestor } from '../scripts/library/the-intelligent-investor';
import { book as lawsOfHumanNature } from '../scripts/library/the-laws-of-human-nature';
import { book as simplePathToWealth } from '../scripts/library/the-simple-path-to-wealth';
import { book as moneyModels } from '../scripts/library/100m-money-models';
import { book as brokenMoney } from '../scripts/library/broken-money';
import { book as findingUltra } from '../scripts/library/finding-ultra';
import { book as livingWithASeal } from '../scripts/library/living-with-a-seal';
import { book as alchemyOfFinance } from '../scripts/library/the-alchemy-of-finance';
import { book as blackSwan } from '../scripts/library/the-black-swan';
import { book as first90Days } from '../scripts/library/the-first-90-days';
import { book as offers } from '../scripts/library/100m-offers';
import { book as managingRentalProperties } from '../scripts/library/the-book-on-managing-rental-properties';
import { book as bestLoserWins } from '../scripts/library/best-loser-wins';
import { book as projectHailMary } from '../scripts/library/project-hail-mary';
import { book as chatgptMillionaire } from '../scripts/library/the-chatgpt-millionaire';
import { book as educated } from '../scripts/library/educated';
import { book as becoming } from '../scripts/library/becoming';
import { book as miracleMorning } from '../scripts/library/the-miracle-morning';
import { book as sapiens } from '../scripts/library/sapiens';
import { book as basicEconomics } from '../scripts/library/basic-economics';
import { book as blackRednecks } from '../scripts/library/black-rednecks-and-white-liberals';
import { book as mentalGame } from '../scripts/library/the-mental-game-of-trading';
import { book as dontBelieve } from '../scripts/library/dont-believe-everything-you-think';
import { book as askAndGiven } from '../scripts/library/ask-and-it-is-given';
import { book as technicalAnalysis } from '../scripts/library/technical-analysis-of-the-financial-markets';
import { book as competitionDemystified } from '../scripts/library/competition-demystified';
import { book as rentalInvesting } from '../scripts/library/the-book-on-rental-property-investing';
import { book as buffettsStrategy } from '../scripts/library/buffetts-2-step-stock-market-strategy';
import { book as cantHurtMe } from '../scripts/library/cant-hurt-me';
import { book as masteringTradingPsychology } from '../scripts/library/mastering-trading-psychology';
import { book as technicalMasterclass } from '../scripts/library/trading-technical-analysis-masterclass';
import { book as beLessZombie } from '../scripts/library/be-less-zombie';
import { book as oneUpOnWallStreet } from '../scripts/library/one-up-on-wall-street';
import { book as totalMoneyMakeover } from '../scripts/library/the-total-money-makeover';
import { book as stockMarketWizard } from '../scripts/library/trade-like-a-stock-market-wizard';
import { book as becomingSupernatural } from '../scripts/library/becoming-supernatural';
import { book as marketWizards } from '../scripts/library/market-wizards';
import { book as playbook } from '../scripts/library/the-playbook';
import { book as bestYearEver } from '../scripts/library/your-best-year-ever';
import { book as disciplinedTrader } from '../scripts/library/the-disciplined-trader';
import { book as dune } from '../scripts/library/dune';
import { book as darvas } from '../scripts/library/how-i-made-2000000-in-the-stock-market';
import { book as strategiesOfWar } from '../scripts/library/the-33-strategies-of-war';
import { book as winFriends } from '../scripts/library/how-to-win-friends-and-influence-people';
import { book as millionaireMind } from '../scripts/library/secrets-of-the-millionaire-mind';
import { book as tradeInStocks } from '../scripts/library/how-to-trade-in-stocks';
import { book as influence } from '../scripts/library/influence';
import { book as teachYouRich } from '../scripts/library/i-will-teach-you-to-be-rich';
import { book as profitFirst } from '../scripts/library/profit-first';
import { book as powerOfOneMore } from '../scripts/library/the-power-of-one-more';
import { book as noLowMoneyDown } from '../scripts/library/the-book-on-investing-in-real-estate-with-no-and-low-money-down';
import { book as richestMan } from '../scripts/library/the-richest-man-in-babylon';
import { book as reminiscences } from '../scripts/library/reminiscences-of-a-stock-operator';
import { book as miracleEquation } from '../scripts/library/the-miracle-equation';
import { book as scienceSelfDiscipline } from '../scripts/library/the-science-of-self-discipline';
import { book as zenTrader } from '../scripts/library/the-zen-trader';
import { book as thinkGrowRich } from '../scripts/library/think-and-grow-rich';
import { book as signs } from '../scripts/library/signs';
import { book as sevenHabits } from '../scripts/library/the-7-habits-of-highly-effective-people';
import { book as commonSenseInvesting } from '../scripts/library/the-little-book-of-common-sense-investing';
import { book as manifest } from '../scripts/library/manifest';
import { book as fiveSecondRule } from '../scripts/library/the-5-second-rule';
import { book as randomWalk } from '../scripts/library/a-random-walk-down-wall-street';
import { book as tradingLiving } from '../scripts/library/trading-for-a-living';
import { book as unfukYourself } from '../scripts/library/unfuk-yourself';
import { book as highPerformance } from '../scripts/library/high-performance-habits';
import { book as letThem } from '../scripts/library/the-let-them-theory';
import { book as beginnerStockMarket } from '../scripts/library/a-beginners-guide-to-the-stock-market';
import { book as dayTradeLiving } from '../scripts/library/how-to-day-trade-for-a-living';
import { book as lawsPower } from '../scripts/library/the-48-laws-of-power';
import { book as littleBeatsMarket } from '../scripts/library/the-little-book-that-still-beats-the-market';
import { book as tractionEOS } from '../scripts/library/traction';
import { book as mountainYou } from '../scripts/library/the-mountain-is-you';
import { book as leadingChange } from '../scripts/library/leading-change';
import { book as endureHanes } from '../scripts/library/endure';
import { book as oneGoodTrade } from '../scripts/library/one-good-trade';
import { book as moneyMasterGame } from '../scripts/library/money-master-the-game';
import { book as motivationManifesto } from '../scripts/library/the-motivation-manifesto';
import { book as relentlessGrover } from '../scripts/library/relentless';
import { book as courageDisliked } from '../scripts/library/the-courage-to-be-disliked';
import { book as fourHourWorkweek } from '../scripts/library/the-4-hour-workweek';
import { book as subtleArt } from '../scripts/library/the-subtle-art-of-not-giving-a-f';
import { book as americasBank } from '../scripts/library/americas-bank';
import { book as brainwashedGut } from '../scripts/library/brainwashed-by-your-gut';
import { book as wayOfMen } from '../scripts/library/the-way-of-men';
import { book as essays101 } from '../scripts/library/101-essays-that-will-change-the-way-you-think';
import { book as confidenceCode } from '../scripts/library/the-confidence-code';
import { book as indistractableBook } from '../scripts/library/indistractable';
import { book as deepWorkBook } from '../scripts/library/deep-work';
import { book as dieWithZeroBook } from '../scripts/library/die-with-zero';
import { book as neverSplitBook } from '../scripts/library/never-split-the-difference';
import { book as psychoCyberneticsBook } from '../scripts/library/psycho-cybernetics';
import { book as weinsteinBook } from '../scripts/library/secrets-for-profiting-in-bull-and-bear-markets';
import { book as dailyCoachBook } from '../scripts/library/the-daily-trading-coach';
import { book as scienceScalingBook } from '../scripts/library/the-science-of-scaling';
import { book as tradeChampionBook } from '../scripts/library/think-and-trade-like-a-champion';
import { book as hospitalityBook } from '../scripts/library/unreasonable-hospitality';
import type { Book, SummaryData } from '../types';
import { STARTER_BOOKS } from './starterBooks';

const ADDITIONAL_TRANSLATED_BOOKS = [neverFinished, alchemist, fourAgreements, intelligentInvestor, lawsOfHumanNature, simplePathToWealth, moneyModels, brokenMoney, findingUltra, livingWithASeal, alchemyOfFinance, blackSwan, first90Days, offers, managingRentalProperties, bestLoserWins, projectHailMary, chatgptMillionaire, educated, becoming, miracleMorning, sapiens, basicEconomics, blackRednecks, mentalGame, dontBelieve, askAndGiven, technicalAnalysis, competitionDemystified, rentalInvesting, buffettsStrategy, cantHurtMe, masteringTradingPsychology, technicalMasterclass, beLessZombie, oneUpOnWallStreet, totalMoneyMakeover, stockMarketWizard, becomingSupernatural, marketWizards, playbook, bestYearEver, disciplinedTrader, dune, darvas, strategiesOfWar, winFriends, millionaireMind, tradeInStocks, influence, teachYouRich, profitFirst, powerOfOneMore, noLowMoneyDown, richestMan, reminiscences, miracleEquation, scienceSelfDiscipline, zenTrader, thinkGrowRich, signs, sevenHabits, commonSenseInvesting, manifest, fiveSecondRule, randomWalk, tradingLiving, unfukYourself, highPerformance, letThem, beginnerStockMarket, dayTradeLiving, lawsPower, littleBeatsMarket, tractionEOS, mountainYou, leadingChange, endureHanes, oneGoodTrade, moneyMasterGame, motivationManifesto, relentlessGrover, courageDisliked, fourHourWorkweek, subtleArt, americasBank, brainwashedGut, wayOfMen, essays101, confidenceCode, indistractableBook, deepWorkBook, dieWithZeroBook, neverSplitBook, psychoCyberneticsBook, weinsteinBook, dailyCoachBook, scienceScalingBook, tradeChampionBook, hospitalityBook];

const situatedMetadata: Book = {
  id: situated.id,
  title: situated.title,
  author: situated.author,
  coverImageUrl: situated.coverImageUrl,
  category: situated.category,
  rating: situated.rating,
  ratingsCount: situated.ratingsCount,
  publicationYear: situated.publicationYear,
  pageCount: situated.pageCount,
  arabicSlug: situated.arabicSlug,
  amazonUrl: situated.amazonUrl,
  kindleUrl: situated.kindleUrl,
  audibleUrl: situated.audibleUrl,
};

const psychoCyberneticsMetadata: Book = {
  id: psychoCybernetics.id,
  title: psychoCybernetics.title,
  author: psychoCybernetics.author,
  coverImageUrl: psychoCybernetics.coverImageUrl,
  category: psychoCybernetics.category,
  rating: psychoCybernetics.rating,
  ratingsCount: psychoCybernetics.ratingsCount,
  publicationYear: psychoCybernetics.publicationYear,
  pageCount: psychoCybernetics.pageCount,
  arabicSlug: psychoCybernetics.arabicSlug,
  amazonUrl: psychoCybernetics.amazonUrl,
  kindleUrl: psychoCybernetics.kindleUrl,
  audibleUrl: psychoCybernetics.audibleUrl,
};

const dieWithZeroMetadata: Book = {
  id: dieWithZero.id,
  title: dieWithZero.title,
  author: dieWithZero.author,
  coverImageUrl: dieWithZero.coverImageUrl,
  category: dieWithZero.category,
  rating: dieWithZero.rating,
  ratingsCount: dieWithZero.ratingsCount,
  publicationYear: dieWithZero.publicationYear,
  pageCount: dieWithZero.pageCount,
  arabicSlug: dieWithZero.arabicSlug,
  amazonUrl: dieWithZero.amazonUrl,
  kindleUrl: dieWithZero.kindleUrl,
  audibleUrl: dieWithZero.audibleUrl,
};

const neverSplitTheDifferenceMetadata: Book = {
  id: neverSplitTheDifference.id,
  title: neverSplitTheDifference.title,
  author: neverSplitTheDifference.author,
  coverImageUrl: neverSplitTheDifference.coverImageUrl,
  category: neverSplitTheDifference.category,
  rating: neverSplitTheDifference.rating,
  ratingsCount: neverSplitTheDifference.ratingsCount,
  publicationYear: neverSplitTheDifference.publicationYear,
  pageCount: neverSplitTheDifference.pageCount,
  arabicSlug: neverSplitTheDifference.arabicSlug,
  amazonUrl: neverSplitTheDifference.amazonUrl,
  kindleUrl: neverSplitTheDifference.kindleUrl,
  audibleUrl: neverSplitTheDifference.audibleUrl,
};

const unreasonableHospitalityMetadata: Book = {
  id: unreasonableHospitality.id,
  title: unreasonableHospitality.title,
  author: unreasonableHospitality.author,
  coverImageUrl: unreasonableHospitality.coverImageUrl,
  category: unreasonableHospitality.category,
  rating: unreasonableHospitality.rating,
  ratingsCount: unreasonableHospitality.ratingsCount,
  publicationYear: unreasonableHospitality.publicationYear,
  pageCount: unreasonableHospitality.pageCount,
  arabicSlug: unreasonableHospitality.arabicSlug,
  amazonUrl: unreasonableHospitality.amazonUrl,
  kindleUrl: unreasonableHospitality.kindleUrl,
  audibleUrl: unreasonableHospitality.audibleUrl,
};

const LOCAL_BOOK_FALLBACKS: Book[] = [
  ...[dailyTradingCoach, thinkAndTradeLikeAChampion, scienceOfScaling, weinsteinSecrets].map((book): Book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    category: book.category,
    publicationYear: book.publicationYear,
    pageCount: book.pageCount,
    arabicSlug: book.arabicSlug,
    amazonUrl: book.amazonUrl,
    kindleUrl: book.kindleUrl,
    audibleUrl: book.audibleUrl,
  })),
  ...STARTER_BOOKS,
  ...ADDITIONAL_TRANSLATED_BOOKS.map(({ summary, keyTakeaways, translations, ...metadata }) => metadata),
  dieWithZeroMetadata,
  neverSplitTheDifferenceMetadata,
  psychoCyberneticsMetadata,
  situatedMetadata,
  unreasonableHospitalityMetadata,
];

const LOCAL_SUMMARIES = new Map<string, SummaryData>([
  [scienceOfScaling.id, { summary: scienceOfScaling.summary, keyTakeaways: scienceOfScaling.keyTakeaways }],
  [weinsteinSecrets.id, { summary: weinsteinSecrets.summary, keyTakeaways: weinsteinSecrets.keyTakeaways }],
  [dailyTradingCoach.id, { summary: dailyTradingCoach.summary, keyTakeaways: dailyTradingCoach.keyTakeaways }],
  [thinkAndTradeLikeAChampion.id, { summary: thinkAndTradeLikeAChampion.summary, keyTakeaways: thinkAndTradeLikeAChampion.keyTakeaways }],
  ...ADDITIONAL_TRANSLATED_BOOKS.map(book => [book.id, { summary: book.summary, keyTakeaways: book.keyTakeaways }] as [string, SummaryData]),
  [psychologyOfMoney.id, { summary: psychologyOfMoney.summary, keyTakeaways: psychologyOfMoney.keyTakeaways }],
  [
    unreasonableHospitality.id,
    {
      summary: unreasonableHospitality.summary,
      keyTakeaways: unreasonableHospitality.keyTakeaways,
    },
  ],
  [
    dieWithZero.id,
    {
      summary: dieWithZero.summary,
      keyTakeaways: dieWithZero.keyTakeaways,
    },
  ],
  [
    neverSplitTheDifference.id,
    {
      summary: neverSplitTheDifference.summary,
      keyTakeaways: neverSplitTheDifference.keyTakeaways,
    },
  ],
  [
    psychoCybernetics.id,
    {
      summary: psychoCybernetics.summary,
      keyTakeaways: psychoCybernetics.keyTakeaways,
    },
  ],
  [
    situated.id,
    {
      summary: situated.summary,
      keyTakeaways: situated.keyTakeaways,
    },
  ],
]);

export function mergeBooksWithLocalFallbacks(firestoreBooks: Book[]): Book[] {
  const merged = new Map(LOCAL_BOOK_FALLBACKS.map((book) => [book.id, book]));

  firestoreBooks.forEach((book) => merged.set(book.id, book));

  return Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export function getLocalBookSummary(bookId: string, language: Language): SummaryData | null {
  if (language !== 'en') return null;

  return LOCAL_SUMMARIES.get(bookId) ?? null;
}
