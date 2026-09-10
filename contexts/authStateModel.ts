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
