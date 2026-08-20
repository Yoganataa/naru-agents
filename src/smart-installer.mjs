// ─── smart-installer.mjs ── Smart Orchestrated Installer ────────────────────
// Combines discovery, backup snapshotting, agent deployment, and MCP fusion
// ──────────────────────────────────────────────────────────────────────────────

import { join } from 'node:path';
import { homedir } from 'node:os';
import { install } from './installer.mjs';
import { createBackup } from './backup-manager.mjs';
import { configureMCPServers } from './mcp-configurator.mjs';
import { runDoctor } from './doctor.mjs';
import { printBanner } from './banner.mjs';

/**
 * Execute smart automated installation
 * @param {object} options
 * @param {boolean} [options.withMcp] - Configure MCPs into opencode.json
 * @param {boolean} [options.force] - Overwrite existing files
 * @param {boolean} [options.dryRun] - Preview only
 */
export async function runSmartInstaller(options = {}) {
  const globalDir = join(homedir(), '.config', 'opencode');

  printBanner('setup');

  // Step 1: Automated Backup Snapshot
  if (!options.dryRun) {
    process.stdout.write('📦 Creating safety backup snapshot... ');
    const backupPath = await createBackup(globalDir);
    if (backupPath) {
      console.log(`✅ Snapshot saved to: ${backupPath}`);
    } else {
      console.log('⚠️  (Skipped or first-time setup)');
    }
  }

  // Step 2: Deploy 11 Agents + 4 RAG Knowledge Stores
  console.log('\n🤖 Installing 11 Subagents & Knowledge Base...');
  await install({
    global: true,
    force: options.force ?? true,
    dryRun: options.dryRun ?? false,
  });

  // Step 3: MCP Auto-Configuration (Fusion into opencode.json)
  if (!options.dryRun && options.withMcp !== false) {
    console.log('\n⚙️  Auto-Configuring 5 MCP Servers in opencode.json...');
    const { mcpSummary } = await configureMCPServers(globalDir);
    for (const [mcp, msg] of Object.entries(mcpSummary)) {
      console.log(`   - ${mcp.padEnd(20)}: ${msg}`);
    }
  }

  // Step 4: Run Doctor Diagnostic
  console.log('\n🩺 Running Post-Installation Health Check...');
  await runDoctor();
}
