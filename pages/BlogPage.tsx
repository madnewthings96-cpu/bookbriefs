import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import useSEO from '../hooks/useSEO';
import BlogLibrary from '../components/blog/BlogLibrary';
import BlogArticleReader from '../components/blog/BlogArticleReader';
import {
  BlogPost,
  calculateReadingProgress,
  filterBlogPosts,
  getBlogCategories,
  getBlogPostDirection,
  getRelatedBlogPosts,
  normalizeBlogArticleMarkup,
  scheduleBlogScrollReset,
  shareBlogArticle,
} from '../components/blog/blogPageModel';
import './BlogPage.css';
import { blogPosts, getFullContent } from '../components/blog/blogContent';
import NotFoundPage from './NotFoundPage';
import { BRAND_NAME, SITE_URL, canonicalRoutePath } from '../utils/seoConfig';

const BlogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const selectedPost = blogPosts.find(post => post.slug === slug) ?? null;
  const [activeCategory, setActiveCategory] = useState('All');
  const [readingProgress, setReadingProgress] = useState(0);
  const [shareLabel, setShareLabel] = useState('Share');
  const articleRef = useRef<HTMLElement>(null);

  useSEO({
    title: selectedPost 
      ? `${selectedPost.title} | Ta7leel`
      : slug ? 'Page not found | Ta7leel' : 'Articles on Books, Business & Personal Development | Ta7leel',
    description: selectedPost
      ? selectedPost.excerpt
      : 'Discover expert insights on trading, business, personal development, and book summaries. Learn from industry experts and improve your knowledge.',
    keywords: 'business blog, trading insights, personal development, book summaries, productivity tips, financial education',
    type: selectedPost ? 'article' : 'website',
    language: selectedPost && getBlogPostDirection(selectedPost) === 'rtl' ? 'ar' : 'en',
    noindex: Boolean(slug && !selectedPost),
    image: selectedPost?.imageUrl,
    ...(selectedPost && {
      publishedTime: selectedPost.date,
    }),
  });

  const openPostModal = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  const closePostModal = () => {
    navigate('/blog');
  };


  useEffect(() => {
    if (!slug) {
      setReadingProgress(0);
      setShareLabel('Share');
      return;
    }

    setShareLabel('Share');
    setReadingProgress(0);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  useLayoutEffect(() => {
    if (slug || selectedPost) return undefined;
    return scheduleBlogScrollReset(window);
  }, [selectedPost, slug]);

  useEffect(() => {
    if (!selectedPost) return undefined;

    const updateProgress = () => {
      const article = articleRef.current;
      if (!article) return;
      const articleTop = window.scrollY + article.getBoundingClientRect().top;
      setReadingProgress(calculateReadingProgress(
        window.scrollY,
        articleTop,
        article.scrollHeight,
        window.innerHeight,
      ));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [selectedPost]);

  const categories = getBlogCategories(blogPosts);
  const filteredPosts = filterBlogPosts(blogPosts, activeCategory);
  const relatedPosts = selectedPost ? getRelatedBlogPosts(blogPosts, selectedPost) : [];
  const sanitizedArticleContent = useMemo(() => {
    if (!selectedPost) return '';
    return DOMPurify.sanitize(normalizeBlogArticleMarkup(getFullContent(selectedPost.id)), {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
      FORBID_ATTR: ['style'],
    });
  }, [selectedPost]);

  const formatDate = (dateString: string, post: BlogPost = selectedPost ?? blogPosts[0]) => {
    const direction = getBlogPostDirection(post);
    return new Date(`${dateString}T00:00:00Z`).toLocaleDateString(direction === 'rtl' ? 'ar' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const shareArticle = async () => {
    if (!selectedPost) return;
    const shareData = { title: selectedPost.title, text: selectedPost.excerpt, url: window.location.href };
    setShareLabel(await shareBlogArticle(shareData, navigator));
  };

  if (slug && !selectedPost) return <NotFoundPage />;

  return (
    <div className="blog-editorial-shell">
      {selectedPost && <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: selectedPost.title,
        description: selectedPost.excerpt, datePublished: selectedPost.date,
        inLanguage: getBlogPostDirection(selectedPost) === 'rtl' ? 'ar' : 'en',
        image: new URL(selectedPost.imageUrl, SITE_URL).href,
        publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL },
        mainEntityOfPage: new URL(canonicalRoutePath(`/blog/${selectedPost.slug}`), SITE_URL).href,
      }).replace(/</g, '\\u003c')}</script>}

      {selectedPost ? (
        <BlogArticleReader
          post={selectedPost}
          contentHtml={sanitizedArticleContent}
          relatedPosts={relatedPosts}
          readingProgress={readingProgress}
          shareLabel={shareLabel}
          onBack={closePostModal}
          onShare={shareArticle}
          onOpenPost={openPostModal}
          formatDate={formatDate}
          articleRef={articleRef}
        />
      ) : (
        <BlogLibrary
          posts={filteredPosts}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onOpenPost={openPostModal}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default BlogPage;
