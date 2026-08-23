// src/plugin/guards/role-guard.ts
/**
 * Enforces role-based least privilege for OpenCode V1 tool execution.
 */

import type { ToolExecuteInput } from "../types.js";
import {
  APPLICATION_MUTATION_TOOLS,
  READ_ONLY_ROLES,
} from "../policy.js";

/** Extracts the target path from native or legacy file mutation arguments. */
function getTargetPath(input: ToolExecuteInput): string {
  const args = input.args || {};
  return String(
    args.filePath ??
    args.path ??
    args.TargetFile ??
    args.target_file ??
    args.targetFile ??
    args.file ??
    args.filepath ??
    "",
  );
}

/** Returns true when the path belongs to N.A.R.U. control-plane artifacts. */
function isControlPlanePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  return normalized.startsWith(".opencode/") || normalized.startsWith("docs/");
}

/** Validates whether the active role may execute the requested tool. */
export function verifyRolePermissions(input: ToolExecuteInput): { allowed: boolean; reason?: string } {
  const toolName = String(input.tool || "").toLowerCase();
  const agentName = String(input.agent || input.caller || input.args?.agent || "").trim().toLowerCase();

  // Unknown agent identity is intentionally left to GateGuard and OpenCode permissions.
  if (!agentName) return { allowed: true };

  if (!READ_ONLY_ROLES.has(agentName) || !APPLICATION_MUTATION_TOOLS.has(toolName)) {
    return { allowed: true };
  }

  const path = getTargetPath(input);
  if (toolName === "apply_patch" || toolName === "patch" || toolName === "multi_edit") {
    return {
      allowed: false,
      reason: `ROLE_VIOLATION: '${agentName}' is read-only and cannot use patch mutation tools. Delegate code changes to 'developer' or 'hotfix'.`,
    };
  }

  if (isControlPlanePath(path)) return { allowed: true };

  return {
    allowed: false,
    reason: `ROLE_VIOLATION: '${agentName}' is read-only and cannot modify application code (${path || "unknown target"}). Delegate code changes to 'developer' or 'hotfix'.`,
  };
}
