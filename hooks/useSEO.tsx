import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
}

const useSEO = ({
  title,
  description,
  keywords = 'book summaries, business books, self-help books, book insights, learning, personal development',
  image = '/images/og-default.jpg',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
}: SEOProps) => {
  const location = useLocation();
  const baseUrl = window.location.origin;
  const currentUrl = canonical || `${baseUrl}${location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  useEffect(() => {
    // Set document title
    document.title = title;


    // Helper function to set meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    setMetaTag('author', author || 'BookBriefs');

    // Robots meta
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
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
    setMetaTag('og:locale', 'ar_AE', true);
    setMetaTag('og:locale:alternate', 'en_US', true);
    setMetaTag('og:locale:alternate', 'ar_SA', true);
    setMetaTag('og:locale:alternate', 'ar_EG', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImageUrl);
    setMetaTag('twitter:site', '@bookbriefs');
    setMetaTag('twitter:creator', '@bookbriefs');

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
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Add language alternate tags for Arabic countries
    const languages = [
      { code: 'ar', label: 'Arabic' },
      { code: 'en', label: 'English' },
      { code: 'ar-AE', label: 'Arabic (UAE)' },
      { code: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
      { code: 'ar-EG', label: 'Arabic (Egypt)' },
      { code: 'x-default', label: 'Default' }
    ];

    languages.forEach(({ code }) => {
      let alternateLangLink = document.querySelector(`link[hreflang="${code}"]`) as HTMLLinkElement;
      if (!alternateLangLink) {
        alternateLangLink = document.createElement('link');
        alternateLangLink.rel = 'alternate';
        alternateLangLink.hreflang = code;
        document.head.appendChild(alternateLangLink);
      }
      alternateLangLink.href = code === 'x-default' ? currentUrl : `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}lang=${code}`;
    });

    // Add Arabic-specific meta tags
    setMetaTag('content-language', 'ar,en');

    // Add geo-targeting for MENA region
    setMetaTag('geo.region', 'AE;SA;EG;QA;KW;BH;OM;JO;LB');
    setMetaTag('geo.placename', 'Dubai, UAE');

  }, [title, description, keywords, image, type, author, publishedTime, modifiedTime, currentUrl, fullImageUrl, noindex]);
};

export default useSEO;
