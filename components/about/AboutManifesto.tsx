import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookCheck,
  BookOpen,
  Brain,
  Calculator,
  Compass,
  Focus,
  LineChart,
  Scissors,
  Sparkles,
  Target,
} from 'lucide-react';

const storyMilestones = [
  {
    label: 'Friction',
    title: 'The problem was never motivation.',
    text: 'Readers already want to learn. The friction is a queue of unfinished books, scattered notes, and useful ideas that disappear before they reach a real decision.',
  },
  {
    label: 'Distillation',
    title: 'Analysis became the method.',
    text: 'Ta7leel means analysis. We preserve the author’s argument, uncover its strongest mental model, and remove the repetition surrounding it.',
  },
  {
    label: 'Application',
    title: 'The brief became a field tool.',
    text: 'Summaries now sit beside reading paths, challenges, and calculators so an idea can move from something understood to something practiced.',
  },
];

const distillationStandards = [
  {
    icon: BookCheck,
    title: 'Protect the argument',
    text: 'A shorter read must still represent the book honestly. We keep the central claim, its reasoning, and the context that makes it meaningful.',
  },
  {
    icon: Scissors,
    title: 'Remove the noise',
    text: 'Repetition, filler, and vague motivation make way for the ideas, examples, and mental models worth remembering.',
  },
  {
    icon: Target,
    title: 'End with application',
    text: 'Each brief should leave you with a clearer decision, a useful question, or one action you can test in the real world.',
  },
];

const focusAreas = [
  {
    label: 'Money & risk',
    title: 'Finance',
    text: 'Markets, investing, wealth, and the psychology behind financial decisions.',
    icon: LineChart,
  },
  {
    label: 'Systems & attention',
    title: 'Behavior',
    text: 'Habits, discipline, focus, and the environments that shape daily choices.',
    icon: Focus,
  },
  {
    label: 'Models & judgment',
    title: 'Thinking',
    text: 'Decision-making, history, human nature, and the ideas that sharpen perspective.',
    icon: Brain,
  },
  {
    label: 'Ideas in motion',
    title: 'Practice',
    text: 'Calculators, challenges, and tools that turn understanding into a repeatable habit.',
    icon: Calculator,
  },
];

const AboutManifesto: React.FC = () => (
  <div className="about-manifesto">
    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero__atmosphere" aria-hidden="true" />
      <div className="about-hero__copy">
        <p className="about-kicker"><Compass size={16} aria-hidden="true" /> About Ta7leel</p>
        <h1 id="about-title">
          Ideas are only useful when they <em>change what you do.</em>
        </h1>
        <p className="about-hero__dek">
          Ta7leel turns serious books on money, psychology, behavior, and better thinking into clear ideas you can carry into your next decision.
        </p>
        <div className="about-actions">
          <Link className="about-action about-action--primary" to="/summaries">
            Browse summaries <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="about-action about-action--quiet" to="/calculators">
            Use the tools
          </Link>
        </div>
      </div>

      <figure className="about-hero__figure">
        <div className="about-hero__frame">
          <img
            src="/images/bookbriefs-reading-companion.png"
            alt="Ta7leel reading companion turning a book into an actionable idea"
            loading="eager"
            decoding="async"
          />
        </div>
        <figcaption>
          <span>Our promise</span>
          <strong>Less noise. More usable wisdom.</strong>
        </figcaption>
      </figure>

      <div className="about-hero__mantra" role="region" aria-label="Ta7leel method" tabIndex={0}>
        <span><b>Read</b> Find the signal</span>
        <span><b>Understand</b> Build the model</span>
        <span><b>Apply</b> Change the decision</span>
      </div>
    </section>

    <div className="about-spine">
      <section className="about-story" aria-labelledby="about-story-title">
        <div className="about-section-heading">
          <p className="about-eyebrow"><BookOpen size={15} aria-hidden="true" /> Why we exist</p>
          <h2 id="about-story-title">From pages to practice</h2>
          <p>Reading should create change—not simply make a saved list longer.</p>
        </div>

        <ol className="about-story__steps">
          {storyMilestones.map((milestone, index) => (
            <li key={milestone.label}>
              <div className="about-story__marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
              <article>
                <p>{milestone.label}</p>
                <h3>{milestone.title}</h3>
                <span>{milestone.text}</span>
              </article>
            </li>
          ))}
        </ol>

        <aside className="about-story__tool">
          <img
            src="/images/bookbriefs-calculator-companion.png"
            alt="Ta7leel companion using a calculator to put an idea into practice"
            loading="lazy"
            decoding="async"
          />
          <div>
            <p><Calculator size={15} aria-hidden="true" /> Why tools belong here</p>
            <h3>An idea becomes useful at the moment of decision.</h3>
            <span>That is why Ta7leel pairs reading with calculators, challenges, and practical prompts.</span>
          </div>
        </aside>
      </section>

      <section className="about-standard" aria-labelledby="about-standard-title">
        <div className="about-standard__intro">
          <p className="about-eyebrow"><Sparkles size={15} aria-hidden="true" /> The editorial standard</p>
          <h2 id="about-standard-title">How we choose and distill books</h2>
          <p>Shorter is not the goal. Clearer, truer, and more useful is.</p>
        </div>
        <div
          className="about-standard__grid"
          role="region"
          aria-label="How Ta7leel distills books"
          tabIndex={0}
        >
          {distillationStandards.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <div className="about-standard__number">0{index + 1}</div>
              <span className="about-standard__icon"><Icon size={20} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-fields" aria-labelledby="about-fields-title">
        <div className="about-section-heading about-section-heading--wide">
          <div>
            <p className="about-eyebrow"><Brain size={15} aria-hidden="true" /> The library</p>
            <h2 id="about-fields-title">Four fields. One sharper mind.</h2>
          </div>
          <p>We choose books that help readers understand money, behavior, risk, discipline, and better thinking.</p>
        </div>
        <div className="about-fields__rail" role="region" aria-label="Ta7leel focus areas" tabIndex={0}>
          {focusAreas.map(({ icon: Icon, label, title, text }) => (
            <article key={title}>
              <div className="about-fields__topline">
                <span>{label}</span>
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>

    <section className="about-closing" aria-labelledby="about-closing-title">
      <div className="about-closing__art">
        <img
          src="/images/Footer character.png"
          alt="Ta7leel companion reaching the top of a mountain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="about-closing__copy">
        <p className="about-kicker"><Sparkles size={15} aria-hidden="true" /> Start with one idea</p>
        <h2 id="about-closing-title">You do not need to read everything.</h2>
        <p className="about-closing__statement">You need the right idea at the right time.</p>
        <p>Choose one summary, keep one useful insight, and bring it into one better decision.</p>
        <div className="about-actions">
          <Link className="about-action about-action--primary" to="/summaries">
            Start reading <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="about-action about-action--quiet" to="/calculators">
            Explore calculators
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutManifesto;
