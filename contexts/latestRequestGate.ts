export class LatestRequestGate {
  private generation = 0;

  begin() {
    this.generation += 1;
    return this.generation;
  }

  isCurrent(requestId: number) {
    return requestId === this.generation;
  }
}
