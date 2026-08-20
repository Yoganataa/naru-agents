// ─── installer.mjs ── Core installer logic ──────────────────────────────────
// Handles installing and uninstalling agent files to opencode config directories
// ──────────────────────────────────────────────────────────────────────────────

import { readdir, copyFile, mkdir, rm, stat, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Agent files to install
const AGENT_FILES = [
  'naru.md',
  'pm-agent.md',
  'researcher-agent.md',
  'architect-agent.md',
  'developer-agent.md',
  'reviewer-agent.md',
  'qa-agent.md',
];

// Knowledge files to install
const KNOWLEDGE_FILES = [
  'heuristics.md',
  'patterns.md',
  'pipeline-history.md',
  'maintenance-log.md',
];

/**
 * Get the global config directory
 * @returns {string}
 */
function getGlobalDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return join(home, '.config', 'opencode');
}

/**
 * Get the project config directory
 * @returns {string}
 */
function getProjectDir() {
  return join(process.cwd(), '.opencode');
}

/**
 * Check if a file exists
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a file with optional overwrite
 * @param {string} src
 * @param {string} dest
 * @param {boolean} force
 * @returns {Promise<{ copied: boolean, skipped: boolean }>}
 */
async function copyFileWithCheck(src, dest, force) {
  if (await fileExists(dest) && !force) {
    return { copied: false, skipped: true };
  }
  await copyFile(src, dest);
  return { copied: true, skipped: false };
}

/**
 * Install agents to a target directory
 * @param {string} targetDir - Target directory path
 * @param {object} options - Installation options
 * @param {boolean} options.force - Overwrite existing files
 * @param {boolean} options.dryRun - Preview changes without installing
 * @param {string[]} options.agents - Specific agents to install (default: all)
 */
export async function installAgents(targetDir, options = {}) {
  const { force = false, dryRun = false, agents = AGENT_FILES } = options;

  const agentsDir = join(targetDir, 'agents');
  const knowledgeDir = join(targetDir, 'knowledge');

  if (dryRun) {
    console.log('\nDry run - would install:\n');
    console.log('Agents:');
    for (const file of agents) {
      const src = join(ROOT_DIR, 'agents', file);
      const dest = join(agentsDir, file);
      const exists = await fileExists(dest);
      console.log(`  ${exists && !force ? '∼' : '+'} ${file}`);
    }
    console.log('\nKnowledge:');
    for (const file of KNOWLEDGE_FILES) {
      const src = join(ROOT_DIR, 'knowledge', file);
      const dest = join(knowledgeDir, file);
      const exists = await fileExists(dest);
      console.log(`  ${exists && !force ? '∼' : '+'} ${file}`);
    }
    return { installed: 0, skipped: agents.length + KNOWLEDGE_FILES.length };
  }

  // Create directories
  await mkdir(agentsDir, { recursive: true });
  await mkdir(knowledgeDir, { recursive: true });

  let installed = 0;
  let skipped = 0;

  // Install agent files
  for (const file of agents) {
    const src = join(ROOT_DIR, 'agents', file);
    const dest = join(agentsDir, file);
    const result = await copyFileWithCheck(src, dest, force);
    if (result.copied) installed++;
    if (result.skipped) skipped++;
  }

  // Install knowledge files
  for (const file of KNOWLEDGE_FILES) {
    const src = join(ROOT_DIR, 'knowledge', file);
    const dest = join(knowledgeDir, file);
    const result = await copyFileWithCheck(src, dest, force);
    if (result.copied) installed++;
    if (result.skipped) skipped++;
  }

  return { installed, skipped };
}

/**
 * Uninstall agents from a target directory
 * @param {string} targetDir - Target directory path
 * @param {object} options - Uninstall options
 * @param {boolean} options.dryRun - Preview changes without uninstalling
 * @param {string[]} options.agents - Specific agents to uninstall (default: all)
 */
export async function uninstallAgents(targetDir, options = {}) {
  const { dryRun = false, agents = AGENT_FILES } = options;

  const agentsDir = join(targetDir, 'agents');
  const knowledgeDir = join(targetDir, 'knowledge');

  if (dryRun) {
    console.log('\nDry run - would uninstall:\n');
    console.log('Agents:');
    for (const file of agents) {
      const dest = join(agentsDir, file);
      const exists = await fileExists(dest);
      console.log(`  ${exists ? '-' : ' '} ${file}`);
    }
    console.log('\nKnowledge:');
    for (const file of KNOWLEDGE_FILES) {
      const dest = join(knowledgeDir, file);
      const exists = await fileExists(dest);
      console.log(`  ${exists ? '-' : ' '} ${file}`);
    }
    return { removed: 0, notFound: agents.length + KNOWLEDGE_FILES.length };
  }

  let removed = 0;
  let notFound = 0;

  // Remove agent files
  for (const file of agents) {
    const dest = join(agentsDir, file);
    if (await fileExists(dest)) {
      await rm(dest);
      removed++;
    } else {
      notFound++;
    }
  }

  // Remove knowledge files
  for (const file of KNOWLEDGE_FILES) {
    const dest = join(knowledgeDir, file);
    if (await fileExists(dest)) {
      await rm(dest);
      removed++;
    } else {
      notFound++;
    }
  }

  return { removed, notFound };
}

/**
 * Install command handler
 * @param {object} options - Installation options
 */
export async function install(options = {}) {
  const { global: isGlobal, project: isProject, force, dryRun } = options;

  // Determine target directory
  let targetDir;
  if (isGlobal) {
    targetDir = getGlobalDir();
  } else if (isProject) {
    targetDir = getProjectDir();
  } else {
    // Default to global
    targetDir = getGlobalDir();
  }

  console.log(`\nInstalling agents to: ${targetDir}`);

  const result = await installAgents(targetDir, { force, dryRun });

  if (dryRun) {
    console.log('\nDry run complete.');
  } else {
    console.log(`\nInstallation complete!`);
    console.log(`  Installed: ${result.installed}`);
    console.log(`  Skipped: ${result.skipped}`);
  }
}

/**
 * Uninstall command handler
 * @param {object} options - Uninstall options
 */
export async function uninstall(options = {}) {
  const { global: isGlobal, project: isProject, dryRun } = options;

  // Determine target directory
  let targetDir;
  if (isGlobal) {
    targetDir = getGlobalDir();
  } else if (isProject) {
    targetDir = getProjectDir();
  } else {
    // Default to global
    targetDir = getGlobalDir();
  }

  console.log(`\nUninstalling agents from: ${targetDir}`);

  const result = await uninstallAgents(targetDir, { dryRun });

  if (dryRun) {
    console.log('\nDry run complete.');
  } else {
    console.log(`\nUninstall complete!`);
    console.log(`  Removed: ${result.removed}`);
    console.log(`  Not found: ${result.notFound}`);
  }
}
