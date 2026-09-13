export interface AsyncIdentityToken {
  identity: string | null;
  generation: number;
}

/**
 * Guards asynchronous UI work that can outlive a modal, scanner, or page.
 * A new identity or operation invalidates every token captured before it.
 */
export class AsyncIdentityGuard {
  private identity: string | null = null;
  private generation = 0;
  private mounted = true;

  setIdentity(identity: string | null) {
    if (identity === this.identity) return;
    this.identity = identity;
    this.generation += 1;
  }

  mount() {
    if (this.mounted) return;
    this.mounted = true;
    this.generation += 1;
  }

  begin(identity = this.identity): AsyncIdentityToken | null {
    if (!this.mounted || identity !== this.identity) return null;
    this.generation += 1;
    return { identity, generation: this.generation };
  }

  capture(identity = this.identity): AsyncIdentityToken | null {
    if (!this.mounted || identity !== this.identity) return null;
    return { identity, generation: this.generation };
  }

  invalidate() {
    this.generation += 1;
  }

  unmount() {
    this.mounted = false;
    this.generation += 1;
  }

  isCurrent(token: AsyncIdentityToken | null): token is AsyncIdentityToken {
    return Boolean(
      this.mounted &&
      token &&
      token.identity === this.identity &&
      token.generation === this.generation,
    );
  }
}
