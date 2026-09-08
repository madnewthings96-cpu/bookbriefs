import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import {
  COFFEE_SUPPORT_ACTIVE_DELAY_MS,
  hasMeaningfulCoffeeSupportScroll,
  shouldRevealCoffeeSupport,
} from './coffeeSupportModel';

const COFFEE_SUPPORT_STORAGE_KEY = 'ta7leel_coffee_support_last_shown';
const ACTIVE_TIME_TICK_MS = 1000;

interface CoffeeSupportCardViewProps {
  onDismiss: () => void;
  shouldReduceMotion?: boolean | null;
}

export const CoffeeSupportCardView: React.FC<CoffeeSupportCardViewProps> = ({
  onDismiss,
  shouldReduceMotion = false,
}) => (
  <motion.aside
    role="region"
    aria-live="polite"
    aria-labelledby="coffee-support-title"
    className="reading-ribbon-grain fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[80] overflow-hidden rounded-[26px] bg-[#FBF8F1] p-4 text-[#10291F] shadow-[0_1px_2px_rgba(9,37,28,0.08),0_18px_55px_rgba(9,37,28,0.2)] ring-1 ring-black/10 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[380px] sm:p-5"
    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.38, bounce: 0 }}
  >
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#304529] via-[#C49552] to-[#AFC2AE]" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-[#DDE7DF]/65 blur-3xl" />

    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss coffee support message"
      className="absolute right-2.5 top-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-[#65766C] transition-[background-color,color,transform] duration-200 hover:bg-white/80 hover:text-[#173A2D] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
    >
      <X aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
    </button>

    <div className="relative flex items-start gap-3.5 pr-8 sm:gap-4">
      <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[#F2F0E7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] sm:h-[88px] sm:w-[88px] sm:rounded-[22px]">
        <img
          src="/images/ta7leel-coffee-support.svg"
          alt=""
          aria-hidden="true"
          className="h-[74px] w-[74px] object-contain sm:h-[82px] sm:w-[82px]"
        />
      </div>

      <div className="min-w-0 pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8A6536]">Reader supported</p>
        <h2 id="coffee-support-title" className="mt-1 font-serif text-[20px] font-bold leading-[1.12] tracking-[-0.02em] text-[#10291F] [text-wrap:balance] sm:text-[22px]">
          A little coffee for more big ideas?
        </h2>
      </div>
    </div>

    <p className="relative mt-3 text-[13px] font-medium leading-5 text-[#5B6B60] [text-wrap:pretty] sm:text-sm sm:leading-[1.45]">
      Help us keep Ta7leel thoughtful, useful, and accessible.
    </p>

    <a
      href="https://ko-fi.com/ta7leel"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onDismiss}
      className="group relative mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[16px] bg-[#304529] px-4 text-sm font-black text-white shadow-[0_8px_20px_rgba(48,69,41,0.22)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#253A20] hover:shadow-[0_12px_26px_rgba(48,69,41,0.3)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#C49552]" />
      <span>Buy us a coffee</span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
    </a>
  </motion.aside>
);

const CoffeeSupportCard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const activeTimeMsRef = useRef(0);
  const hasMeaningfulEngagementRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let lastShownAt: number | null = null;

    try {
      const storedLastShownAt = window.localStorage.getItem(COFFEE_SUPPORT_STORAGE_KEY);
      lastShownAt = storedLastShownAt ? Number(storedLastShownAt) : null;
    } catch {
      lastShownAt = null;
    }

    const now = Date.now();
    const isInCooldown = !shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt,
      now,
    });

    if (isInCooldown) return undefined;

    let activeTimeTimer: number | undefined;

    const stopTracking = () => {
      if (activeTimeTimer !== undefined) window.clearInterval(activeTimeTimer);
      window.removeEventListener('scroll', checkScrollEngagement);
    };

    const tryReveal = () => {
      const revealTime = Date.now();
      const canReveal = shouldRevealCoffeeSupport({
        activeTimeMs: activeTimeMsRef.current,
        hasMeaningfulEngagement: hasMeaningfulEngagementRef.current,
        lastShownAt,
        now: revealTime,
      });

      if (!canReveal) return false;

      setIsVisible(true);
      lastShownAt = revealTime;

      try {
        window.localStorage.setItem(COFFEE_SUPPORT_STORAGE_KEY, String(revealTime));
      } catch {
        // The card can still work when storage is unavailable.
      }

      stopTracking();
      return true;
    };

    const checkScrollEngagement = () => {
      hasMeaningfulEngagementRef.current =
        hasMeaningfulEngagementRef.current ||
        hasMeaningfulCoffeeSupportScroll({
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight,
        });

      tryReveal();
    };

    checkScrollEngagement();
    window.addEventListener('scroll', checkScrollEngagement, { passive: true });

    activeTimeTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeTimeMsRef.current += ACTIVE_TIME_TICK_MS;
      }

      tryReveal();
    }, ACTIVE_TIME_TICK_MS);

    return () => {
      stopTracking();
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <CoffeeSupportCardView
          shouldReduceMotion={shouldReduceMotion}
          onDismiss={() => setIsVisible(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default CoffeeSupportCard;
