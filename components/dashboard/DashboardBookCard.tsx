import { Link } from 'react-router-dom';
import { getBookSummaryHref } from '../readingRouteModel';
import type { DashboardShelfBook } from './dashboardOverviewModel';

interface DashboardBookCardProps {
  item: DashboardShelfBook;
  compact?: boolean;
}

const clampProgress = (progress: number) => Math.max(0, Math.min(100, progress));

export function DashboardBookCard({ item, compact = false }: DashboardBookCardProps) {
  const { book, status } = item;
  const progress = clampProgress(item.progress);
  const href = getBookSummaryHref(book, 'dashboard');
  const hasProgress = status === 'in-progress' || status === 'completed';
  const action = hasProgress ? 'Continue reading' : 'Read summary';
  const statusLabel = status === 'completed'
    ? 'Completed'
    : status === 'in-progress'
      ? `${progress}% complete`
      : status === 'saved'
        ? 'Saved for later'
        : 'Ready to read';

  return (
    <article className={`dashboard-book-card${compact ? ' dashboard-book-card--compact' : ''}`}>
      <Link className="dashboard-book-card-link" to={href} aria-label={`${action}: ${book.title}`}>
        <div className="dashboard-book-card-cover">
          <img src={book.coverImageUrl} alt={`Cover of ${book.title}`} loading="lazy" decoding="async" />
        </div>
        <div className="dashboard-book-card-body">
          <p className="dashboard-book-card-category">{book.category}</p>
          <h3>{book.title}</h3>
          <p className="dashboard-book-card-author">{book.author}</p>
          <div className="dashboard-book-card-meta">
            <span>{statusLabel}</span>
            <span className="dashboard-book-card-action">{action}</span>
          </div>
          {hasProgress && (
            <div
              className="dashboard-book-card-progress"
              role="progressbar"
              aria-label={`${book.title} reading progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default DashboardBookCard;
