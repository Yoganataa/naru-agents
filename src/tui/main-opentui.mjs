// ─── main-opentui.mjs ── Main TUI with OpenTUI (replaces custom renderer) ─────
// `naru` (no args) → interactive agent selection using @opentui/core
// Replaces src/tui/index.mjs custom ANSI renderer with opentui (same as opencode)
// ──────────────────────────────────────────────────────────────────────────────

import { installAgents } from '../installer.mjs';
import { AGENTS } from './state.mjs';
import { join } from 'node:path';
import { homedir } from 'node:os';

let renderer = null;

/**
 * Launch main TUI (agent selection) with opentui
 * @param {object} options
 * @param {boolean} options.force
 */
export async function launchMainTui(options = {}) {
  const { force = false } = options;

  if (!process.stdin.isTTY) {
    console.error('TUI requires interactive terminal. Run: naru setup --auto');
    process.exit(1);
  }

  let createCliRenderer, BoxRenderable, TextRenderable;
  try {
    const core = await import('@opentui/core');
    createCliRenderer = core.createCliRenderer;
    BoxRenderable = core.BoxRenderable;
    TextRenderable = core.TextRenderable;
    if (!createCliRenderer) throw new Error('missing createCliRenderer');
  } catch (e) {
    // Fallback to legacy custom TUI if opentui not available
    console.error(`\x1b[33m⚠ @opentui/core not available (${e.message}) — falling back to legacy TUI\x1b[0m`);
    const { launchTUI } = await import('./index-legacy.mjs');
    await launchTUI(options);
    return;
  }

  // State (reuse AGENTS from state.mjs but manage locally for opentui)
  const agents = AGENTS;
  const selection = new Set(agents.filter(a => a.default).map(a => a.file));
  let cursor = 0;
  let scrollOffset = 0;
  let mode = 'browse'; // browse | confirm | installing | done
  let progress = { current: 0, total: 0, message: '' };

  renderer = await createCliRenderer({
    exitOnCtrlC: true,
    backgroundColor: '#0a0a0f',
  });

  const root = new BoxRenderable(renderer, {
    id: 'root',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: '#0a0a0f',
    padding: 1,
    gap: 1,
  });

  const header = new TextRenderable(renderer, {
    content: '█▀▀█  █▀▀█  █▀▀█  █  █     █▀▀█  █▀▀█  █▀▀█  █▀▀█  ▀█▀  █▀▀▀  — N.A.R.U.',
    fg: '#00f0ff',
  });
  const sub = new TextRenderable(renderer, {
    content: 'AI Team Lead orchestration for opencode — 11 agents • Space toggle • Enter install • q quit',
    fg: '#888888',
  });

  const listBox = new BoxRenderable(renderer, {
    flexDirection: 'column',
    backgroundColor: '#11111a',
    borderStyle: 'rounded',
    borderColor: '#333344',
    padding: 1,
    flexGrow: 1,
  });

  const statusText = new TextRenderable(renderer, {
    content: '',
    fg: '#AEBBFF',
  });

  const helpText = new TextRenderable(renderer, {
    content: '↑/↓ move  Space toggle  a: all  n: none  Enter: install  q: quit',
    fg: '#666677',
  });

  function getViewportHeight() {
    // Approximate: terminal rows - chrome
    try {
      const { stdout } = require('node:process');
      return (stdout.rows || 24) - 10;
    } catch { return 14; }
  }

  function render() {
    // Clear listBox
    try {
      while (listBox.children && listBox.children.length > 0) {
        const c = listBox.children[0];
        if (typeof listBox.remove === 'function') listBox.remove(c);
        else break;
      }
    } catch {}

    if (mode === 'browse') {
      statusText.content = `Selected: ${selection.size}/${agents.length}  •  ${progress.message || ''}`;
      statusText.fg = '#AEBBFF';

      const vh = 12;
      const visible = agents.slice(scrollOffset, scrollOffset + vh);
      visible.forEach((agent, i) => {
        const idx = scrollOffset + i;
        const isCursor = idx === cursor;
        const isSel = selection.has(agent.file);
        const icon = isSel ? '[✓]' : '[ ]';
        const cursorMark = isCursor ? '▶' : ' ';
        const line = `${cursorMark} ${icon} ${agent.file.padEnd(25)} ${agent.description}`;
        const row = new TextRenderable(renderer, {
          content: line,
          fg: isCursor ? '#ffffff' : isSel ? '#00ff88' : '#aaaaaa',
          backgroundColor: isCursor ? '#1e1e3a' : 'transparent',
        });
        listBox.add(row);
      });
      helpText.content = '↑/↓ move  Space toggle  a: all  n: none  Enter: install  q: quit';
    } else if (mode === 'confirm') {
      statusText.content = `Confirm install ${selection.size} agents? (y/n)`;
      statusText.fg = '#ffcc00';
      // Show selected
      agents.filter(a => selection.has(a.file)).forEach(agent => {
        listBox.add(new TextRenderable(renderer, { content: `  ✓ ${agent.file}`, fg: '#00ff88' }));
      });
      helpText.content = 'y: confirm  n: cancel  q: quit';
    } else if (mode === 'installing') {
      statusText.content = `Installing ${progress.current}/${progress.total} — ${progress.message}`;
      statusText.fg = '#ffcc00';
      const barWidth = 40;
      const filled = Math.floor(barWidth * (progress.current / Math.max(1, progress.total)));
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      listBox.add(new TextRenderable(renderer, { content: `  ${progress.current}/${progress.total} (${Math.floor(progress.current/Math.max(1,progress.total)*100)}%)`, fg: '#ffffff' }));
      listBox.add(new TextRenderable(renderer, { content: `  ${bar}`, fg: '#00ff88' }));
      if (progress.message) listBox.add(new TextRenderable(renderer, { content: `  ${progress.message}`, fg: '#AEBBFF' }));
      helpText.content = 'Installing... please wait';
    } else if (mode === 'done') {
      statusText.content = `✓ Installed ${selection.size} agents — restart opencode to use`;
      statusText.fg = '#00ff88';
      listBox.add(new TextRenderable(renderer, { content: '  Restart opencode to use the agents', fg: '#aaaaaa' }));
      helpText.content = 'Press any key to exit • q quit';
    }
  }

  root.add(header);
  root.add(sub);
  root.add(listBox);
  root.add(statusText);
  root.add(helpText);
  renderer.root.add(root);
  render();

  function moveCursor(delta) {
    const max = agents.length - 1;
    cursor = Math.max(0, Math.min(max, cursor + delta));
    const vh = 12;
    if (cursor < scrollOffset) scrollOffset = cursor;
    else if (cursor >= scrollOffset + vh) scrollOffset = cursor - vh + 1;
    render();
  }

  function toggle() {
    const f = agents[cursor].file;
    if (selection.has(f)) selection.delete(f);
    else selection.add(f);
    render();
  }

  async function doInstall() {
    if (selection.size === 0) return;
    mode = 'installing';
    const list = Array.from(selection);
    progress = { current: 0, total: list.length, message: 'Starting...' };
    render();
    const { homedir } = await import('node:os');
    const targetDir = join(homedir(), '.config', 'opencode');
    for (let i = 0; i < list.length; i++) {
      const agent = list[i];
      progress = { current: i + 1, total: list.length, message: `Installing ${agent}...` };
      render();
      await installAgents(targetDir, { force, agents: [agent] });
      await new Promise(r => setTimeout(r, 80));
    }
    mode = 'done';
    progress = { current: list.length, total: list.length, message: 'Done!' };
    render();
  }

  renderer.keyInput.on('keypress', async (key) => {
    if (mode === 'browse') {
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) { renderer.destroy(); return; }
      if (key.name === 'up' || key.name === 'k') moveCursor(-1);
      else if (key.name === 'down' || key.name === 'j') moveCursor(1);
      else if (key.name === 'space') toggle();
      else if (key.name === 'a' || key.name === 'A') { agents.forEach(a => selection.add(a.file)); render(); }
      else if (key.name === 'n' || key.name === 'N') { selection.clear(); render(); }
      else if (key.name === 'return' || key.name === 'enter') {
        if (selection.size === 0) return;
        mode = 'confirm';
        render();
      }
    } else if (mode === 'confirm') {
      if (key.name === 'y' || key.name === 'Y' || key.name === 'return' || key.name === 'enter') {
        await doInstall();
      } else if (key.name === 'n' || key.name === 'N' || key.name === 'escape') {
        mode = 'browse';
        render();
      } else if (key.name === 'q') { renderer.destroy(); return; }
    } else if (mode === 'done') {
      renderer.destroy(); return;
    }
  });

  const origDestroy = renderer.destroy.bind(renderer);
  renderer.destroy = () => { origDestroy(); process.exit(0); };
}
