import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPublishedNewsArticleBySlug,
  isPublicNewsReferenceDenied,
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

export type NewsArticleRouteSnapshot = {
  slug: string;
  snapshot: NewsArticleState;
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

const normalizeSlug = (slug: string): string => slug.trim();

export function selectNewsArticleRouteState(
  slug: string,
  routeSnapshot: NewsArticleRouteSnapshot,
): NewsArticleState {
  return routeSnapshot.slug === normalizeSlug(slug)
    ? routeSnapshot.snapshot
    : initialState();
}

function mergeRelatedCandidates(
  currentArticleId: string,
  ...pages: NewsPageResult[]
): NewsArticle[] {
  const seen = new Set([currentArticleId]);
  const candidates: NewsArticle[] = [];
  pages.forEach((page) => {
    page.articles.forEach((article) => {
      if (seen.has(article.id)) return;
      seen.add(article.id);
      candidates.push(article);
    });
  });
  return candidates;
}

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
    activeSlug = normalizeSlug(slug);
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

      // A dedicated category query guarantees that an older category match is
      // not hidden behind the first general page. The general query fills any
      // remaining related slots with the newest stories from other categories.
      const relatedResults = await Promise.allSettled([
        source.listPublishedNews({ category: article.category }),
        source.listPublishedNews(),
      ]);
      if (version !== requestVersion) return;
      // Related stories are optional enrichment. Keep every successful result
      // independently so a secondary query can never suppress the article.
      const relatedPages = relatedResults.flatMap((result) => (
        result.status === 'fulfilled' ? [result.value] : []
      ));
      publish({
        article,
        relatedArticles: selectRelatedArticles(
          article,
          mergeRelatedCandidates(article.id, ...relatedPages),
          3,
        ),
        loading: false,
        notFound: false,
        error: null,
      });
    } catch (error) {
      if (version !== requestVersion) return;
      if (isPublicNewsReferenceDenied(error)) {
        publish({ ...initialState(), loading: false, notFound: true });
        return;
      }
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
  const [routeSnapshot, setRouteSnapshot] = useState<NewsArticleRouteSnapshot>(() => ({
    slug: '',
    snapshot: controller.getSnapshot(),
  }));

  useEffect(() => {
    const routeSlug = normalizeSlug(slug);
    const unsubscribe = controller.subscribe((snapshot) => {
      setRouteSnapshot({ slug: routeSlug, snapshot });
    });
    void controller.load(slug);
    return () => {
      unsubscribe();
      controller.cancel();
    };
  }, [controller, slug]);

  const retry = useCallback(() => {
    void controller.retry();
  }, [controller]);

  const snapshot = selectNewsArticleRouteState(slug, routeSnapshot);
  return { ...snapshot, retry };
}

export default useNewsArticle;
