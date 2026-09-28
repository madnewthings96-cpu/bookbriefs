import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CircleDot,
  Compass,
  MoveRight,
  Sparkles,
  Target,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import {
  CONNECTIONS_SEO,
  CONNECTION_STORIES,
  CONNECTION_TOPICS,
  FEATURED_LENSES,
  filterConnectionStories,
} from '../components/connections/connectionsModel';

const IdeasInTheWildPage: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<(typeof CONNECTION_TOPICS)[number]>('All');
  const visibleStories = useMemo(
    () => filterConnectionStories(CONNECTION_STORIES, activeTopic),
    [activeTopic],
  );

  useSEO({
    ...CONNECTIONS_SEO,
    type: 'website',
  });

  return (
    <div className="wild-ideas">
      <section className="wild-hero" aria-labelledby="wild-hero-title">
        <div className="wild-hero__copy">
          <p className="wild-kicker"><Compass aria-hidden="true" /> Ta7leel field notes</p>
          <h1 id="wild-hero-title">
            Books are not the world. <span>They are lenses for seeing it.</span>
          </h1>
          <p className="wild-hero__lead">
            Follow one pressure point through several books. Keep the explanation that sharpens your judgment—and test it against reality.
          </p>
          <div className="wild-hero__actions">
            <a className="wild-button wild-button--primary" href="#featured-connection">
              Trace today’s connection <ArrowDownRight aria-hidden="true" />
            </a>
            <a className="wild-button wild-button--quiet" href="#connection-library">
              Browse field notes
            </a>
          </div>
          <p className="wild-hero__rule"><CircleDot aria-hidden="true" /> One situation. Several lenses. No single easy answer.</p>
        </div>

        <aside className="wild-map" aria-label="Book lens map">
          <div className="wild-map__topline">
            <span>Observed in the wild</span>
            <Sparkles aria-hidden="true" />
          </div>
          <div className="wild-map__signal">
            <small>World signal</small>
            <strong>The attention economy</strong>
            <p>Why do good intentions keep losing to the feed?</p>
          </div>
          <div className="wild-map__lenses">
            {FEATURED_LENSES.map((lens) => (
              <article className="wild-lens" key={lens.slug}>
                <img src={lens.cover} alt="" />
                <div>
                  <span>{lens.principle}</span>
                  <Link to={`/summary/${lens.slug}`} aria-label={`Open the ${lens.title} brief`}>
                    {lens.title} <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section id="featured-connection" className="wild-feature" aria-labelledby="wild-feature-title">
        <header className="wild-section-heading">
          <p className="wild-kicker"><BookOpen aria-hidden="true" /> Featured field note</p>
          <h2 id="wild-feature-title">One question. Three lenses.</h2>
          <p>Each book catches part of the pattern. The useful insight appears where their explanations meet.</p>
        </header>

        <div className="wild-feature__body">
          <aside className="wild-feature__question">
            <span>The question in front of us</span>
            <h3>Why do good intentions keep losing to the feed?</h3>
            <p>
              Attention platforms reduce the distance between discomfort and relief to one tap. The behavior looks personal; much of the machinery is environmental.
            </p>
            <div className="wild-feature__annotation">
              <MoveRight aria-hidden="true" />
              <span>Read across the books, not down a single answer.</span>
            </div>
          </aside>

          <div className="wild-feature__analysis">
            {FEATURED_LENSES.map((lens) => (
              <article className="wild-analysis-row" key={lens.slug}>
                <span className="wild-analysis-row__marker" aria-hidden="true" />
                <div>
                  <p>{lens.title}</p>
                  <h3>{lens.principle}</h3>
                  <span>{lens.interpretation}</span>
                </div>
                <Link to={`/summary/${lens.slug}`} aria-label={`Read the connected brief: ${lens.title}`}>
                  Read brief <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="wild-feature__footer">
          <article className="wild-limit">
            <span>Where the lens bends</span>
            <p>
              Not every distraction is manipulation or weak discipline. Fatigue, caregiving, anxiety, and work demands change what a realistic attention plan can ask of someone.
            </p>
          </article>
          <article className="wild-experiment">
            <Target aria-hidden="true" />
            <div>
              <span>Try this in real life</span>
              <p>For one day, record the feeling immediately before you open a distracting app. Change the trigger before judging the habit.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="connection-library" className="wild-library" aria-labelledby="wild-library-title">
        <header className="wild-library__heading">
          <div>
            <p className="wild-kicker"><CircleDot aria-hidden="true" /> Patterns beyond the page</p>
            <h2 id="wild-library-title">Connections worth keeping.</h2>
          </div>
          <p>Short analyses for moments when a headline, choice, or behavior needs more than one explanation.</p>
        </header>

        <nav className="wild-topics" aria-label="Connection topics">
          {CONNECTION_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              aria-pressed={activeTopic === topic}
              onClick={() => setActiveTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </nav>

        <div className="wild-grid" role="region" aria-label="Connections worth keeping" aria-live="polite">
          {visibleStories.map((story) => (
            <article className="wild-card" key={story.id}>
              <div className="wild-card__topline">
                <span>{story.category}</span>
                <small>{story.signal}</small>
              </div>
              <h3>{story.title}</h3>
              <p>{story.setup}</p>
              <div className="wild-card__connection">
                <span>The connection</span>
                <p>{story.connection}</p>
              </div>
              <div className="wild-card__action">
                <Target aria-hidden="true" />
                <p>{story.action}</p>
              </div>
              <div className="wild-card__books">
                {story.books.map((book) => (
                  <Link
                    key={book.slug}
                    to={`/summary/${book.slug}`}
                    aria-label={`Read the connected brief: ${book.title}`}
                  >
                    {book.title} <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wild-closing" aria-labelledby="wild-closing-title">
        <div>
          <p className="wild-kicker">Choose your next lens</p>
          <h2 id="wild-closing-title">The world supplies the question. The library supplies perspective.</h2>
        </div>
        <Link className="wild-button wild-button--closing" to="/summaries">
          Explore all summaries <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default IdeasInTheWildPage;
