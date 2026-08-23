// src/plugin/policy.ts
/**
 * Single source of truth for deterministic N.A.R.U. authorization policy.
 *
 * Agent prompts describe intent; this module defines the runtime policy enforced by the plugin.
 */

export const APPLICATION_MUTATION_TOOLS = new Set([
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

export const SHELL_TOOLS = new Set([
  "bash",
  "powershell",
  "cmd",
  "sh",
  "terminal",
  "run_command",
  "execute_command",
]);

export const READ_ONLY_ROLES = new Set([
  "pm",
  "architect",
  "researcher",
  "dependency",
  "reviewer",
  "qa",
  "docs",
]);

export const CODE_WRITING_ROLES = new Set(["developer", "hotfix"]);

/**
 * Restricts suppressions/skip exemptions to concrete issue references instead of arbitrary words.
 */
export const TRACKING_REFERENCE_PATTERN = /(?:https?:\/\/github\.com\/[^\s]+\/issues\/\d+|(?:GH|JIRA)-\d+|#\d+)/i;

/**
 * Quality-policy version. Bump whenever runtime enforcement semantics change.
 */
export const POLICY_VERSION = "1.0.0";
