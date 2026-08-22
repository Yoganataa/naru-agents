// ─── gate-enforcer.mjs ── Hard Gate 1 Enforcer (Code, not Prompt) ──────────
// Implements LangGraph HITL checkpoint + MetaGPT SOP assembly line as CODE
// Prevents Naru/developer from editing code before Plan APPROVED
// Uses .opencode/artifacts/gate-status.md as durable checkpointer
// ──────────────────────────────────────────────────────────────────────────────

import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Check if Gate 1 (Plan Approval) is passed
 * @param {string} cwd - project root (default: process.cwd())
 * @returns {Promise<{ approved: boolean, reason: string, gateFile: string }>}
 */
export async function checkGate1(cwd = process.cwd()) {
  const gatePath = join(cwd, '.opencode', 'artifacts', 'gate-status.md');
  const planGlob = join(cwd, '.opencode', 'artifacts', 'plan-*.md');
  const latestJson = join(cwd, '.opencode', 'knowledge', 'sessions', 'latest.json');

  // 1. Check gate-status.md for Gate 1 PASS
  try {
    const raw = await readFile(gatePath, 'utf8');
    // Look for Gate 1 markers: Gate 1 ... PASS / APPROVED / Gate1: PASS
    if (/Gate\s*1[^]*?(PASS|APPROVED|APPROVE)/i.test(raw) || /gate-1[^]*?PASS/i.test(raw)) {
      return { approved: true, reason: 'Gate 1 PASS found in gate-status.md', gateFile: gatePath };
    }
    // If file exists but no PASS, check for explicit WAITING
    if (/WAITING|PENDING|NOT.*APPROVED/i.test(raw)) {
      return { approved: false, reason: 'Gate 1 still WAITING_FOR_APPROVAL in gate-status.md', gateFile: gatePath };
    }
  } catch {
    // No gate file → not approved
  }

  // 2. Check latest.json for status APPROVED or Gate1 PASS
  try {
    const raw = await readFile(latestJson, 'utf8');
    const j = JSON.parse(raw);
    if (j.status === 'APPROVED' || j.gate1 === 'PASS' || j.gate_1 === 'PASS' || j.gateStatus?.gate1 === 'PASS') {
      return { approved: true, reason: 'latest.json status APPROVED', gateFile: latestJson };
    }
  } catch {}

  // 3. Check for any plan-*.md with APPROVED stamp
  try {
    const { glob } = await import('node:fs/promises').then(m => m).catch(() => null);
    // Fallback: check if any plan file exists via readdir
    const { readdir } = await import('node:fs/promises');
    const artifactsDir = join(cwd, '.opencode', 'artifacts');
    const files = await readdir(artifactsDir).catch(() => []);
    const planFiles = files.filter(f => f.startsWith('plan-') && f.endsWith('.md'));
    for (const pf of planFiles) {
      try {
        const c = await readFile(join(artifactsDir, pf), 'utf8');
        if (/APPROVED|Gate\s*1.*PASS/i.test(c)) {
          return { approved: true, reason: `Plan ${pf} marked APPROVED`, gateFile: join(artifactsDir, pf) };
        }
      } catch {}
    }
    if (planFiles.length > 0) {
      return { approved: false, reason: `Found ${planFiles.length} plan file(s) but none marked APPROVED`, gateFile: join(cwd, '.opencode/artifacts') };
    }
  } catch {}

  return { approved: false, reason: 'No Gate 1 APPROVAL found (missing gate-status.md / plan-*.md APPROVED)', gateFile: gatePath };
}

/**
 * Assert Gate 1 before allowing edits — throws if not approved
 * Call this at top of developer/mcp mutating operations
 * @param {string} cwd
 * @throws {Error} if not approved (caller should trigger question modal)
 */
export async function assertGate1(cwd = process.cwd()) {
  const res = await checkGate1(cwd);
  if (!res.approved) {
    const err = new Error(`Gate 1 BLOCKED: ${res.reason} — Naru must run question() for Plan approval before edits. File: ${res.gateFile}`);
    err.code = 'GATE1_NOT_APPROVED';
    err.gateFile = res.gateFile;
    throw err;
  }
  return res;
}

/**
 * Create initial gate-status.md in WAITING state (for `naru plan` command)
 * @param {string} cwd
 * @param {string} planFileName
 */
export async function createGateWaiting(cwd = process.cwd(), planFileName = 'plan-pending.md') {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const artifactsDir = join(cwd, '.opencode', 'artifacts');
  await mkdir(artifactsDir, { recursive: true });
  const gatePath = join(artifactsDir, 'gate-status.md');
  const content = `# Gate Status — Naru Pipeline

**Global Budget:** 8 | **Per-Gate Limit:** 3

| Gate | Name | Status | Retries |
|------|------|--------|---------|
| Gate 1 | Plan Approval | ⏸️ WAITING_FOR_APPROVAL | 0 |
| Gate 2 | Smoke & No-Bypass | PENDING | 0 |
| Gate 3 | Review | PENDING | 0 |
| Gate 4 | QA | PENDING | 0 |

**Plan File:** \`${planFileName}\`
**Created:** ${new Date().toISOString()}
**Next:** Run \`question("Plan Review: Approve / Revisi / Abort")\` — only APPROVE may proceed to Developer.
`;
  await writeFile(gatePath, content, 'utf8');
  return gatePath;
}

/**
 * Mark Gate 1 as APPROVED (called after user picks Approve)
 * @param {string} cwd
 */
export async function approveGate1(cwd = process.cwd()) {
  const { readFile, writeFile } = await import('node:fs/promises');
  const gatePath = join(cwd, '.opencode', 'artifacts', 'gate-status.md');
  try {
    let raw = await readFile(gatePath, 'utf8');
    raw = raw.replace(/Gate 1[^]*?WAITING_FOR_APPROVAL/, 'Gate 1 | Plan Approval | ✅ PASS');
    raw = raw.replace(/⏸️ WAITING_FOR_APPROVAL/, '✅ PASS');
    raw += `\n**Approved:** ${new Date().toISOString()} — User selected APPROVE via question modal\n`;
    await writeFile(gatePath, raw, 'utf8');
  } catch {
    await createGateWaiting(cwd, 'plan-approved.md');
    const { writeFile: wf2, readFile: rf2 } = await import('node:fs/promises');
    let r = await rf2(gatePath, 'utf8');
    r = r.replace('WAITING_FOR_APPROVAL', '✅ PASS');
    await wf2(gatePath, r, 'utf8');
  }
  return gatePath;
}
