// src/plugin/index.ts
/**
 * N.A.R.U. OpenCode plugin entrypoint.
 *
 * The plugin is a deterministic enforcement layer. LLM instructions are advisory;
 * authorization decisions are made here at the OpenCode tool boundary.
 */

import type { PluginContext, ToolExecuteInput, ToolExecuteOutput, SystemEvent } from "./types.js";
import { verifyQualityGates } from "./guards/gate-guard.js";
import { scanSecurityViolations } from "./guards/security-guard.js";
import { globalCircuitBreaker } from "./guards/circuit-breaker.js";
import { verifyRolePermissions } from "./guards/role-guard.js";
import { handleSessionLifecycle } from "./events/session-lifecycle.js";
import {
  beginGate1Approval,
  clearSessionRuntimeState,
  finalizeGate1Approval,
  getSessionAgent,
  setSessionAgent,
} from "./runtime-state.js";

/**
 * Returns true when a question request is the canonical N.A.R.U. Gate 1 approval prompt.
 */
function isGate1ApprovalQuestion(args: Record<string, any>): boolean {
  if (!Array.isArray(args.questions)) return false;

  return args.questions.some((question: any) => {
    if (!question || typeof question !== "object") return false;
    if (question.header !== "NARU Gate 1 Approval") return false;
    if (!Array.isArray(question.options)) return false;
    return question.options.some((option: any) => option?.label === "APPROVE_GATE_1");
  });
}

/**
 * Creates the N.A.R.U. plugin hook set for the active OpenCode project.
 */
export const NaruPlugin = async (context: PluginContext = {}) => {
  const projectRoot = context.project?.root || context.directory || process.cwd();

  return {
    name: "naru-guardrails",
    version: "0.0.3",
    description: "N.A.R.U. deterministic hard-constraint anti-bypass guardrails",

    "experimental.chat.system.transform": async (
      input: { sessionID?: string },
      output: { system: string[] },
    ) => {
      const agent = input.sessionID ? getSessionAgent(input.sessionID) : undefined;
      output.system.push([
        "N.A.R.U. CONTROL-PLANE CONTRACT:",
        "1. Never treat .opencode/artifacts/gate-status.md as proof of user approval; it is diagnostic only.",
        "2. Gate 1 requires these complete artifacts before asking for approval: prd.md, goal-baseline.md, architecture-blueprint.md, research-findings.md.",
        "3. The only valid Gate 1 approval question has header `NARU Gate 1 Approval` and an exact affirmative option label `APPROVE_GATE_1`.",
        "4. Do not delegate to developer or mutate application code before that native question has returned the exact APPROVE_GATE_1 answer.",
        "5. Research technical claims using credible primary sources (official documentation, release notes, standards, or peer-reviewed papers) before presenting them as facts.",
        "6. If evidence is missing or conflicting, state the knowledge gap or conflict; never manufacture citations, verification dates, test results, or tool execution claims.",
        agent ? `7. Active runtime agent: ${agent}. Obey its role boundary; never perform another role's work to bypass a gate.` : "7. Active runtime agent is not yet known; fail closed on role-sensitive assumptions.",
      ].join("\n"));
    },

    tool: {
      execute: {
        before: async (input: ToolExecuteInput, _output?: ToolExecuteOutput) => {
          if (input.sessionID) {
            const agent = getSessionAgent(input.sessionID);
            if (agent) input.agent = agent;
          }

          const callID = input.callID ?? input.callId;

          if (input.tool === "question" && isGate1ApprovalQuestion((input.args || {}) as Record<string, any>)) {
            if (!input.sessionID || !callID || !beginGate1Approval(input.sessionID, callID, projectRoot)) {
              throw new Error("⛔ [NARU HARD GUARD - GATE 1]: Cannot create a valid approval challenge because the complete planning and research package is missing.");
            }
          }

          const circuitCheck = globalCircuitBreaker.checkCircuit(input.tool, input.args || input);
          if (circuitCheck.tripped) {
            throw new Error(`⛔ [NARU HARD GUARD - CIRCUIT BREAKER]: ${circuitCheck.reason}`);
          }

          const roleCheck = verifyRolePermissions(input);
          if (!roleCheck.allowed) {
            throw new Error(`⛔ [NARU HARD GUARD - ROLE VIOLATION]: ${roleCheck.reason}`);
          }

          const gateCheck = verifyQualityGates(input, projectRoot);
          if (!gateCheck.allowed) {
            throw new Error(`⛔ [NARU HARD GUARD - GATE ${gateCheck.gate} REJECTED]: ${gateCheck.reason}`);
          }

          const securityCheck = scanSecurityViolations(input);
          if (!securityCheck.safe) {
            throw new Error(`⛔ [NARU HARD GUARD - SECURITY VIOLATION]:\n- ${securityCheck.violations.join("\n- ")}`);
          }
        },

        after: async (input: ToolExecuteInput, output?: ToolExecuteOutput) => {
          const callID = input.callID ?? input.callId;
          if (input.tool === "question" && input.sessionID && callID) {
            const approved = finalizeGate1Approval(input.sessionID, callID, projectRoot, output || {});
            if (approved) {
              console.info("[NARU] Gate 1 approved by native OpenCode question response.");
            }
          }

          if (output?.error || (output?.exitCode !== undefined && output.exitCode !== 0)) {
            globalCircuitBreaker.recordFailure(input.tool, input.args || input);
          } else {
            globalCircuitBreaker.recordSuccess(input.tool, input.args || input);
          }
        },
      },
    },

    event: async ({ event }: { event: SystemEvent }) => {
      const properties = event.properties || event.data || {};

      if (event.type === "message.updated") {
        const info = properties.info;
        if (info?.role === "assistant" && info?.sessionID && info?.agent) {
          setSessionAgent(info.sessionID, info.agent);
        }
      }

      if (event.type === "session.deleted" && properties.sessionID) {
        clearSessionRuntimeState(properties.sessionID);
      }

      handleSessionLifecycle(event, context);
    },
  };
};

export { verifyQualityGates } from "./guards/gate-guard.js";
export { scanSecurityViolations } from "./guards/security-guard.js";
export { CircuitBreakerGuard, globalCircuitBreaker } from "./guards/circuit-breaker.js";
export { verifyRolePermissions } from "./guards/role-guard.js";
export { handleSessionLifecycle } from "./events/session-lifecycle.js";
export { BudgetGuard } from "./guards/budget-guard.js";

export default NaruPlugin;
