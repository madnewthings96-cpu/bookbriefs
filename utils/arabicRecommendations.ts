import { arabicBookSummaries } from '../translations/arabicBookSummaries';
import { mergeBooksWithLocalFallbacks } from './localBookFallbacks';
import { arabicCategoryNames } from './bookLocales';
import { stripSummaryMarkdown } from '../components/summaryReadingModel';

// Editorial topic connections supplement the catalog's broad categories.
const topics = [
  { reason: 'لبناء عادات تدعم التركيز والإنجاز', ids: ['atomic-habits', 'indistractable', 'deep-work', 'high-performance-habits', 'the-7-habits-of-highly-effective-people', 'the-science-of-self-discipline', 'the-miracle-morning', 'the-5-second-rule', 'your-best-year-ever', 'the-power-of-one-more', 'the-miracle-equation', 'the-4-hour-workweek'] },
  { reason: 'لفهم علاقتك بالمال وبناء ثروة مستدامة', ids: ['the-psychology-of-money', 'die-with-zero', 'the-simple-path-to-wealth', 'i-will-teach-you-to-be-rich', 'the-richest-man-in-babylon', 'the-total-money-makeover', 'rich-dad-poor-dad', 'money-master-the-game', 'secrets-of-the-millionaire-mind', 'think-and-grow-rich'] },
  { reason: 'لتوسيع فهمك للاستثمار وأسواق الأسهم', ids: ['the-intelligent-investor', 'the-little-book-of-common-sense-investing', 'a-random-walk-down-wall-street', 'one-up-on-wall-street', 'the-little-book-that-still-beats-the-market', 'buffetts-2-step-stock-market-strategy', 'a-beginners-guide-to-the-stock-market', 'the-simple-path-to-wealth'] },
  { reason: 'لفهم الانفعالات والانضباط في التداول', ids: ['trading-in-the-zone', 'the-disciplined-trader', 'best-loser-wins', 'the-mental-game-of-trading', 'mastering-trading-psychology', 'the-daily-trading-coach', 'the-zen-trader', 'one-good-trade', 'the-playbook', 'market-wizards'] },
  { reason: 'لدراسة أساليب التداول وإدارة المخاطرة', ids: ['technical-analysis-of-the-financial-markets', 'trading-technical-analysis-masterclass', 'trade-like-a-stock-market-wizard', 'think-and-trade-like-a-champion', 'secrets-for-profiting-in-bull-and-bear-markets', 'how-i-made-2000000-in-the-stock-market', 'how-to-trade-in-stocks', 'reminiscences-of-a-stock-operator', 'trading-for-a-living', 'how-to-day-trade-for-a-living', 'the-alchemy-of-finance', 'market-wizards'] },
  { reason: 'لفهم المخاطرة والتحيزات وراء القرارات', ids: ['thinking-fast-and-slow', 'the-black-swan', 'the-psychology-of-money', 'the-laws-of-human-nature', 'influence', 'the-alchemy-of-finance'] },
  { reason: 'لتطوير التواصل والتفاوض وفهم الآخرين', ids: ['never-split-the-difference', 'how-to-win-friends-and-influence-people', 'influence', 'the-laws-of-human-nature', 'the-confidence-code', 'the-courage-to-be-disliked', 'the-four-agreements'] },
  { reason: 'لتطوير الأعمال والعروض وتجربة العملاء', ids: ['100m-offers', '100m-money-models', 'the-science-of-scaling', 'traction', 'profit-first', 'unreasonable-hospitality', 'competition-demystified', 'the-chatgpt-millionaire', 'the-4-hour-workweek'] },
  { reason: 'لفهم القيادة وبناء فرق تتقبل التغيير', ids: ['leading-change', 'the-first-90-days', 'traction', 'unreasonable-hospitality', 'the-science-of-scaling', 'the-7-habits-of-highly-effective-people'] },
  { reason: 'لاستكشاف الاستثمار العقاري وإدارة الإيجارات', ids: ['the-book-on-rental-property-investing', 'the-book-on-managing-rental-properties', 'the-book-on-investing-in-real-estate-with-no-and-low-money-down', 'rich-dad-poor-dad'] },
  { reason: 'لاستكشاف المثابرة وتجاوز الحدود الشخصية', ids: ['cant-hurt-me', 'never-finished', 'endure', 'finding-ultra', 'living-with-a-seal', 'relentless', 'the-motivation-manifesto', 'the-power-of-one-more'] },
  { reason: 'لفهم الذات وإعادة النظر في أنماط التفكير', ids: ['the-mountain-is-you', '101-essays-that-will-change-the-way-you-think', 'dont-believe-everything-you-think', 'psycho-cybernetics', 'the-subtle-art-of-not-giving-a-f', 'unfuk-yourself', 'the-let-them-theory', 'the-courage-to-be-disliked', 'the-confidence-code', 'be-less-zombie', 'situated'] },
  { reason: 'لاستكشاف المعنى والمعتقدات والتغيير الشخصي', ids: ['manifest', 'signs', 'ask-and-it-is-given', 'becoming-supernatural', 'the-four-agreements', 'the-alchemist'] },
  { reason: 'لفهم المال والمؤسسات في سياق أوسع', ids: ['broken-money', 'americas-bank', 'basic-economics', 'sapiens', 'black-rednecks-and-white-liberals', 'the-black-swan'] },
  { reason: 'لقراءة تجارب شخصية عن الهوية والتحول', ids: ['educated', 'becoming', 'finding-ultra', 'never-finished', 'cant-hurt-me'] },
  { reason: 'لاستكشاف عوالم روائية وأسئلة إنسانية', ids: ['dune', 'project-hail-mary', 'the-alchemist'] },
  { reason: 'لفهم القوة والصراع والسلوك الاجتماعي', ids: ['the-48-laws-of-power', 'the-33-strategies-of-war', 'the-laws-of-human-nature', 'the-way-of-men', 'influence'] },
];
const categoryFamilies = [
  ['Self-Help', 'Personal Development', 'Psychology', 'Spirituality'],
  ['Finance', 'Economics', 'Trading', 'Business'],
  ['Business', 'Leadership'],
  ['Biography', 'Sociology'],
];
const bookReasons: Record<string, string> = {
  'atomic-habits': 'لتحويل التغييرات الصغيرة إلى عادات تدوم',
  'indistractable': 'لحماية انتباهك وبناء بيئة تدعم عاداتك',
  'deep-work': 'لتخصيص وقت بلا مقاطعات للمهام التي تتطلب تفكيراً عميقاً',
  'high-performance-habits': 'لربط الوضوح والطاقة بعادات الأداء اليومي',
  'the-7-habits-of-highly-effective-people': 'لربط عاداتك اليومية بقيمك وأولوياتك',
  'the-5-second-rule': 'للانتقال من التردد إلى خطوة عملية',
  'the-miracle-equation': 'لتحويل الأهداف إلى جهد مستمر قابل للمراجعة',
  'the-miracle-morning': 'لبناء روتين صباحي يمنح يومك اتجاهاً',
  'the-science-of-self-discipline': 'لفهم الانضباط وتصميم ممارسة تستمر',
  'your-best-year-ever': 'لصياغة أهداف واضحة وخطة للمتابعة',
  'the-power-of-one-more': 'لاستكشاف أثر المحاولة الإضافية في التقدم',
  'the-psychology-of-money': 'لفهم السلوك الذي يشكل قراراتك المالية',
  'die-with-zero': 'لموازنة الادخار مع الوقت والتجارب المهمة',
  'the-simple-path-to-wealth': 'لفهم الاستقلال المالي والاستثمار البسيط',
  'i-will-teach-you-to-be-rich': 'لتنظيم الادخار والإنفاق في نظام عملي',
  'the-richest-man-in-babylon': 'لاستكشاف مبادئ الادخار عبر حكايات مالية',
  'the-total-money-makeover': 'لفهم خطة منظمة للتعامل مع الديون',
  'trading-in-the-zone': 'لفهم الاحتمالات والانفعالات أثناء التداول',
  'the-disciplined-trader': 'لبناء قواعد تحمي قراراتك تحت الضغط',
  'best-loser-wins': 'لفهم التعامل مع الخسارة دون قرارات انتقامية',
  'the-mental-game-of-trading': 'لتتبع أنماط الخوف والطمع وإصلاح أسبابها',
  'the-daily-trading-coach': 'لتحويل سجل التداول إلى أداة تعلم يومية',
  'never-split-the-difference': 'لتطوير الإنصات والتفاوض على اتفاق واضح',
  'unreasonable-hospitality': 'لتحويل الخدمة الجيدة إلى اهتمام شخصي',
};
const books = mergeBooksWithLocalFallbacks([]);

export function getArabicRecommendations(bookId: string) {
  const current = books.find(book => book.id === bookId);
  if (!current || !arabicBookSummaries[bookId]) return [];
  const currentTopics = topics.filter(topic => topic.ids.includes(bookId));
  return books.filter(book => book.id !== bookId && arabicBookSummaries[book.id]).map(book => {
    const shared = currentTopics.filter(topic => topic.ids.includes(book.id));
    const sameCategory = book.category === current.category;
    const nearbyCategory = categoryFamilies.some(family => family.includes(current.category) && family.includes(book.category));
    const translation = arabicBookSummaries[book.id];
    return {
      book,
      translation,
      score: shared.length * 100 + (book.author === current.author ? 30 : 0) + (sameCategory ? 20 : nearbyCategory ? 5 : 0),
      reason: (shared.length > 0 ? bookReasons[book.id] : undefined) || shared[0]?.reason || (sameCategory ? `قراءة أخرى في ${arabicCategoryNames[book.category] || 'الموضوع نفسه'}` : nearbyCategory ? 'زاوية أخرى لمواصلة استكشاف الموضوع' : 'اكتشف موضوعاً جديداً في مكتبتك'),
      minutes: Math.max(3, Math.ceil(stripSummaryMarkdown(translation.summary).split(/\s+/).filter(Boolean).length / 220)),
    };
  }).sort((a, b) => b.score - a.score || a.book.id.localeCompare(b.book.id)).slice(0, 6);
}
