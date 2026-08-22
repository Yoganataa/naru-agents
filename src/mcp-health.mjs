// ─── mcp-health.mjs ── MCP Health Reporter (Naru Proactive Reminder) ───────
// Jika 1 MCP tidak berfungsi, Naru WAJIB ingatkan user + kasih laporan bagian mana yang harus diperbaiki
// Dipakai oleh: naru (pre-flight), doctor, mcp-manager, gate-enforcer
// ──────────────────────────────────────────────────────────────────────────────

import { discoverMCPServers } from './smart-discovery.mjs';
import { getContext7Key } from './context7-manager.mjs';

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
      title: 'Context7 API key belum di-set',
      detail: 'MCP context7 ter-install tapi tanpa ctx7sk_ key → researcher & dependency akan fallback ke webfetch (degraded, tidak bisa fetch versi exact dari registry).',
      fix: 'Set key via TUI atau CLI',
      fixCmd: 'naru mcp              # pilih context7 → Enter → paste ctx7sk_...\n  atau: naru mcp set context7 ctx7sk_...',
    });
  }
  if (!mcp.context7?.available) {
    issues.push({
      mcp: 'context7',
      severity: 'critical',
      title: 'Context7 MCP tidak tersedia',
      detail: 'Remote https://mcp.context7.com/mcp tidak terjangkau (network / config opencode.json hilang).',
      fix: 'Cek opencode.json mcp.context7.url',
      fixCmd: 'naru mcp status',
    });
  }

  // CodeGraph — needsInit
  if (mcp.codegraph?.needsInit) {
    issues.push({
      mcp: 'codegraph',
      severity: 'warning',
      title: 'CodeGraph ter-install tapi index belum dibuat',
      detail: `Binary ditemukan di ${mcp.codegraph.source} tapi .codegraph/codegraph.db belum ada → codegraph_explore & blast-radius tidak jalan.`,
      fix: 'Init index (877ms)',
      fixCmd: 'naru mcp init codegraph   # atau: codegraph init / naru init',
    });
  }
  if (!mcp.codegraph?.available) {
    issues.push({
      mcp: 'codegraph',
      severity: 'critical',
      title: 'CodeGraph belum ter-install',
      detail: 'Binary codegraph tidak ada di PATH → impact analysis & call-graph tidak jalan.',
      fix: 'Install global',
      fixCmd: 'npm install -g codegraph  /  bun add -g codegraph',
    });
  }

  // Serena
  if (!mcp.serena?.available) {
    issues.push({
      mcp: 'serena',
      severity: 'warning',
      title: 'Serena LSP tidak tersedia',
      detail: 'Binary serena tidak ada → find_symbol & LSP tidak jalan, fallback ke grep.',
      fix: 'Install serena',
      fixCmd: 'pip install serena-agent  atau  cek https://github.com/oraios/serena',
    });
  }

  // Lean-ctx
  if (!mcp['lean-ctx']?.available) {
    issues.push({
      mcp: 'lean-ctx',
      severity: 'warning',
      title: 'lean-ctx tidak tersedia',
      detail: 'Binary lean-ctx tidak ada → ctx_compose & token compaction tidak jalan.',
      fix: 'Install via cargo',
      fixCmd: 'cargo install lean-ctx',
    });
  }

  // Codebase-memory
  if (!mcp['codebase-memory-mcp']?.available) {
    issues.push({
      mcp: 'codebase-memory-mcp',
      severity: 'critical',
      title: 'codebase-memory-mcp tidak tersedia',
      detail: 'Binary tidak ada → knowledge graph persistent tidak jalan, research grounding lemah.',
      fix: 'Install dari release',
      fixCmd: 'Cek https://github.com/DeusData/codebase-memory-mcp/releases',
    });
  }

  // Roblox-studio — only warning if user expects it but not found, otherwise ignore
  // (already handled as available false on Linux is expected)

  const healthy = issues.length === 0;
  const summary = healthy
    ? '✅ Semua 5 MCP inti healthy — siap full pipeline'
    : `⚠️ ${issues.length} MCP bermasalah — Naru akan ingatkan & kasih laporan perbaikan`;

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
    out += `${C.green}  ✓ context7, serena, codegraph, lean-ctx, codebase-memory-mcp — semua OK${C.reset}\n`;
    return out;
  }

  out += `\n${C.yellow}Bagian yang harus diperbaiki:${C.reset}\n`;
  report.issues.forEach((iss, idx) => {
    const icon = iss.severity === 'critical' ? `${C.red}✗ CRITICAL${C.reset}` : `${C.yellow}⚠ WARNING${C.reset}`;
    out += `\n  ${idx + 1}. [${icon}] ${C.bold}${iss.mcp}${C.reset} — ${iss.title}\n`;
    out += `     ${C.dim}${iss.detail}${C.reset}\n`;
    out += `     ${C.cyan}Fix: ${iss.fix}${C.reset}\n`;
    out += `     ${C.dim}Cmd: ${iss.fixCmd}${C.reset}\n`;
  });

  out += `\n${C.dim}Tip: Jalankan fix di atas, lalu: naru mcp validate  atau  naru doctor${C.reset}\n`;
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
