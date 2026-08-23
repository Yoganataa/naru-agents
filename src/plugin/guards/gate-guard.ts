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
 * Checks whether Quality Gate 1 (PRD & Architecture Blueprint) has been explicitly approved
 */
function isGate1Approved(projectRoot: string): boolean {
  const gateStatusPath = join(projectRoot, ".opencode", "artifacts", "gate-status.md");
  const blueprintPath = join(projectRoot, ".opencode", "knowledge", "architecture-blueprint.md");

  // 1. Check gate-status.md for explicit approval
  if (existsSync(gateStatusPath)) {
    try {
      const content = readFileSync(gateStatusPath, "utf8");
      if (
        content.includes("GATE_1_STATUS: APPROVED") ||
        content.includes("Gate 1: APPROVED") ||
        content.includes("Gate 1: [✓ PASS]") ||
        content.includes("GATE_1_STATUS: PASS") ||
        content.includes("Gate 1 SOP: Plan") && content.includes("APPROVED")
      ) {
        return true;
      }
    } catch {}
  }

  // 2. Check architecture-blueprint.md for explicit approval signoff
  if (existsSync(blueprintPath)) {
    try {
      const content = readFileSync(blueprintPath, "utf8");
      if (
        content.includes("GATE_1_STATUS: APPROVED") ||
        content.includes("Gate 1: APPROVED") ||
        content.includes("Status: APPROVED") ||
        content.includes("STATUS: APPROVED")
      ) {
        return true;
      }
    } catch {}
  }

  return false;
}

/**
 * Validates whether the requested tool execution complies with N.A.R.U. Quality Gates
 */
export function verifyQualityGates(input: ToolExecuteInput, projectRoot: string): GateVerificationResult {
  const toolName = (input.tool || "").toLowerCase();
  const args = input.args || input;
  const gate1Approved = isGate1Approved(projectRoot);

  // 1. Direct Code Mutation Tools
  if (CODE_MUTATION_TOOLS.has(toolName)) {
    const rawPath = String(args.path || args.TargetFile || args.target_file || args.targetFile || args.file || args.filepath || "");
    const normalizedPath = rawPath.replace(/\\/g, '/');

    // Allow modifications to internal .opencode artifacts, knowledge, and docs (Planning Phase)
    if (
      normalizedPath.includes(".opencode") ||
      normalizedPath.includes("docs/") ||
      normalizedPath.includes("knowledge/") ||
      normalizedPath.endsWith(".md") ||
      normalizedPath === ""
    ) {
      return { allowed: true, gate: 0 };
    }

    // Zero-Trust: Code mutation is strictly forbidden until Gate 1 is EXPLICITLY APPROVED
    if (!gate1Approved) {
      return {
        allowed: false,
        gate: 1,
        reason: "GATE_1_VIOLATION: Writing or modifying application code is strictly prohibited until PRD & Architecture Blueprint is presented to and EXPLICITLY APPROVED by the user (GATE_1_STATUS: APPROVED in gate-status.md)!"
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
    
    if (isMutationCommand && !gate1Approved) {
      const match = command.match(/(?:>|>>|Out-File|Set-Content)\s+["']?([^\s"'>|&;]+)/i);
      const target = match ? match[1].replace(/\\/g, '/') : "";
      if (target && !target.includes(".opencode") && !target.includes("docs/") && !target.includes("knowledge/") && !target.endsWith(".md")) {
        return {
          allowed: false,
          gate: 1,
          reason: `GATE_1_VIOLATION: Modifying application code via shell redirection (${target}) is strictly prohibited until Architecture Blueprint is EXPLICITLY APPROVED by user!`
        };
      }
    }
  }

  return { allowed: true, gate: 0 };
}
