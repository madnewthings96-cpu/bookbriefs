
import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, Landmark, LineChart, Quote, Target, TrendingUp } from 'lucide-react';
import { TESTIMONIALS } from '../constants';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';

// Lazy load heavy components
const Testimonials = lazy(() => import('../components/Testimonials'));
const MostReadBooks = lazy(() => import('../components/MostReadBooks'));

const readingPaths = [
  {
    title: 'Build better habits',
    description: 'A practical path for routines, discipline, and identity-based change.',
    icon: Target,
    color: 'bg-orange-50 text-orange-700 ring-orange-100',
    books: [
      { title: 'Atomic Habits', image: '/images/atomic-habits.jpg', to: '/summary/atomic-habits' },
      { title: 'The 7 Habits', image: '/images/the 7 habits of highly effective people.jpg', to: '/summary/the-7-habits-of-highly-effective-people' },
      { title: "Can't Hurt Me", image: "/images/can't hurt me.jpg", to: '/summary/cant-hurt-me' },
    ],
  },
  {
    title: 'Understand money',
    description: 'Learn the mental models behind wealth, saving, and long-term investing.',
    icon: Landmark,
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    books: [
      { title: 'The Psychology of Money', image: '/images/the psychology of money.jpg', to: '/summary/the-psychology-of-money' },
      { title: 'Rich Dad Poor Dad', image: '/images/rich dad poor dad.jpg', to: '/summary/rich-dad-poor-dad' },
      { title: 'The Intelligent Investor', image: '/images/the intelligent investor.jpg', to: '/summary/the-intelligent-investor' },
    ],
  },
  {
    title: 'Think like a trader',
    description: 'Study risk, psychology, and decision-making before the next setup.',
    icon: LineChart,
    color: 'bg-sky-50 text-sky-700 ring-sky-100',
    books: [
      { title: 'Trading in the Zone', image: '/images/trading-in-the-zone.jpg', to: '/summary/trading-in-the-zone' },
      { title: 'The Mental Game', image: '/images/the mental game of trading.jpg', to: '/summary/the-mental-game-of-trading' },
      { title: 'Best Loser Wins', image: '/images/best loser wins.jpg', to: '/summary/best-loser-wins' },
    ],
  },
  {
    title: 'Sharpen your thinking',
    description: 'Use big-picture books to understand people, history, and better judgment.',
    icon: Brain,
    color: 'bg-violet-50 text-violet-700 ring-violet-100',
    books: [
      { title: 'Sapiens', image: '/images/sapiens.jpg', to: '/summary/sapiens' },
      { title: 'Thinking, Fast and Slow', image: '/images/fast and slow.jpg', to: '/summary/thinking-fast-and-slow' },
      { title: 'The Subtle Art', image: '/images/the subtle art.jpg', to: '/summary/the-subtle-art-of-not-giving-a-f' },
    ],
  },
];

const howItWorks = [
  {
    title: 'Pick the outcome',
    description: 'Choose a book, topic, or reading path based on what you want to improve next.',
    icon: Target,
    step: '01',
  },
  {
    title: 'Read the distilled brief',
    description: 'Get the core argument, best ideas, and practical takeaways without filler.',
    icon: BookOpen,
    step: '02',
  },
  {
    title: 'Keep the useful ideas',
    description: 'Turn the best insights into saved notes, challenges, and repeatable actions.',
    icon: CheckCircle2,
    step: '03',
  },
];

const HomePage: React.FC = () => {
  useSEO({
    title: 'BookBriefs - Transform Your Learning with Powerful Book Summaries',
    description: 'Discover key insights from the world\'s greatest business and self-help books. Get comprehensive book summaries in minutes, not hours. Join thousands of learners today.',
    keywords: 'book summaries, business books, self-help books, book insights, learning, personal development, productivity, leadership books',
    type: 'website',
  });

  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <div>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden bg-[#f7f0e6] px-4 pb-8 pt-6 sm:px-6 md:pb-10 md:pt-8 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/80 to-transparent" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-7xl">
            <div className="grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
              <div className="max-w-3xl text-left">
                <div className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e5d8c7] px-4 py-2 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_1px_2px_rgba(17,24,39,0.06),0_12px_30px_rgba(89,69,45,0.10)]">
                  <div className="flex" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-current text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-black tabular-nums text-[#453c31]">5,000+ readers</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-gray-950 text-balance sm:text-5xl lg:text-6xl">
                  Meet your shortcut to the best ideas in books.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b4d] text-pretty md:text-lg md:leading-8">
                  BookBriefs turns powerful business, money, psychology, and self-growth books into clear 10-minute reads you can actually remember.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/summaries"
                    className="pressable inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#a75d37] px-7 py-3 text-base font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.12),0_18px_38px_rgba(167,93,55,0.28)] transition-[transform,box-shadow,background-color] duration-300 hover:bg-[#8f4f2f] hover:shadow-[0_1px_2px_rgba(89,69,45,0.12),0_22px_48px_rgba(167,93,55,0.34)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#a75d37]/30"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="arabic-btn text-white">إقرأ الآن</span>
                    <ArrowRight className="h-5 w-5 text-white" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/calculators"
                    className="pressable hidden min-h-12 items-center justify-center gap-2 rounded-full bg-white/70 px-6 py-3 text-base font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_10px_24px_rgba(89,69,45,0.08)] transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-gray-950 sm:inline-flex"
                  >
                    Use Calculator
                  </Link>
                </div>

                <div className="mt-7 hidden max-w-2xl grid-cols-3 gap-3 sm:grid">
                  {[
                    ['100+', 'book summaries'],
                    ['10 min', 'average read'],
                    ['Weekly', 'new ideas'],
                  ].map(([value, label]) => (
                    <div key={value} className="rounded-2xl bg-white/60 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                      <div className="text-lg font-black text-gray-950 md:text-2xl">{value}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[#7a6f62]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[270px] sm:min-h-[360px] lg:min-h-[470px]">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5d8c7]/80 blur-3xl md:h-[420px] md:w-[420px]" aria-hidden="true" />
                <img
                  src="/images/bookbriefs-reading-companion.png"
                  alt="BookBriefs reading companion"
                  className="relative z-10 mx-auto h-auto w-full max-w-[460px] select-none rounded-[28px] shadow-[0_24px_54px_rgba(89,69,45,0.14)] ring-1 ring-[#dccfbd]"
                  loading="eager"
                  decoding="async"
                />

                <div className="absolute right-0 top-6 z-20 hidden max-w-[200px] rounded-2xl bg-white/85 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur md:block">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#a75d37] text-white">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-black leading-5 text-gray-950">A full book idea before your coffee gets cold.</p>
                </div>

                <div className="absolute bottom-4 left-0 z-20 hidden max-w-[250px] rounded-2xl bg-white/85 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur sm:block">
                  <div className="mb-3 flex -space-x-2">
                    <img src="/images/atomic-habits.jpg" alt="" className="h-16 w-11 rounded-lg object-cover shadow-[0_8px_16px_rgba(17,24,39,0.18)] ring-2 ring-white" loading="lazy" aria-hidden="true" />
                    <img src="/images/the psychology of money.jpg" alt="" className="h-16 w-11 rounded-lg object-cover shadow-[0_8px_16px_rgba(17,24,39,0.18)] ring-2 ring-white" loading="lazy" aria-hidden="true" />
                    <img src="/images/100m money models.jpg" alt="" className="h-16 w-11 rounded-lg object-cover shadow-[0_8px_16px_rgba(17,24,39,0.18)] ring-2 ring-white" loading="lazy" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">Today&apos;s path</p>
                  <p className="mt-1 text-sm font-black text-gray-950">Habits, money, focus, decision-making</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-14 md:py-18">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  From shelf to insight
                </p>
                <h2 className="max-w-xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                  Finish more books without collecting more tabs.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
                  Use the same simple flow every time you want a useful idea: choose the goal, read the brief, then save what you can apply.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/summaries"
                    className="pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#a75d37] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(167,93,55,0.26)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#8f4f2f] hover:shadow-[0_20px_42px_rgba(167,93,55,0.32)]"
                  >
                    Explore summaries
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/reading-challenge"
                    className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f7f0e6] px-6 py-3 text-sm font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)] transition-[background-color,color] duration-200 hover:bg-[#e5d8c7]"
                  >
                    Build a reading habit
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {howItWorks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="group min-h-[190px] rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_16px_36px_rgba(89,69,45,0.08)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-1 hover:bg-[#fffaf3] hover:shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_22px_46px_rgba(89,69,45,0.13)] md:min-h-[250px]"
                    >
                      <div className="mb-8 flex items-center justify-between">
                        <span className="text-sm font-black text-[#a75d37]">{item.step}</span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)] transition-[background-color,color] duration-200 group-hover:bg-[#a75d37] group-hover:text-white">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="text-xl font-black leading-tight text-gray-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#675b4d]">{item.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Most Read Books Section */}
        <section className="bg-[#fffaf3] py-6 md:py-8">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <MostReadBooks />
          </Suspense>
        </section>

        {/* Reading Paths Section */}
        <section className="bg-[#f7f0e6] py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)]">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Start with intent
                </p>
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                  Choose a path, not a random book.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Pick the outcome you care about and follow a short sequence of summaries that build on each other.
                </p>
              </div>
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#a75d37] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(167,93,55,0.24)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#8f4f2f] hover:shadow-[0_18px_38px_rgba(167,93,55,0.30)]"
              >
                Browse all summaries
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {readingPaths.map((path) => {
                const Icon = path.icon;

                return (
                  <article key={path.title} className="rounded-2xl bg-white/85 p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.10)] ring-1 ring-[#d7c7b3]/70 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_24px_54px_rgba(89,69,45,0.16)]">
                    <div className="mb-5 flex items-start gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${path.color}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-lg font-black leading-tight text-gray-950">{path.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{path.description}</p>
                      </div>
                    </div>

                    <div className="mb-5 flex -space-x-3">
                      {path.books.map((book) => (
                        <Link
                          key={book.title}
                          to={book.to}
                          className="group relative block h-28 w-20 overflow-hidden rounded-xl bg-gray-100 shadow-[0_10px_24px_rgba(17,24,39,0.14)] ring-2 ring-white transition-transform duration-200 hover:-translate-y-1"
                          aria-label={`Read ${book.title}`}
                        >
                          <img src={book.image} alt="" className="h-full w-full object-cover" loading="lazy" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={path.books[0].to}
                      className="group inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f7f0e6] px-4 py-2 text-sm font-bold text-[#453c31] transition-[background-color,color] duration-200 hover:bg-[#a75d37] hover:text-white"
                    >
                      Start this path
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Summary Preview Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="relative rounded-2xl bg-[#f7f0e6] p-6 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_18px_44px_rgba(89,69,45,0.12)] md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <img
                    src="/images/atomic-habits.jpg"
                    alt="Atomic Habits book cover"
                    className="h-56 w-40 shrink-0 self-center rounded-xl object-cover shadow-[0_18px_34px_rgba(17,24,39,0.22)] sm:self-start md:h-64 md:w-44"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#a75d37]">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      10 min read
                    </p>
                    <h2 className="text-3xl font-black leading-tight text-gray-950 md:text-4xl">
                      Preview a real summary.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#6f6558]">
                      Before someone commits, show them the actual shape of the product: concise ideas, useful takeaways, and actions they can try immediately.
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_14px_32px_rgba(89,69,45,0.10)]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-950">
                    <Quote className="h-4 w-4 text-orange-600" aria-hidden="true" />
                    Atomic Habits in one idea
                  </div>
                  <p className="text-sm leading-7 text-gray-700">
                    Small habits compound because they change the system you live by. The goal is not to chase one big transformation, but to make the next good action obvious, easy, and repeatable.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {['Key idea', 'Takeaway', 'Action'].map((label) => (
                    <div key={label} className="rounded-xl bg-white/70 p-3 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                      <p className="text-xs font-black uppercase tracking-[0.10em] text-[#a75d37]">{label}</p>
                      <p className="mt-1 text-sm font-bold leading-5 text-gray-950">
                        {label === 'Key idea' ? 'Habits are systems' : label === 'Takeaway' ? 'Make cues obvious' : 'Design one small cue today'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f7f0e6] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#a75d37]">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  What readers get
                </p>
                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                  Show the useful part before asking for the click.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                  Each summary should feel like a clear thinking tool: fast enough to finish, structured enough to remember, and practical enough to use.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    'The core argument in plain language',
                    '3-5 takeaways worth remembering',
                    'Practical actions to apply this week',
                    'Quotes and concepts without filler',
                  ].map((item) => (
                    <div key={item} className="flex min-h-16 items-start gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-950/5">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#a75d37]" aria-hidden="true" />
                      <span className="text-sm font-semibold leading-6 text-gray-800">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/summary/atomic-habits"
                    className="pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#a75d37] px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(167,93,55,0.28)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#8f4f2f] hover:shadow-[0_20px_42px_rgba(167,93,55,0.34)]"
                  >
                    Read Atomic Habits
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/summaries"
                    className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-800 transition-[background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
                  >
                    See all books
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="bg-white">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <Testimonials testimonials={TESTIMONIALS} />
          </Suspense>
        </div>

      </div>
    </>
  );
};

export default HomePage;
