// ─── index.ts ── N.A.R.U. OpenCode TypeScript Plugin Entrypoint ───────────────
// Hard-Constraint Anti-Bypass Guardrail Engine conforming to @opencode-ai/plugin
// ──────────────────────────────────────────────────────────────────────────────

import type { PluginContext, ToolExecuteInput, ToolExecuteOutput, SystemEvent } from "./types.js";
import { verifyQualityGates } from "./guards/gate-guard.js";
import { scanSecurityViolations } from "./guards/security-guard.js";
import { globalCircuitBreaker } from "./guards/circuit-breaker.js";
import { verifyRolePermissions } from "./guards/role-guard.js";
import { handleSessionLifecycle } from "./events/session-lifecycle.js";

export const NaruPlugin = async (context: PluginContext = {}) => {
  const projectRoot = context.project?.root || context.directory || process.cwd();

  return {
    name: "naru-guardrails",
    version: "0.0.2",
    description: "N.A.R.U. Deterministic Hard-Constraint Anti-Bypass & Multi-Agent Quality Gate Guardrails",

    // 1. Intercept Tool Execution (Hardware Firewall for LLM tool calls)
    tool: {
      execute: {
        before: async (input: ToolExecuteInput, _output?: ToolExecuteOutput) => {
          // A. Enforce Circuit Breaker (Anti-Loop 2x failure protection)
          const circuitCheck = globalCircuitBreaker.checkCircuit(input.tool, input.args || input);
          if (circuitCheck.tripped) {
            throw new Error(`⛔ [NARU HARD GUARD - CIRCUIT BREAKER]: ${circuitCheck.reason}`);
          }

          // B. Enforce Role-Based Access Control (RBAC)
          const roleCheck = verifyRolePermissions(input);
          if (!roleCheck.allowed) {
            throw new Error(`⛔ [NARU HARD GUARD - ROLE VIOLATION]: ${roleCheck.reason}`);
          }

          // C. Enforce Quality Gates 1-4 (Zero-Trust Hard Gates)
          const gateCheck = verifyQualityGates(input, projectRoot);
          if (!gateCheck.allowed) {
            throw new Error(`⛔ [NARU HARD GUARD - GATE ${gateCheck.gate} REJECTED]: ${gateCheck.reason}`);
          }

          // D. Enforce Multi-Language No-Bypass & Security Invariants
          const securityCheck = scanSecurityViolations(input);
          if (!securityCheck.safe) {
            throw new Error(`⛔ [NARU HARD GUARD - SECURITY VIOLATION]:\n- ${securityCheck.violations.join("\n- ")}`);
          }
        },

        after: async (input: ToolExecuteInput, output?: ToolExecuteOutput) => {
          // Track tool execution success/failure for circuit breaker
          if (output?.error || (output?.exitCode !== undefined && output.exitCode !== 0)) {
            globalCircuitBreaker.recordFailure(input.tool, input.args || input);
          } else {
            globalCircuitBreaker.recordSuccess(input.tool, input.args || input);
          }
        }
      }
    },

    // 2. Intercept Lifecycle Events (Two-Tier Session Memory Sync)
    event: async ({ event }: { event: SystemEvent }) => {
      handleSessionLifecycle(event, context);
    }
  };
};

export { verifyQualityGates } from "./guards/gate-guard.js";
export { scanSecurityViolations } from "./guards/security-guard.js";
export { CircuitBreakerGuard, globalCircuitBreaker } from "./guards/circuit-breaker.js";
export { verifyRolePermissions } from "./guards/role-guard.js";
export { handleSessionLifecycle } from "./events/session-lifecycle.js";
export { BudgetGuard } from "./guards/budget-guard.js";

export default NaruPlugin;
