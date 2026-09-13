import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getFeaturedNewsArticleId,
  listPublishedNews,
  type NewsCursor,
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

type InternalNewsIndexState = Omit<NewsIndexState, 'loadMore' | 'retry'> & {
  category: NewsIndexCategory;
  cursor: NewsCursor | null;
};

const NEWS_LOAD_ERROR = 'Market news is temporarily unavailable. Please try again.';

const createInitialState = (category: NewsIndexCategory): InternalNewsIndexState => ({
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

export function useNewsIndex(activeCategory: NewsIndexCategory): NewsIndexState {
  const [state, setState] = useState<InternalNewsIndexState>(() => createInitialState(activeCategory));
  const [reloadKey, setReloadKey] = useState(0);
  const requestVersionRef = useRef(0);
  const loadMoreInFlightRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;
    loadMoreInFlightRef.current = false;
    const initialState = createInitialState(activeCategory);
    stateRef.current = initialState;
    setState(initialState);

    const loadInitialPage = async () => {
      try {
        const [page, featuredArticleId] = await Promise.all([
          listPublishedNews({ category: activeCategory === 'all' ? undefined : activeCategory }),
          getFeaturedNewsArticleId(),
        ]);
        if (requestVersionRef.current !== requestVersion) return;

        setState({
          category: activeCategory,
          articles: page.articles,
          featuredArticleId,
          loading: false,
          loadingMore: false,
          error: null,
          hasMore: pageHasMore(page.articles.length, page.nextCursor),
          cursor: page.nextCursor,
        });
      } catch {
        if (requestVersionRef.current !== requestVersion) return;
        setState({
          ...createInitialState(activeCategory),
          loading: false,
          error: NEWS_LOAD_ERROR,
        });
      }
    };

    void loadInitialPage();

    return () => {
      requestVersionRef.current += 1;
      loadMoreInFlightRef.current = false;
    };
  }, [activeCategory, reloadKey]);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = stateRef.current;
    if (
      current.category !== activeCategory
      || current.loading
      || current.loadingMore
      || !current.hasMore
      || !current.cursor
      || loadMoreInFlightRef.current
    ) return;

    loadMoreInFlightRef.current = true;
    const requestVersion = ++requestVersionRef.current;
    setState((previous) => previous.category === activeCategory
      ? { ...previous, loadingMore: true, error: null }
      : previous);

    try {
      const page = await listPublishedNews({
        category: activeCategory === 'all' ? undefined : activeCategory,
        cursor: current.cursor,
      });
      if (requestVersionRef.current !== requestVersion) return;

      setState((previous) => {
        if (previous.category !== activeCategory) return previous;
        const knownIds = new Set(previous.articles.map((article) => article.id));
        const newArticles = page.articles.filter((article) => !knownIds.has(article.id));
        return {
          ...previous,
          articles: [...previous.articles, ...newArticles],
          loadingMore: false,
          error: null,
          hasMore: pageHasMore(page.articles.length, page.nextCursor),
          cursor: page.nextCursor,
        };
      });
    } catch {
      if (requestVersionRef.current !== requestVersion) return;
      setState((previous) => previous.category === activeCategory
        ? { ...previous, loadingMore: false, error: NEWS_LOAD_ERROR }
        : previous);
    } finally {
      if (requestVersionRef.current === requestVersion) {
        loadMoreInFlightRef.current = false;
      }
    }
  }, [activeCategory]);

  const retry = useCallback(() => {
    const current = stateRef.current;
    if (current.category === activeCategory && current.articles.length > 0 && current.cursor) {
      void loadMore();
      return;
    }
    setReloadKey((key) => key + 1);
  }, [activeCategory, loadMore]);

  const visibleState = state.category === activeCategory ? state : createInitialState(activeCategory);
  return {
    articles: visibleState.articles,
    featuredArticleId: visibleState.featuredArticleId,
    loading: visibleState.loading,
    loadingMore: visibleState.loadingMore,
    error: visibleState.error,
    hasMore: visibleState.hasMore,
    loadMore,
    retry,
  };
}

export default useNewsIndex;
