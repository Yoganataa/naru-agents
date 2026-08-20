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

  const results = {
    'context7': {
      available: true,
      type: 'remote',
      url: 'https://mcp.context7.com/mcp',
      source: 'Remote Cloud Endpoint (Zero install required)',
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

  // 2. Discover codegraph
  const codegraphPath = await findInPath('codegraph');
  if (codegraphPath) {
    results.codegraph.available = true;
    results.codegraph.source = `Found in PATH: ${codegraphPath}`;
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

  return results;
}
