/**
 * SEO Helper Functions
 * Utilities to improve SEO and site performance
 */

/**
 * Generate a clean, SEO-friendly URL slug from a title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Truncate text to a specific length for meta descriptions
 */
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Strip HTML tags from text (useful for meta descriptions)
 */
export const stripHtml = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Generate keywords from text content
 */
export const generateKeywords = (text: string, maxKeywords: number = 10): string => {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these', 'those'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordFreq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by frequency and take top keywords
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return topWords.join(', ');
};

/**
 * Create a breadcrumb schema for structured data
 */
export const createBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }];

  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const name = path
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
    breadcrumbs.push({ name, url: currentPath });
  });

  return breadcrumbs;
};

/**
 * Format date for structured data (ISO 8601)
 */
export const formatDateForSchema = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

/**
 * Check if image exists and return fallback if needed
 */
export const getImageWithFallback = (imagePath: string, fallback: string = '/images/og-default.jpg'): string => {
  // In production, you might want to actually check if the image exists
  // For now, we'll return the path as-is
  return imagePath || fallback;
};

/**
 * Generate Open Graph image URL
 */
export const getOgImageUrl = (imagePath: string): string => {
  const baseUrl = window.location.origin;
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${baseUrl}${imagePath}`;
};

/**
 * Calculate estimated reading time
 */
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): string => {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

/**
 * Optimize image loading with lazy loading attributes
 */
export const getImageAttributes = (priority: boolean = false) => {
  if (priority) {
    return {
      loading: 'eager' as const,
      fetchpriority: 'high' as const,
    };
  }
  return {
    loading: 'lazy' as const,
    fetchpriority: 'low' as const,
  };
};

/**
 * Create canonical URL
 */
export const getCanonicalUrl = (pathname: string): string => {
  const baseUrl = window.location.origin;
  // Remove hash for canonical URLs
  const cleanPath = pathname.replace(/#.*$/, '');
  return `${baseUrl}${cleanPath}`;
};
