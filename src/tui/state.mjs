// ─── state.mjs ── State machine for TUI ─────────────────────────────────────
// Pure state reducer that transitions between modes
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Available actions
 */
export const Action = {
  UP: 'UP',
  DOWN: 'DOWN',
  SELECT: 'SELECT',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  QUIT: 'QUIT',
  TOGGLE: 'TOGGLE',
  SELECT_ALL: 'SELECT_ALL',
  DESELECT_ALL: 'DESELECT_ALL',
  INSTALL: 'INSTALL',
  BACK: 'BACK',
};

/**
 * Available modes
 */
export const Mode = {
  BROWSE: 'browse',
  CONFIRM: 'confirm',
  INSTALLING: 'installing',
  DONE: 'done',
  QUIT: 'quit',
};

/**
 * Agent file definitions
 */
export const AGENTS = [
  { file: 'naru.md', name: 'naru', description: 'AI Team Lead (Orchestrator)', default: true },
  { file: 'pm-agent.md', name: 'pm-agent', description: 'Product Manager', default: true },
  { file: 'researcher-agent.md', name: 'researcher-agent', description: 'Evidence Researcher', default: true },
  { file: 'dependency-agent.md', name: 'dependency-agent', description: 'Dependency Contract Validator', default: true },
  { file: 'architect-agent.md', name: 'architect-agent', description: 'System Architect', default: true },
  { file: 'developer-agent.md', name: 'developer-agent', description: 'Senior Developer', default: true },
  { file: 'reviewer-agent.md', name: 'reviewer-agent', description: 'Security & Compliance Reviewer', default: true },
  { file: 'qa-agent.md', name: 'qa-agent', description: 'Multimodal QA Engineer', default: true },
  { file: 'docs-agent.md', name: 'docs-agent', description: 'Continuous Documentarian', default: true },
  { file: 'deploy-agent.md', name: 'deploy-agent', description: 'DevOps & Release Engineer', default: true },
  { file: 'hotfix-agent.md', name: 'hotfix-agent', description: 'Production Hotfix Specialist', default: true },
];

/**
 * Create initial state
 * @param {{ cols: number, rows: number }} terminal
 * @returns {object}
 */
export function createInitialState(terminal) {
  const selection = new Set();
  for (const agent of AGENTS) {
    if (agent.default) {
      selection.add(agent.file);
    }
  }

  return {
    mode: Mode.BROWSE,
    agents: AGENTS,
    selection,
    cursor: 0,
    scrollOffset: 0,
    terminal,
    progress: { current: 0, total: 0, message: '' },
  };
}

/**
 * Get visible height (accounting for chrome)
 * @param {object} state
 * @returns {number}
 */
export function getViewportHeight(state) {
  // Top border (2) + tabs (3) + list header (2) + status bar (2) + bottom border (1) = 10
  return state.terminal.rows - 10;
}

/**
 * Pure reducer: apply action to produce new state
 * @param {object} state
 * @param {{ action: string, char?: string }} parsed
 * @returns {object}
 */
export function update(state, parsed) {
  switch (state.mode) {
    case Mode.BROWSE:
      return updateBrowse(state, parsed);
    case Mode.CONFIRM:
      return updateConfirm(state, parsed);
    case Mode.INSTALLING:
      return state;
    case Mode.DONE:
      return updateDone(state, parsed);
    default:
      return state;
  }
}

/**
 * Update browse mode
 * @param {object} state
 * @param {{ action: string }} parsed
 * @returns {object}
 */
function updateBrowse(state, { action }) {
  const vh = getViewportHeight(state);

  switch (action) {
    case Action.UP:
      return moveCursor(state, -1);
    case Action.DOWN:
      return moveCursor(state, +1);
    case Action.PAGE_UP:
      return moveCursor(state, -vh);
    case Action.PAGE_DOWN:
      return moveCursor(state, +vh);
    case Action.HOME:
      return { ...state, cursor: 0, scrollOffset: 0 };
    case Action.END:
      return moveCursor(state, state.agents.length - 1 - state.cursor);
    case Action.TOGGLE:
      return toggleAgent(state);
    case Action.SELECT_ALL:
      return selectAll(state);
    case Action.DESELECT_ALL:
      return deselectAll(state);
    case Action.CONFIRM:
      if (state.selection.size === 0) return state;
      return { ...state, mode: Mode.CONFIRM };
    case Action.QUIT:
      return { ...state, mode: Mode.QUIT };
    default:
      return state;
  }
}

/**
 * Update confirm mode
 * @param {object} state
 * @param {{ action: string }} parsed
 * @returns {object}
 */
function updateConfirm(state, { action }) {
  switch (action) {
    case Action.CONFIRM:
      return { ...state, mode: Mode.INSTALLING };
    case Action.CANCEL:
    case Action.BACK:
      return { ...state, mode: Mode.BROWSE };
    case Action.QUIT:
      return { ...state, mode: Mode.QUIT };
    default:
      return state;
  }
}

/**
 * Update done mode
 * @param {object} state
 * @param {{ action: string }} parsed
 * @returns {object}
 */
function updateDone(state, { action }) {
  switch (action) {
    case Action.QUIT:
    case Action.CONFIRM:
    case Action.CANCEL:
      return { ...state, mode: Mode.QUIT };
    default:
      return state;
  }
}

/**
 * Move cursor by delta
 * @param {object} state
 * @param {number} delta
 * @returns {object}
 */
function moveCursor(state, delta) {
  const newCursor = Math.max(0, Math.min(state.agents.length - 1, state.cursor + delta));
  const vh = getViewportHeight(state);

  let newScrollOffset = state.scrollOffset;
  if (newCursor < state.scrollOffset) {
    newScrollOffset = newCursor;
  } else if (newCursor >= state.scrollOffset + vh) {
    newScrollOffset = newCursor - vh + 1;
  }

  return { ...state, cursor: newCursor, scrollOffset: newScrollOffset };
}

/**
 * Toggle agent selection
 * @param {object} state
 * @returns {object}
 */
function toggleAgent(state) {
  const agent = state.agents[state.cursor];
  const newSelection = new Set(state.selection);

  if (newSelection.has(agent.file)) {
    newSelection.delete(agent.file);
  } else {
    newSelection.add(agent.file);
  }

  return { ...state, selection: newSelection };
}

/**
 * Select all agents
 * @param {object} state
 * @returns {object}
 */
function selectAll(state) {
  const newSelection = new Set(state.agents.map(a => a.file));
  return { ...state, selection: newSelection };
}

/**
 * Deselect all agents
 * @param {object} state
 * @returns {object}
 */
function deselectAll(state) {
  return { ...state, selection: new Set() };
}
