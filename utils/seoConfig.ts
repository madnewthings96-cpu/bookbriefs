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

export type CalculatorLanguage = 'en' | 'ar';
export type CalculatorTabId = 'positionSize' | 'pipValue' | 'fire' | 'compound';

export interface CalculatorFaq {
  question: string;
  answer: string;
}

export interface CalculatorLink {
  label: string;
  path: string;
}

export interface CalculatorRoute {
  path: string;
  language: CalculatorLanguage;
  tabId?: CalculatorTabId;
  title: string;
  h1: string;
  description: string;
  keywords: string;
  eyebrow: string;
  intro: string;
  formulaLabel: string;
  formula: string;
  exampleTitle: string;
  example: string;
  stepsTitle: string;
  steps: string[];
  mistakesTitle: string;
  mistakes: string[];
  faqTitle: string;
  faqs: CalculatorFaq[];
  relatedToolsTitle: string;
  relatedTools: CalculatorLink[];
  relatedSummariesTitle: string;
  relatedSummaries: CalculatorLink[];
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

export const CALCULATOR_ROUTES: CalculatorRoute[] = [
  {
    path: '/calculators',
    language: 'en',
    title: 'Free Trading and Financial Calculators | Ta7leel',
    h1: 'Free trading and financial calculators',
    description:
      'Use free calculators for position sizing, pip value, FIRE planning, and compound interest with practical examples for traders and long-term investors.',
    keywords:
      'trading calculators, financial calculators, position size calculator, pip value calculator, FIRE calculator, compound interest calculator',
    eyebrow: 'Free planning tools',
    intro:
      'Start with the number you need: trade risk, pip value, financial independence, or long-term compounding. Each calculator is paired with a plain-English formula and a worked example.',
    formulaLabel: 'Tool set',
    formula: 'Risk tools + planning tools = clearer money decisions',
    exampleTitle: 'How to use this page',
    example:
      'Choose the calculator that matches the decision in front of you. Traders usually start with position size, then confirm pip value. Investors usually start with compound interest or FIRE.',
    stepsTitle: 'Calculator workflow',
    steps: [
      'Pick the calculator for one specific decision.',
      'Enter conservative assumptions before testing optimistic scenarios.',
      'Save the result with your trade journal, investing notes, or book summary action plan.',
    ],
    mistakesTitle: 'Common mistakes',
    mistakes: [
      'Using a calculator result without checking the assumptions.',
      'Mixing trading risk tools with long-term investing projections.',
      'Treating estimates as guarantees instead of planning ranges.',
    ],
    faqTitle: 'Financial calculator FAQ',
    faqs: [
      {
        question: 'Are these calculators free?',
        answer: 'Yes. The trading and financial calculators on Ta7leel are free to use in your browser.',
      },
      {
        question: 'Which calculator should traders use first?',
        answer: 'Start with the position size calculator, then use the pip value calculator to understand how price movement affects the trade.',
      },
      {
        question: 'Which calculator should investors use first?',
        answer: 'Start with the compound interest calculator for growth scenarios or the FIRE calculator for financial independence planning.',
      },
    ],
    relatedToolsTitle: 'Popular calculators',
    relatedTools: [
      { label: 'Position size calculator', path: '/calculators/position-size' },
      { label: 'Pip value calculator', path: '/calculators/pip-value' },
      { label: 'Compound interest calculator', path: '/calculators/compound-interest' },
      { label: 'FIRE calculator', path: '/calculators/fire' },
    ],
    relatedSummariesTitle: 'Related book summaries',
    relatedSummaries: [
      { label: 'Trading for a Living summary', path: '/summary/trading-for-a-living' },
      { label: 'The Psychology of Money summary', path: '/summary/the-psychology-of-money' },
      { label: 'The Simple Path to Wealth summary', path: '/summary/the-simple-path-to-wealth' },
    ],
  },
  {
    path: '/calculators/pip-value',
    language: 'en',
    tabId: 'pipValue',
    title: 'Pip Value Calculator for Forex, Gold and JPY Pairs | Ta7leel',
    h1: 'Pip value calculator',
    description:
      'Calculate pip value for forex pairs, JPY pairs, and gold so you can understand how each pip or point changes your account risk.',
    keywords:
      'pip value calculator, forex pip value calculator, pip calculator, gold pip value calculator, XAUUSD pip value calculator, JPY pip value',
    eyebrow: 'Forex risk tool',
    intro:
      'A pip value calculator converts market movement into account currency. Use it before placing a trade so a 10-pip move, 20-pip move, or gold point move has a clear dollar value.',
    formulaLabel: 'Pip value formula',
    formula: 'Pip value x number of pips x lot size = trade movement value',
    exampleTitle: 'Example pip value calculation',
    example:
      'On EUR/USD, one standard lot is usually about $10 per pip. A 0.50 lot position moving 20 pips is about $100 of movement: $10 x 0.50 x 20.',
    stepsTitle: 'How to calculate pip value',
    steps: [
      'Choose the currency pair or gold symbol.',
      'Enter the number of pips or points you want to measure.',
      'Enter position size in lots.',
      'Review the result before setting risk or profit targets.',
    ],
    mistakesTitle: 'Pip value mistakes to avoid',
    mistakes: [
      'Treating JPY pairs like regular four-decimal forex pairs.',
      'Using gold points without confirming how your broker quotes XAU/USD.',
      'Calculating pip value after entering the trade instead of before.',
    ],
    faqTitle: 'Pip value calculator FAQ',
    faqs: [
      {
        question: 'What is pip value?',
        answer: 'Pip value is the amount of account currency gained or lost when a position moves by one pip.',
      },
      {
        question: 'How much is one pip for one standard lot?',
        answer: 'For many USD-quoted forex pairs, one standard lot is about $10 per pip. JPY pairs, cross pairs, and gold can be different.',
      },
      {
        question: 'Can I use this calculator for gold?',
        answer: 'Yes. Select XAU/USD and treat the input as points or pips based on your broker quote format.',
      },
    ],
    relatedToolsTitle: 'Related trading calculators',
    relatedTools: [
      { label: 'Position size calculator', path: '/calculators/position-size' },
      { label: 'Trading calculators', path: '/calculators' },
    ],
    relatedSummariesTitle: 'Related trading summaries',
    relatedSummaries: [
      { label: 'Trading for a Living summary', path: '/summary/trading-for-a-living' },
      { label: 'Technical Analysis of the Financial Markets summary', path: '/summary/technical-analysis-of-the-financial-markets' },
      { label: 'The Mental Game of Trading summary', path: '/summary/the-mental-game-of-trading' },
    ],
  },
  {
    path: '/calculators/position-size',
    language: 'en',
    tabId: 'positionSize',
    title: 'Position Size Calculator for Forex and Gold Risk | Ta7leel',
    h1: 'Position size calculator',
    description:
      'Calculate position size from account balance, risk amount, stop loss distance, pair type, and pip value before you place a forex or gold trade.',
    keywords:
      'position size calculator, forex position size calculator, lot size calculator, trading risk calculator, gold position size calculator, risk per trade calculator',
    eyebrow: 'Risk first',
    intro:
      'A position size calculator helps you decide the lot size after you know your account risk and stop loss distance. That keeps the trade sized around risk instead of emotion.',
    formulaLabel: 'Position size formula',
    formula: 'Risk amount / (stop loss pips x pip value per lot) = standard lots',
    exampleTitle: 'Example position size calculation',
    example:
      'If your account is $10,000, your risk is 1%, and your stop loss is 20 pips, the risk amount is $100. If one standard lot is $10 per pip, the position size is 0.50 lots.',
    stepsTitle: 'How to calculate position size',
    steps: [
      'Enter your account balance or fixed money risk.',
      'Choose your risk percentage or risk amount.',
      'Enter the stop loss distance in pips or points.',
      'Choose the pair so the calculator can estimate pip value.',
      'Use the lot size result before placing the order.',
    ],
    mistakesTitle: 'Position sizing mistakes to avoid',
    mistakes: [
      'Choosing lot size first and adjusting the stop loss afterward.',
      'Risking a different percentage on every trade without a rule.',
      'Forgetting that gold, JPY pairs, and cross pairs need different pip value handling.',
    ],
    faqTitle: 'Position size calculator FAQ',
    faqs: [
      {
        question: 'What is position size in trading?',
        answer: 'Position size is the number of lots, units, or contracts you trade. It determines how much money is at risk when price reaches your stop loss.',
      },
      {
        question: 'What risk percentage should I use?',
        answer: 'Many traders use a fixed risk range such as 0.5% to 2% per trade, but the right number depends on your strategy, drawdown tolerance, and experience.',
      },
      {
        question: 'Does this work for gold trading?',
        answer: 'Yes. Select XAU/USD and enter the stop distance in points or pips according to your broker quote format.',
      },
    ],
    relatedToolsTitle: 'Related trading calculators',
    relatedTools: [
      { label: 'Pip value calculator', path: '/calculators/pip-value' },
      { label: 'Trading calculators', path: '/calculators' },
    ],
    relatedSummariesTitle: 'Related trading summaries',
    relatedSummaries: [
      { label: 'Best Loser Wins summary', path: '/summary/best-loser-wins' },
      { label: 'Trading for a Living summary', path: '/summary/trading-for-a-living' },
      { label: 'Market Wizards summary', path: '/summary/market-wizards' },
    ],
  },
  {
    path: '/calculators/fire',
    language: 'en',
    tabId: 'fire',
    title: 'FIRE Calculator: Financial Independence Number | Ta7leel',
    h1: 'FIRE calculator',
    description:
      'Estimate your financial independence number, savings gap, and retirement timeline with a free FIRE calculator for long-term planning.',
    keywords:
      'FIRE calculator, financial independence calculator, early retirement calculator, retirement number calculator, financial freedom calculator',
    eyebrow: 'Financial independence',
    intro:
      'A FIRE calculator estimates the portfolio size required to support annual spending without relying on active income. Use it to test savings rate, expenses, and withdrawal assumptions.',
    formulaLabel: 'FIRE number formula',
    formula: 'Annual expenses x 25 = approximate FIRE number',
    exampleTitle: 'Example FIRE calculation',
    example:
      'If you spend $40,000 per year and use the 4% rule, your rough FIRE number is $1,000,000: $40,000 x 25.',
    stepsTitle: 'How to estimate your FIRE number',
    steps: [
      'Enter annual spending, not just income.',
      'Choose a withdrawal rate that matches your risk tolerance.',
      'Add current savings and monthly contributions.',
      'Compare conservative and optimistic return assumptions.',
    ],
    mistakesTitle: 'FIRE planning mistakes to avoid',
    mistakes: [
      'Using gross income instead of actual yearly spending.',
      'Ignoring taxes, health care, housing, and inflation.',
      'Treating one return assumption as a certain future outcome.',
    ],
    faqTitle: 'FIRE calculator FAQ',
    faqs: [
      {
        question: 'What does FIRE mean?',
        answer: 'FIRE means Financial Independence, Retire Early. It focuses on building enough invested assets to cover living expenses.',
      },
      {
        question: 'What is the 25x rule?',
        answer: 'The 25x rule estimates a FIRE number by multiplying annual expenses by 25, which corresponds to a 4% withdrawal rate.',
      },
      {
        question: 'Is a FIRE calculator a retirement guarantee?',
        answer: 'No. It is a planning estimate. Real results depend on market returns, inflation, taxes, spending changes, and personal risk tolerance.',
      },
    ],
    relatedToolsTitle: 'Related financial calculators',
    relatedTools: [
      { label: 'Compound interest calculator', path: '/calculators/compound-interest' },
      { label: 'Financial calculators', path: '/calculators' },
    ],
    relatedSummariesTitle: 'Related finance summaries',
    relatedSummaries: [
      { label: 'The Simple Path to Wealth summary', path: '/summary/the-simple-path-to-wealth' },
      { label: 'The Psychology of Money summary', path: '/summary/the-psychology-of-money' },
      { label: 'I Will Teach You To Be Rich summary', path: '/summary/i-will-teach-you-to-be-rich' },
    ],
  },
  {
    path: '/calculators/compound-interest',
    language: 'en',
    tabId: 'compound',
    title: 'Compound Interest Calculator with Contributions | Ta7leel',
    h1: 'Compound interest calculator',
    description:
      'Calculate future investment growth from starting balance, monthly contributions, time horizon, and expected annual return.',
    keywords:
      'compound interest calculator, investment calculator, monthly contribution calculator, future value calculator, compound growth calculator',
    eyebrow: 'Long-term growth',
    intro:
      'A compound interest calculator shows how principal, recurring contributions, time, and reinvested returns work together. It is useful for investing, saving, and financial planning scenarios.',
    formulaLabel: 'Compound growth idea',
    formula: 'Principal + contributions + reinvested returns = future value',
    exampleTitle: 'Example compound interest calculation',
    example:
      'If you start with $5,000, add $300 per month, and earn an average 7% annual return for 20 years, contributions and compounding can turn small habits into a much larger future balance.',
    stepsTitle: 'How to use the compound interest calculator',
    steps: [
      'Enter your starting balance.',
      'Add monthly or recurring contributions.',
      'Choose the time horizon in years.',
      'Test realistic annual return assumptions.',
      'Compare total contributions with projected investment growth.',
    ],
    mistakesTitle: 'Compound interest mistakes to avoid',
    mistakes: [
      'Using returns that are too optimistic for the asset class.',
      'Ignoring fees, taxes, and inflation.',
      'Underestimating how much contribution consistency affects the final result.',
    ],
    faqTitle: 'Compound interest calculator FAQ',
    faqs: [
      {
        question: 'What is compound interest?',
        answer: 'Compound interest is growth earned on both your original money and previous growth that remains invested.',
      },
      {
        question: 'Can I include monthly contributions?',
        answer: 'Yes. Monthly contributions are important because long-term wealth often comes from both compounding and consistent saving.',
      },
      {
        question: 'What annual return should I use?',
        answer: 'Use a range instead of one number. Conservative, moderate, and optimistic scenarios make the result more useful.',
      },
    ],
    relatedToolsTitle: 'Related financial calculators',
    relatedTools: [
      { label: 'FIRE calculator', path: '/calculators/fire' },
      { label: 'Financial calculators', path: '/calculators' },
    ],
    relatedSummariesTitle: 'Related investing summaries',
    relatedSummaries: [
      { label: 'The Little Book of Common Sense Investing summary', path: '/summary/the-little-book-of-common-sense-investing' },
      { label: 'The Simple Path to Wealth summary', path: '/summary/the-simple-path-to-wealth' },
      { label: 'Money: Master The Game summary', path: '/summary/money-master-the-game' },
    ],
  },
  {
    path: '/ar/tools/position-size-calculator',
    language: 'ar',
    tabId: 'positionSize',
    title: 'حاسبة حجم الصفقة للفوركس والذهب | تحليل',
    h1: 'حاسبة حجم الصفقة',
    description:
      'احسب حجم الصفقة المناسب بناء على رصيد الحساب، نسبة المخاطرة، وقف الخسارة، وقيمة النقطة قبل دخول صفقة فوركس أو ذهب.',
    keywords:
      'حاسبة حجم الصفقة, حاسبة اللوت, حاسبة المخاطرة في التداول, حساب حجم الصفقة, حاسبة الفوركس, حاسبة الذهب',
    eyebrow: 'إدارة المخاطر',
    intro:
      'تساعدك حاسبة حجم الصفقة على تحديد اللوت بعد معرفة المبلغ الذي تقبل المخاطرة به ومسافة وقف الخسارة. الهدف هو أن تقود المخاطرة القرار، لا العاطفة.',
    formulaLabel: 'معادلة حجم الصفقة',
    formula: 'مبلغ المخاطرة / (وقف الخسارة بالنقاط x قيمة النقطة لكل لوت) = حجم الصفقة',
    exampleTitle: 'مثال على حساب حجم الصفقة',
    example:
      'إذا كان رصيد الحساب 10,000 دولار والمخاطرة 1% ووقف الخسارة 20 نقطة، فمبلغ المخاطرة هو 100 دولار. إذا كانت قيمة النقطة 10 دولارات للوت القياسي، فحجم الصفقة 0.50 لوت.',
    stepsTitle: 'طريقة استخدام الحاسبة',
    steps: [
      'أدخل رصيد الحساب أو مبلغ المخاطرة الثابت.',
      'حدد نسبة المخاطرة أو قيمة المخاطرة.',
      'أدخل مسافة وقف الخسارة بالنقاط.',
      'اختر الزوج أو الذهب لتقدير قيمة النقطة.',
      'استخدم حجم اللوت قبل تنفيذ الأمر.',
    ],
    mistakesTitle: 'أخطاء شائعة',
    mistakes: [
      'اختيار اللوت أولا ثم تعديل وقف الخسارة ليناسب الصفقة.',
      'تغيير نسبة المخاطرة من صفقة لأخرى بدون قاعدة واضحة.',
      'نسيان اختلاف قيمة النقطة في الذهب وأزواج الين والأزواج التقاطعية.',
    ],
    faqTitle: 'أسئلة شائعة حول حاسبة حجم الصفقة',
    faqs: [
      {
        question: 'ما معنى حجم الصفقة؟',
        answer: 'حجم الصفقة هو عدد اللوتات أو الوحدات التي تتداولها، وهو ما يحدد مقدار الخسارة إذا وصل السعر إلى وقف الخسارة.',
      },
      {
        question: 'ما نسبة المخاطرة المناسبة؟',
        answer: 'يستخدم كثير من المتداولين نطاقا ثابتا مثل 0.5% إلى 2% لكل صفقة، لكن الرقم المناسب يعتمد على الاستراتيجية وتحمل التذبذب والخبرة.',
      },
      {
        question: 'هل تعمل الحاسبة مع الذهب؟',
        answer: 'نعم. اختر XAU/USD وأدخل مسافة الوقف بالنقاط حسب طريقة تسعير وسيطك.',
      },
    ],
    relatedToolsTitle: 'حاسبات مرتبطة',
    relatedTools: [
      { label: 'حاسبة قيمة النقطة', path: '/ar/tools/pip-value-calculator' },
      { label: 'حاسبة الفائدة المركبة', path: '/ar/tools/compound-interest-calculator' },
    ],
    relatedSummariesTitle: 'ملخصات مرتبطة',
    relatedSummaries: [
      { label: 'ملخص Trading for a Living', path: '/summary/trading-for-a-living' },
      { label: 'ملخص Best Loser Wins', path: '/summary/best-loser-wins' },
      { label: 'ملخص Market Wizards', path: '/summary/market-wizards' },
    ],
  },
  {
    path: '/ar/tools/pip-value-calculator',
    language: 'ar',
    tabId: 'pipValue',
    title: 'حاسبة قيمة النقطة للفوركس والذهب | تحليل',
    h1: 'حاسبة قيمة النقطة',
    description:
      'احسب قيمة النقطة في أزواج الفوركس، أزواج الين، والذهب لمعرفة تأثير حركة السعر على حسابك قبل دخول الصفقة.',
    keywords:
      'حاسبة قيمة النقطة, حساب قيمة النقطة, حاسبة البيب, قيمة النقطة في الفوركس, حاسبة الذهب, XAUUSD',
    eyebrow: 'أداة مخاطرة للفوركس',
    intro:
      'تحول حاسبة قيمة النقطة حركة السوق إلى قيمة مالية في حسابك. استخدمها قبل الصفقة حتى تعرف معنى حركة 10 أو 20 نقطة على رصيدك.',
    formulaLabel: 'معادلة قيمة النقطة',
    formula: 'قيمة النقطة x عدد النقاط x حجم اللوت = قيمة حركة الصفقة',
    exampleTitle: 'مثال على قيمة النقطة',
    example:
      'في EUR/USD تكون قيمة النقطة للوت القياسي غالبا حوالي 10 دولارات. إذا كان حجم الصفقة 0.50 لوت وتحرك السعر 20 نقطة، فقيمة الحركة حوالي 100 دولار.',
    stepsTitle: 'طريقة حساب قيمة النقطة',
    steps: [
      'اختر زوج العملة أو الذهب.',
      'أدخل عدد النقاط التي تريد قياسها.',
      'أدخل حجم الصفقة باللوت.',
      'راجع النتيجة قبل تحديد المخاطرة أو الهدف.',
    ],
    mistakesTitle: 'أخطاء يجب تجنبها',
    mistakes: [
      'معاملة أزواج الين مثل أزواج الأربع خانات عشرية.',
      'استخدام نقاط الذهب بدون فهم طريقة تسعير الوسيط.',
      'حساب قيمة النقطة بعد الدخول بدلا من حسابها قبل الصفقة.',
    ],
    faqTitle: 'أسئلة شائعة حول قيمة النقطة',
    faqs: [
      {
        question: 'ما هي قيمة النقطة؟',
        answer: 'قيمة النقطة هي مقدار الربح أو الخسارة في عملة الحساب عندما تتحرك الصفقة نقطة واحدة.',
      },
      {
        question: 'كم تساوي النقطة في اللوت القياسي؟',
        answer: 'في كثير من أزواج الدولار تكون قيمة النقطة للوت القياسي حوالي 10 دولارات، لكن أزواج الين والذهب والأزواج التقاطعية تختلف.',
      },
      {
        question: 'هل يمكن استخدامها للذهب؟',
        answer: 'نعم. اختر XAU/USD وتعامل مع الإدخال كنقاط حسب طريقة عرض السعر لدى الوسيط.',
      },
    ],
    relatedToolsTitle: 'حاسبات مرتبطة',
    relatedTools: [
      { label: 'حاسبة حجم الصفقة', path: '/ar/tools/position-size-calculator' },
      { label: 'حاسبة الحرية المالية', path: '/ar/tools/fire-calculator' },
    ],
    relatedSummariesTitle: 'ملخصات مرتبطة',
    relatedSummaries: [
      { label: 'ملخص Trading for a Living', path: '/summary/trading-for-a-living' },
      { label: 'ملخص Technical Analysis of the Financial Markets', path: '/summary/technical-analysis-of-the-financial-markets' },
      { label: 'ملخص The Mental Game of Trading', path: '/summary/the-mental-game-of-trading' },
    ],
  },
  {
    path: '/ar/tools/compound-interest-calculator',
    language: 'ar',
    tabId: 'compound',
    title: 'حاسبة الفائدة المركبة مع الإيداعات الشهرية | تحليل',
    h1: 'حاسبة الفائدة المركبة',
    description:
      'احسب نمو الاستثمار مستقبلا من الرصيد الحالي، المساهمات الشهرية، مدة الاستثمار، ومتوسط العائد السنوي المتوقع.',
    keywords:
      'حاسبة الفائدة المركبة, حاسبة الاستثمار, حساب النمو المركب, حاسبة الادخار, حاسبة العائد المركب',
    eyebrow: 'نمو طويل الأجل',
    intro:
      'توضح حاسبة الفائدة المركبة كيف يعمل رأس المال والمساهمات المتكررة والوقت والعوائد المعاد استثمارها معا لبناء نتيجة أكبر على المدى الطويل.',
    formulaLabel: 'فكرة النمو المركب',
    formula: 'رأس المال + المساهمات + العوائد المعاد استثمارها = القيمة المستقبلية',
    exampleTitle: 'مثال على الفائدة المركبة',
    example:
      'إذا بدأت بمبلغ 5,000 دولار وأضفت 300 دولار شهريا بمتوسط عائد سنوي 7% لمدة 20 سنة، فإن الاستمرارية والتراكم يمكن أن يصنعا فرقا كبيرا في القيمة النهائية.',
    stepsTitle: 'طريقة استخدام الحاسبة',
    steps: [
      'أدخل الرصيد الابتدائي.',
      'أضف المساهمة الشهرية أو الدورية.',
      'حدد مدة الاستثمار بالسنوات.',
      'اختبر أكثر من افتراض للعائد السنوي.',
      'قارن إجمالي المساهمات بالنمو المتوقع.',
    ],
    mistakesTitle: 'أخطاء شائعة',
    mistakes: [
      'استخدام عائد سنوي متفائل جدا.',
      'تجاهل الرسوم والضرائب والتضخم.',
      'التقليل من أثر الاستمرارية في المساهمات الشهرية.',
    ],
    faqTitle: 'أسئلة شائعة حول الفائدة المركبة',
    faqs: [
      {
        question: 'ما هي الفائدة المركبة؟',
        answer: 'هي نمو يحدث على أصل المال وعلى العوائد السابقة التي بقيت مستثمرة.',
      },
      {
        question: 'هل يمكن إدخال مساهمات شهرية؟',
        answer: 'نعم. المساهمات الشهرية مهمة لأن بناء الثروة غالبا يأتي من العوائد المركبة والاستمرارية معا.',
      },
      {
        question: 'ما العائد السنوي الذي يجب استخدامه؟',
        answer: 'استخدم نطاقا من السيناريوهات بدلا من رقم واحد: محافظ، متوسط، ومتفائل.',
      },
    ],
    relatedToolsTitle: 'حاسبات مرتبطة',
    relatedTools: [
      { label: 'حاسبة الحرية المالية', path: '/ar/tools/fire-calculator' },
      { label: 'حاسبة حجم الصفقة', path: '/ar/tools/position-size-calculator' },
    ],
    relatedSummariesTitle: 'ملخصات مرتبطة',
    relatedSummaries: [
      { label: 'ملخص The Simple Path to Wealth', path: '/summary/the-simple-path-to-wealth' },
      { label: 'ملخص The Psychology of Money', path: '/summary/the-psychology-of-money' },
      { label: 'ملخص The Little Book of Common Sense Investing', path: '/summary/the-little-book-of-common-sense-investing' },
    ],
  },
  {
    path: '/ar/tools/fire-calculator',
    language: 'ar',
    tabId: 'fire',
    title: 'حاسبة الحرية المالية ورقم FIRE | تحليل',
    h1: 'حاسبة الحرية المالية',
    description:
      'قدّر رقم الحرية المالية والمدة التقريبية للوصول إليه بناء على المصاريف السنوية، معدل السحب، المدخرات، والمساهمات.',
    keywords:
      'حاسبة الحرية المالية, حاسبة FIRE, حساب التقاعد المبكر, رقم الحرية المالية, حاسبة الاستقلال المالي',
    eyebrow: 'استقلال مالي',
    intro:
      'تقدّر حاسبة الحرية المالية حجم المحفظة المطلوبة لتغطية مصاريفك السنوية دون الاعتماد الكامل على دخل نشط.',
    formulaLabel: 'معادلة رقم الحرية المالية',
    formula: 'المصاريف السنوية x 25 = رقم تقريبي للحرية المالية',
    exampleTitle: 'مثال على رقم الحرية المالية',
    example:
      'إذا كانت مصاريفك السنوية 40,000 دولار واستخدمت قاعدة 4%، فالرقم التقريبي للحرية المالية هو 1,000,000 دولار.',
    stepsTitle: 'طريقة تقدير رقم الحرية المالية',
    steps: [
      'أدخل المصاريف السنوية الفعلية.',
      'اختر معدل سحب يناسب درجة المخاطرة.',
      'أضف المدخرات الحالية والمساهمات الشهرية.',
      'قارن بين عوائد محافظة ومتفائلة.',
    ],
    mistakesTitle: 'أخطاء شائعة',
    mistakes: [
      'استخدام الدخل بدلا من المصاريف السنوية.',
      'تجاهل الضرائب والتأمين الصحي والسكن والتضخم.',
      'اعتبار رقم واحد توقعا مؤكدا للمستقبل.',
    ],
    faqTitle: 'أسئلة شائعة حول FIRE',
    faqs: [
      {
        question: 'ما معنى FIRE؟',
        answer: 'تعني Financial Independence, Retire Early، أي الاستقلال المالي والتقاعد المبكر.',
      },
      {
        question: 'ما هي قاعدة 25x؟',
        answer: 'هي تقدير تقريبي يضرب المصاريف السنوية في 25، ويرتبط بمعدل سحب 4%.',
      },
      {
        question: 'هل الحاسبة ضمان للتقاعد؟',
        answer: 'لا. هي أداة تخطيط فقط، والنتيجة الفعلية تعتمد على العوائد والتضخم والضرائب وتغير المصاريف.',
      },
    ],
    relatedToolsTitle: 'حاسبات مرتبطة',
    relatedTools: [
      { label: 'حاسبة الفائدة المركبة', path: '/ar/tools/compound-interest-calculator' },
      { label: 'حاسبة قيمة النقطة', path: '/ar/tools/pip-value-calculator' },
    ],
    relatedSummariesTitle: 'ملخصات مرتبطة',
    relatedSummaries: [
      { label: 'ملخص The Simple Path to Wealth', path: '/summary/the-simple-path-to-wealth' },
      { label: 'ملخص The Psychology of Money', path: '/summary/the-psychology-of-money' },
      { label: 'ملخص I Will Teach You To Be Rich', path: '/summary/i-will-teach-you-to-be-rich' },
    ],
  },
];
