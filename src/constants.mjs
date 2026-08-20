// ─── constants.mjs ── Single Source of Truth (SSOT) ───────────────────────────
// Centralized project metadata, versioning, and banner presets
// ──────────────────────────────────────────────────────────────────────────────

export const VERSION = '0.0.2';
export const APP_NAME = 'N.A.R.U.';
export const APP_FULL_NAME = 'Next-gen Autonomous Role-based Unified agents';
export const REPO_SLUG = 'yoganataa/naru-agents';

/**
 * Standardized banner configuration presets for all CLI modules
 */
export const BANNER_PRESETS = {
  main: {
    system: `${APP_NAME} — ${APP_FULL_NAME} (v${VERSION})`,
    commands: 'naru setup | naru doctor | naru update',
  },
  setup: {
    system: `${APP_NAME} — Smart System Setup (11 Agents + 5 MCPs) (v${VERSION})`,
    commands: 'naru doctor | opencode',
  },
  doctor: {
    system: `${APP_NAME} — Smart Doctor Diagnostic & Health Audit (v${VERSION})`,
    commands: 'opencode agent list | opencode mcp list',
  },
  update: {
    system: `${APP_NAME} — Auto-Update & Self-Upgrade Engine (v${VERSION})`,
    commands: 'naru doctor',
  },
};
