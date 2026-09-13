const normalizePath = (pathname: string) =>
  (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname).toLowerCase();

export type AppLayoutFamily = 'public' | 'standalone' | 'dashboard';

export const LEGACY_DASHBOARD_REDIRECTS: Record<string, string> = {
  '/profile': '/dashboard/settings',
  '/reading-challenge': '/dashboard/challenge',
  '/downloads': '/dashboard/downloads',
  '/feedback': '/dashboard/admin/feedback',
  '/finance-tracker': '/dashboard/finance',
  '/trading-journal': '/dashboard/trading',
};

export const isStandaloneAppRoute = (pathname: string) =>
  ['/login', '/signup'].includes(normalizePath(pathname));

export const isDashboardAppRoute = (pathname: string) => {
  const normalized = normalizePath(pathname);
  return normalized === '/dashboard' || normalized.startsWith('/dashboard/');
};

export const isFocusedDashboardRoute = (pathname: string) =>
  /^\/dashboard\/summary\/[^/]+$/.test(normalizePath(pathname));

export const getAppLayoutFamily = (pathname: string): AppLayoutFamily => {
  const normalized = normalizePath(pathname);
  if (isStandaloneAppRoute(normalized)) return 'standalone';
  if (isDashboardAppRoute(normalized) || normalized in LEGACY_DASHBOARD_REDIRECTS) return 'dashboard';
  return 'public';
};
