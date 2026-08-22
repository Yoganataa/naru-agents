// ─── mcp-manager.mjs ── Unified MCP Manager (Vibe-Coder Friendly) ───────────
// Single entry for all 6 MCPs: context7, serena, codegraph, lean-ctx, codebase-memory-mcp, roblox-studio
// Design: `naru mcp` (no args) = status, `naru mcp set <mcp> <value>` = set, `naru mcp validate` = probe
// PM-approved: no spam `naru context7`, `naru serena`, ... — one `naru mcp` to rule them all
// ──────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileExists, discoverMCPServers } from './smart-discovery.mjs';
import { printBanner } from './banner.mjs';
import { maskKey, validateKeyFormat, probeContext7Key, setContext7Key, removeContext7Key, getContext7Key } from './context7-manager.mjs';

const execAsync = promisify(exec);

const MCP_LIST = ['context7', 'serena', 'codegraph', 'lean-ctx', 'codebase-memory-mcp', 'roblox-studio'];

/**
 * Get global opencode.json path
 */
function getConfigPath() {
  return join(homedir(), '.config', 'opencode', 'opencode.json');
}

/**
 * Mask any secret for display
 */
function maskSecret(val) {
  if (!val) return '(not set)';
  if (val.length <= 8) return '***';
  return `${val.slice(0, 6)}***${val.slice(-3)}`;
}

/**
 * Show unified status for all MCPs (vibe shortcut: `naru mcp`)
 */
async function showStatus() {
  const C = { green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m' };
  console.log(`${C.bold}MCP Unified Status (6 servers):${C.reset}\n`);

  const mcp = await discoverMCPServers();
  for (const name of MCP_LIST) {
    const info = mcp[name];
    if (!info) continue;
    let icon;
    if (!info.available) icon = `${C.yellow}○ NOT INSTALLED${C.reset}`;
    else if (info.needsInit) icon = `${C.yellow}◐ INSTALLED — NOT INITIALIZED${C.reset}`;
    else if (info.needsKey) icon = `${C.yellow}◐ AVAILABLE (Degraded)${C.reset}`;
    else icon = `${C.green}✓ AVAILABLE${C.reset}`;
    console.log(`  ${C.bold}${name.padEnd(22)}${C.reset} [${icon}]`);
    console.log(`    ${C.dim}${info.source}${C.reset}`);
    if (info.needsInit) console.log(`    ${C.cyan}→ fix: naru mcp init ${name}  (or: codegraph init)${C.reset}`);
    if (info.needsKey) console.log(`    ${C.cyan}→ fix: naru mcp set context7 ctx7sk_...${C.reset}`);
  }

  // Context7 key detail (masked)
  const { key, source } = await getContext7Key();
  console.log(`\n${C.bold}Context7 Key:${C.reset} ${key ? `${C.green}${maskKey(key)}${C.reset} (${source})` : `${C.yellow}not set — fallback to webfetch${C.reset}`}`);
  console.log(`${C.dim}  Set: naru mcp set context7 ctx7sk_...  |  Validate: naru mcp validate context7${C.reset}\n`);
}

/**
 * Handle `naru mcp set <mcp> <value>`
 * Vibe: `naru mcp set context7` (no value) → prompt hidden input
 */
async function handleSet(mcpName, value) {
  const name = (mcpName || '').toLowerCase();
  if (!name || !MCP_LIST.includes(name)) {
    console.error(`\x1b[31m✗ Unknown MCP '${mcpName}'. Available: ${MCP_LIST.join(', ')}\x1b[0m`);
    console.log('\x1b[2mExample: naru mcp set context7 ctx7sk_...\x1b[0m');
    process.exit(1);
  }

  if (name === 'context7') {
    let key = value;
    if (!key) {
      const { createInterface } = await import('node:readline/promises');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        console.log('\x1b[36mPaste Context7 API key (ctx7sk_...) — hidden input.\x1b[0m');
        console.log('\x1b[2mGet: https://context7.com/dashboard → API Keys\x1b[0m\n');
        key = (await rl.question('ctx7sk_ key: ')).trim();
      } finally { rl.close(); }
    }
    if (!key) {
      console.error('\x1b[31m✗ No key provided.\x1b[0m');
      process.exit(1);
    }
    const fmt = validateKeyFormat(key);
    if (!fmt.valid) {
      console.error(`\x1b[31m✗ Invalid: ${fmt.reason}\x1b[0m`);
      process.exit(1);
    }
    console.log(`\nValidating ${maskKey(key)} ...`);
    const probe = await probeContext7Key(key);
    if (!probe.ok) {
      console.log(`\x1b[33m⚠ Probe: ${probe.reason}${probe.status ? ` (HTTP ${probe.status})` : ''}\x1b[0m`);
      console.log('\x1b[2mSaving anyway — validate later: naru mcp validate context7\x1b[0m\n');
    } else {
      console.log(`\x1b[32m✓ Probe ok${probe.status ? ` (HTTP ${probe.status})` : ''}\x1b[0m\n`);
    }
    await setContext7Key(key);
    console.log(`\x1b[32m✓ Saved to ${getConfigPath()} (preserved other MCPs)\x1b[0m`);
    console.log(`\x1b[32mRun: naru mcp status — context7 should be ✓\x1b[0m\n`);
    return;
  }

  // For other MCPs, `set` means configure command path (advanced)
  if (['serena', 'codegraph', 'lean-ctx', 'codebase-memory-mcp'].includes(name)) {
    if (!value) {
      console.error(`\x1b[31m✗ Usage: naru mcp set ${name} <command_path>\x1b[0m`);
      console.log(`\x1b[2mExample: naru mcp set codegraph "C:/tools/codegraph.exe"\x1b[0m`);
      process.exit(1);
    }
    // Write custom command to opencode.json
    const cfgPath = getConfigPath();
    let cfg = {};
    try {
      const raw = await readFile(cfgPath, 'utf8');
      cfg = JSON.parse(raw);
    } catch { cfg = {}; }
    cfg.$schema = cfg.$schema || 'https://opencode.ai/config.json';
    cfg.mcp = cfg.mcp || {};
    cfg.mcp[name] = cfg.mcp[name] || {};
    // Support comma-separated command
    const cmd = value.includes(',') ? value.split(',').map(s => s.trim()) : [value];
    cfg.mcp[name].command = cmd;
    cfg.mcp[name].enabled = true;
    await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
    console.log(`\x1b[32m✓ Set ${name} command → ${cmd.join(' ')}\x1b[0m`);
    return;
  }

  console.error(`\x1b[33m⚠ 'set' not yet supported for '${name}'. Use: naru mcp status\x1b[0m`);
}

/**
 * Handle `naru mcp validate [mcp]`
 */
async function handleValidate(mcpName) {
  const target = (mcpName || 'all').toLowerCase();
  if (target === 'context7' || target === 'all') {
    const { key } = await getContext7Key();
    if (!key) {
      console.error('\x1b[33m⚠ No Context7 key to validate. Run: naru mcp set context7 ctx7sk_...\x1b[0m');
      if (target === 'context7') process.exit(1);
    } else {
      console.log(`Validating Context7 ${maskKey(key)} ...`);
      const fmt = validateKeyFormat(key);
      if (!fmt.valid) {
        console.error(`\x1b[31m✗ Format invalid: ${fmt.reason}\x1b[0m`);
        if (target === 'context7') process.exit(1);
      } else {
        console.log('\x1b[32m✓ Format valid\x1b[0m — probing https://mcp.context7.com/mcp ...');
        const probe = await probeContext7Key(key);
        if (probe.ok) console.log(`\x1b[32m✓ Valid! HTTP ${probe.status || 200}\x1b[0m`);
        else console.error(`\x1b[31m✗ Probe failed: ${probe.reason}${probe.status ? ` (HTTP ${probe.status})` : ''}\x1b[0m`);
      }
    }
  }
  if (target === 'all' || target === 'codegraph') {
    try {
      const { stdout } = await execAsync('codegraph status 2>&1');
      if (stdout.includes('Not initialized')) console.log('\x1b[33m⚠ codegraph: Not initialized — run: naru mcp init codegraph\x1b[0m');
      else if (stdout.includes('Index is up to date')) console.log('\x1b[32m✓ codegraph: Index ready\x1b[0m');
      else console.log(`codegraph: ${stdout.split('\n')[0]}`);
    } catch (e) {
      console.log(`\x1b[33m⚠ codegraph: ${e.message}\x1b[0m`);
    }
  }
  if (target !== 'all' && target !== 'context7' && target !== 'codegraph') {
    console.log(`\x1b[2mValidate for '${target}' not yet implemented — use: naru mcp status\x1b[0m`);
  }
}

/**
 * Handle `naru mcp init [mcp]` — self-heal
 */
async function handleInit(mcpName) {
  const target = (mcpName || 'codegraph').toLowerCase();
  if (target === 'codegraph' || target === 'all') {
    try {
      const { stdout } = await execAsync('codegraph status 2>&1');
      if (!stdout.includes('Not initialized')) {
        console.log('\x1b[32m✓ codegraph already initialized\x1b[0m');
      } else {
        console.log('Running \x1b[36mcodegraph init\x1b[0m ...');
        const { stdout: out } = await execAsync('codegraph init 2>&1');
        console.log(`\x1b[32m✓ ${out.match(/Indexed \d+ files/)?.[0] || 'Indexed'}\x1b[0m`);
      }
    } catch (e) {
      try {
        const { stdout: out } = await execAsync('codegraph init 2>&1');
        console.log(`\x1b[32m✓ ${out.match(/Indexed \d+ files/)?.[0] || 'done'}\x1b[0m`);
      } catch (e2) {
        console.error(`\x1b[31m✗ codegraph init failed: ${e2.message}\x1b[0m`);
      }
    }
  } else {
    console.log(`\x1b[2mInit for '${target}' not needed — only codegraph requires init\x1b[0m`);
  }
}

/**
 * Handle `naru mcp remove <mcp>`
 */
async function handleRemove(mcpName) {
  const name = (mcpName || '').toLowerCase();
  if (name === 'context7') {
    const res = await removeContext7Key();
    console.log(res.removed ? '\x1b[32m✓ Removed Context7 key (fallback to webfetch)\x1b[0m' : '\x1b[33m⚠ No key found\x1b[0m');
  } else {
    console.error(`\x1b[33m⚠ Remove not supported for '${name}'. Use: naru mcp remove context7\x1b[0m`);
  }
}

/**
 * CLI entry: `naru mcp [sub] [args]`
 * Vibe shortcuts: `naru mcp` = status, `naru mcp set` without mcp → interactive
 */
export async function runMcpCLI(rawArgs = []) {
  const args = rawArgs.map(String);
  const sub = (args[0] || 'status').toLowerCase();

  // Normalize aliases: `naru mcp ctx7` → `context7`
  const normalizeMcp = (s) => {
    if (!s) return s;
    const l = s.toLowerCase();
    if (['ctx7', 'c7', 'context'].includes(l)) return 'context7';
    if (['cg', 'graph'].includes(l)) return 'codegraph';
    return l;
  };

  // `naru mcp` (no args) → opentui TUI (vibe) — fallback to CLI status if not TTY
  if (args.length === 0) {
    if (process.stdin.isTTY) {
      const { launchMcpTui } = await import('./tui/mcp-opentui.mjs');
      await launchMcpTui();
      return;
    }
    printBanner('setup');
    await showStatus();
    return;
  }

  if (['status', 'st', 'info', 'list', 'ls', '--status'].includes(sub)) {
    printBanner('setup');
    await showStatus();
    return;
  }

  if (['set', 'add', 'config', '--set'].includes(sub)) {
    printBanner('setup');
    const mcpName = normalizeMcp(args[1]);
    const value = args.slice(2).join(' ').trim() || undefined;
    // Vibe: `naru mcp set` → interactive pick
    if (!mcpName) {
      console.log('\x1b[1mWhich MCP to configure?\x1b[0m');
      console.log(`  ${MCP_LIST.map((m, i) => `[${i + 1}] ${m}`).join('  ')}`);
      const { createInterface } = await import('node:readline/promises');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        const ans = (await rl.question('Pick number or name (default: context7): ')).trim() || 'context7';
        const num = parseInt(ans, 10);
        const picked = !isNaN(num) && num >= 1 && num <= MCP_LIST.length ? MCP_LIST[num - 1] : normalizeMcp(ans);
        await handleSet(picked, undefined);
      } finally { rl.close(); }
      return;
    }
    await handleSet(mcpName, value);
    return;
  }

  if (['validate', 'test', 'check', '--validate'].includes(sub)) {
    printBanner('setup');
    const mcpName = normalizeMcp(args[1]);
    await handleValidate(mcpName);
    return;
  }

  if (['init', 'heal', 'sync', '--init'].includes(sub)) {
    printBanner('setup');
    const mcpName = normalizeMcp(args[1]);
    await handleInit(mcpName);
    return;
  }

  if (['remove', 'rm', 'clear', 'unset'].includes(sub)) {
    printBanner('setup');
    const mcpName = normalizeMcp(args[1]);
    await handleRemove(mcpName);
    return;
  }

  // Shorthand: `naru mcp context7` → status for that mcp, `naru mcp context7 ctx7sk_...` → set
  if (MCP_LIST.includes(normalizeMcp(sub))) {
    const mcpName = normalizeMcp(sub);
    const maybeKey = args[1];
    if (maybeKey && mcpName === 'context7' && maybeKey.startsWith('ctx7sk_')) {
      printBanner('setup');
      await handleSet(mcpName, maybeKey);
      return;
    }
    // Show single MCP status
    printBanner('setup');
    const mcp = await discoverMCPServers();
    const info = mcp[mcpName];
    console.log(`${mcpName}: ${info?.source || 'unknown'} [${info?.available ? 'available' : 'not installed'}]`);
    if (mcpName === 'context7') {
      const { key } = await getContext7Key();
      console.log(`Key: ${key ? maskKey(key) : 'not set'}`);
    }
    return;
  }

  if (['help', '--help', '-h'].includes(sub)) {
    console.log(`
Usage:
  naru mcp [command] [mcp] [value]    — Unified MCP manager (vibe-friendly)

Commands:
  (no args)               Show status for all 6 MCPs          → naru mcp
  status                  Same as above                        → naru mcp status
  set <mcp> <value>       Set MCP config (prompt if no value)  → naru mcp set context7 ctx7sk_...
  validate [mcp]          Live-probe key / index               → naru mcp validate  /  validate context7
  init [mcp]              Self-heal (codegraph init)           → naru mcp init
  remove <mcp>            Remove key/config                    → naru mcp remove context7
  help                    Show this help

MCPs: ${MCP_LIST.join(', ')}

Vibe Shortcuts:
  naru mcp                         → status (no args)
  naru mcp set                     → interactive pick
  naru mcp set context7            → prompt hidden key input
  naru mcp context7 ctx7sk_...     → shorthand set
  naru mcp validate                → validate all
  naru mcp init                    → heal codegraph

Examples:
  naru mcp
  naru mcp set context7
  naru mcp set context7 ctx7sk_abc123...
  naru mcp validate context7
  naru mcp init codegraph
`);
    return;
  }

  console.error(`\x1b[31mUnknown 'naru mcp ${sub}'. Run: naru mcp help\x1b[0m`);
  process.exit(1);
}
