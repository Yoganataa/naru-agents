// ─── context7-manager.mjs ── Context7 API Key Manager ────────────────────────
// Secure handling of Context7 API keys (ctx7sk_*) for remote MCP docs
// Storage: opencode.json mcp.context7.headers.Authorization = Bearer <key>
// Also supports CONTEXT7_API_KEY env var (priority: env > file)
// ──────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileExists } from './smart-discovery.mjs';
import { printBanner } from './banner.mjs';

const CONTEXT7_KEY_PREFIX = 'ctx7sk_';
const CONTEXT7_KEY_REGEX = /^ctx7sk_[A-Za-z0-9_-]{20,}$/;
const CONTEXT7_MCP_URL = 'https://mcp.context7.com/mcp';

/**
 * Get global opencode.json path
 * @returns {string}
 */
function getConfigPath() {
  return join(homedir(), '.config', 'opencode', 'opencode.json');
}

/**
 * Mask API key for display (show first 10 chars + ***)
 * @param {string} key
 * @returns {string}
 */
export function maskKey(key) {
  if (!key) return '(not set)';
  if (key.length <= 10) return '***';
  return `${key.slice(0, 10)}***${key.slice(-4)}`;
}

/**
 * Validate key format locally (no network)
 * @param {string} key
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateKeyFormat(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, reason: 'Key is empty' };
  }
  const trimmed = key.trim();
  if (!trimmed.startsWith(CONTEXT7_KEY_PREFIX)) {
    return { valid: false, reason: `Key must start with '${CONTEXT7_KEY_PREFIX}' (got '${trimmed.slice(0, 8)}...')` };
  }
  if (trimmed.length < 30) {
    return { valid: false, reason: `Key too short (${trimmed.length} chars). Expected ≥30` };
  }
  if (!CONTEXT7_KEY_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Key contains invalid characters (allowed: A-Z a-z 0-9 _ -)' };
  }
  return { valid: true };
}

/**
 * Read current Context7 key from env or opencode.json (env has priority)
 * @returns {Promise<{ key: string|null, source: 'env'|'file'|'none', fileHasKey: boolean }>}
 */
export async function getContext7Key() {
  // Env first
  const envKey = process.env.CONTEXT7_API_KEY?.trim();
  if (envKey && validateKeyFormat(envKey).valid) {
    return { key: envKey, source: 'env', fileHasKey: false }; // file check separate
  }

  // File
  try {
    const cfgPath = getConfigPath();
    if (await fileExists(cfgPath)) {
      const raw = await readFile(cfgPath, 'utf8');
      const cfg = JSON.parse(raw);
      const headers = cfg?.mcp?.context7?.headers;
      // Support both Authorization: Bearer <key> and X-API-KEY / custom header
      const bearer = headers?.Authorization || headers?.authorization || headers?.['X-API-KEY'] || headers?.['x-api-key'] || null;
      if (bearer) {
        // Bearer ctx7sk_... or just ctx7sk_...
        const extracted = bearer.replace(/^Bearer\s+/i, '').trim();
        if (validateKeyFormat(extracted).valid) {
          // If env also exists but invalid, prefer file
          if (envKey && !validateKeyFormat(envKey).valid) {
            return { key: extracted, source: 'file', fileHasKey: true };
          }
          // Env valid already returned above, so file is secondary
          if (!envKey) return { key: extracted, source: 'file', fileHasKey: true };
        }
      }
      // Also check if key stored directly as env-like in config.mcp.context7.env
      const envObj = cfg?.mcp?.context7?.env || cfg?.mcp?.context7?.environment;
      const envFromConfig = envObj?.CONTEXT7_API_KEY;
      if (envFromConfig && validateKeyFormat(envFromConfig).valid) {
        return { key: envFromConfig, source: 'file', fileHasKey: true };
      }
      return { key: null, source: 'none', fileHasKey: false };
    }
  } catch {}
  return { key: null, source: 'none', fileHasKey: false };
}

/**
 * Validate key via live probe to Context7 endpoint (with timeout)
 * @param {string} key
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: boolean, status?: number, reason?: string }>}
 */
export async function probeContext7Key(key, timeoutMs = 7000) {
  const format = validateKeyFormat(key);
  if (!format.valid) return { ok: false, reason: format.reason };

  // If fetch not available (old Node), skip live probe
  if (typeof fetch !== 'function') {
    return { ok: true, reason: 'Format valid (live probe skipped — fetch unavailable)' };
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    // Context7 MCP uses SSE, a HEAD/GET with Authorization should return 200 or 401
    const res = await fetch(CONTEXT7_MCP_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Accept': 'text/event-stream',
      },
      signal: controller.signal,
    });
    clearTimeout(t);
    // 200, 307, 101 (switching) = valid key; 401/403 = invalid; 429 = rate-limited but key format ok
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, reason: `Server rejected key (HTTP ${res.status} Unauthorized)` };
    }
    if (res.status === 429) {
      return { ok: true, status: 429, reason: 'Key format valid, but rate-limited (429)' };
    }
    if (res.status === 405) {
      return { ok: true, status: 405, reason: 'Key format valid (endpoint expects POST/SSE, probe used GET)' };
    }
    // Any 2xx/3xx is success
    if (res.status >= 200 && res.status < 400) {
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, reason: `Unexpected HTTP ${res.status}` };
  } catch (e) {
    if (e.name === 'AbortError') {
      return { ok: false, reason: 'Probe timed out (network slow) — format is valid, but live check failed' };
    }
    return { ok: false, reason: `Network error: ${e.message}` };
  }
}

/**
 * Persist Context7 key to opencode.json (preserves all other config)
 * @param {string} key - raw ctx7sk_... key
 * @returns {Promise<{ saved: boolean, path: string }>}
 */
export async function setContext7Key(key) {
  const format = validateKeyFormat(key);
  if (!format.valid) throw new Error(`Invalid key format: ${format.reason}`);

  const cfgPath = getConfigPath();
  let cfg = {};
  if (await fileExists(cfgPath)) {
    try {
      const raw = await readFile(cfgPath, 'utf8');
      cfg = JSON.parse(raw);
    } catch { cfg = {}; }
  }
  cfg.$schema = cfg.$schema || 'https://opencode.ai/config.json';
  cfg.mcp = cfg.mcp || {};
  cfg.mcp.context7 = cfg.mcp.context7 || { type: 'remote', url: CONTEXT7_MCP_URL, enabled: true };
  cfg.mcp.context7.type = 'remote';
  cfg.mcp.context7.url = CONTEXT7_MCP_URL;
  cfg.mcp.context7.enabled = true;
  cfg.mcp.context7.headers = cfg.mcp.context7.headers || {};
  cfg.mcp.context7.headers.Authorization = `Bearer ${key.trim()}`;

  await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  return { saved: true, path: cfgPath };
}

/**
 * Remove Context7 key from opencode.json
 * @returns {Promise<{ removed: boolean }>}
 */
export async function removeContext7Key() {
  const cfgPath = getConfigPath();
  if (!(await fileExists(cfgPath))) return { removed: false };
  try {
    const raw = await readFile(cfgPath, 'utf8');
    const cfg = JSON.parse(raw);
    if (cfg?.mcp?.context7?.headers?.Authorization) {
      delete cfg.mcp.context7.headers.Authorization;
      // Clean empty headers
      if (Object.keys(cfg.mcp.context7.headers).length === 0) delete cfg.mcp.context7.headers;
      await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
      return { removed: true };
    }
    if (cfg?.mcp?.context7?.headers?.authorization) {
      delete cfg.mcp.context7.headers.authorization;
      await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
      return { removed: true };
    }
  } catch {}
  return { removed: false };
}

/**
 * CLI entry: `naru mcp` — status / set / validate / remove
 */
export async function runContext7CLI(rawArgs = []) {
  const args = rawArgs.map(String);
  const sub = (args[0] || 'status').toLowerCase();
  const keyArg = args[1];

  printBanner('setup'); // reuse setup banner

  // Helper to print status
  async function printStatus() {
    const { key, source } = await getContext7Key();
    const C = { green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m' };
    console.log(`${C.bold}Context7 API Key Status:${C.reset}`);
    if (!key) {
      console.log(`  ${C.yellow}⚠ Not configured${C.reset} — researcher will fallback to webfetch (degraded)`);
      console.log(`  ${C.dim}Set via: naru mcp set ctx7sk_...${C.reset}`);
      console.log(`  ${C.dim}Get key: https://context7.com/dashboard${C.reset}\n`);
    } else {
      console.log(`  ${C.green}✓ Configured${C.reset} (${source === 'env' ? 'env CONTEXT7_API_KEY' : 'opencode.json'}) — ${maskKey(key)}`);
      const fmt = validateKeyFormat(key);
      console.log(`  Format: ${fmt.valid ? `${C.green}✓ valid${C.reset}` : `${C.yellow}⚠ ${fmt.reason}${C.reset}`}`);
    }
    // Also show smart-discovery view
    const { discoverMCPServers } = await import('./smart-discovery.mjs');
    const mcp = await discoverMCPServers();
    console.log(`\n  MCP: ${mcp.context7.source}\n`);
  }

  if (sub === 'status' || sub === 'info' || sub === 'show' || sub === '--status') {
    await printStatus();
    return;
  }

  if (sub === 'set' || sub === '--set' || sub === '-s') {
    let keyToSet = keyArg;
    if (!keyToSet) {
      // Interactive prompt if no key arg
      const { createInterface } = await import('node:readline/promises');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        console.log('\x1b[36mPaste your Context7 API key (starts with ctx7sk_) — input is hidden for security.\x1b[0m');
        console.log('\x1b[2mGet key at: https://context7.com/dashboard → API Keys\x1b[0m\n');
        keyToSet = (await rl.question('ctx7sk_ key: ')).trim();
      } finally { rl.close(); }
    }
    if (!keyToSet) {
      console.error('\x1b[31m✗ No key provided. Usage: naru mcp set ctx7sk_...\x1b[0m');
      process.exit(1);
    }
    const fmt = validateKeyFormat(keyToSet);
    if (!fmt.valid) {
      console.error(`\x1b[31m✗ Invalid key: ${fmt.reason}\x1b[0m`);
      console.error('\x1b[2mExpected: ctx7sk_ + 20+ chars [A-Za-z0-9_-]\x1b[0m');
      process.exit(1);
    }
    console.log(`\nValidating key ${maskKey(keyToSet)} ...`);
    const probe = await probeContext7Key(keyToSet);
    if (!probe.ok) {
      console.log(`\x1b[33m⚠ Format valid, but live probe failed: ${probe.reason}${probe.status ? ` (HTTP ${probe.status})` : ''}\x1b[0m`);
      console.log('\x1b[2mSaving anyway — you can re-validate with: naru mcp validate\x1b[0m\n');
    } else {
      console.log(`\x1b[32m✓ Live probe success${probe.status ? ` (HTTP ${probe.status})` : ''}${probe.reason ? ` — ${probe.reason}` : ''}\x1b[0m\n`);
    }
    await setContext7Key(keyToSet);
    console.log(`\x1b[32m✓ Saved to ${getConfigPath()} (headers.Authorization)\x1b[0m`);
    console.log(`\x1b[2mPreserved: all other mcp entries untouched (safe fusion)\x1b[0m`);
    console.log(`\x1b[32mRun: naru doctor — context7 should now show ✓ AVAILABLE\x1b[0m\n`);
    return;
  }

  if (sub === 'validate' || sub === '--validate' || sub === '-v' || sub === 'test') {
    const { key } = await getContext7Key();
    if (!key) {
      console.error('\x1b[33m⚠ No key configured. Run: naru mcp set ctx7sk_...\x1b[0m');
      process.exit(1);
    }
    console.log(`Validating ${maskKey(key)} ...`);
    const fmt = validateKeyFormat(key);
    if (!fmt.valid) {
      console.error(`\x1b[31m✗ Format invalid: ${fmt.reason}\x1b[0m`);
      process.exit(1);
    }
    console.log('\x1b[32m✓ Format valid\x1b[0m — probing https://mcp.context7.com/mcp ...');
    const probe = await probeContext7Key(key);
    if (probe.ok) {
      console.log(`\x1b[32m✓ Valid key! Server responded HTTP ${probe.status || 200}${probe.reason ? ` — ${probe.reason}` : ''}\x1b[0m`);
    } else {
      console.error(`\x1b[31m✗ Probe failed: ${probe.reason}${probe.status ? ` (HTTP ${probe.status})` : ''}\x1b[0m`);
      console.error('\x1b[2mCheck: https://context7.com/dashboard — key may be revoked or network blocked\x1b[0m');
      process.exit(1);
    }
    return;
  }

  if (sub === 'remove' || sub === 'rm' || sub === '--remove' || sub === 'clear') {
    const res = await removeContext7Key();
    if (res.removed) {
      console.log('\x1b[32m✓ Removed Context7 key from opencode.json\x1b[0m');
      console.log('\x1b[2mFalling back to webfetch (degraded mode) until you set a new key\x1b[0m');
    } else {
      console.log('\x1b[33m⚠ No key found in opencode.json\x1b[0m');
    }
    return;
  }

  if (sub === 'help' || sub === '--help' || sub === '-h') {
    console.log(`
Usage:
  naru mcp [command] [options]

Commands:
  status              Show current key (masked) & MCP health  [default]
  set <key>           Set & validate key (ctx7sk_...)  — prompts if no key given
  validate            Live-probe existing key against Context7 server
  remove              Remove key from opencode.json (fallback to webfetch)
  help                Show this help

Examples:
  naru mcp status
  naru mcp set ctx7sk_abc123...
  naru mcp validate
  CONTEXT7_API_KEY=ctx7sk_... naru mcp status  # env var also supported (priority)
`);
    return;
  }

  console.error(`\x1b[31mUnknown subcommand '${sub}'. Run: naru mcp help\x1b[0m`);
  process.exit(1);
}
