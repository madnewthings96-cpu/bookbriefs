import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, Compass, LineChart, ShieldCheck, Sparkles, Target } from 'lucide-react';
import useSEO from '../hooks/useSEO';

const storyMilestones = [
  {
    title: 'The problem was not motivation.',
    text: 'Most readers already want to learn. The real problem is friction: long reading queues, scattered notes, and ideas that disappear before they become useful.',
  },
  {
    title: 'The answer was distillation.',
    text: 'Ta7leel means analysis. We take serious books and turn them into clear briefs: the core idea, the mental model, the useful quote, and the action worth trying.',
  },
  {
    title: 'The product became a system.',
    text: 'Summaries, reading paths, challenges, and calculators now work together so learning is not just consumed. It is organized, remembered, and applied.',
  },
];

const principles = [
  {
    title: 'Clarity before volume',
    text: 'A shorter brief is only useful if it preserves the hard idea. We prefer sharp, structured insight over long summaries that feel productive but do not stick.',
    icon: Sparkles,
  },
  {
    title: 'Useful beats impressive',
    text: 'Every summary should help a reader make a better decision, improve a habit, understand money, or think more clearly about risk and behavior.',
    icon: Target,
  },
  {
    title: 'Depth without noise',
    text: 'We keep the author’s main argument intact, then remove repetition, filler, and vague motivation so the reader gets the strongest signal quickly.',
    icon: Brain,
  },
];

const focusAreas = [
  ['Finance', 'Money, markets, investing, and the psychology behind risk.'],
  ['Behavior', 'Habits, discipline, attention, and the systems that shape daily choices.'],
  ['Thinking', 'Mental models, decision-making, history, and human nature.'],
  ['Practice', 'Calculators, challenges, and tools that turn ideas into action.'],
];

const AboutPage: React.FC = () => {
  useSEO({
    title: 'About Ta7leel - Clear Book Summaries for Better Decisions | BookBriefs',
    description: 'Learn why Ta7leel exists, how BookBriefs distills serious books into useful ideas, and how the platform helps readers learn, remember, and apply more.',
    keywords: 'about ta7leel, about bookbriefs, book summaries, learning platform, trading psychology, finance books, self development',
    type: 'website',
  });

  return (
    <div className="overflow-x-hidden bg-[#fffaf3]">
      <section className="relative isolate overflow-hidden bg-[#f7f0e6] px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-14 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fffaf3] to-transparent" aria-hidden="true" />
        <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              About Ta7leel
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-gray-950 text-balance sm:text-5xl lg:text-6xl">
              We turn serious books into ideas you can actually use.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b4d] md:text-lg md:leading-8">
              Ta7leel began with a simple frustration: the best lessons in finance, psychology, trading, and self-development were hidden across hundreds of books, but most people did not have the time or structure to extract them.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#675b4d] md:text-lg md:leading-8">
              BookBriefs is our answer: clear summaries, practical paths, and small tools that help readers move from curiosity to action without drowning in information.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#a75d37] px-7 py-3 text-base font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.12),0_18px_38px_rgba(167,93,55,0.28)] transition-[transform,box-shadow,background-color] duration-300 hover:bg-[#8f4f2f] hover:shadow-[0_1px_2px_rgba(89,69,45,0.12),0_22px_48px_rgba(167,93,55,0.34)]"
              >
                Browse summaries
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                to="/calculators"
                className="pressable inline-flex min-h-12 items-center justify-center rounded-full bg-white/70 px-6 py-3 text-base font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_10px_24px_rgba(89,69,45,0.08)] transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-gray-950"
              >
                Use Calculator
              </Link>
            </div>
          </div>

          <div className="relative min-h-[360px] lg:min-h-[500px]">
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5d8c7]/80 blur-3xl md:h-[460px] md:w-[460px]" aria-hidden="true" />
            <img
              src="/images/bookbriefs-reading-companion.png"
              alt="BookBriefs reading companion"
              className="relative z-10 mx-auto h-auto w-full max-w-[480px] select-none rounded-[28px] shadow-[0_24px_54px_rgba(89,69,45,0.14)] ring-1 ring-[#dccfbd]"
              loading="eager"
              decoding="async"
            />
            <div className="absolute bottom-4 left-0 z-20 hidden max-w-[260px] rounded-2xl bg-white/88 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur sm:block">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">Our promise</p>
              <p className="mt-1 text-sm font-black text-gray-950">Less noise, more usable wisdom.</p>
            </div>
            <div className="absolute right-0 top-8 z-20 hidden max-w-[230px] rounded-2xl bg-white/88 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur md:block">
              <Clock3 className="mb-2 h-5 w-5 text-[#a75d37]" aria-hidden="true" />
              <p className="text-sm font-black leading-5 text-gray-950">A strong idea should fit inside a focused reading session.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-18 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Why we exist
              </p>
              <h2 className="max-w-xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                Reading should create change, not just a longer saved list.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
                Most learning products reward collecting. More books saved, more tabs open, more notes scattered everywhere. We care about a different outcome: one useful idea understood well enough to act on.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {principles.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.title}
                    className="rounded-2xl bg-[#f7f0e6] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_16px_36px_rgba(89,69,45,0.08)]"
                  >
                    <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-black leading-tight text-gray-950">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#675b4d]">{principle.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f0e6] px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="rounded-2xl bg-white/86 p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_24px_56px_rgba(89,69,45,0.14)] ring-1 ring-[#d7c7b3] md:p-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f7f0e6] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#a75d37]">
              <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
              The origin
            </p>
            <h2 className="max-w-2xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
              It started with markets, psychology, and a lot of unfinished books.
            </h2>
            <div className="mt-8 space-y-5">
              {storyMilestones.map((item, index) => (
                <article key={item.title} className="grid gap-4 border-t border-[#e5d8c7] pt-5 sm:grid-cols-[52px_1fr]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a75d37] text-sm font-black text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-gray-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#675b4d]">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/bookbriefs-calculator-companion.png"
              alt="BookBriefs companion with calculator"
              className="mx-auto h-auto w-full max-w-[430px] rounded-[28px] shadow-[0_24px_54px_rgba(89,69,45,0.14)] ring-1 ring-[#dccfbd]"
              loading="lazy"
              decoding="async"
            />
            <div className="mx-auto mt-5 max-w-md rounded-2xl bg-white/86 p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.10)] ring-1 ring-[#d7c7b3]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">Why tools belong here</p>
              <p className="mt-2 text-sm leading-7 text-[#4d453a]">
                Learning is strongest when an idea meets a decision. That is why Ta7leel pairs summaries with practical calculators and reading challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-18 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                What we focus on
              </p>
              <h2 className="max-w-3xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
                A library for people who want sharper judgment.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-gray-600">
              The library is intentionally focused. We choose books that help readers understand money, behavior, risk, discipline, and better thinking.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {focusAreas.map(([title, text]) => (
              <article key={title} className="rounded-2xl bg-[#fffaf3] p-5 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <CheckCircle2 className="mb-7 h-6 w-6 text-[#a75d37]" aria-hidden="true" />
                <h3 className="text-xl font-black text-gray-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#675b4d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e5d8c7] px-4 py-14 sm:px-6 md:py-18 lg:px-8">
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <img
              src="/images/Footer character.png"
              alt="Ta7leel character standing on a mountain"
              className="h-auto w-full max-w-[250px]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Keep going
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
              You do not need to read everything. You need the right ideas at the right time.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d453a]">
              Ta7leel is built for readers who want to become more disciplined, thoughtful, and useful in the real world. Start with one summary, one insight, one better decision.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#a75d37] px-7 py-3 text-base font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.12),0_18px_38px_rgba(167,93,55,0.28)] transition-[transform,box-shadow,background-color] duration-300 hover:bg-[#8f4f2f]"
              >
                Start reading
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                to="/calculators"
                className="pressable inline-flex min-h-12 items-center justify-center rounded-full bg-white/70 px-6 py-3 text-base font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_10px_24px_rgba(89,69,45,0.08)] transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-gray-950"
              >
                Use the tools
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
