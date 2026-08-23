// src/cli.mjs
/**
 * Parse N.A.R.U. CLI arguments.
 * @param {string[]} argv Raw arguments after the executable name.
 * @returns {{command?: string, global: boolean, project: boolean, force: boolean, dryRun: boolean, withMcp: boolean, auto: boolean, model?: string}}
 */
export function parseArgs(argv) {
  const result = {
    command: undefined,
    global: false,
    project: false,
    force: false,
    dryRun: false,
    withMcp: true,
    auto: false,
    model: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    switch (arg) {
      case 'install':
      case 'uninstall':
      case 'validate':
      case 'help':
      case 'tui':
      case 'setup':
      case 'doctor':
      case 'rollback':
      case 'init':
      case 'models':
      case 'model':
      case 'plan':
      case 'mcp':
      case 'new':
      case 'create':
      case 'update':
      case 'upgrade':
      case 'audit':
      case 'test':
      case 'harness':
      case 'bench':
        if (result.command === undefined) result.command = arg;
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
      case '--with-mcp':
        result.withMcp = true;
        break;
      case '--no-mcp':
        result.withMcp = false;
        break;
      case '--auto':
      case '-y':
        result.auto = true;
        break;
      case '--model':
      case '-m':
        if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
          result.model = argv[++i];
        }
        break;
      case '--help':
      case '-h':
        result.command = 'help';
        break;
      default:
        // Unknown arguments are intentionally ignored for backward-compatible option parsing.
        break;
    }
  }

  return result;
}
