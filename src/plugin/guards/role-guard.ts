// ─── role-guard.ts ── Role-Based Access Control (RBAC) Hard Enforcer ─────────
// Enforces that analytical/read-only roles cannot mutate application source code
// ──────────────────────────────────────────────────────────────────────────────

import type { ToolExecuteInput } from "../types.js";

const READ_ONLY_ROLES = new Set([
  "pm",
  "architect",
  "researcher",
  "dependency",
  "reviewer",
  "qa",
  "docs"
]);

const CODE_MUTATION_TOOLS = new Set([
  "write_file",
  "edit_file",
  "replace_file_content",
  "patch_file",
  "create_file",
  "write_to_file",
  "apply_patch",
  "patch",
  "multi_edit",
  "append_file",
  "insert_code",
  "save_file"
]);

/**
 * Validates whether the active subagent role is authorized to execute the requested tool
 */
export function verifyRolePermissions(input: ToolExecuteInput): { allowed: boolean; reason?: string } {
  const toolName = (input.tool || "").toLowerCase();
  const agentName = String(input.agent || input.caller || input.args?.agent || "").toLowerCase();

  // If no agent metadata attached, defer to GateGuard & SecurityGuard
  if (!agentName) {
    return { allowed: true };
  }

  if (READ_ONLY_ROLES.has(agentName) && CODE_MUTATION_TOOLS.has(toolName)) {
    const rawPath = String(input.args?.path || input.args?.TargetFile || input.args?.target_file || "");
    const normalizedPath = rawPath.replace(/\\/g, '/');

    // Allow read-only roles to write artifacts and documentation
    if (
      normalizedPath.includes(".opencode") ||
      normalizedPath.includes("docs/") ||
      normalizedPath.includes("knowledge/") ||
      normalizedPath.endsWith(".md")
    ) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `ROLE_VIOLATION: Subagent '${agentName}' is a designated read-only / analytical role and is strictly forbidden from modifying application code (${rawPath}). Code modifications must be performed by '@developer' or '@hotfix'!`
    };
  }

  return { allowed: true };
}
