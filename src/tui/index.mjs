// ─── index.mjs ── TUI orchestrator ──────────────────────────────────────────
// Lifecycle, input handling, state updates, and rendering
// ──────────────────────────────────────────────────────────────────────────────

import { stdin } from 'node:process';
import { enter, exit, getSize, flush } from './screen.mjs';
import { createInitialState, update, Mode, Action } from './state.mjs';
import { render } from './renderer.mjs';
import { installAgents } from '../installer.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Minimum terminal size
const MIN_COLS = 60;
const MIN_ROWS = 20;

/**
 * Parse raw key input into action
 * @param {Buffer} data
 * @param {string} mode
 * @returns {{ action: string, char?: string } | null}
 */
function parseKey(data, mode) {
  const str = data.toString();

  // Ctrl+C
  if (str === '\x03') {
    return { action: Action.QUIT };
  }

  // Escape sequence
  if (str === '\x1b') {
    return { action: Action.CANCEL };
  }

  // Arrow keys
  if (str === '\x1b[A') return { action: Action.UP };
  if (str === '\x1b[B') return { action: Action.DOWN };
  if (str === '\x1b[C') return { action: Action.CONFIRM };
  if (str === '\x1b[D') return { action: Action.BACK };

  // Enter
  if (str === '\r' || str === '\n') {
    return { action: Action.CONFIRM };
  }

  // Space
  if (str === ' ') {
    return { action: Action.TOGGLE };
  }

  // Character keys
  if (mode === Mode.BROWSE) {
    if (str === 'q' || str === 'Q') return { action: Action.QUIT };
    if (str === 'a' || str === 'A') return { action: Action.SELECT_ALL };
    if (str === 'n' || str === 'N') return { action: Action.DESELECT_ALL };
  }

  if (mode === Mode.CONFIRM) {
    if (str === 'y' || str === 'Y') return { action: Action.CONFIRM };
    if (str === 'n' || str === 'N') return { action: Action.CANCEL };
  }

  if (mode === Mode.DONE) {
    return { action: Action.QUIT };
  }

  return null;
}

/**
 * Install agents with progress updates
 * @param {object} state
 * @param {function} setState
 * @param {function} redraw
 * @param {boolean} force
 */
async function performInstall(state, setState, redraw, force) {
  const agents = state.agents
    .filter(a => state.selection.has(a.file))
    .map(a => a.file);

  // Set installing mode
  setState({
    ...state,
    mode: Mode.INSTALLING,
    progress: { current: 0, total: agents.length, message: 'Starting installation...' },
  });
  redraw();

  try {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      // Update progress
      setState({
        ...state,
        mode: Mode.INSTALLING,
        progress: {
          current: i + 1,
          total: agents.length,
          message: `Installing ${agent}...`,
        },
      });
      redraw();

      // Install to global directory
      const { homedir } = await import('node:os');
      const targetDir = join(homedir(), '.config', 'opencode');

      await installAgents(targetDir, {
        force,
        dryRun: false,
        agents: [agent],
      });

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Set done mode
    setState({
      ...state,
      mode: Mode.DONE,
      progress: { current: agents.length, total: agents.length, message: 'Done!' },
    });
    redraw();
  } catch (error) {
    // On error, go back to browse
    console.error('Installation error:', error);
    setState({
      ...state,
      mode: Mode.BROWSE,
    });
    redraw();
  }
}

/**
 * Launch the interactive TUI
 * @param {object} [options]
 * @param {boolean} [options.force] - Overwrite existing files
 */
export async function launchTUI(options = {}) {
  const { force = false } = options;

  // Check for TTY
  if (!process.stdin.isTTY) {
    console.error('Error: TUI requires an interactive terminal (TTY)');
    process.exit(1);
  }

  // Initialize state
  let state = createInitialState(getSize());
  let processing = false;

  // Render function
  const redraw = () => {
    const buffer = render(state);
    flush(buffer);
  };

  // State setter
  const setState = (newState) => {
    state = newState;
  };

  // Enter raw mode
  enter();
  redraw();

  // Handle resize
  const onResize = () => {
    state = { ...state, terminal: getSize() };
    redraw();
  };
  process.on('resize', onResize);

  // Handle input
  const onData = async (data) => {
    if (processing) return;
    processing = true;

    try {
      const parsed = parseKey(data, state.mode);
      if (!parsed) return;

      const newState = update(state, parsed);

      // Handle install action
      if (newState.mode === Mode.INSTALLING && state.mode === Mode.CONFIRM) {
        setState(newState);
        redraw();
        await performInstall(state, setState, redraw, force);
        processing = false;
        return;
      }

      // Update state
      setState(newState);
      redraw();

      // Handle quit
      if (newState.mode === Mode.QUIT) {
        cleanup();
        process.exit(0);
      }
    } finally {
      processing = false;
    }
  };

  // Cleanup function
  const cleanup = () => {
    process.removeListener('resize', onResize);
    stdin.removeListener('data', onData);
    exit();
  };

  // Register input handler
  stdin.on('data', onData);

  // Handle signals
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}
