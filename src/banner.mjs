// ─── banner.mjs ── Modern OpenCode-Style ASCII Banner ─────────────────────────
// Renders vibrant Truecolor gradient block letters for Naru Agents
// ──────────────────────────────────────────────────────────────────────────────

import { BANNER_PRESETS } from './constants.mjs';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
};

/**
 * 24-bit Truecolor RGB escape sequence
 */
function rgb(r, g, b) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

/**
 * Generate the stylized 'naru agents' block banner string
 * @param {string|object} [presetOrOptions='main'] - Preset name ('main'|'setup'|'doctor'|'update') or options object
 * @param {object} [overrides={}] - Optional overrides for system or commands
 * @returns {string}
 */
export function getBannerString(presetOrOptions = 'main', overrides = {}) {
  let systemText = '';
  let commandsText = '';

  if (typeof presetOrOptions === 'string') {
    const preset = BANNER_PRESETS[presetOrOptions] || BANNER_PRESETS.main;
    systemText = overrides.system ?? overrides.session ?? preset.system;
    commandsText = overrides.commands ?? overrides.continueCmd ?? preset.commands;
  } else if (typeof presetOrOptions === 'object' && presetOrOptions !== null) {
    const fallback = BANNER_PRESETS.main;
    systemText = presetOrOptions.system ?? presetOrOptions.session ?? fallback.system;
    commandsText = presetOrOptions.commands ?? presetOrOptions.continueCmd ?? fallback.commands;
  } else {
    systemText = BANNER_PRESETS.main.system;
    commandsText = BANNER_PRESETS.main.commands;
  }

  // Letter gradient palette (Electric Cyan ➔ Royal Violet ➔ Neon Pink)
  const l1 = [
    rgb(0, 240, 255) + '█▀▀▄ ' + rgb(0, 210, 255) + '█▀▀█ ' + rgb(0, 180, 255) + '█▀▀█ ' + rgb(75, 150, 255) + '█  █' + C.reset + '    ' + rgb(140, 110, 255) + '█▀▀█ ' + rgb(170, 90, 255) + '█▀▀█ ' + rgb(200, 70, 255) + '█▀▀█ ' + rgb(230, 50, 230) + '█▀▀▄ ' + rgb(250, 50, 190) + '▀█▀ ' + rgb(255, 60, 150) + '█▀▀▀' + C.reset,
    rgb(0, 240, 255) + '█  █ ' + rgb(0, 210, 255) + '█▄▄█ ' + rgb(0, 180, 255) + '█▄▄▀ ' + rgb(75, 150, 255) + '█  █' + C.reset + '    ' + rgb(140, 110, 255) + '█▄▄█ ' + rgb(170, 90, 255) + '█ ▀▄ ' + rgb(200, 70, 255) + '█▀▀▀ ' + rgb(230, 50, 230) + '█  █ ' + rgb(250, 50, 190) + ' █  ' + rgb(255, 60, 150) + '▀▀▀█' + C.reset,
    rgb(0, 240, 255) + '▀  ▀ ' + rgb(0, 210, 255) + '▀  ▀ ' + rgb(0, 180, 255) + '▀ ▀▀ ' + rgb(75, 150, 255) + '▀▀▀▀' + C.reset + '    ' + rgb(140, 110, 255) + '▀  ▀ ' + rgb(170, 90, 255) + '▀▀▀▀ ' + rgb(200, 70, 255) + '▀▀▀▀ ' + rgb(230, 50, 230) + '▀  ▀ ' + rgb(250, 50, 190) + ' ▀  ' + rgb(255, 60, 150) + '▀▀▀▀' + C.reset,
  ];

  const lines = [
    '',
    ...l1.map(line => '  ' + line),
    '',
    '  ' + C.gray + 'System  ' + C.reset + ' ' + C.bold + systemText + C.reset,
    '  ' + C.gray + 'Commands' + C.reset + ' ' + C.yellow + commandsText + C.reset,
    '',
  ];

  return lines.join('\n');
}

/**
 * Print banner directly to stdout
 * @param {string|object} [presetOrOptions='main']
 * @param {object} [overrides={}]
 */
export function printBanner(presetOrOptions = 'main', overrides = {}) {
  console.log(getBannerString(presetOrOptions, overrides));
}
