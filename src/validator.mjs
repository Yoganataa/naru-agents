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
 * Validate YAML frontmatter and structural agent contracts
 * @param {string} content - File content
 * @param {string} filename - Name of agent file
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateYAML(content, filename) {
  const errors = [];

  // Check for frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push('No YAML frontmatter found');
    return { valid: false, errors };
  }

  const yaml = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);

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

  // Step validation (A.4): verify steps is a positive integer and SOP body contains structured workflow
  const stepsMatch = yaml.match(/steps:\s*(\d+)/);
  if (stepsMatch) {
    const stepsVal = parseInt(stepsMatch[1], 10);
    if (isNaN(stepsVal) || stepsVal <= 0) {
      errors.push(`steps must be a positive integer, got: ${stepsMatch[1]}`);
    }
  }
  if (!body.includes('Workflow') && !body.includes('Step 1') && !body.includes('Pipeline') && filename !== 'naru.md') {
    errors.push('Subagent body must define structured SOP workflow steps');
  }

  // Deploy safety validation: deploy-agent bash wildcard must be "ask"
  if (filename === 'deploy-agent.md') {
    const bashWildcardMatch = yaml.match(/bash:\s*\r?\n(?:\s+.*\r?\n)*?\s+["*]+:\s*"([^"]+)"/);
    if (bashWildcardMatch && bashWildcardMatch[1] !== 'ask') {
      errors.push(`deploy-agent bash wildcard must be "ask" for safety, got: "${bashWildcardMatch[1]}"`);
    }
  }

  // Code modification agents must have semantic / context tools
  if (filename === 'developer-agent.md' || filename === 'hotfix-agent.md') {
    const hasSemanticTool = yaml.includes('serena_') || yaml.includes('lean-ctx_') || yaml.includes('codegraph_');
    if (!hasSemanticTool) {
      errors.push(`${filename} modifies code but lacks semantic code MCP tools (serena / lean-ctx / codegraph)`);
    }
  }

  // Technical claim agents must have explicit Knowledge Gap / Citation section (C.4)
  if (filename === 'researcher-agent.md' || filename === 'dependency-agent.md' || filename === 'naru.md') {
    const hasGroundingOrGap = body.includes('KNOWLEDGE_GAP') || body.includes('Citations') || body.includes('Sitasi') || body.includes('Sources') || body.includes('Grounding');
    if (!hasGroundingOrGap) {
      errors.push(`${filename} provides technical claims but lacks explicit Knowledge Gap or Citation specification`);
    }
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
  const { valid, errors } = validateYAML(content, file);

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
