// ─── security-guard.ts ── Zero-Trust Dependencies & No-Bypass Scanner ────────
import type { ToolExecuteInput, SecurityScanResult } from "../types.js";

const FORBIDDEN_PATTERNS = [
  { pattern: /@ts-ignore/g, message: "Usage of @ts-ignore without an official tracking ticket is strictly prohibited!" },
  { pattern: /@ts-expect-error/g, message: "Usage of @ts-expect-error without formal justification is strictly prohibited!" },
  { pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g, message: "Silent error swallowing (catch () {}) is strictly prohibited!" },
  { pattern: /catch\s*\{\s*\}/g, message: "Silent error swallowing (catch {}) is strictly prohibited!" },
  { pattern: /except\s*:\s*pass/g, message: "Silent error swallowing (except: pass) is strictly prohibited in Python!" },
  { pattern: /(?:api[_-]?key|secret|password|token)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i, message: "Hardcoded secret / API key detected!" }
];

/**
 * Scans code and commands for security vulnerabilities and illegal bypasses
 */
export function scanSecurityViolations(input: ToolExecuteInput): SecurityScanResult {
  const violations: string[] = [];
  const args = input.args || input;
  const content = String(args.content || args.CodeContent || args.codeContent || args.replacement || args.ReplacementContent || "");

  if (content) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(content)) {
        violations.push(rule.message);
      }
    }
  }

  // Check shell command execution for dangerous destructive calls
  const command = String(args.command || args.cmd || args.CommandLine || "");
  if (command) {
    if (/rm\s+-rf\s+\/|format\s+[A-Z]:|del\s+\/f\s+\/s\s+\/q/i.test(command)) {
      violations.push("High-risk destructive shell command blocked by N.A.R.U. Security Guard!");
    }
  }

  return {
    safe: violations.length === 0,
    violations
  };
}
