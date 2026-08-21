import { join } from 'node:path';
import { homedir } from 'node:os';
import { install } from './installer.mjs';
import { createBackup } from './backup-manager.mjs';
import { configureMCPServers } from './mcp-configurator.mjs';
import { runDoctor } from './doctor.mjs';
import { printBanner } from './banner.mjs';
import { applyModelMapping, validateModelForRole, NARU_DEFAULT_MODELS } from './model-manager.mjs';

/**
 * Execute smart automated installation
 * @param {object} options
 * @param {boolean} [options.withMcp] - Configure MCPs into opencode.json
 * @param {boolean} [options.force] - Overwrite existing files
 * @param {boolean} [options.dryRun] - Preview only
 * @param {string} [options.model] - Custom AI model to apply across all agents
 */
export async function runSmartInstaller(options = {}) {
  const globalDir = join(homedir(), '.config', 'opencode');
  const globalAgentsDir = join(globalDir, 'agents');

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

  // Step 3: Custom Model Assignment (if specified)
  if (!options.dryRun && options.model) {
    console.log(`\n🧠 Configuring Custom AI Model: \x1b[1m\x1b[36m${options.model}\x1b[0m...`);
    const customMapping = {};
    const agentFiles = Object.keys(NARU_DEFAULT_MODELS);
    let warningsFound = 0;

    for (const file of agentFiles) {
      customMapping[file] = options.model;
      const validation = validateModelForRole(file, options.model);
      if (!validation.isOptimal) {
        warningsFound++;
        console.log(`   ${validation.warning}`);
      }
    }

    if (warningsFound > 0) {
      console.log('   \x1b[33mℹ️ User Override Policy: Custom model forced per user instruction.\x1b[0m');
    }

    const { updated } = await applyModelMapping(globalAgentsDir, customMapping);
    console.log(`   \x1b[32m✓ Successfully configured ${updated}/11 agents with model '${options.model}'\x1b[0m`);
  }

  // Step 4: MCP Auto-Configuration (Fusion into opencode.json)
  if (!options.dryRun && options.withMcp !== false) {
    console.log('\n⚙️  Auto-Configuring 5 MCP Servers in opencode.json...');
    const { mcpSummary } = await configureMCPServers(globalDir);
    for (const [mcp, msg] of Object.entries(mcpSummary)) {
      console.log(`   - ${mcp.padEnd(20)}: ${msg}`);
    }
  }

  // Step 5: Run Doctor Diagnostic
  console.log('\n🩺 Running Post-Installation Health Check...');
  await runDoctor();
}
