// ─── backup-manager.mjs ── Snapshot & Rollback Engine ───────────────────────
// Creates automated backups before modifications and supports 1-click restore
// ──────────────────────────────────────────────────────────────────────────────

import { readdir, mkdir, copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileExists } from './smart-discovery.mjs';

/**
 * Copy directory recursively
 * @param {string} src
 * @param {string} dest
 */
async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Create a new backup snapshot of OpenCode configuration
 * @param {string} targetDir - OpenCode config dir (~/.config/opencode)
 * @returns {Promise<string|null>} Path to created backup snapshot
 */
export async function createBackup(targetDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(targetDir, '.backups', `snapshot_${timestamp}`);

  try {
    await mkdir(backupDir, { recursive: true });

    // Backup agents directory
    const agentsDir = join(targetDir, 'agents');
    if (await fileExists(agentsDir)) {
      await copyDir(agentsDir, join(backupDir, 'agents'));
    }

    // Backup knowledge directory
    const knowledgeDir = join(targetDir, 'knowledge');
    if (await fileExists(knowledgeDir)) {
      await copyDir(knowledgeDir, join(backupDir, 'knowledge'));
    }

    // Backup opencode.json & opencode.jsonc
    const jsonPath = join(targetDir, 'opencode.json');
    if (await fileExists(jsonPath)) {
      await copyFile(jsonPath, join(backupDir, 'opencode.json'));
    }

    const jsoncPath = join(targetDir, 'opencode.jsonc');
    if (await fileExists(jsoncPath)) {
      await copyFile(jsoncPath, join(backupDir, 'opencode.jsonc'));
    }

    // Clean up old backups (keep latest 5)
    await pruneOldBackups(targetDir, 5);

    return backupDir;
  } catch (err) {
    console.warn(`[WARN] Failed to create backup snapshot: ${err.message}`);
    return null;
  }
}

/**
 * List all available backups
 * @param {string} targetDir
 * @returns {Promise<string[]>}
 */
export async function listBackups(targetDir) {
  const backupsDir = join(targetDir, '.backups');
  if (!(await fileExists(backupsDir))) {
    return [];
  }

  const entries = await readdir(backupsDir, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && e.name.startsWith('snapshot_'))
    .map(e => e.name)
    .sort()
    .reverse();
}

/**
 * Prune old backups, keeping the most recent N snapshots
 * @param {string} targetDir
 * @param {number} maxKeep
 */
async function pruneOldBackups(targetDir, maxKeep = 5) {
  const backups = await listBackups(targetDir);
  if (backups.length > maxKeep) {
    const toRemove = backups.slice(maxKeep);
    for (const b of toRemove) {
      await rm(join(targetDir, '.backups', b), { recursive: true, force: true });
    }
  }
}

/**
 * Restore configuration from the latest or specified backup snapshot
 * @param {string} targetDir
 * @param {string} [snapshotName]
 * @returns {Promise<boolean>}
 */
export async function restoreBackup(targetDir, snapshotName) {
  const backups = await listBackups(targetDir);
  if (backups.length === 0) {
    console.error('No backup snapshots found to restore.');
    return false;
  }

  const targetSnapshot = snapshotName || backups[0];
  const snapshotPath = join(targetDir, '.backups', targetSnapshot);

  if (!(await fileExists(snapshotPath))) {
    console.error(`Snapshot ${targetSnapshot} does not exist.`);
    return false;
  }

  // Restore agents
  const backupAgents = join(snapshotPath, 'agents');
  if (await fileExists(backupAgents)) {
    await copyDir(backupAgents, join(targetDir, 'agents'));
  }

  // Restore knowledge
  const backupKnowledge = join(snapshotPath, 'knowledge');
  if (await fileExists(backupKnowledge)) {
    await copyDir(backupKnowledge, join(targetDir, 'knowledge'));
  }

  // Restore configs
  const backupJson = join(snapshotPath, 'opencode.json');
  if (await fileExists(backupJson)) {
    await copyFile(backupJson, join(targetDir, 'opencode.json'));
  }

  const backupJsonc = join(snapshotPath, 'opencode.jsonc');
  if (await fileExists(backupJsonc)) {
    await copyFile(backupJsonc, join(targetDir, 'opencode.jsonc'));
  }

  return true;
}
