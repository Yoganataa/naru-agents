// src/plugin/runtime-state.ts
/**
 * Stores ephemeral control-plane state for the current OpenCode process.
 *
 * Authorization is intentionally session-scoped and memory-only. Workspace files are
 * treated as evidence, never as proof of user approval.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Gate1Approval {
  fingerprint: string;
  approvedAt: number;
}

interface PendingGate1Approval {
  fingerprint: string;
  callID: string;
}

const gate1Approvals = new Map<string, Gate1Approval>();
const pendingGate1Approvals = new Map<string, PendingGate1Approval>();
const sessionAgents = new Map<string, string>();

const GATE1_PLAN_FILES = [
  ".opencode/artifacts/prd.md",
  ".opencode/artifacts/goal-baseline.md",
  ".opencode/knowledge/architecture-blueprint.md",
] as const;

/**
 * Computes a content fingerprint for the complete Gate 1 planning package.
 * Missing files invalidate the fingerprint instead of producing partial approval.
 */
export function computeGate1Fingerprint(projectRoot: string): string | null {
  try {
    const hash = createHash("sha256");
    for (const relativePath of GATE1_PLAN_FILES) {
      hash.update(relativePath);
      hash.update("\0");
      hash.update(readFileSync(join(projectRoot, relativePath)));
      hash.update("\0");
    }
    return hash.digest("hex");
  } catch {
    return null;
  }
}

/**
 * Records the agent associated with a session from OpenCode message events.
 */
export function setSessionAgent(sessionID: string, agent: unknown): void {
  if (typeof agent !== "string" || !agent.trim()) return;
  sessionAgents.set(sessionID, agent.trim().toLowerCase());
}

/**
 * Returns the last observed agent for a session.
 */
export function getSessionAgent(sessionID: string): string | undefined {
  return sessionAgents.get(sessionID);
}

/**
 * Starts a Gate 1 approval challenge for a specific question tool call.
 */
export function beginGate1Approval(sessionID: string, callID: string, projectRoot: string): boolean {
  const fingerprint = computeGate1Fingerprint(projectRoot);
  if (!fingerprint) return false;

  pendingGate1Approvals.set(sessionID, { fingerprint, callID });
  return true;
}

/**
 * Finalizes Gate 1 only when the exact affirmative option was returned by the native question tool.
 */
export function finalizeGate1Approval(
  sessionID: string,
  callID: string,
  projectRoot: string,
  output: unknown,
): boolean {
  const pending = pendingGate1Approvals.get(sessionID);
  if (!pending || pending.callID !== callID) return false;

  pendingGate1Approvals.delete(sessionID);

  const metadata = output && typeof output === "object"
    ? (output as Record<string, unknown>).metadata
    : undefined;
  const answers = metadata && typeof metadata === "object"
    ? (metadata as Record<string, unknown>).answers
    : undefined;

  const approved = Array.isArray(answers) && answers.some(
    (answer) => Array.isArray(answer) && answer.includes("APPROVE_GATE_1"),
  );
  if (!approved) return false;

  const currentFingerprint = computeGate1Fingerprint(projectRoot);
  if (!currentFingerprint || currentFingerprint !== pending.fingerprint) return false;

  gate1Approvals.set(sessionID, {
    fingerprint: currentFingerprint,
    approvedAt: Date.now(),
  });
  return true;
}

/**
 * Checks that the current planning package is byte-for-byte identical to the approved package.
 */
export function isGate1Approved(sessionID: string, projectRoot: string): boolean {
  const approval = gate1Approvals.get(sessionID);
  if (!approval) return false;

  const currentFingerprint = computeGate1Fingerprint(projectRoot);
  return currentFingerprint !== null && currentFingerprint === approval.fingerprint;
}

/**
 * Invalidates all approval state for a session.
 */
export function clearSessionRuntimeState(sessionID: string): void {
  gate1Approvals.delete(sessionID);
  pendingGate1Approvals.delete(sessionID);
  sessionAgents.delete(sessionID);
}
