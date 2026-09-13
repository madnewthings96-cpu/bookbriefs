export type SummaryCatalogSurfaceState = 'loading' | 'error' | 'not-found' | 'content';

export interface SummaryCatalogSurfaceInput {
  loading: boolean;
  error: string | null;
  hasBook: boolean;
}

export const getSummaryCatalogSurfaceState = ({ loading, error, hasBook }: SummaryCatalogSurfaceInput): SummaryCatalogSurfaceState => {
  if (loading && !hasBook) return 'loading';
  if (error) return 'error';
  if (!hasBook && !loading) return 'not-found';
  return 'content';
};
