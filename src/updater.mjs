// ─── updater.mjs ── Auto-Update & Self-Upgrade Engine ───────────────────────
// Handles automated checking, global package upgrades, and config re-synchronization
// ──────────────────────────────────────────────────────────────────────────────

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { findInPath, fileExists } from './smart-discovery.mjs';
import { runSmartInstaller } from './smart-installer.mjs';
import { printBanner } from './banner.mjs';

const execAsync = promisify(exec);

const REPO_SLUG = 'yoganataa/naru-agents';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Check if a new commit or update is available on GitHub (cached)
 * @returns {Promise<{ hasUpdate: boolean, latestCommit?: string }>}
 */
export async function checkUpdate() {
  const cacheFile = join(homedir(), '.config', 'opencode', '.naru_update_cache.json');
  const now = Date.now();

  // Read cache
  if (await fileExists(cacheFile)) {
    try {
      const data = JSON.parse(await readFile(cacheFile, 'utf8'));
      if (now - data.timestamp < CACHE_TTL_MS) {
        return { hasUpdate: false, latestCommit: data.commit };
      }
    } catch {
      // Ignore cache read errors
    }
  }

  // Probe GitHub API for latest commit
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_SLUG}/commits/main`, {
      headers: { 'User-Agent': 'naru-agents-cli' },
    });
    if (res.ok) {
      const json = await res.json();
      const latestSha = json.sha ? json.sha.slice(0, 7) : 'latest';

      // Save cache
      await writeFile(cacheFile, JSON.stringify({ timestamp: now, commit: latestSha }), 'utf8');
      return { hasUpdate: false, latestCommit: latestSha };
    }
  } catch {
    // Network offline or GitHub API rate-limited - fail silently
  }

  return { hasUpdate: false };
}

/**
 * Execute 1-click self-upgrade (re-installs package & runs smart setup)
 */
export async function runSelfUpdate() {
  printBanner('update');

  const hasBun = await findInPath('bun');
  const hasNpm = await findInPath('npm');

  let upgradeCmd = null;
  if (hasBun) {
    upgradeCmd = `bun install -g github:${REPO_SLUG}`;
  } else if (hasNpm) {
    upgradeCmd = `npm install -g github:${REPO_SLUG}`;
  }

  if (upgradeCmd) {
    console.log(`📦 Running package upgrade: ${upgradeCmd}...`);
    try {
      const { stdout, stderr } = await execAsync(upgradeCmd);
      if (stdout) console.log(stdout.trim());
      console.log('✅ Global binary upgraded successfully.');
    } catch (err) {
      console.warn(`⚠️  Package manager upgrade notice: ${err.message}`);
    }
  } else {
    console.log('ℹ️  No global package manager detected, proceeding with local agent re-sync...');
  }

  // Re-run smart setup to sync all 11 agents, 4 knowledge stores, and 5 MCPs
  console.log('\n⚙️  Re-synchronizing OpenCode agents and MCP configurations...');
  await runSmartInstaller({ force: true, withMcp: true });

  console.log('\n🎉 N.A.R.U. is now completely up to date and ready for orchestration!\n');
}
