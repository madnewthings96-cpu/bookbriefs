import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import FIRECalculator from '../components/FIRECalculator';
import CompoundCalculator from '../components/CompoundCalculator';
import useSEO from '../hooks/useSEO';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flame,
  HelpCircle,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  Wrench,
} from 'lucide-react';
import { CALCULATOR_ROUTES, SITE_URL, canonicalRoutePath } from '../utils/seoConfig';
import type { CalculatorLanguage, CalculatorRoute } from '../utils/seoConfig';

type CalculatorTab = 'pipValue' | 'positionSize' | 'fire' | 'compound';

const calculatorTabs = [
  {
    id: 'positionSize' as const,
    label: 'Position Size',
    shortLabel: 'Position',
    description: 'Find the exact lot size that matches your risk percentage.',
    icon: ShieldCheck,
  },
  {
    id: 'pipValue' as const,
    label: 'Pip Value',
    shortLabel: 'Pip Value',
    description: 'Convert market price movement into account currency.',
    icon: Calculator,
  },
  {
    id: 'fire' as const,
    label: 'FIRE Freedom',
    shortLabel: 'FIRE',
    description: 'Calculate your portfolio target for financial independence.',
    icon: Flame,
  },
  {
    id: 'compound' as const,
    label: 'Compound Growth',
    shortLabel: 'Compound',
    description: 'Model long-term wealth compounding over time.',
    icon: TrendingUp,
  },
];

const calculatorTabLabels: Record<
  CalculatorLanguage,
  Record<CalculatorTab, { label: string; shortLabel: string }>
> = {
  en: {
    positionSize: { label: 'Position Size', shortLabel: 'Position' },
    pipValue: { label: 'Pip Value', shortLabel: 'Pip Value' },
    fire: { label: 'FIRE Freedom', shortLabel: 'FIRE' },
    compound: { label: 'Compound Growth', shortLabel: 'Compound' },
  },
  ar: {
    positionSize: { label: 'حجم الصفقة', shortLabel: 'اللوت' },
    pipValue: { label: 'قيمة النقطة', shortLabel: 'النقطة' },
    fire: { label: 'الحرية المالية', shortLabel: 'FIRE' },
    compound: { label: 'الفائدة المركبة', shortLabel: 'المركبة' },
  },
};

const calculatorDetails: Record<
  CalculatorTab,
  {
    eyebrow: string;
    title: string;
    description: string;
    formulaLabel: string;
    formula: string;
    checks: string[];
  }
> = {
  positionSize: {
    eyebrow: 'Risk First Architecture',
    title: 'Size the trade before you take the risk.',
    description:
      'Position sizing protects capital longevity. Start with the fixed dollar amount or percentage you are willing to risk, then let math translate it into lots.',
    formulaLabel: 'Underlying Formula',
    formula: 'Risk Amount ($) / (Stop Loss Pips x Pip Value) = Standard Lots',
    checks: [
      'Lock in maximum risk percentage (e.g. 1-2%) before entering',
      'Measure technical stop loss distance from your setup structure',
      'Gold (XAU/USD) is denominated in points ($0.01 per point per lot)',
    ],
  },
  pipValue: {
    eyebrow: 'Market Sensitivity',
    title: 'Turn price points into tangible capital.',
    description:
      'Pip valuation allows you to assess the monetary consequence of a move before executing, ensuring risk-reward alignment.',
    formulaLabel: 'Underlying Formula',
    formula: 'Pip Value x Pips Moved x Lot Size = Trade P&L Impact',
    checks: [
      'Check whether the pair is Direct, Indirect, or a Cross pair',
      'Ensure the output is denominated in your account currency',
      'Account for JPY 2-decimal pricing vs standard 4-decimal forex pricing',
    ],
  },
  fire: {
    eyebrow: 'Long-Range Freedom',
    title: 'Calculate your financial independence number.',
    description:
      'The FIRE equation leverages the 25x Annual Expenses rule (4% Safe Withdrawal Rate) to define the portfolio threshold where work becomes optional.',
    formulaLabel: 'Trinity Rule of Thumb',
    formula: 'Annual Lifestyle Expenses x 25 = Minimum Target Portfolio',
    checks: [
      'Base expenses on true annual living costs including healthcare and taxes',
      'Model realistic long-term real returns (6-8% after inflation)',
      'Adjust safe withdrawal rate (3.5% vs 4%) for early retirement horizons',
    ],
  },
  compound: {
    eyebrow: 'Exponential Compounding',
    title: 'Harness the mathematical engine of wealth.',
    description:
      'Compounding rewards patient consistency. Small, regular deposits compound aggressively once the portfolio reaches critical mass.',
    formulaLabel: 'Future Value Formula',
    formula: 'FV = PV(1 + r/n)^(nt) + PMT x [((1 + r/n)^(nt) - 1) / (r/n)]',
    checks: [
      'Distinguish your total deposited principal from earned interest',
      'Test multi-decade horizons (15, 20, 30 years) to see hockey-stick curve',
      'Automate monthly deposits to remove emotional timing friction',
    ],
  },
};

const defaultCalculatorRoute = CALCULATOR_ROUTES.find(
  (route) => route.path === '/calculators'
) as CalculatorRoute;

const getCalculatorRoute = (path: string): CalculatorRoute =>
  CALCULATOR_ROUTES.find((route) => route.path === path) ?? defaultCalculatorRoute;

const getCalculatorPath = (tabId: CalculatorTab, language: CalculatorLanguage): string =>
  CALCULATOR_ROUTES.find((route) => route.tabId === tabId && route.language === language)?.path ??
  CALCULATOR_ROUTES.find((route) => route.tabId === tabId && route.language === 'en')?.path ??
  '/calculators';

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
    canonical: `${SITE_URL}${canonicalRoutePath(activeRoute.path)}`,
    type: 'website',
  });

  const activeCalculator =
    calculatorTabs.find((tab) => tab.id === activeTab) ?? calculatorTabs[0];
  const ActiveIcon = activeCalculator.icon;
  const activeDetail = calculatorDetails[activeTab];
  const tabCopy = calculatorTabLabels[currentLanguage];

  return (
    <div className="overflow-x-hidden bg-[#FBFBFA]" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-white px-4 pb-16 pt-8 sm:px-6 md:pb-24 md:pt-12 lg:px-8 border-b border-forest-900/[0.06]">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-forest-100/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-emerald-50/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-left">
            {/* Pill Tag */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>{activeRoute.eyebrow}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-forest-950 sm:text-5xl lg:text-6xl text-balance leading-[1.08]">
              {activeRoute.h1}
            </h1>

            {/* Intro Text */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-forest-900/75 sm:text-lg sm:leading-8 text-pretty">
              {activeRoute.intro}
            </p>

            {/* Quick Feature Stats */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-forest-900/[0.08] pt-6 text-xs font-semibold text-forest-900/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Deterministic Math</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Zero Latency Calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-600" />
                <span>Institutional Formulas</span>
              </div>
            </div>
          </div>

          {/* Interactive Graphic / Phone Preview Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/images/calculator-phone-preview.png"
                alt={activeRoute.h1}
                className="relative z-10 mx-auto h-auto w-full max-w-[280px] select-none rounded-[28px] book-3d-shadow border border-forest-900/10 sm:max-w-[340px] lg:max-w-[380px]"
                loading="eager"
                decoding="async"
              />

              {/* Floating Formula Badge */}
              <div className="absolute -bottom-4 -left-4 z-20 hidden max-w-[260px] rounded-2xl bg-forest-950/92 p-4 text-left text-white shadow-xl border border-forest-800/60 backdrop-blur-md sm:block">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  {activeRoute.formulaLabel}
                </div>
                <p className="mt-1 text-xs font-bold leading-snug text-white">
                  {activeRoute.formula}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE & TOOLS CONTAINER */}
      <section id="calculator-workspace" className="relative z-20 -mt-6 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          
          {/* Main Calculator Card */}
          <div className="rounded-3xl bg-white p-5 shadow-card-rest border border-forest-900/[0.08] sm:p-8">
            
            {/* Tab Bar Header */}
            <div className="mb-6 flex flex-col gap-4 border-b border-forest-900/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-800 text-white shadow-sm">
                  <ActiveIcon className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                    {activeDetail.eyebrow}
                  </p>
                  <h2 className="font-display text-xl font-extrabold leading-tight text-forest-950 sm:text-2xl">
                    {tabCopy[activeTab].label}
                  </h2>
                </div>
              </div>

              {/* Segmented Control Pill Tabs */}
              <div
                className="flex flex-wrap rounded-2xl bg-forest-50/80 p-1.5 border border-forest-900/[0.08]"
                role="tablist"
                aria-label="Calculator tools"
              >
                {calculatorTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActiveTab = activeTab === tab.id;

                  return (
                    <Link
                      key={tab.id}
                      to={getCalculatorPath(tab.id, currentLanguage)}
                      className={`pressable inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                        isActiveTab
                          ? 'bg-forest-800 text-white shadow-sm'
                          : 'text-forest-900/70 hover:text-forest-950 hover:bg-white/60'
                      }`}
                      role="tab"
                      aria-label={tabCopy[tab.id].label}
                      aria-selected={isActiveTab}
                      aria-current={isActiveTab ? 'page' : undefined}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActiveTab ? 'text-emerald-300' : ''}`} aria-hidden="true" />
                      <span>{tabCopy[tab.id].shortLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Active Calculator Component */}
            <div>
              {activeTab === 'pipValue' && <PipValueCalculator />}
              {activeTab === 'positionSize' && <PositionSizeCalculator />}
              {activeTab === 'fire' && <FIRECalculator />}
              {activeTab === 'compound' && <CompoundCalculator />}
            </div>
          </div>

          {/* Sidebar Modules */}
          <aside className="space-y-6">
            {/* Target Principle Dark Card */}
            <div className="rounded-3xl bg-forest-950 p-6 text-white border border-forest-800 shadow-card-hover">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold leading-tight text-white">
                {activeDetail.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-forest-200/80">
                {activeDetail.description}
              </p>

              <div className="mt-5 rounded-2xl bg-white/[0.06] p-4 border border-white/[0.08]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  {activeDetail.formulaLabel}
                </p>
                <p className="mt-1 font-mono text-xs font-semibold leading-relaxed text-white">
                  {activeDetail.formula}
                </p>
              </div>
            </div>

            {/* Pre-Execution Checklist */}
            <div className="rounded-3xl bg-white p-6 border border-forest-900/[0.08] shadow-card-rest">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-forest-800">
                Before you use the result
              </h3>
              <div className="space-y-3.5">
                {activeDetail.checks.map((check) => (
                  <div key={check} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <p className="text-xs font-medium leading-relaxed text-forest-900/80">
                      {check}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* EDITORIAL DEEP DIVE (Theory, Examples, Steps, FAQs) */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 border-t border-forest-900/[0.06]">
        <div className="container mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="space-y-10">
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-800 border border-forest-800/15">
                {activeRoute.formulaLabel}
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl text-balance">
                {activeRoute.formula}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-forest-900/70 sm:text-base text-pretty">
                {activeRoute.description}
              </p>
            </div>

            {/* Practical Example & Common Mistakes Cards */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-[#FBFBFA] p-6 border border-forest-900/[0.08] shadow-card-rest">
                <div className="mb-3 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-emerald-700" />
                  <h3 className="font-display text-base font-bold text-forest-950">
                    {activeRoute.exampleTitle}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-forest-900/75 text-pretty">
                  {activeRoute.example}
                </p>
              </div>

              <div className="rounded-3xl bg-forest-50/60 p-6 border border-forest-900/[0.08]">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h3 className="font-display text-base font-bold text-forest-950">
                    {activeRoute.mistakesTitle}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {activeRoute.mistakes.map((mistake) => (
                    <li key={mistake} className="flex items-start gap-2 text-xs leading-relaxed text-forest-900/75 text-pretty">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step by Step Ordered Guide */}
            <div>
              <h2 className="font-display text-xl font-extrabold text-forest-950 sm:text-2xl">
                {activeRoute.stepsTitle}
              </h2>
              <ol className="mt-4 grid gap-3 md:grid-cols-2">
                {activeRoute.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex flex-col justify-between rounded-2xl bg-[#FBFBFA] p-5 border border-forest-900/[0.08] shadow-sm"
                  >
                    <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-forest-800 text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <p className="text-xs font-medium leading-relaxed text-forest-900/80 text-pretty">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* FAQ Accordion */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-700" />
                <h2 className="font-display text-xl font-extrabold text-forest-950 sm:text-2xl">
                  {activeRoute.faqTitle}
                </h2>
              </div>
              <div className="divide-y divide-forest-900/[0.08] rounded-3xl bg-[#FBFBFA] border border-forest-900/[0.08] shadow-card-rest">
                {activeRoute.faqs.map((faq) => (
                  <details key={faq.question} className="group p-5">
                    <summary className="cursor-pointer list-none text-sm font-bold text-forest-950 text-pretty transition-colors hover:text-emerald-800 flex items-center justify-between">
                      <span>{faq.question}</span>
                      <ChevronRight className="h-4 w-4 text-forest-900/40 transition-transform duration-200 group-open:rotate-90 group-open:text-emerald-700" />
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-forest-900/70 text-pretty">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </article>

          {/* Sticky Context Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Related Tools */}
            <div className="rounded-3xl bg-[#FBFBFA] p-6 border border-forest-900/[0.08] shadow-card-rest">
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest-800 mb-4">
                {activeRoute.relatedToolsTitle}
              </h2>
              <div className="space-y-2">
                {activeRoute.relatedTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-bold text-forest-900 border border-forest-900/10 transition-all duration-200 hover:bg-forest-800 hover:text-white hover:border-forest-800 shadow-sm"
                  >
                    <span>{tool.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-forest-900/40" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Book Summaries */}
            <div className="rounded-3xl bg-forest-50/60 p-6 border border-forest-900/[0.08]">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-forest-800">
                  {activeRoute.relatedSummariesTitle}
                </h2>
              </div>
              <div className="space-y-2">
                {activeRoute.relatedSummaries.map((summary) => (
                  <Link
                    key={summary.path}
                    to={summary.path}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-bold text-forest-900 border border-forest-900/10 transition-all duration-200 hover:bg-white hover:border-emerald-500/40 hover:shadow-sm"
                  >
                    <span>{summary.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-forest-900/40" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* BOTTOM 3 VALUE PILLARS */}
      <section className="bg-[#FBFBFA] px-4 py-16 sm:px-6 lg:px-8 border-t border-forest-900/[0.06]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Risk First Philosophy', 'Never let emotional confidence dictate lot size. The math precedes the entry.', ShieldCheck],
              ['Long-Range Thinking', 'FIRE targets and compounding curves are navigational systems, not short-term guarantees.', LineChart],
              ['Read & Apply', 'Pair calculations with distilled summaries on psychology, behavioral discipline, and wealth.', WalletCards],
            ].map(([title, body, Icon]) => (
              <article
                key={title as string}
                className="rounded-3xl bg-white p-6 border border-forest-900/[0.08] shadow-card-rest transition-all hover:shadow-card-hover"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-50 text-forest-800 border border-forest-900/10">
                  {React.createElement(Icon as typeof ShieldCheck, {
                    className: 'h-5 w-5 text-emerald-700',
                    'aria-hidden': true,
                  })}
                </span>
                <h3 className="font-display text-base font-bold text-forest-950">
                  {title as string}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-forest-900/70">
                  {body as string}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalculatorsPage;
