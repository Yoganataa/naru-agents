// src/plugin/guards/gate-guard.ts
/**
 * Enforces N.A.R.U. execution gates at the OpenCode tool boundary.
 *
 * This guard fails closed for unknown mutation tools and never trusts a workspace
 * file as proof of user approval. Gate 1 authorization comes from runtime-state.ts.
 */

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { ToolExecuteInput, GateVerificationResult } from "../types.js";
import { isGate1Approved } from "../runtime-state.js";

const CODE_MUTATION_TOOLS = new Set([
  "write",
  "edit",
  "apply_patch",
  "write_file",
  "edit_file",
  "replace_file_content",
  "patch_file",
  "create_file",
  "write_to_file",
  "patch",
  "multi_edit",
  "append_file",
  "insert_code",
  "save_file",
]);

const SHELL_EXECUTION_TOOLS = new Set([
  "bash",
  "powershell",
  "cmd",
  "sh",
  "terminal",
  "run_command",
  "execute_command",
]);

const READ_ONLY_SHELL = [
  /^(?:pwd|cd)(?:\s+[^;&|]+)?$/i,
  /^(?:ls|dir)(?:\s+[^;&|]+)?$/i,
  /^git\s+(?:status|log|diff|show|branch|rev-parse)\b[^;&|]*$/i,
  /^(?:rg|grep|find)\b[^;&|]*$/i,
  /^(?:cat|type|head|tail)\b[^;&|]*$/i,
];

/**
 * Extracts a file path from OpenCode's native write/edit argument names.
 */
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

/**
 * Returns true when a target resolves inside the workspace.
 */
function isInsideProject(projectRoot: string, rawPath: string): boolean {
  if (!rawPath) return false;
  const root = resolve(projectRoot);
  const target = resolve(root, rawPath);
  const rel = relative(root, target);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

/**
 * Returns true for planning/control-plane documents that N.A.R.U. may author before Gate 1.
 */
function isPlanningArtifact(projectRoot: string, rawPath: string): boolean {
  if (!isInsideProject(projectRoot, rawPath)) return false;
  const root = resolve(projectRoot);
  const target = resolve(root, rawPath);
  const rel = relative(root, target).replace(/\\/g, "/");

  return (
    rel.startsWith(".opencode/artifacts/") ||
    rel.startsWith(".opencode/knowledge/") ||
    rel.startsWith("docs/")
  );
}

/**
 * Returns true when a shell command is mechanically limited to read-only inspection.
 */
function isReadOnlyShell(command: string): boolean {
  const normalized = command.trim();
  if (!normalized || /(?:>|>>|<|\||&&|;|\$\(|`)/.test(normalized)) return false;
  return READ_ONLY_SHELL.some((pattern) => pattern.test(normalized));
}

/**
 * Validates whether the requested tool execution complies with N.A.R.U. Quality Gate 1.
 */
export function verifyQualityGates(input: ToolExecuteInput, projectRoot: string): GateVerificationResult {
  const toolName = String(input.tool || "").toLowerCase();
  const args = (input.args || input) as Record<string, any>;
  const sessionID = String(input.sessionID || "");
  const gate1Approved = sessionID ? isGate1Approved(sessionID, projectRoot) : false;

  if (CODE_MUTATION_TOOLS.has(toolName)) {
    if (toolName === "apply_patch" || toolName === "patch" || toolName === "multi_edit") {
      if (!gate1Approved) {
        return {
          allowed: false,
          gate: 1,
          reason: "GATE_1_VIOLATION: Patch-based application mutation requires a native user-approved Gate 1 runtime authorization.",
        };
      }
      return { allowed: true, gate: 4 };
    }

    const rawPath = getTargetPath(args);
    if (!rawPath || !isInsideProject(projectRoot, rawPath)) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Mutation target is missing or outside the active project root. N.A.R.U. fails closed on ambiguous paths.",
      };
    }

    const planningArtifact = isPlanningArtifact(projectRoot, rawPath);
    if (planningArtifact) {
      const normalized = resolve(projectRoot, rawPath).replace(/\\/g, "/");
      if (normalized.endsWith("/.opencode/artifacts/gate-status.md")) {
        return {
          allowed: false,
          gate: 1,
          reason: "GATE_1_VIOLATION: gate-status.md is diagnostic state and cannot be authored by the model as proof of user approval.",
        };
      }
      return { allowed: true, gate: 0 };
    }

    if (!gate1Approved) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Application code mutation is blocked until the native OpenCode question tool returns the exact user approval option APPROVE_GATE_1 for the current planning fingerprint.",
      };
    }

    return { allowed: true, gate: 4 };
  }

  if (SHELL_EXECUTION_TOOLS.has(toolName)) {
    const command = String(args.command ?? args.cmd ?? args.CommandLine ?? "");

    if (!gate1Approved && !isReadOnlyShell(command)) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Shell execution is restricted to deterministic read-only inspection before Gate 1. This prevents shell-based write, package-install, script, redirection, and interpreter bypasses.",
      };
    }
  }

  return { allowed: true, gate: 0 };
}

/**
 * Exposes the current runtime approval state for diagnostics without reading a writable marker file.
 */
export function getGate1Diagnostic(projectRoot: string, sessionID: string): string {
  return isGate1Approved(sessionID, projectRoot) ? "APPROVED" : "BLOCKED";
}
