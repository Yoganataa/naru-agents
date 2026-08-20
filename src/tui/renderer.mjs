// ─── renderer.mjs ── ANSI frame builder ─────────────────────────────────────
// Converts state to string for terminal display
// ──────────────────────────────────────────────────────────────────────────────

import { Mode, getViewportHeight } from './state.mjs';

// ANSI colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const WHITE = '\x1b[37m';
const BG_BLUE = '\x1b[44m';

/**
 * Pad string to width
 * @param {string} str
 * @param {number} width
 * @returns {string}
 */
function padEnd(str, width) {
  // Simple padEnd that handles ANSI codes
  const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, width - visibleLength);
  return str + ' '.repeat(padding);
}

/**
 * Render the complete frame
 * @param {object} state
 * @returns {string}
 */
export function render(state) {
  const { cols, rows } = state.terminal;

  switch (state.mode) {
    case Mode.BROWSE:
      return renderBrowse(state, cols, rows);
    case Mode.CONFIRM:
      return renderConfirm(state, cols, rows);
    case Mode.INSTALLING:
      return renderInstalling(state, cols, rows);
    case Mode.DONE:
      return renderDone(state, cols, rows);
    default:
      return '';
  }
}

/**
 * Render browse mode
 * @param {object} state
 * @param {number} cols
 * @param {number} rows
 * @returns {string}
 */
function renderBrowse(state, cols, rows) {
  const out = [];
  const innerWidth = cols - 4;

  // Top border
  out.push(`${CYAN}┌${'─'.repeat(innerWidth)}┐${RESET}`);

  // Title
  const title = ' @yoganataa/naru-agents ';
  const titlePadding = Math.floor((innerWidth - title.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(titlePadding)}${BOLD}${CYAN}${title}${RESET}${' '.repeat(innerWidth - titlePadding - title.length)}${CYAN}│${RESET}`);

  // Subtitle
  const subtitle = ' AI Team Lead orchestration for opencode ';
  const subPadding = Math.floor((innerWidth - subtitle.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(subPadding)}${DIM}${subtitle}${RESET}${' '.repeat(innerWidth - subPadding - subtitle.length)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Selection count
  const selectionText = `Selected: ${state.selection.size}/${state.agents.length}`;
  out.push(`${CYAN}│${RESET} ${selectionText}${' '.repeat(innerWidth - selectionText.length - 1)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Agent list
  const vh = getViewportHeight(state);
  const visibleAgents = state.agents.slice(state.scrollOffset, state.scrollOffset + vh);

  for (let i = 0; i < vh; i++) {
    if (i < visibleAgents.length) {
      const agent = visibleAgents[i];
      const isSelected = state.selection.has(agent.file);
      const isCursor = state.scrollOffset + i === state.cursor;

      let line = ' ';
      line += isCursor ? `${BOLD}${WHITE}>${RESET}` : ' ';
      line += ' ';
      line += isSelected ? `${GREEN}[✓]${RESET}` : `${DIM}[ ]${RESET}`;
      line += ' ';
      line += padEnd(agent.file, 25);
      line += agent.description;

      // Pad to width
      const visibleLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
      line += ' '.repeat(Math.max(0, innerWidth - visibleLen));

      out.push(`${CYAN}│${RESET}${line}${CYAN}│${RESET}`);
    } else {
      out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);
    }
  }

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Status bar
  const status = ' Space: Select  Enter: Install  a: All  n: None  q: Quit ';
  const statusPadding = Math.floor((innerWidth - status.length) / 2);
  out.push(`${CYAN}│${RESET}${BG_BLUE}${' '.repeat(statusPadding)}${WHITE}${status}${RESET}${' '.repeat(innerWidth - statusPadding - status.length)}${CYAN}│${RESET}`);

  // Bottom border
  out.push(`${CYAN}└${'─'.repeat(innerWidth)}┘${RESET}`);

  return out.join('\n');
}

/**
 * Render confirm mode
 * @param {object} state
 * @param {number} cols
 * @param {number} rows
 * @returns {string}
 */
function renderConfirm(state, cols, rows) {
  const out = [];
  const innerWidth = cols - 4;

  // Top border
  out.push(`${CYAN}┌${'─'.repeat(innerWidth)}┐${RESET}`);

  // Title
  const title = ' Confirm Installation ';
  const titlePadding = Math.floor((innerWidth - title.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(titlePadding)}${BOLD}${YELLOW}${title}${RESET}${' '.repeat(innerWidth - titlePadding - title.length)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Selected agents
  out.push(`${CYAN}│${RESET} ${BOLD}Agents to install:${RESET}${' '.repeat(innerWidth - 20 - 1)}${CYAN}│${RESET}`);

  for (const agent of state.agents) {
    if (state.selection.has(agent.file)) {
      const line = `  ${GREEN}✓${RESET} ${agent.file}`;
      const visibleLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
      out.push(`${CYAN}│${RESET} ${line}${' '.repeat(innerWidth - visibleLen - 1)}${CYAN}│${RESET}`);
    }
  }

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Confirmation prompt
  const prompt = ' Install these agents? (y/n) ';
  const promptPadding = Math.floor((innerWidth - prompt.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(promptPadding)}${BOLD}${prompt}${RESET}${' '.repeat(innerWidth - promptPadding - prompt.length)}${CYAN}│${RESET}`);

  // Pad remaining rows
  while (out.length < rows - 2) {
    out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);
  }

  // Bottom border
  out.push(`${CYAN}└${'─'.repeat(innerWidth)}┘${RESET}`);

  return out.join('\n');
}

/**
 * Render installing mode
 * @param {object} state
 * @param {number} cols
 * @param {number} rows
 * @returns {string}
 */
function renderInstalling(state, cols, rows) {
  const out = [];
  const innerWidth = cols - 4;

  // Top border
  out.push(`${CYAN}┌${'─'.repeat(innerWidth)}┐${RESET}`);

  // Title
  const title = ' Installing... ';
  const titlePadding = Math.floor((innerWidth - title.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(titlePadding)}${BOLD}${CYAN}${title}${RESET}${' '.repeat(innerWidth - titlePadding - title.length)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Progress
  if (state.progress.total > 0) {
    const percent = Math.floor((state.progress.current / state.progress.total) * 100);
    const progressText = `${state.progress.current}/${state.progress.total} (${percent}%)`;
    out.push(`${CYAN}│${RESET} ${progressText}${' '.repeat(innerWidth - progressText.length - 1)}${CYAN}│${RESET}`);

    // Progress bar
    const barWidth = innerWidth - 4;
    const filled = Math.floor(barWidth * (state.progress.current / state.progress.total));
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    out.push(`${CYAN}│${RESET}  ${GREEN}${bar}${RESET}${CYAN}│${RESET}`);
  }

  // Message
  if (state.progress.message) {
    out.push(`${CYAN}│${RESET} ${state.progress.message}${' '.repeat(Math.max(0, innerWidth - state.progress.message.length - 1))}${CYAN}│${RESET}`);
  }

  // Pad remaining rows
  while (out.length < rows - 2) {
    out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);
  }

  // Bottom border
  out.push(`${CYAN}└${'─'.repeat(innerWidth)}┘${RESET}`);

  return out.join('\n');
}

/**
 * Render done mode
 * @param {object} state
 * @param {number} cols
 * @param {number} rows
 * @returns {string}
 */
function renderDone(state, cols, rows) {
  const out = [];
  const innerWidth = cols - 4;

  // Top border
  out.push(`${CYAN}┌${'─'.repeat(innerWidth)}┐${RESET}`);

  // Title
  const title = ' Installation Complete! ';
  const titlePadding = Math.floor((innerWidth - title.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(titlePadding)}${BOLD}${GREEN}${title}${RESET}${' '.repeat(innerWidth - titlePadding - title.length)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Success message
  const msg1 = `Installed ${state.selection.size} agents`;
  out.push(`${CYAN}│${RESET} ${GREEN}✓${RESET} ${msg1}${' '.repeat(innerWidth - msg1.length - 2)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Instructions
  const instr = ' Restart opencode to use the agents ';
  const instrPadding = Math.floor((innerWidth - instr.length) / 2);
  out.push(`${CYAN}│${RESET}${' '.repeat(instrPadding)}${DIM}${instr}${RESET}${' '.repeat(innerWidth - instrPadding - instr.length)}${CYAN}│${RESET}`);

  // Blank line
  out.push(`${CYAN}│${RESET}${' '.repeat(innerWidth)}${CYAN}│${RESET}`);

  // Status bar
  const status = ' Press any key to exit ';
  const statusPadding = Math.floor((innerWidth - status.length) / 2);
  out.push(`${CYAN}│${RESET}${BG_BLUE}${' '.repeat(statusPadding)}${WHITE}${status}${RESET}${' '.repeat(innerWidth - statusPadding - status.length)}${CYAN}│${RESET}`);

  // Bottom border
  out.push(`${CYAN}└${'─'.repeat(innerWidth)}┘${RESET}`);

  return out.join('\n');
}
