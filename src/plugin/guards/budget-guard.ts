// ─── budget-guard.ts ── Retry Budget & Loop Termination Guard ────────────────
export class BudgetGuard {
  private globalBudget: number;
  private gateRetries: Map<number, number>;

  constructor(maxGlobal: number = 8, maxPerGate: number = 3) {
    this.globalBudget = maxGlobal;
    this.gateRetries = new Map();
  }

  public recordGateFailure(gate: number): { exhausted: boolean; remainingGlobal: number; gateRetries: number } {
    this.globalBudget = Math.max(0, this.globalBudget - 1);
    const current = (this.gateRetries.get(gate) || 0) + 1;
    this.gateRetries.set(gate, current);

    const exhausted = this.globalBudget <= 0 || current >= 3;
    return {
      exhausted,
      remainingGlobal: this.globalBudget,
      gateRetries: current
    };
  }

  public reset(): void {
    this.globalBudget = 8;
    this.gateRetries.clear();
  }
}
