// src/plugin/guards/gate-guard.ts
/**
 * Enforces N.A.R.U. execution gates at the OpenCode V1 tool boundary.
 *
 * Gate 1 authorization is runtime state derived from an explicit native question response.
 * Workspace marker files are never treated as proof of approval.
 */

import { isAbsolute, relative, resolve, sep } from "node:path";
import type { ToolExecuteInput, GateVerificationResult } from "../types.js";
import { isGate1Approved } from "../runtime-state.js";
import { APPLICATION_MUTATION_TOOLS, SHELL_TOOLS } from "../policy.js";

const READ_ONLY_SHELL = [
  /^(?:pwd|cd)(?:\s+[^;&|]+)?$/i,
  /^(?:ls|dir)(?:\s+[^;&|]+)?$/i,
  /^git\s+(?:status|log|diff|show|branch|rev-parse)\b[^;&|]*$/i,
  /^(?:rg|grep|find)\b[^;&|]*$/i,
  /^(?:cat|type|head|tail)\b[^;&|]*$/i,
];

/** Extracts a file path from OpenCode V1 write/edit arguments. */
function getTargetPath(args: Record<string, any>): string {
  return String(
    args.filePath ??
    args.path ??
    args.target_file ??
    args.targetFile ??
    args.TargetFile ??
    args.file ??
    args.filepath ??
    "",
  );
}

/** Returns true when a target resolves inside the active workspace. */
function isInsideProject(projectRoot: string, rawPath: string): boolean {
  if (!rawPath) return false;
  const root = resolve(projectRoot);
  const target = resolve(root, rawPath);
  const rel = relative(root, target);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

/** Returns true for N.A.R.U. control-plane files permitted before Gate 1. */
function isPlanningArtifact(projectRoot: string, rawPath: string): boolean {
  if (!isInsideProject(projectRoot, rawPath)) return false;
  const root = resolve(projectRoot);
  const rel = relative(root, resolve(root, rawPath)).replace(/\\/g, "/");

  return rel.startsWith(".opencode/artifacts/") || rel.startsWith(".opencode/knowledge/") || rel.startsWith("docs/");
}

/** Returns true only for shell commands that perform deterministic read-only inspection. */
function isReadOnlyShell(command: string): boolean {
  const normalized = command.trim();
  if (!normalized || /(?:>|>>|<|\||&&|;|\$\(|`)/.test(normalized)) return false;
  return READ_ONLY_SHELL.some((pattern) => pattern.test(normalized));
}

/** Validates whether a tool call is authorized in the current workflow state. */
export function verifyQualityGates(input: ToolExecuteInput, projectRoot: string): GateVerificationResult {
  const toolName = String(input.tool || "").toLowerCase();
  const args = (input.args || input) as Record<string, any>;
  const sessionID = String(input.sessionID || "");
  const gate1Approved = sessionID ? isGate1Approved(sessionID, projectRoot) : false;

  if (APPLICATION_MUTATION_TOOLS.has(toolName)) {
    const rawPath = getTargetPath(args);

    // Patch tools may encode multiple paths; Gate 1 therefore controls them as a whole.
    if (["apply_patch", "patch", "multi_edit"].includes(toolName)) {
      return gate1Approved
        ? { allowed: true, gate: 4 }
        : {
            allowed: false,
            gate: 1,
            reason: "GATE_1_VIOLATION: Patch-based application mutation requires native user-approved Gate 1 runtime authorization.",
          };
    }

    if (!rawPath || !isInsideProject(projectRoot, rawPath)) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Mutation target is missing or outside the active project root. N.A.R.U. fails closed on ambiguous paths.",
      };
    }

    if (isPlanningArtifact(projectRoot, rawPath)) {
      const rel = relative(resolve(projectRoot), resolve(projectRoot, rawPath)).replace(/\\/g, "/");
      if (rel === ".opencode/artifacts/gate-status.md") {
        return {
          allowed: false,
          gate: 1,
          reason: "GATE_1_VIOLATION: gate-status.md is diagnostic state and cannot be authored as proof of user approval.",
        };
      }
      return { allowed: true, gate: 0 };
    }

    return gate1Approved
      ? { allowed: true, gate: 4 }
      : {
          allowed: false,
          gate: 1,
          reason: "GATE_1_VIOLATION: Application code mutation is blocked until the native OpenCode question tool returns APPROVE_GATE_1 for the current planning fingerprint.",
        };
  }

  if (SHELL_TOOLS.has(toolName)) {
    const command = String(args.command ?? args.cmd ?? args.CommandLine ?? "");
    if (!gate1Approved && !isReadOnlyShell(command)) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Shell execution is restricted to read-only inspection before Gate 1. This blocks shell-based writes, installers, interpreters, redirection, and script bypasses.",
      };
    }
  }

  return { allowed: true, gate: 0 };
}

/** Returns runtime gate status for diagnostics. */
export function getGate1Diagnostic(projectRoot: string, sessionID: string): string {
  return isGate1Approved(sessionID, projectRoot) ? "APPROVED" : "BLOCKED";
}
