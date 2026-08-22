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
  "write_to_file"
]);

/**
 * Validates whether the requested tool execution complies with N.A.R.U. Quality Gates
 */
export function verifyQualityGates(input: ToolExecuteInput, projectRoot: string): GateVerificationResult {
  const toolName = input.tool || "";
  if (!CODE_MUTATION_TOOLS.has(toolName)) {
    return { allowed: true, gate: 0 };
  }

  const args = input.args || input;
  const targetPath = String(args.path || args.TargetFile || args.target_file || args.targetFile || "");

  // Allow modifications to internal .opencode artifacts, knowledge, and docs
  if (
    targetPath.includes(".opencode") ||
    targetPath.includes("docs/") ||
    targetPath.includes("knowledge/") ||
    targetPath.endsWith(".md")
  ) {
    return { allowed: true, gate: 0 };
  }

  // 1. Gate 1 Enforcement: Blueprint & PRD must exist
  const blueprintPath = join(projectRoot, ".opencode", "knowledge", "architecture-blueprint.md");
  const projectBriefPath = join(projectRoot, ".opencode", "artifacts", "project-brief.md");
  
  if (!existsSync(blueprintPath) && !existsSync(projectBriefPath)) {
    return {
      allowed: false,
      gate: 1,
      reason: "GATE_1_VIOLATION: Writing or modifying application code is strictly prohibited until Architecture Blueprint (.opencode/knowledge/architecture-blueprint.md) is created and approved!"
    };
  }

  // 2. Gate 2 Enforcement: Check Plan / ADR approval status
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
