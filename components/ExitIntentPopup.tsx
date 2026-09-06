import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import ExitIntentDialog from './ExitIntentDialog';
import { getModalFocusWrapTarget } from './modalFocusTrap';

const EXIT_POPUP_STORAGE_KEY = 'exit_popup_last_shown';
const POPUP_COOLDOWN_DAYS = 7;

const ExitIntentPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShown, setHasShown] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const checkCooldown = () => {
    const lastShown = localStorage.getItem(EXIT_POPUP_STORAGE_KEY);
    if (lastShown) {
      const daysSince = (Date.now() - Number.parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < POPUP_COOLDOWN_DAYS) return false;
    }
    return true;
  };

  const showPopup = () => {
    if (!hasShown && checkCooldown()) {
      setIsVisible(true);
      setHasShown(true);
      localStorage.setItem(EXIT_POPUP_STORAGE_KEY, Date.now().toString());
    }
  };

  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) showPopup();
    };

    const timer = window.setTimeout(showPopup, 180000);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.clearTimeout(timer);
    };
  }, [hasShown]);

  useEffect(() => {
    if (!isVisible) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsVisible(false);
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
  }, [isVisible]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      setIsVisible(false);
    } catch (caughtError) {
      console.error(caughtError);
      const message = caughtError instanceof Error ? caughtError.message : 'Failed to continue with Google.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setIsVisible(false);
    } catch (caughtError) {
      console.error(caughtError);
      const authError = caughtError as { code?: string; message?: string };

      if (authError.code === 'auth/email-already-in-use') {
        setError('That email already has an account. Log in instead.');
        setIsLogin(true);
      } else if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        setError('That email and password do not match. Try again.');
      } else if (authError.code === 'auth/user-not-found') {
        setError('No account was found for that email. Create one instead.');
        setIsLogin(false);
      } else {
        setError(authError.message || 'We could not complete that request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin((currentMode) => !currentMode);
    setError(null);
    setShowPassword(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-[#06130E]/68 p-3 backdrop-blur-[8px] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          onMouseDown={() => setIsVisible(false)}
        >
          <ExitIntentDialog
            dialogRef={dialogRef}
            email={email}
            password={password}
            isLogin={isLogin}
            loading={loading}
            error={error}
            reduceMotion={reduceMotion}
            showPassword={showPassword}
            onClose={() => setIsVisible(false)}
            onGoogleAuth={handleGoogleAuth}
            onSubmit={handleAuth}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onToggleMode={handleToggleMode}
            onTogglePassword={() => setShowPassword((isShown) => !isShown)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
