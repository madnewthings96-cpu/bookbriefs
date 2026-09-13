import {
  type NewsArticle,
  type NewsArticleDraft,
  createEmptyNewsDraft,
} from './newsModel';

const FIXTURE_DATE = new Date('2026-09-13T12:00:00.000Z');

const cloneDate = (date: Date): Date => new Date(date.getTime());

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
};

export function makeNewsArticleFixture(overrides: Partial<NewsArticle> = {}): NewsArticle {
  const publishedAt = cloneDate(overrides.publishedAt ?? FIXTURE_DATE);
  const createdAt = cloneDate(overrides.createdAt ?? publishedAt);
  const updatedAt = cloneDate(overrides.updatedAt ?? publishedAt);
  return {
    id: 'fixture-news-article',
    title: 'Weekly Market Outlook',
    slug: 'weekly-market-outlook',
    excerpt: 'A concise editorial view of the week ahead across global markets.',
    body: 'Markets enter the week with investors focused on rates, growth, and risk.',
    category: 'markets',
    language: 'en',
    authorName: 'Ta7leel Editorial',
    imageUrl: 'https://images.example.com/news/weekly-market-outlook.jpg',
    imagePath: 'news/fixture-news-article/weekly-market-outlook.jpg',
    imageAlt: 'A market chart showing the weekly outlook',
    sources: [{ label: 'Example Markets Desk', url: 'https://example.com/markets' }],
    status: 'published',
    createdAt,
    updatedAt,
    publishedAt,
    ...overrides,
  };
}

const SAMPLE_DRAFT: NewsArticleDraft = deepFreeze({
  ...createEmptyNewsDraft(),
  id: 'sample-development-news-article',
  title: 'Development Sample: Reading the Week in Global Markets',
  slug: 'development-sample-reading-the-week-in-global-markets',
  excerpt: 'A clearly marked local sample draft for evaluating the editorial layout and preview flow.',
  body: '# Development sample\n\nThis polished sample exists only in development and emulator environments. It is never written automatically or exposed as a published story.\n\nUse the preview to review hierarchy, source presentation, and responsive reading behavior before creating a real article.',
  category: 'markets',
  authorName: 'Development Editorial',
  imageUrl: 'https://images.example.com/news/development-sample.jpg',
  imagePath: 'news/sample-development-news-article/development-sample.jpg',
  imageAlt: 'Development sample image of a financial market display',
  sources: [{ label: 'Development source', url: 'https://example.com/development-source' }],
});

export function getSampleNewsDraft(): NewsArticleDraft {
  return SAMPLE_DRAFT;
}
