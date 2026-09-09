import { Link } from 'react-router-dom';
import { getBookSummaryHref } from '../readingRouteModel';
import DashboardBookCard from './DashboardBookCard';
import type { DashboardKnowledgeItem, DashboardShelfBook, WeeklyReadingInsight } from './dashboardOverviewModel';

export interface DashboardOverviewViewProps {
  greeting: string;
  userName: string;
  catalogLoading: boolean;
  catalogError?: string | null;
  onRetryCatalog?: () => void;
  challengeLoading: boolean;
  continueBook?: DashboardShelfBook;
  challenge?: { current: number; goal: number; percentage: number };
  challengeError: string | null;
  libraryError: string | null;
  recentKnowledge: DashboardKnowledgeItem[];
  library: DashboardShelfBook[];
  weeklyInsight: WeeklyReadingInsight;
  recommendations: DashboardShelfBook[];
}

function CardSkeleton({ lines = 3, label = 'Loading reading data' }: { lines?: number; label?: string }) {
  return (
    <div className="dashboard-card-skeleton" aria-label={label} role="status">
      {Array.from({ length: lines }, (_, index) => <span key={index} />)}
    </div>
  );
}

function CardAlert({ message }: { message: string }) {
  return <p className="dashboard-card-alert" role="alert">{message} Refresh the page to try again.</p>;
}

function CatalogAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="dashboard-catalog-alert" role="alert">
      <p>{message}</p>
      <p>Saved reading data remains available while the catalog reconnects.</p>
      <button type="button" onClick={onRetry}>Try again</button>
    </div>
  );
}

function CatalogUnavailable() {
  return (
    <div className="dashboard-catalog-unavailable">
      <p>The book catalog is unavailable right now. Try again to restore book details.</p>
    </div>
  );
}

const dateLabel = (date: Date) => new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(date);

function EmptyAction({ children, to }: { children: string; to: string }) {
  return <Link className="dashboard-empty-action" to={to}>{children}</Link>;
}

export default function DashboardOverviewView({
  greeting,
  userName,
  catalogLoading,
  catalogError = null,
  onRetryCatalog,
  challengeLoading,
  continueBook,
  challenge,
  challengeError,
  libraryError,
  recentKnowledge,
  library,
  weeklyInsight,
  recommendations,
}: DashboardOverviewViewProps) {
  const challengePercentage = Math.max(0, Math.min(100, challenge?.percentage ?? 0));

  return (
    <div className="dashboard-page dashboard-overview">
      <section className="dashboard-overview-intro" aria-labelledby="dashboard-overview-title">
        <p className="dashboard-page-eyebrow">Your reading desk</p>
        <h1 id="dashboard-overview-title">{greeting}, {userName}</h1>
        <p>Pick up a useful idea, return to a favorite, or find the next summary for your shelf.</p>
        <Link className="dashboard-primary-action" to="/dashboard/discover">Search book summaries</Link>
      </section>

      {catalogError && <CatalogAlert message={catalogError} onRetry={onRetryCatalog} />}

      <div className="dashboard-overview-lead-grid">
        <section className="dashboard-overview-card dashboard-continue-card" aria-labelledby="dashboard-continue-title">
          <div className="dashboard-card-heading">
            <p className="dashboard-page-eyebrow">Next up</p>
            <h2 id="dashboard-continue-title">Continue reading</h2>
          </div>
          {catalogLoading ? <CardSkeleton /> : continueBook ? (
            <DashboardBookCard item={continueBook} />
          ) : catalogError ? <CatalogUnavailable /> : (
            <div className="dashboard-empty-state">
              <p>Your next useful idea is waiting in the summary library.</p>
              <EmptyAction to="/dashboard/discover">Choose your first summary</EmptyAction>
            </div>
          )}
        </section>

        <section className="dashboard-overview-card dashboard-challenge-card" aria-labelledby="dashboard-challenge-title">
          <div className="dashboard-card-heading">
            <p className="dashboard-page-eyebrow">This year</p>
            <h2 id="dashboard-challenge-title">Reading challenge</h2>
          </div>
          {challengeLoading ? <CardSkeleton lines={4} label="Loading your reading challenge" /> : challenge ? (
            <div className="dashboard-challenge-content">
              {challengeError && <CardAlert message={challengeError} />}
              <div
                className="dashboard-challenge-ring"
                role="progressbar"
                aria-label="Reading challenge progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={challengePercentage}
                style={{ background: `conic-gradient(var(--dashboard-moss, #4e7a60) ${challengePercentage}%, #e2e9e2 0)` }}
              >
                <span className="dashboard-challenge-ring-inner">{challenge.current} of {challenge.goal}</span>
              </div>
              <p>Keep building the shelf you want to return to.</p>
              <Link className="dashboard-text-action" to="/dashboard/challenge">View reading challenge</Link>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              {challengeError && <CardAlert message={challengeError} />}
              <p>A small goal gives your next reading session a direction.</p>
              <EmptyAction to="/dashboard/challenge">Create a reading goal</EmptyAction>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-overview-content-grid">
        <div className="dashboard-overview-content-main">
          <section className="dashboard-overview-card dashboard-notes-card" aria-labelledby="dashboard-notes-title">
            <div className="dashboard-card-heading dashboard-card-heading--with-action">
              <div>
                <p className="dashboard-page-eyebrow">Return to an idea</p>
                <h2 id="dashboard-notes-title">Recent notes</h2>
              </div>
              <Link className="dashboard-text-action" to="/dashboard/notes">View all notes</Link>
            </div>
            {catalogLoading ? <CardSkeleton /> : recentKnowledge.length ? (
              <ul className="dashboard-knowledge-list">
                {recentKnowledge.map(item => {
                  const title = item.book?.title || 'A saved book';
                  const href = getBookSummaryHref(item.book || { id: item.bookId }, 'dashboard');
                  return (
                    <li key={item.id}>
                      <Link to={href}>
                        <span className="dashboard-knowledge-kind">{item.kind === 'highlight' ? 'Highlight' : 'Note'}</span>
                        <strong>{title}</strong>
                        <p>{item.content}</p>
                        <time dateTime={item.updatedAt.toISOString()}>{dateLabel(item.updatedAt)}</time>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : catalogError ? <CatalogUnavailable /> : (
              <div className="dashboard-empty-state">
                <p>Keep the ideas worth returning to close at hand.</p>
                <EmptyAction to="/dashboard/discover">Capture your first idea</EmptyAction>
              </div>
            )}
          </section>

          <section className="dashboard-overview-card dashboard-library-card" aria-labelledby="dashboard-library-title">
            <div className="dashboard-card-heading dashboard-card-heading--with-action">
              <div>
                <p className="dashboard-page-eyebrow">Your collection</p>
                <h2 id="dashboard-library-title">Your library</h2>
              </div>
              <Link className="dashboard-text-action" to="/dashboard/library">Open library</Link>
            </div>
            {libraryError && <CardAlert message={libraryError} />}
            {catalogLoading ? <CardSkeleton lines={4} /> : library.length ? (
              <div className="dashboard-book-grid dashboard-book-grid--library">
                {library.slice(0, 3).map(item => <DashboardBookCard compact item={item} key={item.book.id} />)}
              </div>
            ) : catalogError ? <CatalogUnavailable /> : (
              <div className="dashboard-empty-state">
                <p>Save a summary or begin reading to make this shelf yours.</p>
                <EmptyAction to="/dashboard/discover">Explore the library</EmptyAction>
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-overview-rail" aria-label="Reading insights">
          <section className="dashboard-overview-card dashboard-insight-card" aria-labelledby="dashboard-insight-title">
            <div className="dashboard-card-heading">
              <p className="dashboard-page-eyebrow">Your rhythm</p>
              <h2 id="dashboard-insight-title">Weekly insight</h2>
            </div>
            {weeklyInsight.readingDays > 0 ? (
              <div className="dashboard-insight-stats">
                <p><strong>{weeklyInsight.readingDays}</strong> reading {weeklyInsight.readingDays === 1 ? 'day' : 'days'} this week</p>
                <p><strong>{weeklyInsight.currentStreak}</strong> day current streak</p>
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <p>Your reading rhythm will appear after your first session.</p>
                <EmptyAction to="/dashboard/discover">Read a summary</EmptyAction>
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="dashboard-overview-card dashboard-recommendations-card" aria-labelledby="dashboard-recommendations-title">
        <div className="dashboard-card-heading dashboard-card-heading--with-action">
          <div>
            <p className="dashboard-page-eyebrow">A useful next read</p>
            <h2 id="dashboard-recommendations-title">Recommended reading</h2>
          </div>
          <Link className="dashboard-text-action" to="/dashboard/discover">Browse all summaries</Link>
        </div>
        {catalogLoading ? <CardSkeleton lines={4} /> : recommendations.length ? (
          <div className="dashboard-book-grid dashboard-book-grid--recommendations">
            {recommendations.map(item => <DashboardBookCard compact item={item} key={item.book.id} />)}
          </div>
        ) : catalogError ? <CatalogUnavailable /> : (
          <div className="dashboard-empty-state">
            <p>Explore the catalog to find a summary for your next session.</p>
            <EmptyAction to="/dashboard/discover">Browse book summaries</EmptyAction>
          </div>
        )}
      </section>
    </div>
  );
}
