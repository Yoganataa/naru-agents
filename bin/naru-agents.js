#!/usr/bin/env node

// ─── naru-agents CLI ────────────────────────────────────────────────────────
// Entry point for bunx github:yoganataa/naru-agents
// Routes to TUI, install, uninstall, validate, or help
// ──────────────────────────────────────────────────────────────────────────────

import { parseArgs } from '../src/cli.mjs';

const args = parseArgs(process.argv.slice(2));

switch (args.command) {
  case 'tui':
  case undefined:
    // Launch interactive TUI
    const { launchTUI } = await import('../src/tui/index.mjs');
    await launchTUI({ force: args.force });
    break;

  case 'install':
    const { install } = await import('../src/installer.mjs');
    await install({
      global: args.global,
      project: args.project,
      force: args.force,
      dryRun: args.dryRun,
    });
    break;

  case 'uninstall':
    const { uninstall } = await import('../src/installer.mjs');
    await uninstall({
      global: args.global,
      project: args.project,
      dryRun: args.dryRun,
    });
    break;

  case 'validate':
    const { validate } = await import('../src/validator.mjs');
    await validate();
    break;

  case 'setup':
    const { runSmartInstaller } = await import('../src/smart-installer.mjs');
    await runSmartInstaller({
      withMcp: args.withMcp,
      force: args.force || args.auto,
      dryRun: args.dryRun,
    });
    break;

  case 'doctor':
    const { runDoctor } = await import('../src/doctor.mjs');
    await runDoctor();
    break;

  case 'rollback':
    const { restoreBackup } = await import('../src/backup-manager.mjs');
    const { homedir } = await import('node:os');
    const { join } = await import('node:path');
    const globalDir = join(homedir(), '.config', 'opencode');
    const success = await restoreBackup(globalDir);
    if (success) {
      console.log('✅ Configuration successfully restored from previous backup snapshot.');
    } else {
      console.error('❌ Rollback failed or no backup snapshot available.');
    }
    break;

  case 'update':
  case 'upgrade':
    const { runSelfUpdate } = await import('../src/updater.mjs');
    await runSelfUpdate();
    break;

  case 'help':
  case '--help':
  case '-h':
    await showHelp();
    break;

  default:
    console.error(`Unknown command: ${args.command}`);
    console.error('Run "naru help" or "naru-agents help" for usage information.');
    process.exit(1);
}

async function showHelp() {
  const { printBanner } = await import('../src/banner.mjs');
  printBanner('main');

  console.log(`Usage:
  naru [command] [options]
  naru-agents [command] [options]
  bunx github:yoganataa/naru-agents [command] [options]
  npx github:yoganataa/naru-agents [command] [options]

Commands:
  (none)              Launch interactive TUI
  setup               Smart Setup: installs 11 agents, knowledge stores & auto-configures 5 MCPs
  doctor              Health check & diagnostic for runtimes, agents & MCPs
  update, upgrade     Auto-upgrade global package and re-sync OpenCode agents & MCPs
  install             Install agents to opencode config
  uninstall           Remove installed agents
  rollback            Restore configuration from previous backup snapshot
  validate            Validate agent files
  help                Show this help message

Options:
  --global            Install to global config (~/.config/opencode/)
  --project           Install to current project (.opencode/)
  --force             Overwrite existing files
  --auto, -y          Automated non-interactive setup
  --with-mcp          Auto-configure 5 MCP servers in opencode.json (default: true)
  --no-mcp            Skip MCP configuration in opencode.json
  --dry-run           Preview changes without installing

Examples:
  naru setup
  naru doctor
  naru update
  naru rollback
  bunx github:yoganataa/naru-agents setup --auto
  `);
}
