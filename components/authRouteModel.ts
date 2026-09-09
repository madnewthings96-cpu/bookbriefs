export type ProtectedRouteDecision = 'loading' | 'allow' | 'redirect';

export const getProtectedRouteDecision = (
  isAuthReady: boolean,
  isAuthenticated: boolean,
): ProtectedRouteDecision => {
  if (!isAuthReady) return 'loading';
  return isAuthenticated ? 'allow' : 'redirect';
};

export const getSafePostAuthDestination = (candidate?: string): string => {
  if (!candidate) return '/dashboard';
  const [pathname] = candidate.split(/[?#]/, 1);
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    ? candidate
    : '/dashboard';
};
