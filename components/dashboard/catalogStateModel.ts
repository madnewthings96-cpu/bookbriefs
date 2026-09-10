export type CatalogSurfaceState = 'loading' | 'error' | 'content' | 'empty';

export interface CatalogSurfaceInput {
  loading: boolean;
  error: string | null;
  hasContent: boolean;
  /** User-owned data must be hydrated before an empty state is trustworthy. */
  userDataReady?: boolean;
}

/**
 * Chooses the page content state while allowing stale/usable content to stay
 * visible alongside a loading or error banner.
 */
export const buildCatalogSurfaceState = ({ loading, error, hasContent, userDataReady = true }: CatalogSurfaceInput): CatalogSurfaceState => {
  if (!userDataReady && !hasContent) return 'loading';
  if (hasContent) return 'content';
  if (loading) return 'loading';
  if (error) return 'error';
  return 'empty';
};

export const runCatalogRetry = (refreshBooks: () => Promise<void>) => async () => {
  await refreshBooks();
};
