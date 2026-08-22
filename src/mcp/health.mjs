// ─── mcp-health.mjs ── MCP Health Reporter (Naru Proactive Reminder) ───────
// If any MCP server is degraded/missing, Naru proactively reminds the user with actionable diagnostics
// Used by: naru (pre-flight), doctor, mcp-manager, gate-enforcer
// ──────────────────────────────────────────────────────────────────────────────

import { discoverMCPServers } from '../discovery.mjs';
import { getContext7Key } from './context7.mjs';

/**
 * Severity for MCP issue
 * @typedef {'critical'|'warning'|'info'} Severity
 */

/**
 * Generate detailed MCP health report
 * @param {string} cwd
 * @returns {Promise<{ healthy: boolean, issues: Array<{mcp: string, severity: Severity, title: string, detail: string, fix: string, fixCmd: string}>, summary: string }>}
 */
export async function getMcpHealthReport(cwd = process.cwd()) {
  const mcp = await discoverMCPServers();
  const issues = [];

  // Context7 — degraded if no key
  if (mcp.context7?.needsKey) {
    issues.push({
      mcp: 'context7',
      severity: 'warning',
      title: 'Context7 API key not configured',
      detail: 'MCP context7 is configured without a ctx7sk_ key -> researcher & dependency will fallback to webfetch (degraded, cannot fetch exact registry versions).',
      fix: 'Set key via TUI or CLI',
      fixCmd: 'naru mcp              # select context7 -> Enter -> paste ctx7sk_...\n  or: naru mcp set context7 ctx7sk_...',
    });
  }
  if (!mcp.context7?.available) {
    issues.push({
      mcp: 'context7',
      severity: 'critical',
      title: 'Context7 MCP unavailable',
      detail: 'Remote https://mcp.context7.com/mcp is unreachable (network error or missing opencode.json config).',
      fix: 'Verify opencode.json mcp.context7.url',
      fixCmd: 'naru mcp status',
    });
  }

  // CodeGraph — needsInit
  if (mcp.codegraph?.needsInit) {
    issues.push({
      mcp: 'codegraph',
      severity: 'warning',
      title: 'CodeGraph installed but index not initialized',
      detail: `Binary found at ${mcp.codegraph.source} but .codegraph/codegraph.db does not exist -> codegraph_explore & blast-radius unavailable.`,
      fix: 'Initialize index (877ms)',
      fixCmd: 'naru mcp init codegraph   # or: codegraph init / naru init',
    });
  }
  if (!mcp.codegraph?.available) {
    issues.push({
      mcp: 'codegraph',
      severity: 'critical',
      title: 'CodeGraph not installed',
      detail: 'Binary codegraph not found in PATH -> impact analysis & call-graph unavailable.',
      fix: 'Install globally',
      fixCmd: 'npm install -g codegraph  /  bun add -g codegraph',
    });
  }

  // Serena
  if (!mcp.serena?.available) {
    issues.push({
      mcp: 'serena',
      severity: 'warning',
      title: 'Serena LSP unavailable',
      detail: 'Binary serena not found -> find_symbol & LSP unavailable, falling back to ripgrep.',
      fix: 'Install serena',
      fixCmd: 'pip install serena-agent  or  check https://github.com/oraios/serena',
    });
  }

  // Lean-ctx
  if (!mcp['lean-ctx']?.available) {
    issues.push({
      mcp: 'lean-ctx',
      severity: 'warning',
      title: 'lean-ctx unavailable',
      detail: 'Binary lean-ctx not found -> ctx_compose & token compaction unavailable.',
      fix: 'Install via cargo',
      fixCmd: 'cargo install lean-ctx',
    });
  }

  // Codebase-memory
  if (!mcp['codebase-memory-mcp']?.available) {
    issues.push({
      mcp: 'codebase-memory-mcp',
      severity: 'critical',
      title: 'codebase-memory-mcp unavailable',
      detail: 'Binary not found -> persistent knowledge graph unavailable, research grounding degraded.',
      fix: 'Install from official release',
      fixCmd: 'Check https://github.com/DeusData/codebase-memory-mcp/releases',
    });
  }

  // Roblox-studio — only warning if user expects it but not found, otherwise ignore
  // (already handled as available false on Linux is expected)

  const healthy = issues.length === 0;
  const summary = healthy
    ? '✅ All 5 core MCP servers healthy — ready for full pipeline'
    : `⚠️ ${issues.length} MCP issue(s) detected — Naru proactive diagnostic reminder`;

  return { healthy, issues, summary, mcp };
}

/**
 * Format report as human-readable text (for Naru to send to user)
 * @param {Awaited<ReturnType<typeof getMcpHealthReport>>} report
 * @returns {string}
 */
export function formatMcpReport(report) {
  const C = { green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m' };
  let out = `\n${C.bold}MCP Health Check — Naru Proactive Reminder${C.reset}\n`;
  out += `${report.summary}\n`;

  if (report.healthy) {
    out += `${C.green}  ✓ context7, serena, codegraph, lean-ctx, codebase-memory-mcp — all OK${C.reset}\n`;
    return out;
  }

  out += `\n${C.yellow}Actionable Remediation Items:${C.reset}\n`;
  report.issues.forEach((iss, idx) => {
    const icon = iss.severity === 'critical' ? `${C.red}✗ CRITICAL${C.reset}` : `${C.yellow}⚠ WARNING${C.reset}`;
    out += `\n  ${idx + 1}. [${icon}] ${C.bold}${iss.mcp}${C.reset} — ${iss.title}\n`;
    out += `     ${C.dim}${iss.detail}${C.reset}\n`;
    out += `     ${C.cyan}Fix: ${iss.fix}${C.reset}\n`;
    out += `     ${C.dim}Cmd: ${iss.fixCmd}${C.reset}\n`;
  });

  out += `\n${C.dim}Tip: Run the remediation above, then: naru mcp validate  or  naru doctor${C.reset}\n`;
  return out;
}

/**
 * Naru pre-flight check — call this before any pipeline
 * If unhealthy, returns report string for Naru to send via `question` or chat
 * @param {string} cwd
 * @returns {Promise<{ shouldBlock: boolean, report: string, reportObj: Awaited<ReturnType<typeof getMcpHealthReport>> }>}
 */
export async function checkMcpPreflight(cwd = process.cwd()) {
  const report = await getMcpHealthReport(cwd);
  const shouldBlock = report.issues.some(i => i.severity === 'critical');
  return {
    shouldBlock,
    report: formatMcpReport(report),
    reportObj: report,
  };
}
