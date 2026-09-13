import {
  BookOpen,
  Calculator,
  CandlestickChart,
  Compass,
  Download,
  LayoutDashboard,
  Library,
  MessageCircle,
  NotebookPen,
  Settings,
  Trophy,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardNavItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  action?: 'feedback';
}

export interface DashboardNavGroup {
  id: 'reading' | 'tools' | 'utility';
  label: string | null;
  items: DashboardNavItem[];
}

export { LEGACY_DASHBOARD_REDIRECTS } from '../appLayoutModel';

export const DASHBOARD_NAVIGATION: DashboardNavGroup[] = [
  {
    id: 'reading',
    label: 'Reading',
    items: [
      { id: 'overview', labelKey: 'dashboardOverview', fallbackLabel: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
      { id: 'discover', labelKey: 'dashboardDiscover', fallbackLabel: 'Discover', href: '/dashboard/discover', icon: Compass },
      { id: 'library', labelKey: 'dashboardLibrary', fallbackLabel: 'Library', href: '/dashboard/library', icon: Library },
      { id: 'notes', labelKey: 'dashboardNotes', fallbackLabel: 'Notes', href: '/dashboard/notes', icon: NotebookPen },
      { id: 'challenge', labelKey: 'dashboardChallenge', fallbackLabel: 'Challenge', href: '/dashboard/challenge', icon: Trophy },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'downloads', labelKey: 'dashboardDownloads', fallbackLabel: 'Downloads', href: '/dashboard/downloads', icon: Download },
      { id: 'calculators', labelKey: 'dashboardCalculators', fallbackLabel: 'Calculators', href: '/dashboard/calculators', icon: Calculator },
      { id: 'finance', labelKey: 'dashboardFinance', fallbackLabel: 'Finance Tracker', href: '/dashboard/finance', icon: WalletCards },
      { id: 'trading', labelKey: 'dashboardTrading', fallbackLabel: 'Trading Journal', href: '/dashboard/trading', icon: CandlestickChart },
    ],
  },
  {
    id: 'utility',
    label: null,
    items: [
      { id: 'feedback', labelKey: 'dashboardSendFeedback', fallbackLabel: 'Send feedback', href: '#feedback', icon: MessageCircle, action: 'feedback' },
      { id: 'settings', labelKey: 'dashboardSettings', fallbackLabel: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

const normalizePathname = (pathname: string) => {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || '/';
  return (withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, '') : withoutQuery).toLowerCase();
};

export const isDashboardNavItemActive = (item: DashboardNavItem, pathname: string) => {
  if (item.action) return false;
  const currentPath = normalizePathname(pathname);
  const itemPath = normalizePathname(item.href);
  return item.exact ? currentPath === itemPath : currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

export const getDashboardPageTitle = (pathname: string) => {
  const item = DASHBOARD_NAVIGATION.flatMap(group => group.items)
    .find(candidate => isDashboardNavItemActive(candidate, pathname));
  return item?.fallbackLabel ?? 'Overview';
};
