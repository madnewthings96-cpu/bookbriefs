export const COFFEE_SUPPORT_ACTIVE_DELAY_MS = 5 * 60 * 1000;
export const COFFEE_SUPPORT_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const MEANINGFUL_SCROLL_RATIO = 0.35;

interface CoffeeSupportScrollPosition {
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
}

interface CoffeeSupportEligibility {
  activeTimeMs: number;
  hasMeaningfulEngagement: boolean;
  lastShownAt: number | null;
  now: number;
}

export const hasMeaningfulCoffeeSupportScroll = ({
  scrollY,
  viewportHeight,
  documentHeight,
}: CoffeeSupportScrollPosition) => {
  const scrollableDistance = documentHeight - viewportHeight;
  return scrollableDistance > 0 && scrollY / scrollableDistance >= MEANINGFUL_SCROLL_RATIO;
};

export const shouldRevealCoffeeSupport = ({
  activeTimeMs,
  hasMeaningfulEngagement,
  lastShownAt,
  now,
}: CoffeeSupportEligibility) => {
  if (activeTimeMs < COFFEE_SUPPORT_ACTIVE_DELAY_MS || !hasMeaningfulEngagement) {
    return false;
  }

  const hasRecentValidImpression =
    lastShownAt !== null &&
    Number.isFinite(lastShownAt) &&
    lastShownAt <= now &&
    now - lastShownAt < COFFEE_SUPPORT_COOLDOWN_MS;

  return !hasRecentValidImpression;
};
