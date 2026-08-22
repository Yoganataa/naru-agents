// ─── index.ts ── N.A.R.U. OpenCode TypeScript Plugin Entrypoint ───────────────
// Hard-Constraint Anti-Bypass Guardrail Engine conforming to @opencode-ai/plugin
// ──────────────────────────────────────────────────────────────────────────────

import type { PluginContext, ToolExecuteInput, ToolExecuteOutput, SystemEvent } from "./types.js";
import { verifyQualityGates } from "./guards/gate-guard.js";
import { scanSecurityViolations } from "./guards/security-guard.js";
import { handleSessionLifecycle } from "./events/session-lifecycle.js";

export const NaruPlugin = async (context: PluginContext = {}) => {
  const projectRoot = context.project?.root || context.directory || process.cwd();

  return {
    name: "naru-guardrails",
    version: "0.0.2",
    description: "N.A.R.U. Deterministic Hard-Constraint Anti-Bypass & Quality Gate Guardrails",

    // 1. Intercept Tool Execution (Hardware Firewall for LLM tool calls)
    tool: {
      execute: {
        before: async (input: ToolExecuteInput, _output?: ToolExecuteOutput) => {
          // A. Enforce Quality Gates 1-4
          const gateCheck = verifyQualityGates(input, projectRoot);
          if (!gateCheck.allowed) {
            throw new Error(`⛔ [NARU HARD GUARD - GATE ${gateCheck.gate} REJECTED]: ${gateCheck.reason}`);
          }

          // B. Enforce No-Bypass & Security Standards
          const securityCheck = scanSecurityViolations(input);
          if (!securityCheck.safe) {
            throw new Error(`⛔ [NARU HARD GUARD - SECURITY VIOLATION]:\n- ${securityCheck.violations.join("\n- ")}`);
          }
        },

        after: async (_input: ToolExecuteInput, _output?: ToolExecuteOutput) => {
          // Post-execution telemetry & verification hooks
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
export { handleSessionLifecycle } from "./events/session-lifecycle.js";
export { BudgetGuard } from "./guards/budget-guard.js";

export default NaruPlugin;
