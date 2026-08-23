// src/plugin/guards/security-guard.ts
/**
 * Deterministic content and command scanner for common implementation bypasses.
 *
 * This scanner is intentionally conservative. A ticket can document a justified
 * suppression, but it never authorizes destructive database operations.
 */

import type { ToolExecuteInput, SecurityScanResult } from "../types.js";

interface RuleDef {
  name: string;
  pattern: RegExp;
  message: string;
  allowWithTicket?: boolean;
}

const TICKET_REGEX = /(?:GH-[A-Z0-9][A-Z0-9_-]*|JIRA-[A-Z0-9][A-Z0-9_-]*|#[0-9]+|https?:\/\/github\.com\/[^\s/]+\/[^\s/]+\/issues\/[0-9]+)/i;

const FORBIDDEN_PATTERNS: RuleDef[] = [
  {
    name: "ts-ignore",
    pattern: /@ts-ignore/i,
    message: "Usage of @ts-ignore without an official tracking ticket is strictly prohibited.",
    allowWithTicket: true,
  },
  {
    name: "ts-expect-error",
    pattern: /@ts-expect-error/i,
    message: "Usage of @ts-expect-error without formal ticket justification is strictly prohibited.",
    allowWithTicket: true,
  },
  {
    name: "eslint-disable-blanket",
    pattern: /\/\*\s*eslint-disable\s*\*\//i,
    message: "Blanket /* eslint-disable */ is prohibited.",
    allowWithTicket: true,
  },
  {
    name: "silent-catch",
    pattern: /catch\s*(?:\([^)]*\))?\s*\{\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)?\s*\}/i,
    message: "Silent error swallowing through an empty catch block is prohibited.",
  },
  {
    name: "python-except-pass",
    pattern: /except(?:\s+[^:]+)?\s*:\s*pass/i,
    message: "Silent error swallowing through except: pass is prohibited in Python.",
  },
  {
    name: "py-type-ignore",
    pattern: /#\s*type:\s*ignore/i,
    message: "Blanket Python type suppression is prohibited without an issue ticket.",
    allowWithTicket: true,
  },
  {
    name: "py-noqa-blanket",
    pattern: /#\s*noqa(?!\s*:\s*[A-Z0-9])/i,
    message: "Blanket Python noqa is prohibited without a rule code and issue ticket.",
    allowWithTicket: true,
  },
  {
    name: "go-nolint-blanket",
    pattern: /\/\/\s*nolint(?!\s*:\s*\w+)/i,
    message: "Blanket Go nolint is prohibited without a rule ID and issue ticket.",
    allowWithTicket: true,
  },
  {
    name: "skipped-tests",
    pattern: /(?:\b(?:it|test|describe)\.skip\s*\(|@pytest\.mark\.skip|\bt\.Skip\s*\()/i,
    message: "Disabling automated tests is prohibited without an official issue reference.",
    allowWithTicket: true,
  },
  {
    name: "hardcoded-secret",
    pattern: /(?:api[_-]?key|secret|password|token)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    message: "Hardcoded secret, token, or private credential detected.",
  },
  {
    name: "destructive-db-drop",
    pattern: /\b(?:DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE\s+(?:TABLE|DATABASE)|DROP\s+COLUMN|ALTER\s+TABLE[\s\S]*\bDROP\s+COLUMN)\b/i,
    message: "Destructive database schema alteration detected. This requires a separate explicit user safety confirmation and is never ticket-authorized.",
  },
];

/**
 * Scans code and commands for security vulnerabilities and illegal bypasses.
 */
export function scanSecurityViolations(input: ToolExecuteInput): SecurityScanResult {
  const violations: string[] = [];
  const args = (input.args || input) as Record<string, any>;
  const content = String(
    args.content ??
    args.CodeContent ??
    args.codeContent ??
    args.replacement ??
    args.ReplacementContent ??
    args.patch ??
    args.text ??
    args.diff ??
    "",
  );

  if (content) {
    for (const rule of FORBIDDEN_PATTERNS) {
      if (!rule.pattern.test(content)) continue;
      if (rule.allowWithTicket && TICKET_REGEX.test(content)) continue;
      violations.push(rule.message);
    }
  }

  const command = String(args.command ?? args.cmd ?? args.CommandLine ?? "");
  if (command) {
    if (/(?:rm\s+-rf|rm\s+--recursive\s+--force|Remove-Item\s+.*-Recurse.*-Force|rmdir\s+\/s\s+\/q|del\s+\/f\s+\/s\s+\/q)/i.test(command)) {
      violations.push("High-risk destructive shell command blocked by N.A.R.U. Security Guard.");
    }

    if (/@ts-(?:ignore|expect-error)/i.test(command) && !TICKET_REGEX.test(command)) {
      violations.push("TypeScript suppression injected through a shell command without an issue ticket.");
    }

    if (/\b(?:DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE\s+(?:TABLE|DATABASE)|DROP\s+COLUMN)\b/i.test(command)) {
      violations.push("Destructive database command blocked; ticket references cannot bypass this safety control.");
    }
  }

  return { safe: violations.length === 0, violations };
}
