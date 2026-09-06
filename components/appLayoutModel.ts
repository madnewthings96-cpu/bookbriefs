const standaloneRoutes = new Set(['/login', '/signup']);

export function isStandaloneAppRoute(pathname: string): boolean {
  const normalizedPath = (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname).toLowerCase();
  return standaloneRoutes.has(normalizedPath);
}
