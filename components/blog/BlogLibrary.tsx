import React from 'react';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { BlogPost, getBlogPostDirection } from './blogPageModel';

interface BlogLibraryProps {
  posts: BlogPost[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onOpenPost: (post: BlogPost) => void;
  formatDate: (date: string, post: BlogPost) => string;
}

const ArticleMeta: React.FC<{ post: BlogPost; formatDate: BlogLibraryProps['formatDate'] }> = ({ post, formatDate }) => (
  <div className="signal-card__meta" lang={getBlogPostDirection(post) === 'rtl' ? 'ar' : 'en'}>
    <span>{formatDate(post.date, post)}</span>
    <span aria-hidden="true">/</span>
    <span className="signal-card__time"><Clock3 size={14} aria-hidden="true" />{post.readTime}</span>
  </div>
);

const BlogLibrary: React.FC<BlogLibraryProps> = ({
  posts,
  categories,
  activeCategory,
  onCategoryChange,
  onOpenPost,
  formatDate,
}) => {
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <section className="signal-library" aria-labelledby="signal-library-title">
      <div className="signal-library__masthead">
        <div className="signal-library__intro">
          <p className="signal-eyebrow">Ta7leel editorial</p>
          <h1 id="signal-library-title">Ideas with a longer half-life.</h1>
          <p className="signal-library__dek">
            Field notes on money, markets, behavior, and the books that sharpen judgment.
          </p>
        </div>
        <div className="signal-library__edition" aria-label="Editorial focus">
          <span>Research desk</span>
          <strong>Markets · Mind · Money</strong>
          <small>Essays selected for practical value</small>
        </div>
      </div>

      <nav className="signal-topics" aria-label="Article topics">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      {!featuredPost ? (
        <div className="signal-library__empty" role="status">
          <strong>No essays in this topic yet.</strong>
          <span>Choose another topic to continue reading.</span>
        </div>
      ) : (
        <>
          <article
            className="signal-feature"
            dir={getBlogPostDirection(featuredPost)}
          >
            <div className="signal-feature__image-wrap">
              <img src={featuredPost.imageUrl} alt="" className="signal-feature__image" loading="eager" />
              <span className="signal-feature__issue" lang="en" dir="ltr">Featured signal</span>
            </div>
            <div className="signal-feature__copy">
              <span className="signal-card__category" lang={getBlogPostDirection(featuredPost) === 'rtl' ? 'ar' : 'en'}>
                {featuredPost.category}
              </span>
              <ArticleMeta post={featuredPost} formatDate={formatDate} />
              <h2 lang={getBlogPostDirection(featuredPost) === 'rtl' ? 'ar' : 'en'}>{featuredPost.title}</h2>
              <p lang={getBlogPostDirection(featuredPost) === 'rtl' ? 'ar' : 'en'}>{featuredPost.excerpt}</p>
              <div className="signal-feature__footer">
                <div className="signal-card__tags" aria-label="Article tags">
                  {featuredPost.tags.slice(0, 3).map((tag) => (
                    <span key={tag} lang={getBlogPostDirection(featuredPost) === 'rtl' ? 'ar' : 'en'}>{tag}</span>
                  ))}
                </div>
                <button
                  type="button"
                  lang="en"
                  aria-label={`Read the essay: ${featuredPost.title}`}
                  onClick={() => onOpenPost(featuredPost)}
                >
                  Read the essay <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>

          {remainingPosts.length > 0 && (
            <div className="signal-latest">
              <div className="signal-latest__heading">
                <div>
                  <p className="signal-eyebrow">The reading ledger</p>
                  <h2>Latest field notes</h2>
                </div>
                <span>{remainingPosts.length} essays</span>
              </div>

              <div className="signal-grid">
                {remainingPosts.map((post) => (
                  <article
                    className="signal-card"
                    dir={getBlogPostDirection(post)}
                    key={post.id}
                  >
                    <div className="signal-card__image-wrap">
                      <img src={post.imageUrl} alt="" loading="lazy" />
                      <span className="signal-card__category" lang={getBlogPostDirection(post) === 'rtl' ? 'ar' : 'en'}>
                        {post.category}
                      </span>
                    </div>
                    <div className="signal-card__body">
                      <ArticleMeta post={post} formatDate={formatDate} />
                      <h3 lang={getBlogPostDirection(post) === 'rtl' ? 'ar' : 'en'}>{post.title}</h3>
                      <p lang={getBlogPostDirection(post) === 'rtl' ? 'ar' : 'en'}>{post.excerpt}</p>
                      <button
                        type="button"
                        lang="en"
                        aria-label={`Continue reading: ${post.title}`}
                        onClick={() => onOpenPost(post)}
                      >
                        Continue reading <ArrowUpRight size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default BlogLibrary;
