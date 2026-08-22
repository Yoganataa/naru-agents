// ─── index.mjs ── TUI entry (opentui) ─────────────────────────────────────
// Now uses @opentui/core for all interfaces (replaces custom ANSI renderer)
// Falls back to legacy if opentui unavailable
// ──────────────────────────────────────────────────────────────────────────────

export async function launchTUI(options = {}) {
  try {
    const { launchMainTui } = await import('./main-opentui.mjs');
    await launchMainTui(options);
  } catch (e) {
    // Fallback to legacy custom TUI
    console.error(`\x1b[33m⚠ opentui failed (${e.message}) — falling back to legacy TUI\x1b[0m`);
    const { launchTUI: launchLegacy } = await import('./index-legacy.mjs');
    await launchLegacy(options);
  }
}
