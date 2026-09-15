export const NEWS_CATEGORIES = ['markets', 'forex', 'economy', 'crypto'] as const;
export const NEWS_PAGE_SIZE = 10;

export type NewsCategory = typeof NEWS_CATEGORIES[number];
export type NewsStatus = 'draft' | 'published';
export type NewsSource = { label: string; url: string };

export interface NewsArticleDraft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: NewsCategory;
  language: 'en';
  authorName: string;
  imageUrl: string;
  imagePath: string;
  imageAlt: string;
  sources: NewsSource[];
  status: NewsStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}

export type NewsArticle = Omit<NewsArticleDraft, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
  status: 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
};

export type NewsValidationErrors = Partial<Record<
  'title' | 'slug' | 'excerpt' | 'body' | 'category' | 'authorName' | 'imageUrl' | 'imageAlt' | 'sources',
  string
>>;

const MAX_TITLE_LENGTH = 140;
const MAX_EXCERPT_LENGTH = 240;
const MAX_AUTHOR_LENGTH = 80;
const MAX_IMAGE_ALT_LENGTH = 180;
const MAX_SOURCE_LABEL_LENGTH = 120;
const MAX_BODY_LENGTH = 100_000;
const MAX_SLUG_LENGTH = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createEmptyNewsDraft(): NewsArticleDraft {
  return {
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    category: 'markets',
    language: 'en',
    authorName: '',
    imageUrl: '',
    imagePath: '',
    imageAlt: '',
    sources: [],
    status: 'draft',
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  };
}

export function slugifyNewsTitle(title: string): string {
  return title.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
}

const isNewsCategory = (value: unknown): value is NewsCategory => (
  typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value)
);

export function validateNewsDraft(
  draft: NewsArticleDraft,
  mode: 'draft' | 'publish',
): NewsValidationErrors {
  const errors: NewsValidationErrors = {};
  const title = typeof draft.title === 'string' ? draft.title : '';
  const slug = typeof draft.slug === 'string' ? draft.slug : '';
  const excerpt = typeof draft.excerpt === 'string' ? draft.excerpt : '';
  const body = typeof draft.body === 'string' ? draft.body : '';
  const authorName = typeof draft.authorName === 'string' ? draft.authorName : '';
  const imageUrl = typeof draft.imageUrl === 'string' ? draft.imageUrl : '';
  const imageAlt = typeof draft.imageAlt === 'string' ? draft.imageAlt : '';

  if (!title.trim()) errors.title = 'Title is required.';
  else if (title.length > MAX_TITLE_LENGTH) errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;

  if (slug) {
    if (slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
      errors.slug = 'Slug must use lowercase letters, numbers, and single hyphens only.';
    }
  } else if (mode === 'publish') {
    errors.slug = 'Slug is required to publish.';
  }

  if (excerpt.length > MAX_EXCERPT_LENGTH) errors.excerpt = `Excerpt must be ${MAX_EXCERPT_LENGTH} characters or fewer.`;
  else if (mode === 'publish' && !excerpt.trim()) errors.excerpt = 'Excerpt is required to publish.';

  if (body.length > MAX_BODY_LENGTH) errors.body = `Body must be ${MAX_BODY_LENGTH} characters or fewer.`;
  else if (mode === 'publish' && !body.trim()) errors.body = 'Body is required to publish.';

  if (!isNewsCategory(draft.category)) errors.category = 'Choose a valid news category.';

  if (authorName.length > MAX_AUTHOR_LENGTH) errors.authorName = `Author name must be ${MAX_AUTHOR_LENGTH} characters or fewer.`;
  else if (mode === 'publish' && !authorName.trim()) errors.authorName = 'Author name is required to publish.';

  if (mode === 'publish' && !imageUrl.trim()) errors.imageUrl = 'A featured image is required to publish.';

  if (imageAlt.length > MAX_IMAGE_ALT_LENGTH) errors.imageAlt = `Image alt text must be ${MAX_IMAGE_ALT_LENGTH} characters or fewer.`;
  else if (mode === 'publish' && !imageAlt.trim()) errors.imageAlt = 'Image alt text is required to publish.';

  if (!Array.isArray(draft.sources)) {
    errors.sources = 'Sources must be a list.';
  } else {
    const invalidSource = draft.sources.some((source) => {
      if (!source || typeof source.label !== 'string' || !source.label.trim() || source.label.length > MAX_SOURCE_LABEL_LENGTH) {
        return true;
      }
      if (typeof source.url !== 'string' || !source.url.startsWith('https://')) return true;
      try {
        return new URL(source.url).protocol !== 'https:';
      } catch {
        return true;
      }
    });
    if (invalidSource) errors.sources = 'Sources need a label and an https:// URL.';
  }

  return errors;
}

const byNewestPublication = (left: NewsArticle, right: NewsArticle): number => (
  right.publishedAt.getTime() - left.publishedAt.getTime()
);

export function selectFeaturedArticle(
  articles: NewsArticle[],
  featuredArticleId: string | null | undefined,
): NewsArticle | undefined {
  if (featuredArticleId) {
    const configured = articles.find((article) => article.id === featuredArticleId);
    if (configured) return configured;
  }
  return [...articles].sort(byNewestPublication)[0];
}

export function selectRelatedArticles(
  current: NewsArticle,
  candidates: NewsArticle[],
  limit = 3,
): NewsArticle[] {
  if (limit <= 0) return [];
  const eligible = candidates.filter((article) => article.id !== current.id);
  const sameCategory = eligible
    .filter((article) => article.category === current.category)
    .sort(byNewestPublication);
  const otherCategories = eligible
    .filter((article) => article.category !== current.category)
    .sort(byNewestPublication);
  return [...sameCategory, ...otherCategories].slice(0, limit);
}

export function formatNewsDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
