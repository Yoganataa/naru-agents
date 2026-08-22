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
      model: args.model,
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

  case 'init':
    const { printBanner: printInitBanner } = await import('../src/banner.mjs');
    const { mkdir: mkdirAsync, writeFile: writeInitFile, access: accessInit } = await import('node:fs/promises');
    const { join: joinPath } = await import('node:path');
    
    printInitBanner('init');
    const projectOpencode = joinPath(process.cwd(), '.opencode');
    const projectKnowledge = joinPath(projectOpencode, 'knowledge');
    const projectSessions = joinPath(projectKnowledge, 'sessions');
    
    await mkdirAsync(projectSessions, { recursive: true });
    
    const projectLatest = joinPath(projectSessions, 'latest.json');
    try {
      await accessInit(projectLatest);
    } catch {
      await writeInitFile(projectLatest, JSON.stringify({
        initialized: new Date().toISOString(),
        last_session_id: null,
        status: "INITIALIZED",
        version: "0.0.2"
      }, null, 2), 'utf8');
    }
    
    console.log('✅ Repository Knowledge & Session Architecture Initialized in: ' + projectKnowledge);
    console.log('   - Sessions Directory : .opencode/knowledge/sessions/');
    console.log('   - Latest Pointer     : .opencode/knowledge/sessions/latest.json');

    // Self-Healing: CodeGraph index per-project (fixes "Not initialized" for new user)
    try {
      const { exec: execInit } = await import('node:child_process');
      const { promisify: promInit } = await import('node:util');
      const { access: accessCg } = await import('node:fs/promises');
      const execAsyncInit = promInit(execInit);
      // Check if codegraph binary exists
      let hasCodegraph = false;
      try { await execAsyncInit('codegraph --version'); hasCodegraph = true; } catch {}
      if (hasCodegraph) {
        try { await accessCg(joinPath(process.cwd(), '.codegraph', 'codegraph.db')); } catch {
          console.log('\n🔧 Self-Healing: CodeGraph not initialized → running `codegraph init`...');
          try {
            const { stdout } = await execAsyncInit('codegraph init 2>&1');
            console.log('   ' + (stdout.match(/Indexed \d+ files/)?.[0] || '✓ CodeGraph ready'));
          } catch (e) {
            console.log('   ⚠ codegraph init failed: ' + e.message);
            console.log('   → Run manually: codegraph init');
          }
        }
      }
      // Context7 hint (no hard fail)
      if (!process.env.CONTEXT7_API_KEY) {
        try {
          const { readFile: readCgKey } = await import('node:fs/promises');
          const { homedir: homeDir } = await import('node:os');
          const cfg = await readCgKey(joinPath(homeDir(), '.config', 'opencode', 'opencode.json'), 'utf8');
          if (!cfg.includes('ctx7sk')) {
            console.log('\nℹ️  Context7: No ctx7sk key — researcher will fallback to webfetch. Set CONTEXT7_API_KEY for full docs.');
          }
        } catch {}
      }
    } catch {}

    console.log('\n💡 Next Step: Open OpenCode and type "@naru init" or send "Naru init repo" to execute 5-MCP deep AST & graph scanning!\n');
    break;

  case 'plan':
    const { runPlanManager } = await import('../src/plan-manager.mjs');
    await runPlanManager(process.argv.slice(3));
    break;

  case 'mcp':
    const { runMcpCLI } = await import('../src/mcp-manager.mjs');
    await runMcpCLI(process.argv.slice(3));
    break;

  // `naru context7` removed — use `naru mcp` (unified). Kept as error hint.
  case 'context7':
    console.error('\x1b[31m✗ `naru context7` removed — use `naru mcp`\x1b[0m');
    console.log('\x1b[2m  naru mcp              → TUI for all MCPs (recommended, vibe-friendly)\x1b[0m');
    console.log('\x1b[2m  naru mcp set context7 ctx7sk_... → set Context7 key\x1b[0m');
    console.log('\x1b[2m  naru mcp help         → help\x1b[0m');
    process.exit(1);
    break;

  case 'models':
  case 'model':
    const { runModelManagerCLI } = await import('../src/model-manager.mjs');
    await runModelManagerCLI();
    break;

  case 'new':
  case 'create':
    const { runProjectWizard } = await import('../src/project-wizard.mjs');
    await runProjectWizard();
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
  new, create         Interactive Project Scaffolding Wizard (prompts Category, Stack, DB, Auth, MVP)
  init                Initialize repository knowledge & timestamped session structure
  plan                Create plan + Gate 1 approval (Plan mode — edit deny until APPROVE)
  setup               Smart Setup: installs 11 agents, knowledge stores & auto-configures 5 MCPs
  mcp                 Unified MCP manager (opentui TUI) — no args = TUI, status/set/validate/init
  models              Manage AI models, check role compatibility & inspect OpenCode models
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
  naru init
  naru plan "Add Google login"      # create plan + Gate 1 WAITING → Approve to allow edits
  naru plan approve                 # approve Gate 1 → developer may edit
  naru mcp                          # TUI (opentui) — no args opens interactive manager
  naru mcp set context7 ctx7sk_...  # set & validate Context7 key (CLI)
  naru mcp validate                 # validate all MCPs
  naru mcp init                     # self-heal codegraph index
  naru models
  naru setup
  naru doctor
  bunx github:yoganataa/naru-agents setup --auto
  `);
}
