// ─── mcp-opentui.mjs ── OpenTUI MCP Manager TUI ─────────────────────────────
// `naru mcp` (no args) → interactive TUI using @opentui/core (same as opencode)
// Vibe: no spam commands, one TUI to rule all 6 MCPs
// ──────────────────────────────────────────────────────────────────────────────

import { discoverMCPServers } from '../smart-discovery.mjs';
import { getContext7Key, setContext7Key, validateKeyFormat, probeContext7Key, maskKey } from '../context7-manager.mjs';

let renderer = null;

const MCP_META = {
  'context7': { label: 'context7', desc: 'Remote docs (ctx7sk_...)', hint: 'Enter → set key' },
  'serena': { label: 'serena', desc: 'LSP code intelligence', hint: 'Enter → info' },
  'codegraph': { label: 'codegraph', desc: 'Call-graph index', hint: 'Enter → init/sync' },
  'lean-ctx': { label: 'lean-ctx', desc: 'Tree-sitter AST', hint: 'Enter → info' },
  'codebase-memory-mcp': { label: 'codebase-memory-mcp', desc: 'Knowledge graph', hint: 'Enter → info' },
  'roblox-studio': { label: 'roblox-studio', desc: 'Roblox Studio MCP', hint: 'Enter → info' },
};

const MCP_ORDER = ['context7', 'serena', 'codegraph', 'lean-ctx', 'codebase-memory-mcp', 'roblox-studio'];

/**
 * Launch MCP TUI with opentui
 * Falls back to CLI status if opentui unavailable or not TTY
 */
export async function launchMcpTui() {
  if (!process.stdin.isTTY) {
    console.error('TUI requires interactive terminal. Run: naru mcp status');
    process.exit(1);
  }

  let createCliRenderer, BoxRenderable, TextRenderable, InputRenderable;
  try {
    const core = await import('@opentui/core');
    createCliRenderer = core.createCliRenderer;
    BoxRenderable = core.BoxRenderable;
    TextRenderable = core.TextRenderable;
    InputRenderable = core.InputRenderable;
    if (!createCliRenderer || !BoxRenderable || !TextRenderable) throw new Error('opentui core missing exports');
  } catch (e) {
    console.error(`\x1b[33m⚠ @opentui/core not available (${e.message}) — falling back to CLI status\x1b[0m\n`);
    const { runMcpCLI } = await import('../mcp-manager.mjs');
    await runMcpCLI(['status']);
    return;
  }

  // Fetch initial MCP status
  let mcpData = await discoverMCPServers();
  let ctxKeyInfo = await getContext7Key();

  // State
  let selected = 0;
  let mode = 'browse'; // browse | input-context7 | info
  let message = '';
  let messageColor = '#AEBBFF';

  renderer = await createCliRenderer({
    exitOnCtrlC: true,
    backgroundColor: '#0a0a0f',
  });

  // Root container
  const rootBox = new BoxRenderable(renderer, {
    id: 'root',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: '#0a0a0f',
    padding: 1,
    gap: 1,
  });

  // Header
  const header = new TextRenderable(renderer, {
    id: 'header',
    content: '█▀▀█  █▀▀█  █▀▀█  █  █     █▀▀█  █▀▀█  █▀▀█  █▀▀█  ▀█▀  █▀▀▀   — MCP Manager (opentui)',
    fg: '#00f0ff',
  });
  const subHeader = new TextRenderable(renderer, {
    id: 'subheader',
    content: 'Unified MCP manager — 6 servers • ↑↓ navigate • Enter configure • q quit',
    fg: '#888888',
  });

  // List container
  const listBox = new BoxRenderable(renderer, {
    id: 'list',
    flexDirection: 'column',
    backgroundColor: '#11111a',
    borderStyle: 'rounded',
    borderColor: '#333344',
    padding: 1,
    gap: 0,
    flexGrow: 1,
  });

  // Message bar
  const msgText = new TextRenderable(renderer, {
    id: 'msg',
    content: 'Tip: Select context7 → Enter to set ctx7sk_ key • codegraph → Enter to init',
    fg: '#AEBBFF',
  });

  // Help bar
  const helpText = new TextRenderable(renderer, {
    id: 'help',
    content: '↑/↓ move  Enter select  q quit  |  CLI: naru mcp set context7 ctx7sk_...  naru mcp validate',
    fg: '#666677',
  });

  // Input for context7 (hidden initially)
  let inputBox = null;
  let keyInput = null;

  function getStatusIcon(info) {
    if (!info) return '○';
    if (!info.available) return '○';
    if (info.needsInit) return '◐';
    if (info.needsKey) return '◐';
    return '✓';
  }

  function getStatusColor(info) {
    if (!info) return '#666677';
    if (!info.available) return '#ffaa00';
    if (info.needsInit || info.needsKey) return '#ffaa00';
    return '#00ff88';
  }

  function renderList() {
    // Clear previous children (except we rebuild)
    // opentui: need to remove all children then re-add
    // Simplest: listBox inner children are TextRenderables, we recreate
    // Remove existing children by clearing array (if API allows)
    try {
      // @opentui/core BoxRenderable has `children` array and `remove` method
      // Try to clear via while loop
      while (listBox.children && listBox.children.length > 0) {
        const child = listBox.children[0];
        if (typeof listBox.remove === 'function') listBox.remove(child);
        else break;
      }
    } catch {}

    MCP_ORDER.forEach((name, idx) => {
      const info = mcpData[name];
      const meta = MCP_META[name];
      const isSelected = idx === selected && mode === 'browse';
      const icon = getStatusIcon(info);
      const color = getStatusColor(info);
      const selBg = isSelected ? '#1e1e3a' : 'transparent';
      const selFg = isSelected ? '#ffffff' : color;
      const extra = name === 'context7' && ctxKeyInfo.key
        ? ` ${maskKey(ctxKeyInfo.key)}`
        : '';

      const line = isSelected ? `▶ ${icon} ${name.padEnd(22)} ${meta.desc}${extra}  ← ${meta.hint}` : `  ${icon} ${name.padEnd(22)} ${meta.desc}${extra}`;

      const row = new TextRenderable(renderer, {
        id: `row-${name}`,
        content: line,
        fg: selFg,
        backgroundColor: selBg,
      });
      listBox.add(row);

      // Second line: source detail (dim)
      const srcLine = `    ${info?.source || 'unknown'}`;
      const srcRow = new TextRenderable(renderer, {
        id: `src-${name}`,
        content: srcLine,
        fg: isSelected ? '#aaaaee' : '#666677',
        backgroundColor: selBg,
      });
      listBox.add(srcRow);
    });

    // Update message
    msgText.content = message || 'Tip: Select context7 → Enter to set ctx7sk_ key • codegraph → Enter to init';
    msgText.fg = messageColor;
  }

  // Build layout
  rootBox.add(header);
  rootBox.add(subHeader);
  rootBox.add(listBox);
  rootBox.add(msgText);
  rootBox.add(helpText);
  renderer.root.add(rootBox);

  renderList();

  // Input mode helpers
  function enterInputMode() {
    mode = 'input-context7';
    message = 'Enter Context7 key (ctx7sk_...) → Enter to save, Esc to cancel';
    messageColor = '#ffcc00';

    inputBox = new BoxRenderable(renderer, {
      id: 'input-box',
      flexDirection: 'column',
      backgroundColor: '#1a1a2e',
      borderStyle: 'rounded',
      borderColor: '#ffcc00',
      padding: 1,
      gap: 1,
    });
    inputBox.add(new TextRenderable(renderer, { content: 'Context7 API Key (hidden input, paste ctx7sk_...)', fg: '#ffcc00' }));
    keyInput = new InputRenderable(renderer, {
      id: 'ctx7-input',
      width: 60,
      placeholder: 'ctx7sk_...',
      backgroundColor: '#222233',
      focusedBackgroundColor: '#333355',
      textColor: '#ffffff',
      cursorColor: '#ffcc00',
    });
    inputBox.add(keyInput);
    inputBox.add(new TextRenderable(renderer, { content: 'Enter: save & validate • Esc: cancel', fg: '#8888aa' }));
    rootBox.add(inputBox);
    keyInput.focus();
    renderList();
  }

  function exitInputMode() {
    mode = 'browse';
    if (inputBox) {
      try { rootBox.remove(inputBox); } catch {}
      inputBox = null;
      keyInput = null;
    }
    renderList();
  }

  async function handleSelect() {
    const name = MCP_ORDER[selected];
    if (name === 'context7') {
      enterInputMode();
    } else if (name === 'codegraph') {
      const info = mcpData['codegraph'];
      if (info?.needsInit) {
        message = 'Running codegraph init...';
        messageColor = '#ffcc00';
        renderList();
        try {
          const { exec } = await import('node:child_process');
          const { promisify } = await import('node:util');
          const execAsync = promisify(exec);
          const { stdout } = await execAsync('codegraph init 2>&1');
          message = `✓ ${stdout.match(/Indexed \d+ files/)?.[0] || 'codegraph ready'}`;
          messageColor = '#00ff88';
          // Refresh data
          mcpData = await discoverMCPServers();
        } catch (e) {
          message = `✗ codegraph init failed: ${e.message}`;
          messageColor = '#ff4444';
        }
        renderList();
      } else {
        message = 'codegraph already initialized ✓ — run: naru mcp validate codegraph';
        messageColor = '#00ff88';
        renderList();
      }
    } else {
      message = `${name}: ${mcpData[name]?.source || 'no action'} — use: naru mcp status`;
      messageColor = '#AEBBFF';
      renderList();
    }
  }

  // Key handling
  renderer.keyInput.on('keypress', async (key) => {
    // Input mode: handle Esc
    if (mode === 'input-context7') {
      if (key.name === 'escape') {
        exitInputMode();
        return;
      }
      // InputRenderable handles its own Enter, we listen for its ENTER event below
      return;
    }

    // Browse mode
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      renderer.destroy();
      return;
    }
    if (key.name === 'up' || key.name === 'k') {
      selected = Math.max(0, selected - 1);
      renderList();
    } else if (key.name === 'down' || key.name === 'j') {
      selected = Math.min(MCP_ORDER.length - 1, selected + 1);
      renderList();
    } else if (key.name === 'return' || key.name === 'enter') {
      await handleSelect();
    } else if (key.name === 'r') {
      // Refresh
      mcpData = await discoverMCPServers();
      ctxKeyInfo = await getContext7Key();
      message = 'Refreshed ✓';
      messageColor = '#00ff88';
      renderList();
    }
  });

  // Input-mode save handler (second listener for Enter in input mode)
  renderer.keyInput.on('keypress', async (key) => {
    if (mode !== 'input-context7' || !keyInput) return;
    if (key.name === 'return' || key.name === 'enter') {
      const rawKey = keyInput.value?.trim();
      if (!rawKey) {
        message = '✗ Empty key — Esc to cancel';
        messageColor = '#ff4444';
        renderList();
        return;
      }
      const fmt = validateKeyFormat(rawKey);
      if (!fmt.valid) {
        message = `✗ ${fmt.reason}`;
        messageColor = '#ff4444';
        renderList();
        return;
      }
      message = `Validating ${maskKey(rawKey)} ...`;
      messageColor = '#ffcc00';
      renderList();
      const probe = await probeContext7Key(rawKey);
      if (!probe.ok) {
        message = `⚠ ${probe.reason} — saving anyway`;
        messageColor = '#ffaa00';
      } else {
        message = `✓ Probe ok (HTTP ${probe.status || 200})`;
        messageColor = '#00ff88';
      }
      renderList();
      try {
        await setContext7Key(rawKey);
        ctxKeyInfo = await getContext7Key();
        mcpData = await discoverMCPServers();
        message = `✓ Saved ${maskKey(rawKey)} — validating...`;
        messageColor = '#00ff88';
      } catch (e) {
        message = `✗ Save failed: ${e.message}`;
        messageColor = '#ff4444';
      }
      renderList();
      setTimeout(() => exitInputMode(), 1200);
    }
  });

  // Cleanup on destroy
  const origDestroy = renderer.destroy.bind(renderer);
  renderer.destroy = () => {
    origDestroy();
    process.exit(0);
  };
}
