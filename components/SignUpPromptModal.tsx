import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bookmark, Download, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getModalFocusWrapTarget } from './modalFocusTrap';

interface SignUpPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const benefits = [
  {
    title: 'Personalized picks',
    description: 'Recommendations shaped by what you read.',
    icon: Sparkles,
  },
  {
    title: 'PDF brief downloads',
    description: 'Keep useful ideas available offline.',
    icon: Download,
  },
  {
    title: 'Bookmarks that stay',
    description: 'Save books and return whenever you want.',
    icon: Bookmark,
  },
];

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.09A6.67 6.67 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
  </svg>
);

const SignUpPromptModal: React.FC<SignUpPromptModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const shouldReduceMotion = useReducedMotion();

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const activeIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      const wrapTarget = getModalFocusWrapTarget(activeIndex, focusableElements.length, event.shiftKey);

      if (wrapTarget !== null) {
        event.preventDefault();
        focusableElements[wrapTarget]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const moveTo = (path: '/signup' | '/login') => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#06130E]/65 p-3 backdrop-blur-[7px] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-prompt-title"
            aria-describedby="signup-prompt-description"
            tabIndex={-1}
            className="reading-ribbon-grain relative max-h-[90svh] w-full max-w-[480px] overflow-x-hidden overflow-y-auto rounded-[28px] border border-white/70 bg-[#FBF8F1] text-[#09251C] shadow-[0_30px_90px_rgba(3,20,14,0.38)] outline-none"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#304529] via-[#C49552] to-[#AFC2AE]" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#DDE7DF]/65 blur-3xl" />

            <div className="relative px-5 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
              <div className="flex items-center justify-between gap-4">
                <img
                  src="/images/ta7leel-navbar-logo-mind-leaf.png"
                  alt="Ta7leel"
                  className="h-9 w-auto object-contain sm:h-10"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close account prompt"
                  className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#304529]/10 bg-white/75 text-[#53675E] shadow-sm transition duration-200 hover:-rotate-3 hover:border-[#304529]/20 hover:bg-white hover:text-[#09251C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
                >
                  <X aria-hidden="true" className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C49552]/25 bg-[#F5EBD9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6E542D] sm:text-[11px]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#C49552] shadow-[0_0_0_3px_rgba(196,149,82,0.16)]" />
                  Free reader account
                </div>
                <h2 id="signup-prompt-title" className="mt-3 max-w-[390px] text-[28px] font-bold leading-[1.05] tracking-[-0.035em] text-[#09251C] sm:text-[34px]">
                  Keep every insight within reach.
                </h2>
                <p id="signup-prompt-description" className="mt-3 max-w-[410px] text-[14px] leading-6 text-[#53675E] sm:text-[15px]">
                  Save what matters, keep useful briefs nearby, and pick up exactly where you left off.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {benefits.map(({ title, description, icon: Icon }, index) => (
                  <motion.div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-[#304529]/10 bg-white/55 px-3 py-2.5 sm:px-4 sm:py-3"
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: shouldReduceMotion ? 0 : 0.1 + index * 0.055, duration: 0.28 }}
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDE7DF] text-[#304529]">
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold leading-5 text-[#173A2D] sm:text-sm">{title}</span>
                      <span className="block text-[12px] leading-[1.35] text-[#65766C] sm:text-[13px]">{description}</span>
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => moveTo('/signup')}
                  className="group flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#304529]/15 bg-white px-4 text-sm font-bold text-[#304529] shadow-[0_4px_14px_rgba(26,55,43,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#304529]/25 hover:shadow-[0_8px_22px_rgba(26,55,43,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] active:translate-y-0"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => moveTo('/signup')}
                  className="group relative flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#304529] to-[#4A6741] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(48,69,41,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(48,69,41,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] active:translate-y-0"
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#E3BE7D]" />
                  <span aria-hidden="true" className="absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 group-hover:translate-x-[110%]" />
                  <Mail aria-hidden="true" className="relative h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span className="relative">Continue with email</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[#C49552]/18 bg-[#F5EBD9]/70 px-3 py-2 text-center text-[11px] font-semibold text-[#6E624F] sm:text-xs">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#9A713B]" strokeWidth={1.8} />
                Trusted by 5,000+ thoughtful readers
              </div>

              <p className="mt-4 text-center text-xs text-[#65766C] sm:text-[13px]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => moveTo('/login')}
                  className="font-bold text-[#304529] underline decoration-[#C49552]/55 decoration-2 underline-offset-4 transition hover:text-[#173A2D] hover:decoration-[#C49552] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
                >
                  Log in
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignUpPromptModal;
