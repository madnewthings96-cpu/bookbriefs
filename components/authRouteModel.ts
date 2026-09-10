export type ProtectedRouteDecision = 'loading' | 'allow' | 'redirect';

export const getProtectedRouteDecision = (
  isAuthReady: boolean,
  isAuthenticated: boolean,
  authError?: string | null,
): ProtectedRouteDecision => {
  if (!isAuthReady) return 'loading';
  return isAuthenticated && !authError ? 'allow' : 'redirect';
};

const POST_AUTH_URL_BASE = 'https://ta7leel.local';

export const getSafePostAuthDestination = (candidate?: string): string => {
  if (!candidate) return '/dashboard';
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '/dashboard';

  try {
    const parsed = new URL(candidate, POST_AUTH_URL_BASE);
    if (parsed.origin !== POST_AUTH_URL_BASE) return '/dashboard';

    const normalizedPathname = parsed.pathname.toLowerCase();
    return normalizedPathname === '/dashboard' || normalizedPathname.startsWith('/dashboard/')
      ? candidate
      : '/dashboard';
  } catch {
    return '/dashboard';
  }
};
