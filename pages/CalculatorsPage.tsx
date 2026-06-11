import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import FIRECalculator from '../components/FIRECalculator';
import CompoundCalculator from '../components/CompoundCalculator';
import useSEO from '../hooks/useSEO';
import { Calculator, CheckCircle2, Flame, LineChart, ShieldCheck, Sparkles, Target, TrendingUp, WalletCards } from 'lucide-react';

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

const CalculatorsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useSEO({
    title: 'Free Trading & Financial Calculators - Pip Value, Position Size, FIRE & Compound Interest | BookBriefs',
    description: 'Calculate trading pip values, position sizes, FIRE numbers, and compound interest with our free financial calculators. Essential tools for traders and investors.',
    keywords: 'trading calculator, pip value calculator, position size calculator, FIRE calculator, compound interest calculator, forex calculator, trading tools, financial planning',
    type: 'website',
  });
  
  // Determine active tab from URL
  const getTabFromPath = (path: string): CalculatorTab => {
    if (path.includes('/pip-value')) return 'pipValue';
    if (path.includes('/position-size')) return 'positionSize';
    if (path.includes('/fire')) return 'fire';
    if (path.includes('/compound-interest')) return 'compound';
    return 'positionSize'; // default
  };

  const [activeTab, setActiveTab] = useState<CalculatorTab>(getTabFromPath(location.pathname));

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Handle tab change with URL update
  const handleTabChange = (tab: CalculatorTab) => {
    setActiveTab(tab);
    const pathMap: Record<CalculatorTab, string> = {
      pipValue: '/calculators/pip-value',
      positionSize: '/calculators/position-size',
      fire: '/calculators/fire',
      compound: '/calculators/compound-interest'
    };
    navigate(pathMap[tab]);
  };

  const activeCalculator = calculatorTabs.find((tab) => tab.id === activeTab) ?? calculatorTabs[0];
  const ActiveIcon = activeCalculator.icon;
  const activeDetail = calculatorDetails[activeTab];

  return (
    <div className="overflow-x-hidden bg-[#fffaf3]">
      <section className="relative isolate overflow-hidden bg-[#f7f0e6] px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-14 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fffaf3] to-transparent" aria-hidden="true" />
        <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Free planning tools
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-gray-950 text-balance sm:text-5xl lg:text-6xl">
              Calculate the move before money is on the line.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b4d] md:text-lg md:leading-8">
              Use simple calculators for trade risk, pip value, FIRE targets, and long-term compounding without opening a spreadsheet.
            </p>
          </div>

          <div className="relative min-h-[250px] sm:min-h-[320px]">
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5d8c7]/80 blur-3xl md:h-[430px] md:w-[430px]" aria-hidden="true" />
            <img
              src="/images/bookbriefs-calculator-companion.png"
              alt="BookBriefs calculator companion"
              className="relative z-10 mx-auto h-auto w-full max-w-[320px] select-none rounded-[28px] shadow-[0_24px_54px_rgba(89,69,45,0.14)] ring-1 ring-[#dccfbd] sm:max-w-[380px] lg:max-w-[440px]"
              loading="eager"
              decoding="async"
            />
            <div className="absolute bottom-4 left-0 z-20 hidden max-w-[250px] rounded-2xl bg-white/88 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur sm:block">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">{activeDetail.eyebrow}</p>
              <p className="mt-1 text-sm font-black text-gray-950">{activeDetail.formula}</p>
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
                  <h2 className="text-2xl font-black leading-tight text-gray-950">{activeCalculator.label}</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex" role="tablist" aria-label="Calculator tools">
                {calculatorTabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition-[background-color,color,box-shadow] duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#a75d37] text-white shadow-[0_10px_20px_rgba(167,93,55,0.22)] [&_span]:text-white [&_svg]:text-white'
                          : 'bg-[#f7f0e6] text-[#453c31] hover:bg-[#e5d8c7]'
                      }`}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{tab.shortLabel}</span>
                    </button>
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
