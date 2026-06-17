import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import FIRECalculator from '../components/FIRECalculator';
import CompoundCalculator from '../components/CompoundCalculator';
import useSEO from '../hooks/useSEO';
import { Calculator, CheckCircle2, Flame, LineChart, ShieldCheck, Sparkles, Target, TrendingUp, WalletCards } from 'lucide-react';
import { CALCULATOR_ROUTES, SITE_URL } from '../utils/seoConfig';
import type { CalculatorLanguage, CalculatorRoute } from '../utils/seoConfig';

type CalculatorTab = 'pipValue' | 'positionSize' | 'fire' | 'compound';

const calculatorTabs = [
  {
    id: 'positionSize' as const,
    label: 'Position Size',
    shortLabel: 'Position',
    description: 'Find the lot size that matches your account risk.',
    icon: ShieldCheck,
  },
  {
    id: 'pipValue' as const,
    label: 'Pip Value',
    shortLabel: 'Pip Value',
    description: 'Convert price movement into real money.',
    icon: Calculator,
  },
  {
    id: 'fire' as const,
    label: 'FIRE',
    shortLabel: 'FIRE',
    description: 'Estimate your financial independence target.',
    icon: Flame,
  },
  {
    id: 'compound' as const,
    label: 'Compound Interest',
    shortLabel: 'Compound',
    description: 'Project long-term growth from steady contributions.',
    icon: TrendingUp,
  },
];

const calculatorTabLabels: Record<CalculatorLanguage, Record<CalculatorTab, { label: string; shortLabel: string }>> = {
  en: {
    positionSize: { label: 'Position Size', shortLabel: 'Position' },
    pipValue: { label: 'Pip Value', shortLabel: 'Pip Value' },
    fire: { label: 'FIRE', shortLabel: 'FIRE' },
    compound: { label: 'Compound Interest', shortLabel: 'Compound' },
  },
  ar: {
    positionSize: { label: 'حجم الصفقة', shortLabel: 'اللوت' },
    pipValue: { label: 'قيمة النقطة', shortLabel: 'النقطة' },
    fire: { label: 'الحرية المالية', shortLabel: 'FIRE' },
    compound: { label: 'الفائدة المركبة', shortLabel: 'المركبة' },
  },
};

const calculatorDetails: Record<CalculatorTab, {
  eyebrow: string;
  title: string;
  description: string;
  formulaLabel: string;
  formula: string;
  checks: string[];
}> = {
  positionSize: {
    eyebrow: 'Risk first',
    title: 'Size the trade before you enter it.',
    description: 'Position sizing keeps one trade from doing too much damage. Start with the amount you are willing to risk, then let the calculator translate it into lots.',
    formulaLabel: 'Core idea',
    formula: 'Risk amount / stop-loss distance = position size',
    checks: ['Keep risk fixed before choosing lots', 'Use stop loss distance from your actual setup', 'Treat gold points differently from forex pips'],
  },
  pipValue: {
    eyebrow: 'Know the move',
    title: 'Turn pips into account currency.',
    description: 'Pip value helps you understand what a market move means in money terms before you decide whether the trade is worth taking.',
    formulaLabel: 'Core idea',
    formula: 'Pip value x pips x lot size = trade movement value',
    checks: ['Check the pair type before calculating', 'Use the same currency as your account', 'Review gold and JPY pairs separately'],
  },
  fire: {
    eyebrow: 'Long view',
    title: 'Find the number behind financial independence.',
    description: 'The FIRE calculator uses your savings rate, expenses, and expected returns to estimate the portfolio size needed to fund your lifestyle.',
    formulaLabel: 'Rule of thumb',
    formula: 'Annual expenses x 25 = approximate FIRE number',
    checks: ['Separate income from yearly spending', 'Keep return assumptions realistic', 'Use withdrawal rate as a planning input'],
  },
  compound: {
    eyebrow: 'Growth engine',
    title: 'See how time changes the result.',
    description: 'Compound interest rewards consistency. Small monthly contributions can become meaningful when the timeline is long enough.',
    formulaLabel: 'Core idea',
    formula: 'Principal + contributions + reinvested returns = future value',
    checks: ['Compare contributions against growth', 'Test different time horizons', 'Use realistic annual return ranges'],
  },
};

const defaultCalculatorRoute = CALCULATOR_ROUTES.find((route) => route.path === '/calculators') as CalculatorRoute;

const getCalculatorRoute = (path: string): CalculatorRoute => (
  CALCULATOR_ROUTES.find((route) => route.path === path) ?? defaultCalculatorRoute
);

const getCalculatorPath = (tabId: CalculatorTab, language: CalculatorLanguage): string => (
  CALCULATOR_ROUTES.find((route) => route.tabId === tabId && route.language === language)?.path
  ?? CALCULATOR_ROUTES.find((route) => route.tabId === tabId && route.language === 'en')?.path
  ?? '/calculators'
);

const getTabFromRoute = (route: CalculatorRoute): CalculatorTab => route.tabId ?? 'positionSize';

const CalculatorsPage: React.FC = () => {
  const location = useLocation();
  const activeRoute = getCalculatorRoute(location.pathname);
  const activeTab = getTabFromRoute(activeRoute);
  const currentLanguage = activeRoute.language;
  const isArabic = currentLanguage === 'ar';

  useSEO({
    title: activeRoute.title,
    description: activeRoute.description,
    keywords: activeRoute.keywords,
    canonical: `${SITE_URL}${activeRoute.path}`,
    type: 'website',
  });

  const activeCalculator = calculatorTabs.find((tab) => tab.id === activeTab) ?? calculatorTabs[0];
  const ActiveIcon = activeCalculator.icon;
  const activeDetail = calculatorDetails[activeTab];
  const tabCopy = calculatorTabLabels[currentLanguage];

  return (
    <div className="overflow-x-hidden bg-[#fffaf3]" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="relative isolate overflow-hidden bg-[#f7f0e6] px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-14 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fffaf3] to-transparent" aria-hidden="true" />
        <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {activeRoute.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-gray-950 text-balance sm:text-5xl lg:text-6xl">
              {activeRoute.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b4d] text-pretty md:text-lg md:leading-8">
              {activeRoute.intro}
            </p>
          </div>

          <div className="relative min-h-[250px] sm:min-h-[320px]">
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5d8c7]/80 blur-3xl md:h-[430px] md:w-[430px]" aria-hidden="true" />
            <img
              src="/images/calculator-phone-preview.png"
              alt={activeRoute.h1}
              className="relative z-10 mx-auto h-auto w-full max-w-[320px] select-none rounded-[28px] shadow-[0_24px_54px_rgba(89,69,45,0.14)] outline outline-1 -outline-offset-1 outline-black/10 sm:max-w-[380px] lg:max-w-[440px]"
              loading="eager"
              decoding="async"
            />
            <div className="absolute bottom-4 left-0 z-20 hidden max-w-[250px] rounded-2xl bg-white/88 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur sm:block">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeRoute.formulaLabel}</p>
              <p className="mt-1 text-sm font-black text-gray-950">{activeRoute.formula}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator-workspace" className="relative z-20 -mt-8 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="container mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_24px_56px_rgba(89,69,45,0.14)] ring-1 ring-[#d7c7b3] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-[#eadfce] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a75d37] text-white shadow-[0_12px_26px_rgba(167,93,55,0.24)]">
                  <ActiveIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeDetail.eyebrow}</p>
                  <h2 className="text-2xl font-black leading-tight text-gray-950">{tabCopy[activeTab].label}</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex" role="tablist" aria-label="Calculator tools">
                {calculatorTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActiveTab = activeTab === tab.id;

                  return (
                    <Link
                      key={tab.id}
                      to={getCalculatorPath(tab.id, currentLanguage)}
                      className={`inline-flex min-h-10 items-center justify-center rounded-xl text-sm font-black transition-[background-color,color,box-shadow,width] duration-200 ${
                        isActiveTab
                          ? 'w-auto gap-2 bg-[#a75d37] px-3 py-2 text-white shadow-[0_10px_20px_rgba(167,93,55,0.22)] [&_span]:text-white [&_svg]:text-white'
                          : 'w-10 bg-[#f7f0e6] p-2 text-[#453c31] hover:bg-[#e5d8c7]'
                      }`}
                      role="tab"
                      aria-label={tabCopy[tab.id].label}
                      aria-selected={isActiveTab}
                      aria-current={isActiveTab ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className={isActiveTab ? 'inline' : 'sr-only'}>{tabCopy[tab.id].shortLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              {activeTab === 'pipValue' && <PipValueCalculator />}
              {activeTab === 'positionSize' && <PositionSizeCalculator />}
              {activeTab === 'fire' && <FIRECalculator />}
              {activeTab === 'compound' && <CompoundCalculator />}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_18px_40px_rgba(89,69,45,0.10)]">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-black leading-tight text-gray-950">{activeDetail.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#675b4d]">{activeDetail.description}</p>
              <div className="mt-5 rounded-xl bg-white/75 p-4 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeDetail.formulaLabel}</p>
                <p className="mt-1 text-sm font-black leading-6 text-gray-950">{activeDetail.formula}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.10)] ring-1 ring-[#d7c7b3]">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-[#a75d37]">Before you use the result</h3>
              <div className="space-y-3">
                {activeDetail.checks.map((check) => (
                  <div key={check} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#a75d37]" aria-hidden="true" />
                    <p className="text-sm font-semibold leading-6 text-[#453c31]">{check}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#fffaf3] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="space-y-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeRoute.formulaLabel}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-gray-950 text-balance">{activeRoute.formula}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#675b4d] text-pretty">{activeRoute.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.08)] ring-1 ring-[#d7c7b3]">
                <h3 className="text-xl font-black text-gray-950">{activeRoute.exampleTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-[#675b4d] text-pretty">{activeRoute.example}</p>
              </div>
              <div className="rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <h3 className="text-xl font-black text-gray-950">{activeRoute.mistakesTitle}</h3>
                <ul className="mt-3 space-y-2">
                  {activeRoute.mistakes.map((mistake) => (
                    <li key={mistake} className="flex gap-2 text-sm leading-6 text-[#675b4d] text-pretty">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a75d37]" aria-hidden="true" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-950">{activeRoute.stepsTitle}</h2>
              <ol className="mt-4 grid gap-3 md:grid-cols-2">
                {activeRoute.steps.map((step, index) => (
                  <li key={step} className="rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-[#453c31] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_32px_rgba(89,69,45,0.07)] ring-1 ring-[#d7c7b3]">
                    <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#a75d37] text-xs font-black text-white tabular-nums">
                      {index + 1}
                    </span>
                    <p className="text-pretty">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-950">{activeRoute.faqTitle}</h2>
              <div className="mt-4 divide-y divide-[#eadfce] rounded-2xl bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.08)] ring-1 ring-[#d7c7b3]">
                {activeRoute.faqs.map((faq) => (
                  <details key={faq.question} className="group p-5">
                    <summary className="cursor-pointer list-none text-base font-black text-gray-950 text-pretty">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-[#675b4d] text-pretty">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.08)] ring-1 ring-[#d7c7b3]">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeRoute.relatedToolsTitle}</h2>
              <div className="mt-4 space-y-2">
                {activeRoute.relatedTools.map((tool) => (
                  <Link key={tool.path} to={tool.path} className="block rounded-xl bg-[#f7f0e6] px-4 py-3 text-sm font-black text-[#453c31] transition-[background-color,color] duration-200 hover:bg-[#e5d8c7]">
                    {tool.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeRoute.relatedSummariesTitle}</h2>
              <div className="mt-4 space-y-2">
                {activeRoute.relatedSummaries.map((summary) => (
                  <Link key={summary.path} to={summary.path} className="block rounded-xl bg-white/80 px-4 py-3 text-sm font-black text-[#453c31] transition-[background-color,color] duration-200 hover:bg-white">
                    {summary.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Risk first', 'Never let the lot size decide the risk for you.', ShieldCheck],
              ['Plan longer', 'FIRE and compound tools are direction setters, not promises.', LineChart],
              ['Use notes', 'Pair calculations with summaries on risk, money, and behavior.', WalletCards],
            ].map(([title, body, Icon]) => (
              <article key={title as string} className="rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a75d37]">
                  {React.createElement(Icon as typeof ShieldCheck, { className: 'h-5 w-5', 'aria-hidden': true })}
                </span>
                <h3 className="text-lg font-black text-gray-950">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#675b4d]">{body as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default CalculatorsPage;
