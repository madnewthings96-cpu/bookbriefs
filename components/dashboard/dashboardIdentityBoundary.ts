/**
 * Private dashboard state is intentionally keyed by the authenticated UID.
 * React uses this value at the protected route boundary to synchronously
 * unmount the previous account's pages, drafts, selections, and modals before
 * rendering the next account's subtree.
 */
export const getDashboardIdentityKey = (
  userId: string | null | undefined,
  isAuthenticated: boolean,
): string => isAuthenticated && userId ? `dashboard:${userId}` : 'dashboard:anonymous';
