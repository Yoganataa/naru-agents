// ─── security-guard.ts ── Zero-Trust Dependencies & Multi-Language No-Bypass ──
import type { ToolExecuteInput, SecurityScanResult } from "../types.js";

interface RuleDef {
  name: string;
  pattern: RegExp;
  message: string;
  allowWithTicket?: boolean;
}

const TICKET_REGEX = /(?:issue|ticket|gh-|jira-|fix|ref|#\d+)/i;

const FORBIDDEN_PATTERNS: RuleDef[] = [
  // ── 1. TypeScript / JavaScript ──────────────────────────────────────────────
  {
    name: "ts-ignore",
    pattern: /@ts-ignore/g,
    message: "Usage of @ts-ignore without an official tracking ticket is strictly prohibited!",
    allowWithTicket: true
  },
  {
    name: "ts-expect-error",
    pattern: /@ts-expect-error/g,
    message: "Usage of @ts-expect-error without formal ticket justification is strictly prohibited!",
    allowWithTicket: true
  },
  {
    name: "eslint-disable-blanket",
    pattern: /\/\*\s*eslint-disable\s*\*\//g,
    message: "Blanket /* eslint-disable */ is prohibited! Specify exact rule or link ticket.",
    allowWithTicket: true
  },

  // ── 2. Silent Error Swallowing (Empty catch) ─────────────────────────────────
  {
    name: "silent-catch",
    pattern: /catch\s*(?:\([^)]*\))?\s*\{\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)?\s*\}/g,
    message: "Silent error swallowing (empty catch block) is strictly prohibited across all languages!"
  },
  {
    name: "python-except-pass",
    pattern: /except(?:\s+[^:]+)?\s*:\s*pass/g,
    message: "Silent error swallowing (except: pass) is strictly prohibited in Python!"
  },

  // ── 3. Python Type & Lint Suppression ────────────────────────────────────────
  {
    name: "py-type-ignore",
    pattern: /#\s*type:\s*ignore/g,
    message: "Blanket '# type: ignore' in Python is prohibited without an issue ticket!",
    allowWithTicket: true
  },
  {
    name: "py-noqa-blanket",
    pattern: /#\s*noqa(?!\s*:\s*[A-Z0-9])/g,
    message: "Blanket '# noqa' in Python is prohibited without specifying exact error code and ticket!",
    allowWithTicket: true
  },

  // ── 4. Go & Rust Suppression ────────────────────────────────────────────────
  {
    name: "go-nolint-blanket",
    pattern: /\/\/\s*nolint(?!\s*:\s*\w+)/g,
    message: "Blanket '//nolint' in Go is prohibited without rule ID and ticket justification!",
    allowWithTicket: true
  },

  // ── 5. Skipped Tests Without Ticket ──────────────────────────────────────────
  {
    name: "skipped-tests",
    pattern: /(?:\b(?:it|test|describe)\.skip\s*\(|@pytest\.mark\.skip|\bt\.Skip\s*\()/g,
    message: "Disabling automated tests (.skip) without an official issue link is strictly prohibited!",
    allowWithTicket: true
  },

  // ── 6. Secret & Token Leakage ────────────────────────────────────────────────
  {
    name: "hardcoded-secret",
    pattern: /(?:api[_-]?key|secret|password|token)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    message: "Hardcoded secret, token, or private credential detected!"
  }
];

/**
 * Scans code and commands for security vulnerabilities and illegal bypasses
 */
export function scanSecurityViolations(input: ToolExecuteInput): SecurityScanResult {
  const violations: string[] = [];
  const args = input.args || input;
  const content = String(
    args.content ||
    args.CodeContent ||
    args.codeContent ||
    args.replacement ||
    args.ReplacementContent ||
    args.patch ||
    args.text ||
    args.diff ||
    ""
  );

  if (content) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(content)) {
        // If rule allows ticket, check if ticket is referenced in content
        if (rule.allowWithTicket && TICKET_REGEX.test(content)) {
          continue; // Permitted with ticket exemption
        }
        violations.push(rule.message);
      }
    }
  }

  // Check shell command execution for dangerous destructive calls or inline bypasses
  const command = String(args.command || args.cmd || args.CommandLine || "");
  if (command) {
    if (/rm\s+-rf\s+\/|format\s+[A-Z]:|del\s+\/f\s+\/s\s+\/q/i.test(command)) {
      violations.push("High-risk destructive shell command blocked by N.A.R.U. Security Guard!");
    }
    if (/@ts-ignore/i.test(command) && !TICKET_REGEX.test(command)) {
      violations.push("Usage of @ts-ignore via shell command injection without ticket is prohibited!");
    }
  }

  return {
    safe: violations.length === 0,
    violations
  };
}
