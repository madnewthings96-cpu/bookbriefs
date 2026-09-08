import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, canonicalRoutePath, isPrivateSeoRoute } from '../utils/seoConfig';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
  language?: 'ar' | 'en';
}

const useSEO = ({
  title,
  description,
  keywords = 'book summaries, business books, self-help books, ملخصات كتب, كتب أعمال, تطوير ذاتي',
  image = '/favicon/ta7leel.png',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  language = 'en',
}: SEOProps) => {
  const location = useLocation();
  const shouldNoindex = noindex || isPrivateSeoRoute(location.pathname);
  const currentUrl = canonical || `${SITE_URL}${canonicalRoutePath(location.pathname)}`;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Build-time schemas describe the initial page only; React supplies current schemas.
    document.querySelectorAll('script[data-seo-prerender]').forEach(element => element.remove());
    // Track created elements for cleanup
    const createdElements: HTMLElement[] = [];

    // Set document title
    const previousTitle = document.title;
    document.title = title;

    // Helper function to set meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
        createdElements.push(element as HTMLElement);
      }

      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    setMetaTag('author', author || 'تحليل - Ta7leel');

    // Robots meta
    if (shouldNoindex) {
      setMetaTag('robots', 'noindex, follow');
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', fullImageUrl, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'تحليل - Ta7leel', true);
    setMetaTag('og:locale', language === 'ar' ? 'ar_AR' : 'en_US', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImageUrl);
    setMetaTag('twitter:site', '@ta7leel');

    ['article:published_time', 'article:modified_time', 'article:author'].forEach(key => {
      document.querySelectorAll(`meta[property="${key}"]`).forEach(element => element.remove());
    });
    // Article specific meta tags
    if (type === 'article' && publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      if (author) {
        setMetaTag('article:author', author, true);
      }
    }

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const canonicalCreated = !canonicalLink;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Cleanup function — remove dynamically created elements on unmount
    return () => {
      document.title = previousTitle;
      createdElements.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      if (canonicalCreated && canonicalLink.parentNode) {
        canonicalLink.parentNode.removeChild(canonicalLink);
      }
    };
  }, [title, description, keywords, image, type, author, publishedTime, modifiedTime, currentUrl, fullImageUrl, shouldNoindex, language]);
};

export default useSEO;
