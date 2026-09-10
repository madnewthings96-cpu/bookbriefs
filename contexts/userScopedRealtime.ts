export interface UserIdentityToken {
  userId: string;
  version: number;
}

type Cleanup = () => void;

type StartSubscription<T> = (
  token: UserIdentityToken,
  onValue: (value: T) => void,
  onError: (error: unknown) => void,
) => Cleanup | void;

/**
 * A small identity gate for user-owned realtime data.
 *
 * Providers call observe during render so switching users or logging out
 * clears the store before any private value can be exposed. Every async
 * callback and mutation carries a token containing both UID and identity
 * version; callbacks from an older subscription are therefore ignored even
 * when an SDK delivers them after unsubscribe.
 */
export class UserScopedRealtimeStore<T> {
  private readonly emptyState: () => T;
  private state: T;
  private currentUserId: string | null = null;
  private version = 0;
  private readonly activeSubscriptions = new Set<Cleanup>();

  constructor(emptyState: () => T) {
    this.emptyState = emptyState;
    this.state = emptyState();
  }

  observe(userId: string | null) {
    if (userId === this.currentUserId) return false;

    this.currentUserId = userId;
    this.version += 1;
    this.stopSubscriptions();
    this.state = this.emptyState();
    return true;
  }

  capture(userId: string | null): UserIdentityToken | null {
    if (!userId || userId !== this.currentUserId) return null;
    return { userId, version: this.version };
  }

  isCurrent(token: UserIdentityToken | null): token is UserIdentityToken {
    return Boolean(
      token &&
      token.userId === this.currentUserId &&
      token.version === this.version,
    );
  }

  getExposedState(userId: string | null): T {
    if (userId && userId === this.currentUserId) return this.state;
    return this.emptyState();
  }

  publish(token: UserIdentityToken | null, nextState: T) {
    if (!this.isCurrent(token)) return false;
    this.state = nextState;
    return true;
  }

  update(token: UserIdentityToken | null, updater: (state: T) => T) {
    if (!this.isCurrent(token)) return false;
    const nextState = updater(this.state);
    if (!this.isCurrent(token)) return false;
    this.state = nextState;
    return true;
  }

  subscribe<U>(
    userId: string | null,
    start: StartSubscription<U>,
    onValue: (value: U, token: UserIdentityToken) => void,
    onError?: (error: unknown, token: UserIdentityToken) => void,
  ): Cleanup {
    const token = this.capture(userId);
    if (!token) return () => undefined;

    let active = true;
    let sdkCleanup: Cleanup | void;
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      active = false;
      if (typeof sdkCleanup === 'function') sdkCleanup();
      this.activeSubscriptions.delete(dispose);
    };
    this.activeSubscriptions.add(dispose);

    const guardedValue = (value: U) => {
      if (!active || !this.isCurrent(token)) return;
      onValue(value, token);
    };
    const guardedError = (error: unknown) => {
      if (!active || !this.isCurrent(token)) return;
      onError?.(error, token);
    };

    try {
      sdkCleanup = start(token, guardedValue, guardedError);
    } catch (error) {
      guardedError(error);
    }
    if (disposed && typeof sdkCleanup === 'function') sdkCleanup();
    return dispose;
  }

  stopSubscriptions() {
    Array.from(this.activeSubscriptions).forEach((dispose) => dispose());
  }
}
