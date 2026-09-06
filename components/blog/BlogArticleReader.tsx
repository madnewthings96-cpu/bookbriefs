import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Share2 } from 'lucide-react';
import { BlogPost, getBlogPostDirection } from './blogPageModel';

interface BlogArticleReaderProps {
  post: BlogPost;
  contentHtml: string;
  relatedPosts: BlogPost[];
  readingProgress: number;
  shareLabel: string;
  onBack: () => void;
  onShare: () => void;
  onOpenPost: (post: BlogPost) => void;
  formatDate: (date: string, post: BlogPost) => string;
  articleRef?: React.RefObject<HTMLElement>;
}

const BlogArticleReader: React.FC<BlogArticleReaderProps> = ({
  post,
  contentHtml,
  relatedPosts,
  readingProgress,
  shareLabel,
  onBack,
  onShare,
  onOpenPost,
  formatDate,
  articleRef,
}) => {
  const direction = getBlogPostDirection(post);
  const language = direction === 'rtl' ? 'ar' : 'en';
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const shareStatus = shareLabel === 'Share' ? '' : shareLabel;

  return (
    <div className="signal-reader" dir={direction}>
      <div
        className="signal-reader__progress"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={readingProgress}
      >
        <span style={{ width: `${readingProgress}%` }} />
      </div>

      <div className="signal-reader__toolbar" lang="en">
        <button type="button" onClick={onBack} aria-label="Back to all articles">
          <BackIcon size={18} aria-hidden="true" />
          <span>All field notes</span>
        </button>
        <span className="signal-reader__wordmark">Ta7leel Journal</span>
        <button type="button" onClick={onShare} aria-label="Share article">
          <Share2 size={17} aria-hidden="true" />
          <span>{shareLabel}</span>
        </button>
      </div>
      <span className="signal-reader__share-status" lang="en" role="status" aria-live="polite" aria-atomic="true">
        {shareStatus}
      </span>

      <header className="signal-reader__header">
        <div className="signal-reader__headline" lang={language}>
          <span className="signal-card__category">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="signal-reader__meta">
            <span>{formatDate(post.date, post)}</span>
            <span aria-hidden="true">/</span>
            <span><Clock3 size={15} aria-hidden="true" />{post.readTime}</span>
          </div>
        </div>
        <aside className="signal-reader__margin" lang="en" aria-label="Article field note">
          <span>Filed under</span>
          <strong lang={language}>{post.category}</strong>
          <p>Read slowly. Keep what changes your next decision.</p>
        </aside>
      </header>

      <figure className="signal-reader__hero">
        <img src={post.imageUrl} alt="" loading="eager" />
        <figcaption lang="en">Ta7leel research desk · <span lang={language}>{formatDate(post.date, post)}</span></figcaption>
      </figure>

      <article className="signal-reader__article" dir={direction} lang={language} ref={articleRef}>
        <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>

      <section className="signal-reader__support" lang="en" aria-labelledby="support-journal-title">
        <p className="signal-eyebrow">Keep independent ideas in circulation</p>
        <h2 id="support-journal-title">Found a thought worth carrying forward?</h2>
        <p>Your support helps us publish more careful work on markets, behavior, and books.</p>
        <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer">
          Support the journal <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>

      {relatedPosts.length > 0 && (
        <section className="signal-related" aria-labelledby="related-reading-title">
          <div className="signal-related__heading" lang="en">
            <p className="signal-eyebrow">Continue the thread</p>
            <h2 id="related-reading-title">Related reading</h2>
          </div>
          <div className="signal-related__grid">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.id}
                dir={getBlogPostDirection(relatedPost)}
              >
                <img src={relatedPost.imageUrl} alt="" loading="lazy" />
                <div>
                  <span lang={getBlogPostDirection(relatedPost) === 'rtl' ? 'ar' : 'en'}>{relatedPost.category}</span>
                  <h3 lang={getBlogPostDirection(relatedPost) === 'rtl' ? 'ar' : 'en'}>{relatedPost.title}</h3>
                  <button
                    type="button"
                    lang="en"
                    aria-label={`Read next: ${relatedPost.title}`}
                    onClick={() => onOpenPost(relatedPost)}
                  >
                    Read next <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogArticleReader;
