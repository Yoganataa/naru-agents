#!/usr/bin/env bun

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

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  default:
    console.error(`Unknown command: ${args.command}`);
    console.error('Run "naru-agents help" for usage information.');
    process.exit(1);
}

function showHelp() {
  console.log(`
@yoganataa/naru-agents - AI Team Lead orchestration for opencode

Usage:
  bunx github:yoganataa/naru-agents [command] [options]

Commands:
  (none)              Launch interactive TUI
  install             Install agents to opencode config
  uninstall           Remove installed agents
  validate            Validate agent files
  help                Show this help message

Options:
  --global            Install to global config (~/.config/opencode/agents/)
  --project           Install to current project (.opencode/agents/)
  --force             Overwrite existing files
  --dry-run           Preview changes without installing

Examples:
  bunx github:yoganataa/naru-agents
  bunx github:yoganataa/naru-agents install --global
  bunx github:yoganataa/naru-agents install --project .
  bunx github:yoganataa/naru-agents uninstall --global
  `);
}
