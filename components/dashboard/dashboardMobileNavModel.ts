export const DESKTOP_BREAKPOINT_QUERY = '(min-width: 1024px)';

export interface DesktopMediaQueryList {
  readonly matches: boolean;
  addEventListener?: (type: 'change', listener: (event: MediaQueryListEvent) => void) => void;
  removeEventListener?: (type: 'change', listener: (event: MediaQueryListEvent) => void) => void;
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
}

type DesktopMediaQueryFactory = (query: string) => DesktopMediaQueryList;
type DesktopChangeEvent = { matches: boolean };

/**
 * Observe the desktop breakpoint used by the mobile More drawer. The initial
 * state is emitted so a drawer opened after a resize cannot remain stranded.
 */
export const subscribeToDesktopBreakpoint = (
  mediaQuery: DesktopMediaQueryList,
  onChange: (isDesktop: boolean) => void,
): (() => void) => {
  const handleChange = (event: DesktopChangeEvent) => onChange(event.matches);
  onChange(mediaQuery.matches);

  if (mediaQuery.addEventListener && mediaQuery.removeEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }

  mediaQuery.addListener?.(handleChange);
  return () => mediaQuery.removeListener?.(handleChange);
};

export const subscribeToDesktopBreakpointFromWindow = (
  matchMedia: DesktopMediaQueryFactory,
  onChange: (isDesktop: boolean) => void,
): (() => void) => subscribeToDesktopBreakpoint(matchMedia(DESKTOP_BREAKPOINT_QUERY), onChange);
