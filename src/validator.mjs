// ─── validator.mjs ── Agent file validator ──────────────────────────────────
// Validates agent files have correct YAML frontmatter and structure
// ──────────────────────────────────────────────────────────────────────────────

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const AGENTS_DIR = join(ROOT_DIR, 'agents');

/**
 * Validate YAML frontmatter
 * @param {string} content - File content
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateYAML(content) {
  const errors = [];

  // Check for frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push('No YAML frontmatter found');
    return { valid: false, errors };
  }

  const yaml = frontmatterMatch[1];

  // Check for required fields
  if (!yaml.includes('description:')) {
    errors.push('Missing description field');
  }

  if (!yaml.includes('mode:')) {
    errors.push('Missing mode field');
  }

  // Check for old permission format
  if (yaml.includes('permission_deny:') || yaml.includes('permission_allow:')) {
    errors.push('Old permission format detected (permission_deny/allow)');
  }

  // Check for new permission format
  if (!yaml.includes('permission:')) {
    errors.push('Missing permission section');
  }

  // Check for invalid webfetch / websearch permission object format
  if (/webfetch:\s*\r?\n\s+["*]/.test(yaml) || /websearch:\s*\r?\n\s+["*]/.test(yaml)) {
    errors.push('webfetch/websearch must be a string action ("allow" | "ask" | "deny"), not an object/mapping');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a single agent file
 * @param {string} filePath - Path to agent file
 * @returns {Promise<{ file: string, valid: boolean, errors: string[] }>}
 */
async function validateAgentFile(filePath) {
  const file = filePath.split(/[\\/]/).pop();
  const content = await readFile(filePath, 'utf8');
  const { valid, errors } = validateYAML(content);

  return { file, valid, errors };
}

/**
 * Validate all agent files
 */
export async function validate() {
  console.log('\nValidating agent files...\n');

  const files = await readdir(AGENTS_DIR);
  const agentFiles = files.filter(f => f.endsWith('.md'));

  let validCount = 0;
  let invalidCount = 0;

  for (const file of agentFiles) {
    const filePath = join(AGENTS_DIR, file);
    const result = await validateAgentFile(filePath);

    if (result.valid) {
      console.log(`✅ ${result.file}`);
      validCount++;
    } else {
      console.log(`❌ ${result.file}`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
      invalidCount++;
    }
  }

  console.log(`\nValidation complete!`);
  console.log(`  Valid: ${validCount}`);
  console.log(`  Invalid: ${invalidCount}`);

  if (invalidCount > 0) {
    process.exit(1);
  }
}
