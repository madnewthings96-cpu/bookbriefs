export type NavigationGroupKey = 'library' | 'tools' | 'learn';

const routeGroups: Record<NavigationGroupKey, readonly string[]> = {
  library: [
    '/summaries',
    '/summary',
    '/book-summaries',
    '/ar/book-summaries',
    '/categories',
    '/ar/categories',
    '/reading-challenge',
    '/downloads',
  ],
  tools: ['/calculators', '/ar/tools', '/finance-tracker', '/trading-journal'],
  learn: ['/blog', '/news', '/about'],
};

const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export const getActiveNavigationGroup = (pathname: string): NavigationGroupKey | null => {
  const group = (Object.keys(routeGroups) as NavigationGroupKey[]).find((key) =>
    routeGroups[key].some((route) => matchesRoute(pathname, route)),
  );

  return group ?? null;
};

export const getNextNavigationMenu = (
  activeMenu: NavigationGroupKey | null,
  requestedMenu: NavigationGroupKey,
): NavigationGroupKey | null => (activeMenu === requestedMenu ? null : requestedMenu);

export const isCompactHeader = (scrollY: number): boolean => scrollY > 20;
