import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPublishedNewsArticleBySlug,
  listPublishedNews,
  type NewsPageResult,
} from './newsRepository';
import { selectRelatedArticles, type NewsArticle, type NewsCategory } from './newsModel';

export type NewsArticleState = {
  article: NewsArticle | null;
  relatedArticles: NewsArticle[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
};

export type NewsArticleDataSource = {
  getPublishedNewsArticleBySlug(slug: string): Promise<NewsArticle | null>;
  listPublishedNews(options?: { category?: NewsCategory }): Promise<NewsPageResult>;
};

export type NewsArticleController = {
  getSnapshot(): NewsArticleState;
  subscribe(listener: (snapshot: NewsArticleState) => void): () => void;
  load(slug: string): Promise<void>;
  retry(): Promise<void>;
  cancel(): void;
};

const NEWS_ARTICLE_ERROR = 'This article is temporarily unavailable. Please try again.';

const defaultSource: NewsArticleDataSource = {
  getPublishedNewsArticleBySlug,
  listPublishedNews,
};

const initialState = (): NewsArticleState => ({
  article: null,
  relatedArticles: [],
  loading: true,
  notFound: false,
  error: null,
});

export function createNewsArticleController(
  source: NewsArticleDataSource = defaultSource,
): NewsArticleController {
  let snapshot = initialState();
  let activeSlug = '';
  let requestVersion = 0;
  const listeners = new Set<(nextSnapshot: NewsArticleState) => void>();

  const publish = (nextSnapshot: NewsArticleState) => {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener(snapshot));
  };

  const load = async (slug: string): Promise<void> => {
    activeSlug = slug.trim();
    const version = ++requestVersion;
    publish(initialState());

    if (!activeSlug) {
      publish({ ...initialState(), loading: false, notFound: true });
      return;
    }

    try {
      const article = await source.getPublishedNewsArticleBySlug(activeSlug);
      if (version !== requestVersion) return;
      if (!article) {
        publish({ ...initialState(), loading: false, notFound: true });
        return;
      }

      // Fetch the newest public stories across categories. The selector keeps
      // same-category stories first, then fills any remaining related slots.
      const relatedPage = await source.listPublishedNews();
      if (version !== requestVersion) return;
      publish({
        article,
        relatedArticles: selectRelatedArticles(article, relatedPage.articles, 3),
        loading: false,
        notFound: false,
        error: null,
      });
    } catch {
      if (version !== requestVersion) return;
      publish({
        article: null,
        relatedArticles: [],
        loading: false,
        notFound: false,
        error: NEWS_ARTICLE_ERROR,
      });
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    retry: () => load(activeSlug),
    cancel: () => {
      requestVersion += 1;
    },
  };
}

export function useNewsArticle(slug: string): NewsArticleState & { retry: () => void } {
  const controllerRef = useRef<NewsArticleController | null>(null);
  if (!controllerRef.current) controllerRef.current = createNewsArticleController();
  const controller = controllerRef.current;
  const [snapshot, setSnapshot] = useState<NewsArticleState>(() => controller.getSnapshot());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setSnapshot);
    void controller.load(slug);
    return () => {
      unsubscribe();
      controller.cancel();
    };
  }, [controller, slug]);

  const retry = useCallback(() => {
    void controller.retry();
  }, [controller]);

  return { ...snapshot, retry };
}

export default useNewsArticle;
