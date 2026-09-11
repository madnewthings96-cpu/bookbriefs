export class SummaryVisitTracker {
  private identity: string | null | undefined;
  private recordedVisitKey: string | null = null;

  observe(identity: string | null) {
    if (identity === this.identity) return;
    this.identity = identity;
    this.recordedVisitKey = null;
  }

  shouldRecord(identity: string | null, bookId: string | undefined, isUserDataReady: boolean) {
    if (!isUserDataReady || !identity || !bookId) return false;
    if (this.identity !== identity) return false;

    const visitKey = `${identity}:${bookId}`;
    if (this.recordedVisitKey === visitKey) return false;
    this.recordedVisitKey = visitKey;
    return true;
  }
}
