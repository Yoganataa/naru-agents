// ─── plan-manager.mjs ── Naru Plan (Gate 1) ─────────────────────────────────
// `naru plan` — creates plan-*.md + gate-status.md (WAITING) → question Approve
// Implements Opencode Plan mode (edit deny) + LangGraph HITL checkpoint
// ──────────────────────────────────────────────────────────────────────────────

import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { printBanner } from './banner.mjs';
import { checkGate1, createGateWaiting, approveGate1 } from './gate-enforcer.mjs';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'plan';
}

/**
 * Run `naru plan` — interactive or via args
 * @param {string[]} rawArgs
 */
export async function runPlanManager(rawArgs = []) {
  const args = rawArgs.map(String);
  const sub = (args[0] || '').toLowerCase();

  // Subcommands: `naru plan approve` / `naru plan status`
  if (sub === 'status' || sub === 'show') {
    const gate = await checkGate1();
    console.log(`\nGate 1: ${gate.approved ? '✅ PASS' : '⏸️ WAITING_FOR_APPROVAL'}`);
    console.log(`Reason: ${gate.reason}`);
    console.log(`File: ${gate.gateFile}\n`);
    return;
  }
  if (sub === 'approve' || sub === '--approve' || sub === '-a') {
    await approveGate1();
    console.log('\x1b[32m✓ Gate 1 APPROVED — developer edits now allowed\x1b[0m');
    console.log('\x1b[2mNext: naru mcp / code edits will pass Gate 1 check\x1b[0m\n');
    return;
  }
  if (sub === 'reject' || sub === 'abort') {
    console.log('\x1b[33m⚠ Gate 1 remains WAITING — no edits allowed until Approve\x1b[0m\n');
    return;
  }

  printBanner('setup');
  console.log('\x1b[1mNaru Plan — Gate 1 (Plan Approval) — Opencode Plan Mode\x1b[0m');
  console.log('\x1b[2mCreates plan-*.md + gate-status.md (WAITING) → requires question Approve before any edit\x1b[0m\n');

  // Check existing gate
  const existing = await checkGate1();
  if (existing.approved) {
    console.log(`\x1b[32m✓ Gate 1 already PASS: ${existing.reason}\x1b[0m`);
    console.log('\x1b[2mRun: naru plan --force to create new plan\x1b[0m\n');
    if (!args.includes('--force') && !args.includes('-f')) return;
  }

  // Interactive plan creation
  let goal = args.join(' ').trim();
  // Remove subcommand if it was `create` etc.
  if (['create', 'new', '--force', '-f'].includes(goal.split(' ')[0])) goal = args.slice(1).join(' ').trim();

  if (!goal) {
    if (!process.stdin.isTTY) {
      console.error('\x1b[31m✗ No goal provided. Usage: naru plan "Your feature goal"\x1b[0m');
      console.log('\x1b[2mExample: naru plan "Add Google login with Better-Auth"\x1b[0m');
      process.exit(1);
    }
    const rl = createInterface({ input, output });
    try {
      console.log('\x1b[1mDescribe your goal:\x1b[0m');
      goal = (await rl.question('> ')).trim();
      if (!goal) {
        console.error('\x1b[31m✗ Goal cannot be empty\x1b[0m');
        process.exit(1);
      }
    } finally { rl.close(); }
  }

  const slug = slugify(goal);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const planFile = `plan-${slug}-${timestamp.slice(0, 19)}.md`;
  const artifactsDir = join(process.cwd(), '.opencode', 'artifacts');
  await mkdir(artifactsDir, { recursive: true });
  const planPath = join(artifactsDir, planFile);

  const planContent = `# Plan — ${goal}

**Status:** ⏸️ WAITING_FOR_APPROVAL (Gate 1)
**Created:** ${new Date().toISOString()}
**Gate File:** \`.opencode/artifacts/gate-status.md\`

## Goal
${goal}

## Scope (to be filled by PM)
- [ ] User stories
- [ ] Acceptance criteria
- [ ] Non-functional requirements

## Next
1. Review this plan
2. Run: \`naru plan approve\`  → Gate 1 PASS → developer may edit
3. Or: \`naru plan reject\`  → stays WAITING, no edits

---
*Generated via \`naru plan\` — Opencode Plan mode (edit deny) + LangGraph HITL checkpoint*
`;

  await writeFile(planPath, planContent, 'utf8');
  await createGateWaiting(process.cwd(), planFile);

  console.log(`\n\x1b[32m✓ Plan created: ${planPath}\x1b[0m`);
  console.log(`\x1b[33m⏸️ Gate 1 WAITING_FOR_APPROVAL — edits BLOCKED until Approve\x1b[0m`);
  console.log(`\x1b[2m  File: ${join('.opencode', 'artifacts', 'gate-status.md')}\x1b[0m\n`);

  // Ask for approval via question (if TTY, interactive; else hint)
  if (process.stdin.isTTY) {
    const rl2 = createInterface({ input, output });
    try {
      console.log('\x1b[1mApprove this plan now?\x1b[0m');
      console.log('  [1] Approve → Gate 1 PASS (allow edits)');
      console.log('  [2] Revise  → keep WAITING, edit plan file manually');
      console.log('  [3] Abort   → keep WAITING');
      const ans = (await rl2.question('Select [1/2/3, default 2]: ')).trim() || '2';
      if (ans === '1') {
        await approveGate1();
        console.log('\n\x1b[32m✓ Gate 1 APPROVED — developer edits now allowed\x1b[0m\n');
      } else if (ans === '3') {
        console.log('\n\x1b[33m⚠ Aborted — Gate 1 remains WAITING\x1b[0m\n');
      } else {
        console.log(`\n\x1b[2mKeep WAITING — edit ${planFile} then run: naru plan approve\x1b[0m\n`);
      }
    } finally { rl2.close(); }
  } else {
    console.log('\x1b[2mNon-TTY: run `naru plan approve` to approve, or edit plan file manually\x1b[0m\n');
  }
}
