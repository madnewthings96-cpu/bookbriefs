import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getFeaturedNewsArticleId,
  getPublishedNewsArticle,
  isPublicNewsReferenceDenied,
  listPublishedNews,
  type NewsCursor,
  type NewsPageResult,
} from './newsRepository';
import {
  NEWS_PAGE_SIZE,
  type NewsArticle,
  type NewsCategory,
} from './newsModel';

export type NewsIndexCategory = NewsCategory | 'all';

export type NewsIndexState = {
  articles: NewsArticle[];
  featuredArticleId: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore(): Promise<void>;
  retry(): void;
};

export type NewsIndexSnapshot = Omit<NewsIndexState, 'loadMore' | 'retry'> & {
  category: NewsIndexCategory;
  cursor: NewsCursor | null;
};

export type NewsIndexDataSource = {
  listPublishedNews(options?: {
    category?: NewsCategory;
    cursor?: NewsCursor | null;
  }): Promise<NewsPageResult>;
  getFeaturedNewsArticleId(): Promise<string | null>;
  getPublishedNewsArticle(id: string): Promise<NewsArticle | null>;
};

export type NewsIndexController = {
  getSnapshot(): NewsIndexSnapshot;
  subscribe(listener: (snapshot: NewsIndexSnapshot) => void): () => void;
  setCategory(category: NewsIndexCategory): void;
  loadMore(): Promise<void>;
  retry(): Promise<void>;
  cancel(): void;
};

const NEWS_LOAD_ERROR = 'Market news is temporarily unavailable. Please try again.';

const defaultSource: NewsIndexDataSource = {
  listPublishedNews,
  getFeaturedNewsArticleId,
  getPublishedNewsArticle,
};

const createInitialSnapshot = (category: NewsIndexCategory): NewsIndexSnapshot => ({
  category,
  articles: [],
  featuredArticleId: null,
  loading: true,
  loadingMore: false,
  error: null,
  hasMore: false,
  cursor: null,
});

const pageHasMore = (articleCount: number, cursor: NewsCursor | null): boolean => (
  articleCount === NEWS_PAGE_SIZE && cursor !== null
);

const appendUniqueArticles = (current: NewsArticle[], incoming: NewsArticle[]): NewsArticle[] => {
  const knownIds = new Set(current.map((article) => article.id));
  return [
    ...current,
    ...incoming.filter((article) => !knownIds.has(article.id)),
  ];
};

export function createNewsIndexController(
  initialCategory: NewsIndexCategory,
  source: NewsIndexDataSource = defaultSource,
): NewsIndexController {
  let snapshot = createInitialSnapshot(initialCategory);
  let requestVersion = 0;
  let started = false;
  let loadMoreInFlight = false;
  const listeners = new Set<(nextSnapshot: NewsIndexSnapshot) => void>();

  const publish = (nextSnapshot: NewsIndexSnapshot) => {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener(snapshot));
  };

  const isCurrentRequest = (version: number, category: NewsIndexCategory): boolean => (
    version === requestVersion && category === snapshot.category
  );

  const loadConfiguredFeaturedArticle = async (category: NewsIndexCategory): Promise<NewsArticle | null> => {
    try {
      const featuredArticleId = await source.getFeaturedNewsArticleId();
      if (!featuredArticleId) return null;
      const article = await source.getPublishedNewsArticle(featuredArticleId);
      if (!article || (category !== 'all' && article.category !== category)) return null;
      return article;
    } catch (error) {
      // A stale config points at a record the public rules intentionally hide.
      // Other failures still fail the initial load so they remain observable.
      if (isPublicNewsReferenceDenied(error)) return null;
      throw error;
    }
  };

  const loadInitialPage = async (category: NewsIndexCategory, version: number) => {
    try {
      const [page, featuredArticle] = await Promise.all([
        source.listPublishedNews({ category: category === 'all' ? undefined : category }),
        loadConfiguredFeaturedArticle(category),
      ]);
      if (!isCurrentRequest(version, category)) return;

      const articles = featuredArticle
        ? appendUniqueArticles(page.articles, [featuredArticle])
        : page.articles;
      publish({
        category,
        articles,
        featuredArticleId: featuredArticle?.id ?? null,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: pageHasMore(page.articles.length, page.nextCursor),
        cursor: page.nextCursor,
      });
    } catch {
      if (!isCurrentRequest(version, category)) return;
      publish({
        ...createInitialSnapshot(category),
        loading: false,
        error: NEWS_LOAD_ERROR,
      });
    }
  };

  const setCategory = (category: NewsIndexCategory) => {
    if (started && snapshot.category === category) return;
    started = true;
    loadMoreInFlight = false;
    const version = ++requestVersion;
    publish(createInitialSnapshot(category));
    void loadInitialPage(category, version);
  };

  const loadMore = async (): Promise<void> => {
    const current = snapshot;
    if (
      current.loading
      || current.loadingMore
      || !current.hasMore
      || !current.cursor
      || loadMoreInFlight
    ) return;

    loadMoreInFlight = true;
    const category = current.category;
    const version = ++requestVersion;
    publish({ ...current, loadingMore: true, error: null });

    try {
      const page = await source.listPublishedNews({
        category: category === 'all' ? undefined : category,
        cursor: current.cursor,
      });
      if (!isCurrentRequest(version, category)) return;

      publish({
        ...snapshot,
        articles: appendUniqueArticles(snapshot.articles, page.articles),
        loadingMore: false,
        error: null,
        hasMore: pageHasMore(page.articles.length, page.nextCursor),
        cursor: page.nextCursor,
      });
    } catch {
      if (!isCurrentRequest(version, category)) return;
      publish({ ...snapshot, loadingMore: false, error: NEWS_LOAD_ERROR });
    } finally {
      if (isCurrentRequest(version, category)) loadMoreInFlight = false;
    }
  };

  const retry = async (): Promise<void> => {
    if (snapshot.articles.length > 0 && snapshot.cursor) {
      await loadMore();
      return;
    }
    started = false;
    setCategory(snapshot.category);
  };

  const cancel = () => {
    requestVersion += 1;
    started = false;
    loadMoreInFlight = false;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setCategory,
    loadMore,
    retry,
    cancel,
  };
}

export function useNewsIndex(activeCategory: NewsIndexCategory): NewsIndexState {
  const controllerRef = useRef<NewsIndexController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createNewsIndexController(activeCategory);
  }
  const controller = controllerRef.current;
  const [snapshot, setSnapshot] = useState<NewsIndexSnapshot>(() => controller.getSnapshot());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setSnapshot);
    controller.setCategory(activeCategory);
    return () => {
      unsubscribe();
      controller.cancel();
    };
  }, [activeCategory, controller]);

  const loadMore = useCallback(() => controller.loadMore(), [controller]);
  const retry = useCallback(() => {
    void controller.retry();
  }, [controller]);
  const visibleSnapshot = snapshot.category === activeCategory
    ? snapshot
    : createInitialSnapshot(activeCategory);

  return {
    articles: visibleSnapshot.articles,
    featuredArticleId: visibleSnapshot.featuredArticleId,
    loading: visibleSnapshot.loading,
    loadingMore: visibleSnapshot.loadingMore,
    error: visibleSnapshot.error,
    hasMore: visibleSnapshot.hasMore,
    loadMore,
    retry,
  };
}

export default useNewsIndex;
