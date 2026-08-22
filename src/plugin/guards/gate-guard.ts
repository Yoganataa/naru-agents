// ─── gate-guard.ts ── Quality Gate 1-4 Deterministic Hard Enforcement ───────
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ToolExecuteInput, GateVerificationResult } from "../types.js";

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

const SHELL_EXECUTION_TOOLS = new Set([
  "bash",
  "run_command",
  "execute_command",
  "terminal",
  "sh",
  "powershell",
  "cmd"
]);

/**
 * Validates whether the requested tool execution complies with N.A.R.U. Quality Gates
 */
export function verifyQualityGates(input: ToolExecuteInput, projectRoot: string): GateVerificationResult {
  const toolName = (input.tool || "").toLowerCase();
  const args = input.args || input;

  const blueprintPath = join(projectRoot, ".opencode", "knowledge", "architecture-blueprint.md");
  const projectBriefPath = join(projectRoot, ".opencode", "artifacts", "project-brief.md");
  const hasBlueprint = existsSync(blueprintPath) || existsSync(projectBriefPath);

  // 1. Direct Code Mutation Tools
  if (CODE_MUTATION_TOOLS.has(toolName)) {
    const rawPath = String(args.path || args.TargetFile || args.target_file || args.targetFile || args.file || args.filepath || "");
    const normalizedPath = rawPath.replace(/\\/g, '/');

    // Allow modifications to internal .opencode artifacts, knowledge, and docs
    if (
      normalizedPath.includes(".opencode") ||
      normalizedPath.includes("docs/") ||
      normalizedPath.includes("knowledge/") ||
      normalizedPath.endsWith(".md") ||
      normalizedPath === ""
    ) {
      return { allowed: true, gate: 0 };
    }

    if (!hasBlueprint) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Writing or modifying application code is strictly prohibited until Architecture Blueprint (.opencode/knowledge/architecture-blueprint.md) is created and approved!"
      };
    }

    // Gate 2 Enforcement: Check Plan / ADR approval status
    const gateStatusPath = join(projectRoot, ".opencode", "artifacts", "gate-status.md");
    if (existsSync(gateStatusPath)) {
      try {
        const content = readFileSync(gateStatusPath, "utf8");
        if (content.includes("GATE_2_STATUS: BLOCKED") || content.includes("Gate 2: BLOCKED")) {
          return {
            allowed: false,
            gate: 2,
            reason: "GATE_2_VIOLATION: Quality Gate 2 is BLOCKED. Complete ADR / Plan design and obtain approval before modifying application code."
          };
        }
      } catch {
        // Ignore read errors
      }
    }

    return { allowed: true, gate: 4 };
  }

  // 2. Shell Execution Interception (Prevent bash echo/cat redirection mutations to application files)
  if (SHELL_EXECUTION_TOOLS.has(toolName)) {
    const command = String(args.command || args.cmd || args.CommandLine || "");
    const isMutationCommand = /(?:>|>>|Out-File|Set-Content)\s+["']?([^\s"'>|&;]+)/i.test(command) ||
                              /(?:fs\.writeFileSync|open\([^,]+,\s*['"]w['"]\))/i.test(command);
    
    if (isMutationCommand && !hasBlueprint) {
      const match = command.match(/(?:>|>>|Out-File|Set-Content)\s+["']?([^\s"'>|&;]+)/i);
      const target = match ? match[1].replace(/\\/g, '/') : "";
      if (target && !target.includes(".opencode") && !target.includes("docs/") && !target.includes("knowledge/") && !target.endsWith(".md")) {
        return {
          allowed: false,
          gate: 1,
          reason: `GATE_1_VIOLATION: Modifying application code via shell redirection (${target}) is strictly prohibited until Architecture Blueprint is approved!`
        };
      }
    }
  }

  return { allowed: true, gate: 0 };
}
