// ─── circuit-breaker.ts ── Anti-Loop & 2x Consecutive Failure Guard ──────────
// Grounded in arXiv:2502.04899: Eliminating cognitive deadlocks in agent loops
// ──────────────────────────────────────────────────────────────────────────────

export class CircuitBreakerGuard {
  private failureMap: Map<string, number>;
  private maxConsecutiveFailures: number;

  constructor(maxConsecutive: number = 2) {
    this.failureMap = new Map();
    this.maxConsecutiveFailures = maxConsecutive;
  }

  private computeSignature(tool: string, args: any): string {
    try {
      const sanitized = { ...args };
      delete sanitized?.callId;
      delete sanitized?.sessionID;
      return `${tool.toLowerCase()}::${JSON.stringify(sanitized)}`;
    } catch {
      return `${tool.toLowerCase()}::raw`;
    }
  }

  /**
   * Checks whether the requested tool call is currently blocked by circuit breaker
   */
  public checkCircuit(tool: string, args: any): { tripped: boolean; reason?: string } {
    const signature = this.computeSignature(tool, args);
    const failures = this.failureMap.get(signature) || 0;

    if (failures >= this.maxConsecutiveFailures) {
      return {
        tripped: true,
        reason: `CIRCUIT_BREAKER_TRIPPED: Tool '${tool}' failed ${failures} times consecutively with identical arguments. Repeating the same failed action is strictly prohibited. Step back, re-verify docs via context7/websearch, or escalate to user!`
      };
    }

    return { tripped: false };
  }

  /**
   * Records a failure for the specified tool signature
   */
  public recordFailure(tool: string, args: any): void {
    const signature = this.computeSignature(tool, args);
    const count = (this.failureMap.get(signature) || 0) + 1;
    this.failureMap.set(signature, count);
  }

  /**
   * Records a success, resetting the failure counter
   */
  public recordSuccess(tool: string, args: any): void {
    const signature = this.computeSignature(tool, args);
    this.failureMap.delete(signature);
  }

  /**
   * Reset all circuit breaker counters
   */
  public reset(): void {
    this.failureMap.clear();
  }
}

export const globalCircuitBreaker = new CircuitBreakerGuard(2);
