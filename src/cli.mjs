// ─── cli.mjs ── CLI argument parser ─────────────────────────────────────────
// Simple argument parser for naru-agents CLI
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parse CLI arguments
 * @param {string[]} argv - Raw arguments (without node/bun and script path)
 * @returns {{ command?: string, global?: boolean, project?: boolean, force?: boolean, dryRun?: boolean }}
 */
export function parseArgs(argv) {
  const result = {
    command: undefined,
    global: false,
    project: false,
    force: false,
    dryRun: false,
  };

  for (const arg of argv) {
    switch (arg) {
      case 'install':
      case 'uninstall':
      case 'validate':
      case 'help':
      case 'tui':
        result.command = arg;
        break;
      case '--global':
      case '-g':
        result.global = true;
        break;
      case '--project':
      case '-p':
        result.project = true;
        break;
      case '--force':
      case '-f':
        result.force = true;
        break;
      case '--dry-run':
      case '-d':
        result.dryRun = true;
        break;
      case '--help':
      case '-h':
        result.command = 'help';
        break;
      default:
        // Unknown argument - ignore
        break;
    }
  }

  return result;
}
