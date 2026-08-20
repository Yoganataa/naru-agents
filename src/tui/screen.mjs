// ─── screen.mjs ── Terminal I/O ─────────────────────────────────────────────
// Handles raw mode, clear, write, and resize detection
// ──────────────────────────────────────────────────────────────────────────────

import { stdin, stdout } from 'node:process';

// ANSI escape codes
const ESC = '\x1b[';
const ALT_SCREEN_ON = ESC + '?1049h';
const ALT_SCREEN_OFF = ESC + '?1049h';
const CURSOR_HIDE = ESC + '?25l';
const CURSOR_SHOW = ESC + '?25h';
const CLEAR = ESC + '2J';
const HOME = ESC + 'H';

let originalMode = null;
let prevLines = [];

/**
 * Get terminal size
 * @returns {{ cols: number, rows: number }}
 */
export function getSize() {
  return {
    cols: stdout.columns || 80,
    rows: stdout.rows || 24,
  };
}

/**
 * Enter raw mode and switch to alternate screen
 */
export function enter() {
  if (!stdin.isTTY) {
    console.error('Error: TUI requires an interactive terminal (TTY)');
    process.exit(1);
  }

  originalMode = stdin.isRaw;
  stdin.setRawMode(true);
  stdin.resume();

  stdout.write(ALT_SCREEN_ON);
  stdout.write(CURSOR_HIDE);
  stdout.write(CLEAR);
  stdout.write(HOME);

  prevLines = [];
}

/**
 * Exit raw mode and restore terminal
 */
export function exit() {
  stdout.write(CURSOR_SHOW);
  stdout.write(ALT_SCREEN_OFF);

  if (originalMode !== null) {
    stdin.setRawMode(originalMode);
  }
  stdin.pause();
}

/**
 * Flush a frame to the terminal (line-level diffing)
 * @param {string} buffer - Complete frame as string
 */
export function flush(buffer) {
  const lines = buffer.split('\n');
  const { rows } = getSize();

  // Only update lines that changed
  for (let i = 0; i < Math.min(lines.length, rows); i++) {
    if (lines[i] !== prevLines[i]) {
      // Move to line and clear it
      stdout.write(`${ESC}${i + 1};1H`);
      stdout.write(`${ESC}2K`);
      stdout.write(lines[i]);
    }
  }

  prevLines = lines;
}

/**
 * Clear the screen
 */
export function clear() {
  stdout.write(CLEAR);
  stdout.write(HOME);
  prevLines = [];
}

/**
 * Write a line directly
 * @param {string} line
 */
export function writeLine(line) {
  stdout.write(line + '\n');
}
