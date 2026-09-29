export type DashboardNavigate = (to: string, options?: { replace?: boolean }) => void;
export type DashboardLogout = () => Promise<boolean>;

export async function completeDashboardLogout(
  logout: DashboardLogout,
  navigate: DashboardNavigate,
): Promise<boolean> {
  try {
    const didSignOut = await logout();
    if (!didSignOut) return false;
    navigate('/', { replace: true });
    return true;
  } catch {
    return false;
  }
}
