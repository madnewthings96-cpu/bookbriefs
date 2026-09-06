import React, { FormEvent, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react';

export type AuthGatewayMode = 'login' | 'signup';

export interface AuthGatewayProps {
  mode: AuthGatewayMode;
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  onNameChange?: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleAuth: () => void;
  onSwitchMode: () => void;
  onGoHome: () => void;
}

const trailSteps = [
  {
    title: 'Save',
    description: 'Keep the ideas worth returning to.',
    icon: BookOpenCheck,
  },
  {
    title: 'Understand',
    description: 'Turn dense books into clear mental models.',
    icon: Lightbulb,
  },
  {
    title: 'Apply',
    description: 'Carry one useful idea into your day.',
    icon: CheckCircle2,
  },
];

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[19px] w-[19px] shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.04H12v3.86h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.34Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.75-5.59-4.11H3.08v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.31-1.91V7.51H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.49l3.33-2.58Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.92 5.51l3.33 2.58C7.2 7.73 9.4 5.98 12 5.98Z" />
    </svg>
  );
}

interface AuthInputProps {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

function AuthInput({
  id,
  label,
  type,
  autoComplete,
  value,
  placeholder,
  icon: Icon,
  onChange,
  disabled = false,
  suffix,
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[13px] font-semibold tracking-[-0.01em] text-[#20362e]">
        {label}
      </label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6e7d75] transition-colors duration-200 group-focus-within:text-[#304529]" />
        <input
          id={id}
          autoComplete={autoComplete}
          type={type}
          value={value}
          placeholder={placeholder}
          required
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full rounded-2xl border border-[#d9d8cd] bg-[#fffef9] py-3 pl-11 pr-12 text-[15px] text-[#102e24] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[#9aa39e] hover:border-[#aeb9b2] focus:border-[#4a6741] focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,103,65,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        {suffix}
      </div>
    </div>
  );
}

export function AuthGateway({
  mode,
  name = '',
  email,
  password,
  confirmPassword = '',
  error = '',
  success = '',
  isLoading = false,
  isGoogleLoading = false,
  onNameChange = () => undefined,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange = () => undefined,
  onSubmit,
  onGoogleAuth,
  onSwitchMode,
  onGoHome,
}: AuthGatewayProps) {
  const isSignup = mode === 'signup';
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const busy = isLoading || isGoogleLoading;
  const locked = busy || Boolean(success);

  const copy = isSignup
    ? {
        eyebrow: 'A clearer way to read',
        title: 'Build your personal reading library.',
        body: 'Save the books that move you, keep their best ideas close, and turn reading into action.',
        google: 'Continue with Google',
        submit: 'Create my library',
        alternateLead: 'Already have a library?',
        alternateAction: 'Sign in',
      }
    : {
        eyebrow: 'Your saved shelf is waiting',
        title: 'Welcome back to your reading trail.',
        body: 'Pick up where you left off and keep the most useful ideas from every book within reach.',
        google: 'Continue with Google',
        submit: 'Continue to my library',
        alternateLead: 'New to Ta7leel?',
        alternateAction: 'Create your library',
      };

  const passwordToggle = (
    visible: boolean,
    onToggle: () => void,
    label: string,
  ) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={locked}
      className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#65736c] transition-colors hover:bg-[#eef1e9] hover:text-[#193c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6741] focus-visible:ring-offset-1"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
    >
      {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
    </button>
  );

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#ece9df] px-0 text-[#102e24] sm:px-5 sm:py-5 lg:flex lg:items-center lg:px-8 lg:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_8%_8%,rgba(199,150,62,0.19),transparent_28%),radial-gradient(circle_at_92%_88%,rgba(48,69,41,0.19),transparent_32%)]" />

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid min-h-[100dvh] w-full max-w-[1260px] overflow-hidden bg-[#fffdf7] sm:min-h-[calc(100dvh-40px)] sm:rounded-[30px] sm:border sm:border-white/70 sm:shadow-[0_30px_90px_-38px_rgba(16,46,36,0.42)] lg:min-h-[720px] lg:grid-cols-[0.92fr_1.08fr] xl:min-h-[760px]"
      >
        <aside className="relative h-[210px] overflow-hidden bg-[#304529] sm:h-[250px] lg:h-auto lg:min-h-[720px]">
          <img
            src="/images/join login new.webp"
            alt="Two readers exchanging an idea"
            className="absolute inset-0 h-full w-full object-cover object-[center_53%] sm:object-[center_50%] lg:object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,46,36,0.12)_0%,rgba(16,46,36,0.06)_32%,rgba(16,46,36,0.92)_100%)] lg:bg-[linear-gradient(180deg,rgba(16,46,36,0.08)_0%,rgba(16,46,36,0.14)_42%,rgba(16,46,36,0.94)_100%)]" />
          <div className="absolute inset-0 mix-blend-color bg-[#304529]/25" />

          <button
            type="button"
            onClick={onGoHome}
            className="absolute left-5 top-5 z-10 flex h-11 items-center gap-2 rounded-full border border-white/35 bg-[#fffdf7]/90 px-3.5 text-xs font-bold text-[#193c2f] shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#304529] sm:left-7 sm:top-7 lg:left-9 lg:top-9"
            aria-label="Back to Ta7leel home"
          >
            <ArrowLeft className="h-4 w-4" />
            <img src="/images/ta7leel-navbar-logo-mind-leaf.png" alt="Ta7leel" className="h-[25px] w-auto" />
          </button>

          <div className="absolute inset-x-5 bottom-5 z-10 rounded-[22px] border border-white/15 bg-[#102e24]/[0.78] p-4 text-white shadow-2xl backdrop-blur-xl sm:inset-x-7 sm:bottom-7 lg:inset-x-9 lg:bottom-9 lg:p-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ead19d] lg:text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              Make every book useful
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 lg:mt-6 lg:block lg:space-y-0">
              {trailSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + index * 0.12, duration: 0.42 }}
                    className="relative lg:flex lg:min-h-[74px] lg:gap-4"
                  >
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#ead19d]/55 bg-[#213f34] text-[#f3d28f] lg:h-9 lg:w-9 lg:shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < trailSteps.length - 1 && (
                      <motion.span
                        aria-hidden="true"
                        initial={reduceMotion ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.48 + index * 0.12, duration: 0.45 }}
                        className="absolute left-[17px] top-9 hidden h-9 w-px origin-top bg-gradient-to-b from-[#d6ad5c] to-white/15 lg:block"
                      />
                    )}
                    <div className="mt-2 lg:mt-0">
                      <p className="text-[12px] font-bold text-white lg:text-sm">{step.title}</p>
                      <p className="mt-1 hidden max-w-[260px] text-xs leading-5 text-white/66 lg:block">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-0 items-center justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-12 xl:px-20">
          <div className="w-full max-w-[470px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5 }}
            >
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.19em] text-[#8a6428]">
                <span className="h-px w-6 bg-[#c7963e]" />
                {copy.eyebrow}
              </p>
              <h1 className="mt-4 max-w-[460px] font-serif text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] text-[#102e24] sm:text-[43px] lg:text-[46px]">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-[445px] text-[14px] leading-6 text-[#607068] sm:text-[15px]">
                {copy.body}
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.52 }}
              className="mt-7 sm:mt-8"
            >
              <button
                type="button"
                onClick={onGoogleAuth}
                disabled={locked}
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-[#d7d8cf] bg-white text-sm font-bold text-[#243a32] shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#aeb9b2] hover:bg-[#fffef9] hover:shadow-[0_9px_22px_-15px_rgba(16,46,36,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6741] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {isGoogleLoading ? (
                  <span aria-hidden="true" className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#9ba69f] border-t-[#304529] motion-reduce:animate-none" />
                ) : (
                  <GoogleMark />
                )}
                {isGoogleLoading ? 'Connecting to Google…' : copy.google}
              </button>

              <div className="my-5 flex items-center gap-4" aria-hidden="true">
                <span className="h-px flex-1 bg-[#e3e1d8]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#8a938e]">or use email</span>
                <span className="h-px flex-1 bg-[#e3e1d8]" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4" aria-busy={locked} noValidate={false}>
                {isSignup && (
                  <AuthInput
                    id="auth-name"
                    label="Full name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    placeholder="Your name"
                    icon={UserRound}
                    onChange={onNameChange}
                    disabled={locked}
                  />
                )}

                <AuthInput
                  id="auth-email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  value={email}
                  placeholder="you@example.com"
                  icon={Mail}
                  onChange={onEmailChange}
                  disabled={locked}
                />

                <AuthInput
                  id="auth-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
                  icon={LockKeyhole}
                  onChange={onPasswordChange}
                  disabled={locked}
                  suffix={passwordToggle(showPassword, () => setShowPassword((visible) => !visible), 'password')}
                />

                {isSignup && (
                  <AuthInput
                    id="auth-confirm-password"
                    label="Confirm password"
                    type={showConfirmation ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    placeholder="Repeat your password"
                    icon={LockKeyhole}
                    onChange={onConfirmPasswordChange}
                    disabled={locked}
                    suffix={passwordToggle(showConfirmation, () => setShowConfirmation((visible) => !visible), 'password confirmation')}
                  />
                )}

                <div className="min-h-[24px] pt-0.5">
                  {error && (
                    <p id="auth-feedback" role="alert" aria-live="polite" className="flex items-start gap-2 text-[12px] font-semibold leading-5 text-[#a23f35]">
                      <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c95a4d]" />
                      {error}
                    </p>
                  )}
                  {!error && success && (
                    <p id="auth-feedback" role="status" aria-live="polite" className="flex items-center gap-2 text-[12px] font-semibold leading-5 text-[#2d684f]">
                      <Check className="h-4 w-4" />
                      {success}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={locked}
                  className="group relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#304529_0%,#183b2e_100%)] px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_-16px_rgba(16,46,36,0.9),inset_0_1px_0_rgba(255,255,255,0.16)] transition-[box-shadow,transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_34px_-17px_rgba(16,46,36,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6741] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-24 -translate-x-full skew-x-[-22deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[520px] motion-reduce:hidden" />
                  <span className="relative flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/45 border-t-white motion-reduce:animate-none" />
                        {isSignup ? 'Creating your library…' : 'Opening your library…'}
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-[18px] w-[18px]" />
                        Ready
                      </>
                    ) : (
                      <>
                        {copy.submit}
                        <ArrowRight className="h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-[#6d7872]">
                {copy.alternateLead}{' '}
                <button
                  type="button"
                  onClick={onSwitchMode}
                  disabled={locked}
                  className="font-extrabold text-[#2f5b48] underline decoration-[#c7963e]/55 decoration-2 underline-offset-4 transition-colors hover:text-[#102e24] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6741] focus-visible:ring-offset-2"
                >
                  {copy.alternateAction}
                </button>
              </p>

              <p className="mt-5 text-center text-[10px] leading-5 text-[#8a938e]">
                By continuing, you agree to Ta7leel’s{' '}
                <a href="/terms-of-use" className="underline underline-offset-2 hover:text-[#304529]">Terms</a>
                {' '}and{' '}
                <a href="/privacy-policy" className="underline underline-offset-2 hover:text-[#304529]">Privacy Policy</a>.
              </p>
            </motion.div>
          </div>
        </section>
      </motion.section>
    </div>
  );
}

export default AuthGateway;
