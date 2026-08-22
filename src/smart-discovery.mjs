// ─── smart-discovery.mjs ── Cross-Platform Discovery Engine ─────────────────
// Dynamically discovers binaries, package managers, and OpenCode environment
// ──────────────────────────────────────────────────────────────────────────────

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { homedir, platform } from 'node:os';

const execAsync = promisify(exec);

/**
 * Detect operating system details
 * @returns {{ os: string, isWindows: boolean, isMac: boolean, isLinux: boolean }}
 */
export function detectOS() {
  const currentPlatform = platform();
  return {
    os: currentPlatform,
    isWindows: currentPlatform === 'win32',
    isMac: currentPlatform === 'darwin',
    isLinux: currentPlatform === 'linux',
  };
}

/**
 * Check if a command is available in system PATH
 * @param {string} cmd
 * @returns {Promise<string|null>} Path to executable or null
 */
export async function findInPath(cmd) {
  const { isWindows } = detectOS();
  const lookupCmd = isWindows ? `where.exe ${cmd}` : `which ${cmd}`;

  try {
    const { stdout } = await execAsync(lookupCmd);
    const lines = stdout.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.length > 0 ? normalizePath(lines[0]) : null;
  } catch {
    return null;
  }
}

/**
 * Check if a file path exists and is accessible
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize path to use forward slashes (universal for OpenCode)
 * @param {string} p
 * @returns {string}
 */
export function normalizePath(p) {
  if (!p) return p;
  return resolve(p).replace(/\\/g, '/');
}

/**
 * Detect available package managers
 * @returns {Promise<Record<string, boolean>>}
 */
export async function detectPackageManagers() {
  const managers = ['bun', 'npm', 'pnpm', 'cargo', 'pip', 'pipx', 'brew', 'winget', 'choco'];
  const results = {};

  await Promise.all(
    managers.map(async (pm) => {
      const path = await findInPath(pm);
      results[pm] = path !== null;
    })
  );

  return results;
}


/**
 * Discover dynamic locations for all 5 MCP servers
 * @returns {Promise<Record<string, { available: boolean, type: string, command?: string[], url?: string, source?: string }>>}
 */
export async function discoverMCPServers() {
  const { isWindows } = detectOS();
  const home = homedir();
  const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');

  // Helper: check context7 API key (ctx7sk_*) in env or opencode.json — strict ctx7sk only
  async function checkContext7Key() {
    if (process.env.CONTEXT7_API_KEY && process.env.CONTEXT7_API_KEY.startsWith('ctx7sk')) return true;
    try {
      const { readFile } = await import('node:fs/promises');
      const globalConfigPath = join(homedir(), '.config', 'opencode', 'opencode.json');
      const content = await readFile(globalConfigPath, 'utf8');
      if (content.includes('ctx7sk')) return true;
      // Also check env-style key in config (e.g., "CONTEXT7_API_KEY": "ctx7sk_...")
      if (/ctx7sk_[A-Za-z0-9_-]{10,}/.test(content)) return true;
    } catch {}
    return false;
  }

  const hasContext7Key = await checkContext7Key();

  const results = {
    'context7': {
      available: true,
      type: 'remote',
      url: 'https://mcp.context7.com/mcp',
      source: hasContext7Key
        ? 'Remote Cloud Endpoint (Zero install required) — API key configured ✓'
        : 'Remote Cloud Endpoint (Zero install) — ⚠ No ctx7sk key: will fallback to webfetch (set CONTEXT7_API_KEY for full docs)',
      needsKey: !hasContext7Key,
    },
    'serena': {
      available: false,
      type: 'local',
      command: ['serena', 'start-mcp-server', '--project-from-cwd'],
      source: null,
    },
    'codegraph': {
      available: false,
      type: 'local',
      command: ['codegraph', 'serve', '--mcp'],
      source: null,
    },
    'lean-ctx': {
      available: false,
      type: 'local',
      command: ['lean-ctx'],
      source: null,
    },
    'codebase-memory-mcp': {
      available: false,
      type: 'local',
      command: ['codebase-memory-mcp'],
      source: null,
    },
  };

  // 1. Discover serena
  const serenaPath = await findInPath('serena');
  if (serenaPath) {
    results.serena.available = true;
    results.serena.source = `Found in PATH: ${serenaPath}`;
  }

  // 2. Discover codegraph — binary + index health (self-healing aware)
  const codegraphPath = await findInPath('codegraph');
  if (codegraphPath) {
    results.codegraph.available = true;
    // Check if index is initialized (self-healing gap: binary exists but .codegraph missing)
    const codegraphIndexDb = join(process.cwd(), '.codegraph', 'codegraph.db');
    const codegraphDir = join(process.cwd(), '.codegraph');
    const hasIndexDb = await fileExists(codegraphIndexDb);
    const hasIndexDir = await fileExists(codegraphDir);
    if (hasIndexDb) {
      // Try to verify index is not stale via codegraph status
      try {
        const { stdout } = await execAsync('codegraph status 2>&1');
        if (stdout.includes('Not initialized')) {
          results.codegraph.source = `Found in PATH: ${codegraphPath} (⚠ Index not initialized — run 'codegraph init' or 'naru init')`;
          results.codegraph.needsInit = true;
        } else if (stdout.includes('Index is up to date') || stdout.includes('Files:')) {
          results.codegraph.source = `Found in PATH: ${codegraphPath} (✓ Index ready)`;
          results.codegraph.indexReady = true;
        } else {
          results.codegraph.source = `Found in PATH: ${codegraphPath}`;
        }
      } catch {
        results.codegraph.source = `Found in PATH: ${codegraphPath}${hasIndexDir ? ' (Index check skipped)' : ' (⚠ Index not initialized)'}`;
        if (!hasIndexDir) results.codegraph.needsInit = true;
      }
    } else {
      results.codegraph.source = `Found in PATH: ${codegraphPath} (⚠ Index not initialized — run 'codegraph init' to enable call-graph)`;
      results.codegraph.needsInit = true;
    }
  }

  // 3. Discover lean-ctx
  const leanCtxPath = await findInPath('lean-ctx');
  if (leanCtxPath) {
    results['lean-ctx'].available = true;
    results['lean-ctx'].command = [leanCtxPath];
    results['lean-ctx'].source = `Found in PATH: ${leanCtxPath}`;
  } else {
    // Check common Cargo bin location
    const cargoBin = isWindows
      ? join(home, '.cargo', 'bin', 'lean-ctx.exe')
      : join(home, '.cargo', 'bin', 'lean-ctx');
    if (await fileExists(cargoBin)) {
      results['lean-ctx'].available = true;
      results['lean-ctx'].command = [normalizePath(cargoBin)];
      results['lean-ctx'].source = `Found in Cargo bin: ${normalizePath(cargoBin)}`;
    }
  }

  // 4. Discover codebase-memory-mcp
  const cbmPath = await findInPath('codebase-memory-mcp');
  if (cbmPath) {
    results['codebase-memory-mcp'].available = true;
    results['codebase-memory-mcp'].command = [cbmPath];
    results['codebase-memory-mcp'].source = `Found in PATH: ${cbmPath}`;
  } else {
    // Check common installation paths
    const candidatePaths = isWindows
      ? [
          join(localAppData, 'Programs', 'codebase-memory-mcp', 'codebase-memory-mcp.exe'),
          join(home, 'AppData', 'Local', 'Programs', 'codebase-memory-mcp', 'codebase-memory-mcp.exe'),
        ]
      : [
          join(home, '.local', 'bin', 'codebase-memory-mcp'),
          '/usr/local/bin/codebase-memory-mcp',
        ];

    for (const cand of candidatePaths) {
      if (await fileExists(cand)) {
        results['codebase-memory-mcp'].available = true;
        results['codebase-memory-mcp'].command = [normalizePath(cand)];
        results['codebase-memory-mcp'].source = `Found at: ${normalizePath(cand)}`;
        break;
      }
    }
  }

  // 5. Discover roblox-studio (Built-in Native Roblox Studio MCP Server)
  const { isLinux } = detectOS();
  if (isLinux) {
    results['roblox-studio'] = {
      available: false,
      type: 'local',
      command: null,
      source: 'Unavailable on Linux (Roblox Studio only supports Windows & macOS)',
    };
  } else {
    const robloxDir = isWindows
      ? join(localAppData, 'Roblox')
      : join(home, 'Library', 'Application Support', 'Roblox');
    const robloxMcpBat = isWindows
      ? join(robloxDir, 'mcp.bat')
      : join(robloxDir, 'mcp.sh');

    if (await fileExists(robloxMcpBat)) {
      results['roblox-studio'] = {
        available: true,
        type: 'local',
        command: isWindows ? ['cmd.exe', '/c', normalizePath(robloxMcpBat)] : [normalizePath(robloxMcpBat)],
        source: 'Built-in Roblox Studio MCP Server (Active)',
      };
    } else if (await fileExists(robloxDir)) {
      results['roblox-studio'] = {
        available: true,
        type: 'local',
        command: isWindows ? ['cmd.exe', '/c', normalizePath(robloxMcpBat)] : [normalizePath(robloxMcpBat)],
        source: 'Roblox Installed (Ready: Toggle in Studio Assistant > Manage MCP Servers)',
      };
    }
  }

  return results;
}


