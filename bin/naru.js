#!/usr/bin/env node

// bin/naru.js
/**
 * N.A.R.U. CLI entrypoint.
 */

import { parseArgs } from '../src/cli.mjs';

const args = parseArgs(process.argv.slice(2));

switch (args.command) {
  case 'tui':
  case undefined: {
    const { launchTUI } = await import('../src/tui/index.mjs');
    await launchTUI({ force: args.force });
    break;
  }

  case 'install': {
    const { install } = await import('../src/installer.mjs');
    await install({ global: args.global, project: args.project, force: args.force, dryRun: args.dryRun });
    break;
  }

  case 'uninstall': {
    const { uninstall } = await import('../src/installer.mjs');
    await uninstall({ global: args.global, project: args.project, dryRun: args.dryRun });
    break;
  }

  case 'validate': {
    const { validate } = await import('../src/validator.mjs');
    await validate();
    break;
  }

  case 'setup': {
    const { runSmartInstaller } = await import('../src/setup.mjs');
    await runSmartInstaller({
      withMcp: args.withMcp,
      force: args.force || args.auto,
      dryRun: args.dryRun,
      model: args.model,
    });
    break;
  }

  case 'doctor': {
    const { runDoctor } = await import('../src/doctor.mjs');
    await runDoctor();
    break;
  }

  case 'rollback': {
    const { restoreBackup } = await import('../src/backup-manager.mjs');
    const { homedir } = await import('node:os');
    const { join } = await import('node:path');
    const success = await restoreBackup(join(homedir(), '.config', 'opencode'));
    console.log(success
      ? '✅ Configuration successfully restored from previous backup snapshot.'
      : '❌ Rollback failed or no backup snapshot available.');
    if (!success) process.exitCode = 1;
    break;
  }

  case 'init': {
    const { printBanner } = await import('../src/banner.mjs');
    const { mkdir, writeFile, access } = await import('node:fs/promises');
    const { join } = await import('node:path');

    printBanner('init');
    const knowledgeDir = join(process.cwd(), '.opencode', 'knowledge');
    const sessionsDir = join(knowledgeDir, 'sessions');
    await mkdir(sessionsDir, { recursive: true });

    const latestPath = join(sessionsDir, 'latest.json');
    try {
      await access(latestPath);
    } catch {
      await writeFile(latestPath, JSON.stringify({
        initialized: new Date().toISOString(),
        last_session_id: null,
        status: 'INITIALIZED',
        version: '0.0.3',
      }, null, 2));
    }

    console.log(`✅ Repository knowledge initialized in: ${knowledgeDir}`);
    break;
  }

  case 'plan': {
    const { runPlanManager } = await import('../src/plan-manager.mjs');
    await runPlanManager(process.argv.slice(3));
    break;
  }

  case 'mcp': {
    const { runMcpCLI } = await import('../src/mcp/manager.mjs');
    await runMcpCLI(process.argv.slice(3));
    break;
  }

  case 'models':
  case 'model': {
    const { runModelManagerCLI } = await import('../src/model-manager.mjs');
    await runModelManagerCLI();
    break;
  }

  case 'new':
  case 'create': {
    const { runProjectWizard } = await import('../src/project-wizard.mjs');
    await runProjectWizard();
    break;
  }

  case 'update':
  case 'upgrade': {
    const { runSelfUpdate } = await import('../src/updater.mjs');
    await runSelfUpdate();
    break;
  }

  case 'audit': {
    const { runSelfAuditCLI } = await import('../src/self-auditor.mjs');
    await runSelfAuditCLI();
    break;
  }

  case 'test':
    await import('../src/test-harness.mjs');
    await import('../src/prompt-evaluator.mjs');
    console.log('✅ N.A.R.U. test suite entrypoints loaded. Run `naru harness` for deterministic workflow verification and `naru bench` for prompt-spectrum verification.');
    break;

  case 'harness': {
    const { runTestHarnessCLI } = await import('../src/test-harness.mjs');
    await runTestHarnessCLI(args);
    break;
  }

  case 'bench': {
    const { runPromptSpectrumBenchmark } = await import('../src/prompt-evaluator.mjs');
    const result = await runPromptSpectrumBenchmark();
    if (!result.success) process.exitCode = 1;
    break;
  }

  case 'help': {
    const { printBanner } = await import('../src/banner.mjs');
    printBanner('main');
    console.log(`Usage:
  naru [command] [options]

Commands:
  new, create         Project scaffolding wizard
  init                Initialize project knowledge/session state
  plan                Create plan and request Gate 1 user approval
  setup               Install agents and optional MCP configuration
  mcp                 Manage MCP configuration
  models              Inspect configured AI models
  doctor              Environment and configuration diagnostics
  audit               Agent/policy consistency audit
  harness             Deterministic workflow and artifact verification
  bench               Prompt-spectrum behavioral benchmark
  test                Load the deterministic test entrypoints
  update, upgrade     Update and resync N.A.R.U.
  install             Install agents/plugin
  uninstall           Remove agents/plugin
  rollback            Restore the previous configuration snapshot
  validate            Validate installed agent definitions
  help                Show this help message

Options:
  --global            Install to global OpenCode configuration
  --project           Install to the current project
  --force             Overwrite existing files
  --auto, -y          Non-interactive setup
  --with-mcp          Configure MCP servers during setup
  --no-mcp            Skip MCP configuration
  --dry-run           Preview changes without writing
  --model, -m MODEL   Override the setup model
`);
    break;
  }

  default:
    console.error(`Unknown command: ${args.command}`);
    console.error('Run `naru help` for usage information.');
    process.exitCode = 1;
}
