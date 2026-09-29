export interface FavoriteMutationToken {
  bookId: string;
  sequence: number;
}

interface PendingFavoriteMutation {
  token: FavoriteMutationToken;
  desired: boolean;
}

const normalize = (bookIds: string[]) => Array.from(new Set(
  bookIds.filter((bookId): bookId is string => typeof bookId === 'string' && bookId.length > 0),
));

const apply = (bookIds: string[], bookId: string, desired: boolean) => {
  const next = new Set(bookIds);
  if (desired) next.add(bookId);
  else next.delete(bookId);
  return Array.from(next);
};

/**
 * Reconciles the remote favorites snapshot with per-book optimistic writes.
 * A failed operation only removes its own pending intent; newer operations and
 * listener snapshots are rebased instead of being rolled back wholesale.
 */
export class OptimisticFavoritesState {
  private remote: string[] = [];
  private sequence = 0;
  private readonly pending = new Map<string, PendingFavoriteMutation>();

  reset() {
    this.remote = [];
    this.sequence = 0;
    this.pending.clear();
  }

  setRemote(bookIds: string[]) {
    this.remote = normalize(bookIds);
    return this.get();
  }

  begin(bookId: string, desired: boolean) {
    const token: FavoriteMutationToken = { bookId, sequence: ++this.sequence };
    this.pending.set(bookId, { token, desired });
    return { token, state: this.get() };
  }

  resolve(token: FavoriteMutationToken, succeeded: boolean) {
    const pending = this.pending.get(token.bookId);
    if (!pending || pending.token.sequence !== token.sequence) return this.get();
    this.pending.delete(token.bookId);
    if (succeeded) this.remote = apply(this.remote, token.bookId, pending.desired);
    return this.get();
  }

  get() {
    let next = this.remote;
    const mutations = Array.from(this.pending.values()).sort((a, b) => a.token.sequence - b.token.sequence);
    mutations.forEach(({ token, desired }) => {
      next = apply(next, token.bookId, desired);
    });
    return next;
  }
}
