export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthObserverState {
  user: AuthUser | null;
  isAuthReady: boolean;
  authError: string | null;
}

export type AuthAttemptKind = 'login' | 'signup' | 'google';

export type AuthObserverSubscriptionRef = {
  current: (() => void) | null;
};

/**
 * Dispose the subscription currently owned by the provider. Clearing the ref
 * before invoking the cleanup makes this safe for both replacement and
 * unmount, even when a recovery attempt has installed a newer subscription.
 */
export const disposeCurrentAuthObserverSubscription = (
  subscriptionRef: AuthObserverSubscriptionRef,
): void => {
  const cleanup = subscriptionRef.current;
  subscriptionRef.current = null;
  cleanup?.();
};

export const INITIAL_AUTH_OBSERVER_STATE: AuthObserverState = {
  user: null,
  isAuthReady: false,
  authError: null,
};

const getObserverErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return 'Authentication state could not be verified.';
};

export const applyAuthObserverUser = (
  _state: AuthObserverState,
  user: AuthUser | null,
): AuthObserverState => ({
  user,
  isAuthReady: true,
  authError: null,
});

export const applyAuthObserverError = (
  _state: AuthObserverState,
  error: unknown,
): AuthObserverState => ({
  // An observer error is a loss of proof of identity. Never retain a private
  // session while Firebase can no longer vouch for it.
  user: null,
  isAuthReady: true,
  authError: getObserverErrorMessage(error),
});

export interface AuthObserverFlow {
  getState: () => AuthObserverState;
  observerUser: (user: AuthUser | null) => AuthObserverState;
  observerError: (error: unknown) => AuthObserverState;
  beginAttempt: (kind: AuthAttemptKind) => AuthObserverState;
}

/**
 * Keeps the React provider and its tests on one recovery contract. A UI auth
 * attempt is allowed to clear a failed observer only before its Firebase
 * observer can publish the successful identity again.
 */
export const createAuthObserverFlow = (
  initialState: AuthObserverState = INITIAL_AUTH_OBSERVER_STATE,
): AuthObserverFlow => {
  let state = initialState;

  return {
    getState: () => state,
    observerUser: (user) => {
      state = applyAuthObserverUser(state, user);
      return state;
    },
    observerError: (error) => {
      state = applyAuthObserverError(state, error);
      return state;
    },
    beginAttempt: (_kind) => {
      state = {
        user: null,
        isAuthReady: false,
        authError: null,
      };
      return state;
    },
  };
};
