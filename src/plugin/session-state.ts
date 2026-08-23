// src/plugin/session-state.ts
/**
 * Maintains process-local N.A.R.U. control state derived from OpenCode runtime events.
 *
 * Gate authorization is intentionally not read from writable workspace files. A gate
 * approval exists only after the real OpenCode `question` tool returns an affirmative
 * user answer, and the approval is bound to a fingerprint of the approved planning
 * artifacts. Restarting the plugin therefore requires a fresh user approval.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface SessionControlState {
  agent?: string;
  pendingGate1?: {
    fingerprint: string;
    requestedAt: number;
  };
  gate1Approval?: {
    fingerprint: string;
    approvedAt: number;
  };
}

const sessions = new Map<string, SessionControlState>();

const GATE1_PLAN_FILES = [
  ".opencode/artifacts/prd.md",
  ".opencode/artifacts/goal-baseline.md",
  ".opencode/knowledge/architecture-blueprint.md",
] as const;

const GATE1_APPROVAL_HEADER = "NARU Gate 1 Approval";
const GATE1_APPROVAL_LABEL = "APPROVE_GATE_1";

/**
 * Returns or creates mutable runtime state for a session.
 */
function getSessionState(sessionID: string): SessionControlState {
  const current = sessions.get(sessionID);
  if (current) return current;

  const next: SessionControlState = {};
  sessions.set(sessionID, next);
  return next;
}

/**
 * Records the currently executing assistant agent for a session.
 */
export function updateSessionAgent(sessionID: string | undefined, agent: unknown): void {
  if (!sessionID || typeof agent !== "string" || !agent.trim()) return;
  getSessionState(sessionID).agent = agent.trim().toLowerCase();
}

/**
 * Returns the last runtime-observed agent for the session.
 */
export function getSessionAgent(sessionID: string | undefined): string | undefined {
  if (!sessionID) return undefined;
  return sessions.get(sessionID)?.agent;
}

/**
 * Removes all in-memory control state for a session.
 */
export function clearSessionState(sessionID: string | undefined): void {
  if (!sessionID) return;
  sessions.delete(sessionID);
}

/**
 * Computes a stable fingerprint over the planning artifacts that Gate 1 protects.
 * Missing artifacts produce `null`, which prevents approval of an incomplete plan.
 */
export function computeGate1Fingerprint(projectRoot: string): string | null {
  try {
    const hash = createHash("sha256");

    for (const relativePath of GATE1_PLAN_FILES) {
      const absolutePath = join(projectRoot, relativePath);
      const content = readFileSync(absolutePath);
      hash.update(relativePath);
      hash.update("\0");
      hash.update(content);
      hash.update("\0");
    }

    return hash.digest("hex");
  } catch {
    return null;
  }
}

/**
 * Determines whether a question tool call is the canonical N.A.R.U. Gate 1 approval prompt.
 */
export function isGate1ApprovalQuestion(args: Record<string, unknown>): boolean {
  const questions = Array.isArray(args.questions) ? args.questions : [];

  return questions.some((question) => {
    if (!question || typeof question !== "object") return false;
    const candidate = question as Record<string, unknown>;
    const header = String(candidate.header ?? "");
    const options = Array.isArray(candidate.options) ? candidate.options : [];

    return (
      header === GATE1_APPROVAL_HEADER &&
      options.some((option) => {
        if (!option || typeof option !== "object") return false;
        return String((option as Record<string, unknown>).label ?? "") === GATE1_APPROVAL_LABEL;
      })
    );
  });
}

/**
 * Creates a pending Gate 1 approval challenge for the current plan fingerprint.
 */
export function beginGate1Approval(sessionID: string | undefined, projectRoot: string): boolean {
  if (!sessionID) return false;
  const fingerprint = computeGate1Fingerprint(projectRoot);
  if (!fingerprint) return false;

  getSessionState(sessionID).pendingGate1 = {
    fingerprint,
    requestedAt: Date.now(),
  };

  return true;
}

/**
 * Finalizes Gate 1 only when the pending challenge is answered with the exact affirmative label.
 */
export function finalizeGate1Approval(
  sessionID: string | undefined,
  projectRoot: string,
  output: unknown,
): boolean {
  if (!sessionID) return false;

  const state = sessions.get(sessionID);
  const pending = state?.pendingGate1;
  if (!pending) return false;

  const metadata = output && typeof output === "object"
    ? (output as Record<string, unknown>).metadata
    : undefined;
  const metadataRecord = metadata && typeof metadata === "object"
    ? (metadata as Record<string, unknown>)
    : undefined;
  const answers = metadataRecord?.answers;

  const approved = Array.isArray(answers) && answers.some((answer) => {
    return Array.isArray(answer) && answer.some((item) => item === GATE1_APPROVAL_LABEL);
  });

  if (!approved) {
    delete state?.pendingGate1;
    return false;
  }

  const currentFingerprint = computeGate1Fingerprint(projectRoot);
  if (!currentFingerprint || currentFingerprint !== pending.fingerprint) {
    delete state?.pendingGate1;
    return false;
  }

  state.gate1Approval = {
    fingerprint: currentFingerprint,
    approvedAt: Date.now(),
  };
  delete state.pendingGate1;

  persistGate1Status(projectRoot, state.gate1Approval);
  return true;
}

/**
 * Verifies that Gate 1 is still valid for the current planning artifacts.
 */
export function isGate1Approved(sessionID: string | undefined, projectRoot: string): boolean {
  if (!sessionID) return false;

  const approval = sessions.get(sessionID)?.gate1Approval;
  if (!approval) return false;

  const currentFingerprint = computeGate1Fingerprint(projectRoot);
  return currentFingerprint !== null && currentFingerprint === approval.fingerprint;
}

/**
 * Writes an informational status artifact after the runtime approval has already been accepted.
 * This file is intentionally diagnostic only; no authorization decision reads it.
 */
function persistGate1Status(
  projectRoot: string,
  approval: NonNullable<SessionControlState["gate1Approval"]>,
): void {
  try {
    const artifactsDir = join(projectRoot, ".opencode", "artifacts");
    mkdirSync(artifactsDir, { recursive: true });
    const statusPath = join(artifactsDir, "gate-status.md");

    writeFileSync(
      statusPath,
      [
        "# N.A.R.U. Runtime Gate Status",
        "",
        "GATE_1_STATUS: APPROVED",
        `APPROVED_AT: ${new Date(approval.approvedAt).toISOString()}`,
        `PLAN_FINGERPRINT_SHA256: ${approval.fingerprint}`,
        "AUTHORITY: USER_RESPONSE_FROM_NATIVE_QUESTION_TOOL",
        "NOTE: This file is diagnostic only and is never used as an authorization source.",
        "",
      ].join("\n"),
      "utf8",
    );
  } catch {
    // Authorization remains in memory even if the diagnostic status file cannot be written.
  }
}

export { GATE1_APPROVAL_HEADER, GATE1_APPROVAL_LABEL };
