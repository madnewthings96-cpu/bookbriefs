import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  LineChart,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ExitIntentDialogProps {
  dialogRef: React.RefObject<HTMLDivElement>;
  email: string;
  password: string;
  isLogin: boolean;
  loading: boolean;
  error: string | null;
  reduceMotion: boolean | null;
  showPassword?: boolean;
  onClose: () => void;
  onGoogleAuth: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleMode: () => void;
  onTogglePassword?: () => void;
}

const GoogleMark = () => (
  <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.09A6.67 6.67 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
  </svg>
);

export const ExitIntentDialog: React.FC<ExitIntentDialogProps> = ({
  dialogRef,
  email,
  password,
  isLogin,
  loading,
  error,
  reduceMotion,
  showPassword = false,
  onClose,
  onGoogleAuth,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onToggleMode,
  onTogglePassword,
}) => (
  <motion.div
    ref={dialogRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="exit-popup-title"
    aria-describedby="exit-popup-description"
    tabIndex={-1}
    className="relative grid max-h-[92svh] w-full max-w-[960px] overflow-x-hidden overflow-y-auto rounded-[28px] border border-white/60 bg-[#FBF8F1] text-[#09251C] shadow-[0_36px_110px_rgba(3,20,14,0.48)] outline-none md:grid-cols-[0.92fr_1.08fr]"
    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
    transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
    onMouseDown={(event) => event.stopPropagation()}
  >
    <div aria-hidden="true" className="absolute inset-x-0 top-0 z-30 h-1 bg-gradient-to-r from-[#E3BE7D] via-[#C49552] to-[#4A6741]" />

    <section className="relative min-h-[190px] overflow-hidden bg-[#173A2D] md:min-h-[610px]">
      <img
        src="/popup.jpg"
        alt="Trader reviewing a market chart and recording decisions"
        className="absolute inset-0 h-full w-full object-cover object-center grayscale-[15%] md:object-[48%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(155deg,rgba(9,37,28,0.22),rgba(9,37,28,0.72)_60%,rgba(9,37,28,0.96))]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 flex h-full min-h-[190px] flex-col justify-between p-5 text-[#FBF8F1] sm:p-7 md:min-h-[610px] md:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-white/25 bg-[#FBF8F1]/92 px-3 py-2 shadow-sm backdrop-blur-sm">
            <img src="/images/ta7leel-navbar-logo-mind-leaf.png" alt="Ta7leel" className="h-7 w-auto object-contain" />
          </span>
          <span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/72 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E3BE7D] shadow-[0_0_0_4px_rgba(227,190,125,0.16)]" />
            Private by default
          </span>
        </div>

        <motion.div
          className="max-w-[330px] rounded-[22px] border border-white/18 bg-[#0A241B]/72 p-4 shadow-[0_22px_55px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-5"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.16, duration: 0.32 }}
        >
          <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E3BE7D]">
            <span>Trading field note</span>
            <span>01</span>
          </div>
          <blockquote className="mt-2 font-serif text-[22px] italic leading-tight tracking-[-0.02em] text-white sm:text-[26px] md:text-[30px]">
            “Clarity compounds.”
          </blockquote>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white/72 sm:text-xs">
            <LineChart aria-hidden="true" className="h-4 w-4 text-[#E3BE7D]" strokeWidth={1.8} />
            Track <span aria-hidden="true" className="text-white/35">→</span> Review <span aria-hidden="true" className="text-white/35">→</span> Improve
          </div>
        </motion.div>
      </div>
    </section>

    <section className="reading-ribbon-grain relative flex flex-col justify-center bg-[#FBF8F1] px-5 pb-6 pt-16 sm:px-8 sm:pb-8 md:px-10 md:py-9">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close exit prompt"
        className="group absolute right-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#304529]/10 bg-white/80 text-[#53675E] shadow-sm transition duration-200 hover:-rotate-3 hover:border-[#304529]/20 hover:bg-white hover:text-[#09251C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] sm:right-5 sm:top-5"
      >
        <X aria-hidden="true" className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.8} />
      </button>

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#C49552]/25 bg-[#F5EBD9] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6E542D] sm:text-[11px]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#C49552] shadow-[0_0_0_3px_rgba(196,149,82,0.16)]" />
          Before you go · Free toolkit
        </div>

        <h2 id="exit-popup-title" className="mt-3 max-w-[430px] text-[30px] font-bold leading-[1.03] tracking-[-0.04em] text-[#09251C] sm:text-[36px]">
          Turn every trade into a lesson.
        </h2>
        <p id="exit-popup-description" className="mt-3 max-w-[450px] text-sm leading-6 text-[#53675E] sm:text-[15px]">
          Build a calmer process with a private journal that helps you spot patterns, review decisions, and trade with intention.
        </p>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Journal benefits">
          {[
            ['Spot patterns', BarChart3],
            ['Review decisions', LineChart],
            ['Stay private', ShieldCheck],
          ].map(([label, Icon]) => (
            <span key={label as string} className="inline-flex items-center gap-1.5 rounded-full border border-[#304529]/10 bg-white/60 px-2.5 py-1.5 text-[11px] font-semibold text-[#456052]">
              <Icon aria-hidden="true" className="h-3.5 w-3.5 text-[#304529]" strokeWidth={1.8} />
              {label as string}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onGoogleAuth}
          disabled={loading}
          className="group mt-5 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#304529]/15 bg-white px-4 text-sm font-bold text-[#304529] shadow-[0_4px_14px_rgba(26,55,43,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#304529]/25 hover:shadow-[0_8px_22px_rgba(26,55,43,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleMark />
          Continue with Google
        </button>

        <div className="my-3 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#304529]/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A897F]">or use email</span>
          <span className="h-px flex-1 bg-[#304529]/10" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="exit-popup-email" className="mb-1.5 block text-xs font-bold text-[#304529]">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7C8C82]" strokeWidth={1.8} />
              <input
                id="exit-popup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
                disabled={loading}
                className="min-h-12 w-full rounded-2xl border border-[#304529]/12 bg-white/70 py-3 pl-11 pr-4 text-sm text-[#173A2D] outline-none transition placeholder:text-[#91A097] hover:border-[#304529]/22 focus:border-[#C49552] focus:bg-white focus:ring-4 focus:ring-[#C49552]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label htmlFor="exit-popup-password" className="mb-1.5 block text-xs font-bold text-[#304529]">{isLogin ? 'Password' : 'Create a password'}</label>
            <div className="relative">
              <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7C8C82]" strokeWidth={1.8} />
              <input
                id="exit-popup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="min-h-12 w-full rounded-2xl border border-[#304529]/12 bg-white/70 py-3 pl-11 pr-12 text-sm text-[#173A2D] outline-none transition placeholder:text-[#91A097] hover:border-[#304529]/22 focus:border-[#C49552] focus:bg-white focus:ring-4 focus:ring-[#C49552]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {onTogglePassword && (
                <button
                  type="button"
                  onClick={onTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7C8C82] transition hover:bg-[#DDE7DF] hover:text-[#304529] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" /> : <Eye aria-hidden="true" className="h-[18px] w-[18px]" />}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-[#B65042]/20 bg-[#FFF0EC] px-3 py-2.5 text-xs font-semibold leading-5 text-[#8C352C]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#304529] to-[#4A6741] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(48,69,41,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(48,69,41,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
          >
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#E3BE7D]" />
            {loading ? (
              <>
                <LoaderCircle aria-hidden="true" className="h-[18px] w-[18px] animate-spin" />
                Please wait…
              </>
            ) : (
              <>
                {isLogin ? 'Open my journal' : 'Create my free journal'}
                <ArrowRight aria-hidden="true" className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" strokeWidth={1.8} />
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#65766C]">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-[#9A713B]" strokeWidth={1.8} />
          Free to start · Your journal stays private
        </div>

        <p className="mt-3 text-center text-xs text-[#65766C] sm:text-[13px]">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="font-bold text-[#304529] underline decoration-[#C49552]/55 decoration-2 underline-offset-4 transition hover:text-[#173A2D] hover:decoration-[#C49552] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49552]"
          >
            {isLogin ? 'Create one free' : 'Log in'}
          </button>
        </p>
      </div>
    </section>
  </motion.div>
);

export default ExitIntentDialog;
