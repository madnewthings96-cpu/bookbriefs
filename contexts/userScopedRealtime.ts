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
  private mounted = true;
  private readonly activeSubscriptions = new Set<Cleanup>();

  constructor(emptyState: () => T) {
    this.emptyState = emptyState;
    this.state = emptyState();
  }

  observe(userId: string | null) {
    // React development StrictMode may replay an effect cleanup/setup pair;
    // allow the next render to re-arm this store while keeping all old tokens
    // invalid because destroy() advanced the version.
    if (!this.mounted) {
      this.mounted = true;
      this.currentUserId = null;
      this.state = this.emptyState();
    }
    if (userId === this.currentUserId) return false;

    this.currentUserId = userId;
    this.version += 1;
    this.stopSubscriptions();
    this.state = this.emptyState();
    return true;
  }

  /**
   * Re-arm a persistent store at the beginning of an effect setup.
   *
   * React StrictMode can run an effect's cleanup and setup again without a
   * render in between. Providers therefore call this explicitly before they
   * capture a subscription or mutation token. The identity/version gate still
   * invalidates every token from the destroyed setup.
   */
  activate(userId: string | null) {
    if (!this.mounted) {
      this.mounted = true;
      this.currentUserId = null;
      this.state = this.emptyState();
    }
    return this.observe(userId);
  }

  capture(userId: string | null): UserIdentityToken | null {
    if (!this.mounted || !userId || userId !== this.currentUserId) return null;
    return { userId, version: this.version };
  }

  isCurrent(token: UserIdentityToken | null): token is UserIdentityToken {
    return Boolean(
      token &&
      this.mounted &&
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

  /** Invalidate retained async mutations when the owning page unmounts. */
  destroy() {
    if (!this.mounted) return;
    this.mounted = false;
    this.version += 1;
    this.stopSubscriptions();
    this.state = this.emptyState();
    this.currentUserId = null;
  }
}
