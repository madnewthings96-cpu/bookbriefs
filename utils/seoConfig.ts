export const SITE_URL = 'https://ta7leel.site';
export const BRAND_NAME = 'Ta7leel | تحليل';
export const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

export interface CategoryHub {
  slug: string;
  category: string;
  englishTitle: string;
  englishDescription: string;
  englishKeywords: string;
  arabicTitle: string;
  arabicDescription: string;
  arabicKeywords: string;
}

export const CATEGORY_HUBS: CategoryHub[] = [
  {
    slug: 'trading-books',
    category: 'Trading',
    englishTitle: 'Trading Book Summaries',
    englishDescription:
      'Read practical summaries of the best trading books, including trading psychology, technical analysis, risk management, and market discipline.',
    englishKeywords:
      'trading book summaries, trading psychology books, technical analysis books, trading books, market psychology',
    arabicTitle: 'ملخصات كتب التداول',
    arabicDescription:
      'اكتشف ملخصات عملية لأفضل كتب التداول، سيكولوجية التداول، التحليل الفني، إدارة المخاطر، والانضباط في الأسواق.',
    arabicKeywords:
      'ملخصات كتب التداول, كتب سيكولوجية التداول, كتب التحليل الفني, كتب إدارة المخاطر, التداول',
  },
  {
    slug: 'investing-books',
    category: 'Finance',
    englishTitle: 'Investing Book Summaries',
    englishDescription:
      'Explore summaries of investing and personal finance books covering wealth building, compounding, value investing, and financial independence.',
    englishKeywords:
      'investing book summaries, finance book summaries, personal finance books, wealth building books, investing books',
    arabicTitle: 'ملخصات كتب الاستثمار والمال',
    arabicDescription:
      'ملخصات لأهم كتب الاستثمار والمال وبناء الثروة، من الاستثمار القيمي إلى الحرية المالية والفائدة المركبة.',
    arabicKeywords:
      'ملخصات كتب الاستثمار, ملخصات كتب المال, كتب الحرية المالية, كتب بناء الثروة, كتب التمويل الشخصي',
  },
  {
    slug: 'business-books',
    category: 'Business',
    englishTitle: 'Business Book Summaries',
    englishDescription:
      'Learn the main ideas from top business books about entrepreneurship, strategy, leadership, marketing, and execution.',
    englishKeywords:
      'business book summaries, entrepreneurship book summaries, strategy books, leadership books, startup books',
    arabicTitle: 'ملخصات كتب الأعمال وريادة الأعمال',
    arabicDescription:
      'اقرأ ملخصات كتب الأعمال وريادة الأعمال والاستراتيجية والقيادة، مع أفكار عملية قابلة للتطبيق.',
    arabicKeywords:
      'ملخصات كتب الأعمال, كتب ريادة الأعمال, كتب الإدارة, كتب القيادة, كتب الشركات الناشئة',
  },
  {
    slug: 'self-development-books',
    category: 'Self-Help',
    englishTitle: 'Self-Development Book Summaries',
    englishDescription:
      'Discover summaries of self-development books about habits, discipline, confidence, productivity, and personal growth.',
    englishKeywords:
      'self development book summaries, self help book summaries, productivity books, habit books, personal growth books',
    arabicTitle: 'ملخصات كتب تطوير الذات',
    arabicDescription:
      'أفضل ملخصات كتب تطوير الذات والعادات والانضباط والإنتاجية والنمو الشخصي في مكان واحد.',
    arabicKeywords:
      'ملخصات كتب تطوير الذات, كتب تنمية بشرية, كتب العادات, كتب الإنتاجية, كتب الانضباط',
  },
  {
    slug: 'psychology-books',
    category: 'Psychology',
    englishTitle: 'Psychology Book Summaries',
    englishDescription:
      'Read summaries of psychology books about behavior, decision-making, human nature, confidence, and mental performance.',
    englishKeywords:
      'psychology book summaries, human behavior books, decision making books, mental performance books',
    arabicTitle: 'ملخصات كتب علم النفس والسلوك',
    arabicDescription:
      'ملخصات كتب علم النفس والسلوك البشري واتخاذ القرار والثقة والأداء الذهني.',
    arabicKeywords:
      'ملخصات كتب علم النفس, كتب السلوك البشري, كتب اتخاذ القرار, كتب الأداء الذهني',
  },
];

export const CALCULATOR_ROUTES = [
  {
    path: '/calculators',
    title: 'Free Trading and Financial Calculators',
    description:
      'Use free calculators for position sizing, pip value, FIRE planning, and compound interest.',
  },
  {
    path: '/calculators/pip-value',
    title: 'Pip Value Calculator',
    description:
      'Calculate pip value for forex and trading positions with a simple free calculator.',
  },
  {
    path: '/calculators/position-size',
    title: 'Position Size Calculator',
    description:
      'Calculate trade position size based on account balance, risk percentage, stop loss, and pip value.',
  },
  {
    path: '/calculators/fire',
    title: 'FIRE Calculator',
    description:
      'Estimate your financial independence number and retirement timeline with a free FIRE calculator.',
  },
  {
    path: '/calculators/compound-interest',
    title: 'Compound Interest Calculator',
    description:
      'Calculate how investments can grow over time through compound interest.',
  },
];

