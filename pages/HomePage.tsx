import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Compass,
  Headphones,
  Landmark,
  LineChart,
  Quote,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
  Calculator,
  Flame,
} from 'lucide-react';
import { TESTIMONIALS } from '../constants';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import RotatingHeroPhrase from '../components/RotatingHeroPhrase';

// Lazy load heavy components
const Testimonials = lazy(() => import('../components/Testimonials'));
const MostReadBooks = lazy(() => import('../components/MostReadBooks'));

const readingPaths = [
  {
    title: 'Build high-leverage habits',
    description: 'A structured sequence for compounding routines, discipline, and identity change.',
    icon: Target,
    tag: '3 Books · 30 min total',
    badgeColor: 'bg-forest-50 text-forest-800 border-forest-200',
    books: [
      { title: 'Atomic Habits', image: '/images/atomic-habits.jpg', to: '/summary/atomic-habits' },
      { title: 'The 7 Habits', image: '/images/the 7 habits of highly effective people.jpg', to: '/summary/the-7-habits-of-highly-effective-people' },
      { title: "Can't Hurt Me", image: "/images/can't hurt me.jpg", to: '/summary/cant-hurt-me' },
    ],
  },
  {
    title: 'The psychology of wealth',
    description: 'Learn the timeless behavioral principles behind money, saving, and patience.',
    icon: Landmark,
    tag: '3 Books · 30 min total',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    books: [
      { title: 'The Psychology of Money', image: '/images/the psychology of money.jpg', to: '/summary/the-psychology-of-money' },
      { title: 'Rich Dad Poor Dad', image: '/images/rich dad poor dad.jpg', to: '/summary/rich-dad-poor-dad' },
      { title: 'The Intelligent Investor', image: '/images/the intelligent investor.jpg', to: '/summary/the-intelligent-investor' },
    ],
  },
  {
    title: 'Trader & risk psychology',
    description: 'Master probability, discipline, and emotional control before your next trade.',
    icon: LineChart,
    tag: '3 Books · 30 min total',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    books: [
      { title: 'Trading in the Zone', image: '/images/trading-in-the-zone.jpg', to: '/summary/trading-in-the-zone' },
      { title: 'The Mental Game', image: '/images/the mental game of trading.jpg', to: '/summary/the-mental-game-of-trading' },
      { title: 'Best Loser Wins', image: '/images/best loser wins.jpg', to: '/summary/best-loser-wins' },
    ],
  },
  {
    title: 'Sharpen your mental models',
    description: 'Big-picture frameworks from history, psychology, and cognitive science.',
    icon: Brain,
    tag: '3 Books · 30 min total',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    books: [
      { title: 'Thinking, Fast and Slow', image: '/images/fast and slow.jpg', to: '/summary/thinking-fast-and-slow' },
      { title: 'Sapiens', image: '/images/sapiens.jpg', to: '/summary/sapiens' },
      { title: 'The Subtle Art', image: '/images/the subtle art.jpg', to: '/summary/the-subtle-art-of-not-giving-a-f' },
    ],
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'The 90% Filter',
    description:
      'Most 300-page business books can be stated in 10 pages. We strip author repetition, anecdotal padding, and filler so you get only the core signal.',
    icon: Target,
  },
  {
    step: '02',
    title: 'The Mental Model',
    description:
      'We extract the author’s primary reasoning frameworks so you don’t just memorize arbitrary quotes—you gain tools for clearer daily decision-making.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Tools for Action',
    description:
      'Every brief finishes with concrete 1-minute action steps, interactive calculators, and personal note saving so insights actually compound in your life.',
    icon: Zap,
  },
];

// Interactive Hero Brief Preview Widget (Bloom x Arcade Inspired)
const HeroInteractivePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'thesis' | 'model' | 'action'>('thesis');

  const tabContent = {
    thesis: {
      label: 'Core Thesis',
      quote:
        'Small habits do not add up; they compound exponentially. You do not rise to the level of your goals; you fall to the level of your systems.',
      takeaway: 'Focus on who you wish to become rather than simply what you want to achieve.',
      pill: 'Systems Thinking',
    },
    model: {
      label: 'The Mental Model',
      quote:
        'The 4 Laws of Behavior Change: To build a habit, make it (1) Obvious, (2) Attractive, (3) Easy, and (4) Satisfying.',
      takeaway: 'Inversion for breaking bad habits: Make cues invisible, unattractive, difficult, and painful.',
      pill: 'Behavioral Loop',
    },
    action: {
      label: '1-Minute Action',
      quote:
        'Habit Stacking Formula: "After [CURRENT HABIT], I will [NEW HABIT]."',
      takeaway: 'Example: "After I pour my morning coffee, I will open Ta7leel and read one 10-minute brief."',
      pill: 'Implementation Cue',
    },
  };

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-forest-500/15 to-emerald-300/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative rounded-3xl bg-white p-6 shadow-card-hover border border-forest-900/[0.08] backdrop-blur-xl md:p-7">
        {/* Top Header Bar */}
        <div className="mb-5 flex items-center justify-between border-b border-forest-900/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Interactive Brief Preview
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest-700">
            <Clock3 className="h-3.5 w-3.5 text-forest-600" />
            <span>10 min read</span>
            <span className="text-forest-300">·</span>
            <Headphones className="h-3.5 w-3.5 text-forest-600" />
            <span>Audio</span>
          </div>
        </div>

        {/* Book Identity Mini Row */}
        <div className="mb-5 flex gap-4 items-center">
          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg book-3d-shadow">
            <img
              src="/images/atomic-habits.jpg"
              alt="Atomic Habits by James Clear"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>4.9 (1,240+ readers)</span>
            </div>
            <h3 className="truncate font-display text-lg font-extrabold text-forest-950">
              Atomic Habits
            </h3>
            <p className="text-xs text-forest-800/70">by James Clear · Personal Growth</p>
          </div>
        </div>

        {/* Arcade-Style Segmented Tab Switcher */}
        <div className="mb-5 flex rounded-xl bg-forest-50 p-1 border border-forest-900/[0.06]">
          {(['thesis', 'model', 'action'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-forest-950 shadow-sm'
                  : 'text-forest-800/70 hover:text-forest-950'
              }`}
            >
              {tab === 'thesis' && '💡 Core Thesis'}
              {tab === 'model' && '🧠 Mental Model'}
              {tab === 'action' && '⚡ 1-Min Action'}
            </button>
          ))}
        </div>

        {/* Dynamic Card Body */}
        <div className="min-h-[140px] rounded-2xl bg-forest-50/50 p-4 border border-forest-900/[0.05] transition-all duration-300">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="inline-flex items-center rounded-md bg-forest-100 px-2.5 py-0.5 text-[11px] font-bold text-forest-800">
              {tabContent[activeTab].pill}
            </span>
            <span className="text-[11px] font-medium text-forest-800/60">
              Key Insight
            </span>
          </div>
          <blockquote className="font-serif italic text-base leading-relaxed text-forest-950">
            &ldquo;{tabContent[activeTab].quote}&rdquo;
          </blockquote>
          <p className="mt-2.5 text-xs font-medium leading-relaxed text-forest-800/80">
            <strong className="text-forest-950 font-bold">Takeaway: </strong>
            {tabContent[activeTab].takeaway}
          </p>
        </div>

        {/* Card Footer CTA */}
        <div className="mt-5 flex items-center justify-between pt-1">
          <div className="flex -space-x-1.5 overflow-hidden">
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-forest-200 text-[10px] font-bold text-forest-800 flex items-center justify-center">
              AR
            </span>
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center justify-center">
              EN
            </span>
          </div>
          <Link
            to="/summary/atomic-habits"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-600 transition-colors"
          >
            <span>Read full 10-min brief</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  useSEO({
    title: 'Ta7leel - High-Signal Book Summaries & Mental Models',
    description:
      'Master the key insights from the world’s greatest business, psychology, and self-growth books in 10 minutes. Distilled for clarity, retention, and action.',
    keywords:
      'book summaries, business books, self-help books, mental models, personal development, trading psychology, investing books, Arabic book summaries',
    type: 'website',
  });

  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />

      <div className="bg-[#FBFBFA] text-forest-950 selection:bg-forest-100 selection:text-forest-900">
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-16 lg:px-8 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(20,61,45,0.08),rgba(251,251,250,0))]">
          <div className="container relative z-10 mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

              {/* Left Column: Value Proposition */}
              <div className="max-w-2xl text-left">
                {/* Pill Tag & Social Proof */}
                <div className="mb-6 inline-flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1 text-xs font-bold text-forest-800 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-forest-600" />
                    Distilled Wisdom · 10-Minute Briefs
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-forest-900/[0.06] px-3 py-1 text-xs font-semibold text-forest-800 shadow-sm">
                    <div className="flex" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <span>5,000+ Active Readers</span>
                  </div>
                </div>

                {/* Primary Headline */}
                <h1
                  className="font-display text-4xl font-extrabold tracking-tight text-forest-950 sm:text-5xl lg:text-6xl text-balance leading-[1.06]"
                  aria-label="Read less. Understand more. Apply immediately."
                >
                  Read less. <br />
                  Understand more. <br />
                  <RotatingHeroPhrase />
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-base leading-relaxed text-forest-900/75 sm:text-lg sm:leading-8 text-pretty">
                  Ta7leel turns transformative books on psychology, money, habits, and strategy
                  into clear, actionable 10-minute briefs—stripping 90% of the fluff so you retain
                  the mental models that compound.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <Link
                    to="/summaries"
                    className="pressable inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-forest-800 px-8 py-3 text-base font-bold !text-white shadow-card-rest transition-all duration-200 hover:bg-forest-700 hover:shadow-card-hover hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-forest-700/30"
                  >
                    <span className="!text-white font-bold">Explore Library</span>
                    <ArrowRight className="h-4 w-4 !text-white" />
                  </Link>

                  <a
                    href="#reading-paths"
                    className="pressable inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-base font-bold !text-forest-950 border border-forest-900/15 shadow-sm transition-all duration-200 hover:bg-forest-50 hover:border-forest-900/30"
                  >
                    <span className="!text-forest-950 font-bold">Browse Paths</span>
                    <Compass className="h-4 w-4 text-forest-700" />
                  </a>
                </div>

                {/* Trust Badges / Stats Bar */}
                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-forest-900/[0.08] pt-7">
                  <div>
                    <div className="font-display text-2xl font-extrabold text-forest-950 sm:text-3xl">100+</div>
                    <div className="mt-0.5 text-xs font-semibold text-forest-900/60 uppercase tracking-wider">Distilled Books</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-extrabold text-forest-950 sm:text-3xl">10 Min</div>
                    <div className="mt-0.5 text-xs font-semibold text-forest-900/60 uppercase tracking-wider">Average Read</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-extrabold text-forest-950 sm:text-3xl">100%</div>
                    <div className="mt-0.5 text-xs font-semibold text-forest-900/60 uppercase tracking-wider">Actionable Signal</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Arcade-Style Interactive Brief Preview */}
              <div className="lg:pl-6">
                <HeroInteractivePreview />
              </div>

            </div>
          </div>
        </section>

        {/* THE TA7LEEL METHOD (How It Works) */}
        <section className="border-y border-forest-900/[0.06] bg-white py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-forest-800">
                <Clock3 className="h-3.5 w-3.5 text-forest-600" />
                The Distillation Engine
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-forest-950 md:text-5xl">
                Finish books. Keep the thinking.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest-900/70 md:text-lg">
                Reading isn’t a trophy of finished pages. It’s about extracting the sharpest mental
                models so you make better decisions in life, money, and work.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {howItWorks.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="group relative rounded-2xl bg-forest-50/40 p-7 border border-forest-900/[0.06] transition-all duration-300 hover:bg-white hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-display text-sm font-extrabold text-forest-700">
                        {item.step}
                      </span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-forest-800 border border-forest-900/[0.08] shadow-sm transition-colors duration-200 group-hover:bg-forest-800 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-forest-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-forest-900/70">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MOST READ BOOKS SHELF */}
        <section className="py-12 md:py-16">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-forest-800" />
              </div>
            }
          >
            <MostReadBooks />
          </Suspense>
        </section>

        {/* CURATED READING PATHS SECTION */}
        <section id="reading-paths" className="border-t border-forest-900/[0.06] bg-white py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-800">
                  <Compass className="h-3.5 w-3.5 text-forest-600" />
                  Intentional Learning
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-forest-950 md:text-5xl">
                  Curated paths, not random books.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-forest-900/70">
                  Pick the outcome you want to master. Follow a sequence of 3 complementary briefs
                  that build upon each other.
                </p>
              </div>
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-50 border border-forest-800/20 px-6 py-2.5 text-sm font-bold text-forest-800 transition-all duration-200 hover:bg-forest-800 hover:text-white"
              >
                <span>View all library</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {readingPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <article
                    key={path.title}
                    className="group flex flex-col justify-between rounded-3xl bg-[#FBFBFA] p-6 border border-forest-900/[0.08] shadow-card-rest transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-forest-600/30"
                  >
                    <div>
                      {/* Path Tag */}
                      <div className="mb-4 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${path.badgeColor}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {path.tag}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-forest-950 group-hover:text-forest-800 transition-colors">
                        {path.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-forest-900/70">
                        {path.description}
                      </p>

                      {/* Stacked 3D Books */}
                      <div className="my-6 flex -space-x-3 items-center justify-center py-2">
                        {path.books.map((book) => (
                          <Link
                            key={book.title}
                            to={book.to}
                            className="group/book relative block h-24 w-16 overflow-hidden rounded-lg book-3d-shadow transition-all duration-200 hover:-translate-y-2 hover:z-20 ring-2 ring-white"
                            aria-label={`Read ${book.title}`}
                          >
                            <img
                              src={book.image}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={path.books[0].to}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-forest-900 border border-forest-900/10 shadow-sm transition-all duration-200 group-hover:bg-forest-800 group-hover:text-white group-hover:border-forest-800"
                    >
                      <span>Start this path</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* BRIEF ANATOMY SHOWCASE (The Psychology of Money Feature) */}
        <section className="border-t border-forest-900/[0.06] bg-[#FBFBFA] py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">

              {/* Visual Card */}
              <div className="relative rounded-3xl bg-white p-7 shadow-card-hover border border-forest-900/[0.08] md:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-60 w-40 shrink-0 self-center overflow-hidden rounded-xl book-3d-shadow sm:self-start">
                    <img
                      src="/images/the psychology of money.jpg"
                      alt="The Psychology of Money by Morgan Housel"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <Clock3 className="h-3.5 w-3.5" />
                      10 Min Read · Wealth & Behavior
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-forest-950">
                      The Psychology of Money
                    </h3>
                    <p className="mt-1 text-xs text-forest-800/70 font-medium">
                      by Morgan Housel · 19 Timeless Lessons
                    </p>

                    <div className="mt-5 rounded-2xl bg-forest-50/60 p-4 border border-forest-900/[0.06]">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-forest-800">
                        <Quote className="h-3.5 w-3.5 text-emerald-700" />
                        The Core Premise
                      </div>
                      <blockquote className="font-serif italic text-sm leading-relaxed text-forest-950">
                        &ldquo;Doing well with money has a little to do with how smart you are and a
                        lot to do with how you behave. Genius without behavioral control is a
                        disaster.&rdquo;
                      </blockquote>
                    </div>
                  </div>
                </div>

                {/* 3 Pillars of Every Brief */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-forest-50/50 p-3.5 border border-forest-900/[0.05]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest-700">
                      The Thesis
                    </span>
                    <p className="mt-1 text-xs font-semibold leading-snug text-forest-950">
                      Wealth is what you do not see: unspent options.
                    </p>
                  </div>
                  <div className="rounded-xl bg-forest-50/50 p-3.5 border border-forest-900/[0.05]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest-700">
                      The Model
                    </span>
                    <p className="mt-1 text-xs font-semibold leading-snug text-forest-950">
                      Reasonable beats purely rational every time.
                    </p>
                  </div>
                  <div className="rounded-xl bg-forest-50/50 p-3.5 border border-forest-900/[0.05]">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest-700">
                      The Action
                    </span>
                    <p className="mt-1 text-xs font-semibold leading-snug text-forest-950">
                      Define &quot;enough&quot; before the finish line shifts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pitch Right Column */}
              <div className="lg:pl-6">
                <p className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-800">
                  <TrendingUp className="h-3.5 w-3.5 text-forest-600" />
                  Inside Every Brief
                </p>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-forest-950 md:text-5xl">
                  We show you the value before asking for your time.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-forest-900/70">
                  Every summary on Ta7leel is built like an executive brief. No fluff, no sponsored
                  endorsements—just the hardest insights synthesized for rapid consumption and long-term
                  application.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    'Core thesis explained in plain, direct language',
                    '3 to 5 universal mental models you can apply',
                    'Concrete 1-minute action steps for immediate compounding',
                    'Bilingual Arabic & English briefs with audio playback',
                  ].map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-forest-900/[0.06] shadow-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-sm font-semibold text-forest-950 leading-snug">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/summary/the-psychology-of-money"
                    className="pressable inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-forest-800 px-7 py-3 text-sm font-bold !text-white shadow-card-rest transition-all duration-200 hover:bg-forest-700 hover:shadow-card-hover"
                  >
                    <span className="!text-white font-bold">Read Psychology of Money</span>
                    <ArrowRight className="h-4 w-4 !text-white" />
                  </Link>
                  <Link
                    to="/reading-challenge"
                    className="pressable inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold !text-forest-950 border border-forest-900/15 transition-all duration-200 hover:bg-forest-50"
                  >
                    <span className="!text-forest-950 font-bold">Join 30-Day Challenge</span>
                    <Flame className="h-4 w-4 text-amber-500" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LEARNING OS HIGHLIGHT (Calculators & Challenges) */}
        <section className="border-t border-forest-900/[0.06] bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-forest-50/70 p-8 border border-forest-900/[0.08] lg:p-12">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white border border-forest-900/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-800 shadow-sm">
                    <Calculator className="h-3.5 w-3.5 text-forest-600" />
                    Interactive Learning System
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-extrabold text-forest-950 sm:text-4xl">
                    More than reading. <br />
                    Test ideas with interactive tools.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-forest-900/70 sm:text-base">
                    Use our built-in financial compounding calculators, position-sizing tools, and the
                    30-Day Reading Challenge to verify insights with real data.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/calculators"
                      className="pressable inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-forest-700"
                    >
                      <Calculator className="h-4 w-4" />
                      Try Calculators
                    </Link>
                    <Link
                      to="/reading-challenge"
                      className="pressable inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-forest-900 border border-forest-900/15 shadow-sm transition-all duration-200 hover:bg-forest-50"
                    >
                      <Flame className="h-4 w-4 text-amber-500" />
                      Reading Challenge
                    </Link>
                  </div>
                </div>

                {/* Quick Interactive Tool Snippet */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-5 border border-forest-900/[0.06] shadow-sm">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <h4 className="font-display font-bold text-forest-950 text-sm">Compound Growth</h4>
                    <p className="mt-1 text-xs text-forest-900/60 leading-relaxed">
                      Visualize how small regular investments compound over 10, 20, and 30 years.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 border border-forest-900/[0.06] shadow-sm">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <Flame className="h-4 w-4 text-amber-500" />
                    </div>
                    <h4 className="font-display font-bold text-forest-950 text-sm">30-Day Streak</h4>
                    <p className="mt-1 text-xs text-forest-900/60 leading-relaxed">
                      Read one brief per day to build an automatic, unstoppable learning habit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <div className="border-t border-forest-900/[0.06] bg-white">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-forest-800" />
              </div>
            }
          >
            <Testimonials testimonials={TESTIMONIALS} />
          </Suspense>
        </div>

        {/* HIGH-CONVERSION BOTTOM BANNER */}
        <section className="relative isolate overflow-hidden bg-forest-900 px-4 py-16 sm:px-6 md:py-24 lg:px-8 text-white">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-forest-700/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative z-10 mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-800/80 border border-forest-700/50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Start Reading Smarter Today
            </span>

            <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-tight !text-white">
              Stop letting great ideas get lost in unread books.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed !text-forest-100/90 sm:text-lg">
              Join thousands of thoughtful readers who use Ta7leel every week to master business,
              psychology, and personal growth in 10 minutes.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-base font-bold !text-forest-950 shadow-lg transition-all duration-200 hover:bg-forest-50 hover:scale-105"
              >
                <span className="!text-forest-950 font-bold">Browse All 100+ Summaries</span>
                <ArrowRight className="h-4 w-4 !text-forest-950" />
              </Link>
              <Link
                to="/reading-challenge"
                className="pressable inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-forest-800 px-7 py-3.5 text-base font-bold !text-white border border-forest-600 shadow-sm transition-all duration-200 hover:bg-forest-700"
              >
                <span className="!text-white font-bold">Take the Reading Challenge</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HomePage;
