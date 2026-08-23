// src/plugin/guards/security-guard.ts
/**
 * Deterministic security and anti-bypass scanner for OpenCode V1 tool calls.
 *
 * This layer is intentionally narrow: runtime authorization belongs to policy/gate guards;
 * this scanner detects concrete code and command hazards before execution.
 */

import type { ToolExecuteInput, SecurityScanResult } from "../types.js";
import { TRACKING_REFERENCE_PATTERN } from "../policy.js";

interface RuleDef {
  name: string;
  pattern: RegExp;
  message: string;
  allowWithTicket?: boolean;
}

const FORBIDDEN_PATTERNS: RuleDef[] = [
  {
    name: "ts-ignore",
    pattern: /@ts-ignore/i,
    message: "@ts-ignore is prohibited unless justified by a concrete tracked issue.",
    allowWithTicket: true,
  },
  {
    name: "ts-expect-error",
    pattern: /@ts-expect-error/i,
    message: "@ts-expect-error is prohibited unless justified by a concrete tracked issue.",
    allowWithTicket: true,
  },
  {
    name: "eslint-disable-blanket",
    pattern: /\/\*\s*eslint-disable\s*\*\//i,
    message: "Blanket eslint-disable is prohibited.",
    allowWithTicket: true,
  },
  {
    name: "silent-catch",
    pattern: /catch\s*(?:\([^)]*\))?\s*\{\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)?\s*\}/i,
    message: "Empty catch blocks are prohibited.",
  },
  {
    name: "python-except-pass",
    pattern: /except(?:\s+[^:]+)?\s*:\s*pass\b/i,
    message: "Python except: pass is prohibited.",
  },
  {
    name: "py-type-ignore",
    pattern: /#\s*type:\s*ignore\b/i,
    message: "Python type: ignore requires a concrete tracked issue.",
    allowWithTicket: true,
  },
  {
    name: "py-noqa-blanket",
    pattern: /#\s*noqa\s*$/im,
    message: "Blanket Python noqa is prohibited.",
    allowWithTicket: true,
  },
  {
    name: "go-nolint-blanket",
    pattern: /\/\/\s*nolint\b/i,
    message: "Blanket Go nolint requires a concrete tracked issue and rule identifier.",
    allowWithTicket: true,
  },
  {
    name: "skipped-tests",
    pattern: /(?:\b(?:it|test|describe)\.skip\s*\(|@pytest\.mark\.skip\b|\bt\.Skip\s*\(|#\s*\[ignore\]|@Disabled\b)/i,
    message: "Disabling automated tests requires a concrete tracked issue.",
    allowWithTicket: true,
  },
  {
    name: "hardcoded-secret",
    pattern: /(?:api[_-]?key|secret|password|token)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    message: "Potential hardcoded credential detected.",
  },
  {
    name: "destructive-db",
    pattern: /\b(?:DROP\s+TABLE|DROP\s+DATABASE|DROP\s+COLUMN|TRUNCATE\s+TABLE)\b/i,
    message: "Destructive database schema operations require an explicit approved migration workflow.",
  },
];

/** Collects all textual tool arguments relevant to static scanning. */
function getContent(input: ToolExecuteInput): string {
  const args = input.args || input;
  return [
    args.content,
    args.CodeContent,
    args.codeContent,
    args.replacement,
    args.ReplacementContent,
    args.patch,
    args.text,
    args.diff,
    args.command,
    args.cmd,
    args.CommandLine,
  ]
    .filter((value): value is string => typeof value === "string")
    .join("\n");
}

/** Scans a tool call for deterministic security violations. */
export function scanSecurityViolations(input: ToolExecuteInput): SecurityScanResult {
  const violations: string[] = [];
  const content = getContent(input);
  const command = String((input.args || input).command ?? (input.args || input).cmd ?? "");
  const hasTrackingReference = TRACKING_REFERENCE_PATTERN.test(content);

  for (const rule of FORBIDDEN_PATTERNS) {
    if (!rule.pattern.test(content)) continue;
    if (rule.allowWithTicket && hasTrackingReference) continue;
    violations.push(`[${rule.name}] ${rule.message}`);
  }

  if (command && /(?:^|[;&|])\s*(?:rm\s+-rf\b|del\s+\/f\b|format\s+[A-Z]:\b)/i.test(command)) {
    violations.push("[destructive-shell] High-risk destructive shell command blocked.");
  }

  return { safe: violations.length === 0, violations };
}
