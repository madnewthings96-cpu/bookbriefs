export const SIDEBAR_PREFERENCE_KEY = 'ta7leel_dashboard_sidebar_collapsed';
export const SIDEBAR_PREFERENCE_EVENT = 'dashboard-preference-change';

const getSafeStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readSidebarCollapsed = (): boolean => {
  try {
    return getSafeStorage()?.getItem(SIDEBAR_PREFERENCE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const writeSidebarCollapsed = (collapsed: boolean): void => {
  try {
    getSafeStorage()?.setItem(SIDEBAR_PREFERENCE_KEY, String(collapsed));
  } catch {
    // Private browsing and disabled storage should not block the dashboard.
  }
};

export const resetSidebarPreference = (): void => {
  try {
    getSafeStorage()?.removeItem(SIDEBAR_PREFERENCE_KEY);
  } catch {
    // Private browsing and disabled storage should not block the dashboard.
  }

  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_EVENT));
  } catch {
    // Event delivery is best effort when the browser surface is restricted.
  }
};
