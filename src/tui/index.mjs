// ─── index.mjs ── TUI entry (opentui) ─────────────────────────────────────
// Now uses @opentui/core for all interfaces (replaces custom ANSI renderer)
// Falls back to legacy if opentui unavailable
// ──────────────────────────────────────────────────────────────────────────────

export async function launchTUI(options = {}) {
  try {
    const { launchMainTui } = await import('./screens/main.mjs');
    await launchMainTui(options);
  } catch (e) {
    console.error(`\x1b[31m✗ TUI failed: ${e.message}\x1b[0m`);
    process.exit(1);
  }
}
