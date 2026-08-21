// ─── model-manager.mjs ── Dynamic Model Discovery & Interactive Role Optimizer ─
// Grounded in live OpenCode metadata (Artificial Analysis Index & Reasoning Variants)
// ──────────────────────────────────────────────────────────────────────────────

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const execAsync = promisify(exec);

/**
 * Built-in Recommended Model & Variant Defaults (Calibrated to Active OpenCode Models)
 */
export const NARU_DEFAULT_CONFIGS = {
  'naru.md': { model: 'opencode/muse-spark-1.2-contributor-free', variant: 'high' },
  'pm-agent.md': { model: 'opencode/muse-spark-1.2-contributor-free', variant: 'xhigh' },
  'architect-agent.md': { model: 'opencode/muse-spark-1.2-contributor-free', variant: 'xhigh' },
  'developer-agent.md': { model: 'opencode/big-pickle' },
  'hotfix-agent.md': { model: 'opencode/big-pickle' },
  'reviewer-agent.md': { model: 'opencode/x-preview-f-free', variant: 'max' },
  'qa-agent.md': { model: 'opencode/mimo-v2.5-free' },
  'docs-agent.md': { model: 'opencode/nemotron-3-ultra-free' },
  'researcher-agent.md': { model: 'opencode/hy3-free', variant: 'medium' },
  'dependency-agent.md': { model: 'opencode/hy3-free', variant: 'low' },
  'deploy-agent.md': { model: 'opencode/hy3-free', variant: 'low' },
};

export const NARU_DEFAULT_MODELS = Object.fromEntries(
  Object.entries(NARU_DEFAULT_CONFIGS).map(([k, v]) => [k, v.model])
);

/**
 * Known Frontier & Active OpenCode Models Capability Registry
 * Grounded in Artificial Analysis Index, Terminal-Bench, and MMMU-Pro
 */
export const MODEL_CAPABILITIES_REGISTRY = {
  // ── Active OpenCode Free Models (Verified Ground-Truth) ──────────────────────
  'opencode/muse-spark-1.2-contributor-free': {
    name: 'Muse Spark 1.2 Free',
    vision: true,
    pdf: true,
    codingSpecialist: false,
    contextWindow: 1048576,
    maxOutput: 131072,
    speed: 'fast',
    tier: 'frontier-omni',
    supportedVariants: ['minimal', 'low', 'medium', 'high', 'xhigh'],
    defaultVariant: 'high',
    aaIndex: 54.0,
  },
  'opencode/x-preview-f-free': {
    name: 'Ox Alpha Free',
    vision: true,
    pdf: false,
    codingSpecialist: true,
    contextWindow: 1000000,
    maxOutput: 131072,
    speed: 'fast',
    tier: 'frontier-omni-reasoning',
    supportedVariants: ['low', 'high', 'max'],
    defaultVariant: 'max',
    aaIndex: 50.0,
  },
  'opencode/big-pickle': {
    name: 'Big Pickle',
    vision: false,
    pdf: false,
    codingSpecialist: true,
    contextWindow: 200000,
    maxOutput: 32000,
    speed: 'fast',
    tier: 'frontier-coding',
    supportedVariants: [],
    defaultVariant: null,
    aaIndex: 47.0,
  },
  'opencode/mimo-v2.5-free': {
    name: 'MiMo V2.5 Free',
    vision: true,
    pdf: false,
    codingSpecialist: false,
    contextWindow: 1048576,
    maxOutput: 256000,
    speed: 'medium',
    tier: 'multimodal-vision',
    supportedVariants: [],
    defaultVariant: null,
    aaIndex: 43.0,
  },
  'opencode/nemotron-3-ultra-free': {
    name: 'Nemotron 3 Ultra Free',
    vision: false,
    pdf: false,
    codingSpecialist: false,
    contextWindow: 1000000,
    maxOutput: 128000,
    speed: 'fast',
    tier: 'high-reasoning-rag',
    supportedVariants: [],
    defaultVariant: null,
    aaIndex: 48.2,
  },
  'opencode/nemotron-3.5-lightning-free': {
    name: 'Nemotron 3.5 Lightning Free',
    vision: false,
    pdf: false,
    codingSpecialist: false,
    contextWindow: 262144,
    maxOutput: 262144,
    speed: 'ultra-fast',
    tier: 'lightweight-execution',
    supportedVariants: [],
    defaultVariant: null,
    aaIndex: 38.0,
  },
  'opencode/hy3-free': {
    name: 'Hy3 Free',
    vision: false,
    pdf: false,
    codingSpecialist: false,
    contextWindow: 190000,
    maxOutput: 64000,
    speed: 'ultra-fast',
    tier: 'lightweight-fast',
    supportedVariants: ['low', 'medium', 'high'],
    defaultVariant: 'medium',
    aaIndex: 41.0,
  },

  // ── Commercial Frontier Tier (Anthropic, OpenAI, Google) ────────────────────
  'anthropic/claude-3-7-sonnet': { vision: true, pdf: true, codingSpecialist: true, contextWindow: 200000, speed: 'fast', tier: 'frontier-omni', supportedVariants: [] },
  'anthropic/claude-3-5-sonnet': { vision: true, pdf: true, codingSpecialist: true, contextWindow: 200000, speed: 'fast', tier: 'frontier-omni', supportedVariants: [] },
  'anthropic/claude-3-5-haiku': { vision: true, pdf: true, codingSpecialist: false, contextWindow: 200000, speed: 'ultra-fast', tier: 'lightweight-fast', supportedVariants: [] },
  'openai/gpt-4o': { vision: true, pdf: true, codingSpecialist: true, contextWindow: 128000, speed: 'fast', tier: 'frontier-omni', supportedVariants: [] },
  'openai/gpt-4o-mini': { vision: true, pdf: true, codingSpecialist: false, contextWindow: 128000, speed: 'ultra-fast', tier: 'lightweight-fast', supportedVariants: [] },
  'openai/o3-mini': { vision: false, pdf: false, codingSpecialist: true, contextWindow: 200000, speed: 'fast', tier: 'frontier-coding', supportedVariants: ['low', 'medium', 'high'] },
  'google/gemini-2.5-pro': { vision: true, pdf: true, codingSpecialist: true, contextWindow: 2000000, speed: 'medium', tier: 'frontier-omni', supportedVariants: [] },
  'google/gemini-2.5-flash': { vision: true, pdf: true, codingSpecialist: false, contextWindow: 1048576, speed: 'ultra-fast', tier: 'high-reasoning', supportedVariants: [] },
};

/**
 * 4 Cognitive Role Clusters & Technical Requirements
 */
export const ROLE_REQUIREMENTS = {
  orchestration: {
    agents: ['naru.md', 'pm-agent.md', 'architect-agent.md'],
    name: 'Strategic Triad & Architecture',
    minContext: 128000,
    idealContext: 1048576,
    needsVision: true,
    needsPdf: true,
    needsCoding: false,
    recommended: 'opencode/muse-spark-1.2-contributor-free, anthropic/claude-3-7-sonnet, google/gemini-2.5-pro',
  },
  coding: {
    agents: ['developer-agent.md', 'hotfix-agent.md'],
    name: 'Autonomous Code Synthesis & Hotfix',
    minContext: 32000,
    idealContext: 200000,
    needsVision: false,
    needsPdf: false,
    needsCoding: true,
    recommended: 'opencode/big-pickle, opencode/x-preview-f-free, anthropic/claude-3-7-sonnet',
  },
  security_review: {
    agents: ['reviewer-agent.md'],
    name: 'Security, Drift & No-Bypass Audit',
    minContext: 128000,
    idealContext: 1000000,
    needsVision: true,
    needsPdf: false,
    needsCoding: true,
    recommended: 'opencode/x-preview-f-free, opencode/muse-spark-1.2-contributor-free, anthropic/claude-3-7-sonnet',
  },
  vision_qa: {
    agents: ['qa-agent.md'],
    name: 'Multimodal Quality Assurance & E2E Testing',
    minContext: 128000,
    idealContext: 1048576,
    needsVision: true,
    needsPdf: false,
    needsCoding: false,
    recommended: 'opencode/mimo-v2.5-free, opencode/x-preview-f-free, google/gemini-2.5-flash',
  },
  documentation: {
    agents: ['docs-agent.md'],
    name: 'Enterprise Documentation & Knowledge Reflection',
    minContext: 128000,
    idealContext: 1000000,
    needsVision: false,
    needsPdf: false,
    needsCoding: false,
    recommended: 'opencode/nemotron-3-ultra-free, opencode/muse-spark-1.2-contributor-free',
  },
  fast_retrieval: {
    agents: ['researcher-agent.md', 'dependency-agent.md', 'deploy-agent.md'],
    name: 'Fast Retrieval, Dependency & DevOps',
    minContext: 32000,
    idealContext: 190000,
    needsVision: false,
    needsPdf: false,
    needsCoding: false,
    recommended: 'opencode/hy3-free, opencode/nemotron-3.5-lightning-free, google/gemini-2.0-flash',
  },
};

/**
 * Discover models available in OpenCode CLI
 * @returns {Promise<string[]>}
 */
export async function discoverOpenCodeModels() {
  try {
    const { stdout } = await execAsync('opencode models');
    const models = stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('───') && !line.startsWith('Error'));

    if (models.length > 0) {
      return models;
    }
  } catch {}

  return Object.values(NARU_DEFAULT_MODELS).filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Get capability metadata for a model
 * @param {string} modelId
 * @returns {object}
 */
export function getModelCapabilities(modelId) {
  const actualId = typeof modelId === 'object' && modelId !== null ? modelId.model : String(modelId || '');
  if (MODEL_CAPABILITIES_REGISTRY[actualId]) {
    return MODEL_CAPABILITIES_REGISTRY[actualId];
  }

  const lower = actualId.toLowerCase();
  const hasVision = lower.includes('vision') || lower.includes('-vl') || lower.includes('4o') || lower.includes('sonnet') || lower.includes('mimo') || lower.includes('gemini') || lower.includes('spark') || lower.includes('x-preview');
  const isCoding = lower.includes('coder') || lower.includes('pickle') || lower.includes('o3-mini') || lower.includes('sonnet') || lower.includes('x-preview');
  const isFast = lower.includes('flash') || lower.includes('mini') || lower.includes('haiku') || lower.includes('lightning') || lower.includes('hy3');

  return {
    name: actualId,
    vision: hasVision,
    pdf: lower.includes('spark') || lower.includes('claude') || lower.includes('gpt-4o'),
    codingSpecialist: isCoding,
    contextWindow: lower.includes('1m') ? 1048576 : 128000,
    maxOutput: 64000,
    speed: isFast ? 'ultra-fast' : 'fast',
    tier: 'custom-model',
    supportedVariants: [],
  };
}

/**
 * Find which role cluster an agent file belongs to
 * @param {string} agentFile
 * @returns {object|null}
 */
export function getRoleClusterForAgent(agentFile) {
  for (const [clusterKey, cluster] of Object.entries(ROLE_REQUIREMENTS)) {
    if (cluster.agents.includes(agentFile)) {
      return { key: clusterKey, ...cluster };
    }
  }
  return null;
}

/**
 * Validate whether a model is suitable for an agent role
 * @param {string} agentFile
 * @param {string} modelId
 * @returns {{ isOptimal: boolean, warning?: string, level?: 'info'|'warning'|'critical', recommendation?: string }}
 */
export function validateModelForRole(agentFile, modelId) {
  const cluster = getRoleClusterForAgent(agentFile);
  if (!cluster) {
    return { isOptimal: true };
  }

  const caps = getModelCapabilities(modelId);

  // 1. Critical Check: Multimodal Vision required for QA / Reviewer
  if (cluster.needsVision && !caps.vision) {
    return {
      isOptimal: false,
      level: 'critical',
      warning: `🚨 CRITICAL CAPABILITY MISMATCH: '${modelId}' does NOT support Multimodal Vision. UI regression testing, screenshot OCR, and visual layout inspection will be disabled.`,
      recommendation: cluster.recommended,
    };
  }

  // 2. Warning Check: Coding specialist required for Developer / Hotfix
  if (cluster.needsCoding && !caps.codingSpecialist && caps.tier !== 'frontier-omni' && caps.tier !== 'frontier-omni-reasoning') {
    return {
      isOptimal: false,
      level: 'warning',
      warning: `⚠️  CAPABILITY MISMATCH: '${modelId}' is not a recognized Coding Specialist model. It may exhibit higher syntax error rates on complex AST multi-file edits.`,
      recommendation: cluster.recommended,
    };
  }

  // 3. Warning Check: Small context for Orchestrator
  if (cluster.minContext && caps.contextWindow < cluster.minContext) {
    return {
      isOptimal: false,
      level: 'warning',
      warning: `⚠️  CONTEXT WARNING: '${modelId}' context window (${caps.contextWindow}) is smaller than recommended minimum (${cluster.minContext}). Long pipelines may experience context truncation.`,
      recommendation: cluster.recommended,
    };
  }

  return { isOptimal: true };
}

/**
 * Read current model and variant assignments from all agent files in a directory
 * @param {string} agentsDir
 * @returns {Promise<Record<string, { model: string, variant?: string }>>}
 */
export async function readAgentModels(agentsDir) {
  const mapping = {};
  try {
    const files = await readdir(agentsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await readFile(join(agentsDir, file), 'utf8');
        const modelMatch = content.match(/^model:\s*([^\r\n]+)/m);
        const variantMatch = content.match(/^variant:\s*([^\r\n]+)/m);
        if (modelMatch) {
          mapping[file] = {
            model: modelMatch[1].trim(),
            variant: variantMatch ? variantMatch[1].trim() : undefined,
          };
        }
      }
    }
  } catch {}
  return mapping;
}

/**
 * Update model and optional variant in an agent markdown file's YAML frontmatter
 * @param {string} filePath
 * @param {string} newModelId
 * @param {string} [newVariant]
 * @returns {Promise<boolean>}
 */
export async function writeAgentModel(filePath, newModelId, newVariant) {
  try {
    let content = await readFile(filePath, 'utf8');
    if (!content.includes('model:')) {
      return false;
    }
    
    // Update model line
    content = content.replace(/^model:\s*([^\r\n]+)/m, `model: ${newModelId}`);

    // Update or remove variant line
    const caps = getModelCapabilities(newModelId);
    const variantToSet = newVariant || (caps.supportedVariants?.length ? caps.defaultVariant : undefined);

    if (variantToSet) {
      if (content.includes('variant:')) {
        content = content.replace(/^variant:\s*([^\r\n]+)/m, `variant: ${variantToSet}`);
      } else {
        content = content.replace(/^model:\s*([^\r\n]+)/m, `model: $1\nvariant: ${variantToSet}`);
      }
    } else {
      if (content.includes('variant:')) {
        content = content.replace(/^variant:\s*[^\r\n]+(\r?\n)?/m, '');
      }
    }

    await writeFile(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Apply model mapping to all agent files in destination directory
 * @param {string} agentsDir
 * @param {Record<string, string|{ model: string, variant?: string }>} mapping
 * @returns {Promise<{ updated: number, errors: number }>}
 */
export async function applyModelMapping(agentsDir, mapping) {
  let updated = 0;
  let errors = 0;

  for (const [file, conf] of Object.entries(mapping)) {
    const filePath = join(agentsDir, file);
    const modelId = typeof conf === 'string' ? conf : conf.model;
    const variant = typeof conf === 'object' ? conf.variant : undefined;
    const ok = await writeAgentModel(filePath, modelId, variant);
    if (ok) updated++;
    else errors++;
  }

  return { updated, errors };
}

/**
 * Print the current 11-agent mapping table
 */
export function printMappingTable(currentMappings) {
  console.log('\x1b[1mCurrent 11-Agent Model Mapping & Role Compatibility:\x1b[0m');
  console.log('┌──────────────────────┬──────────────────────────────────────┬───────────────────────────────────────────┬──────────────┐');
  console.log('│ Agent File           │ Role Cluster                         │ Assigned Model & Reasoning Variant        │ Status       │');
  console.log('├──────────────────────┼──────────────────────────────────────┼───────────────────────────────────────────┼──────────────┤');

  const agentFiles = Object.keys(NARU_DEFAULT_CONFIGS);
  let issueCount = 0;

  for (const file of agentFiles) {
    const rawConf = currentMappings[file] || NARU_DEFAULT_CONFIGS[file];
    const assignedModel = typeof rawConf === 'string' ? rawConf : rawConf.model;
    const assignedVariant = typeof rawConf === 'object' ? rawConf.variant : undefined;
    
    const cluster = getRoleClusterForAgent(file);
    const validation = validateModelForRole(file, assignedModel);

    let statusStr = '\x1b[32m✓ OPTIMAL\x1b[0m   ';
    if (!validation.isOptimal) {
      issueCount++;
      if (validation.level === 'critical') {
        statusStr = '\x1b[31m🚨 CRITICAL\x1b[0m ';
      } else {
        statusStr = '\x1b[33m⚠️ MISMATCH\x1b[0m ';
      }
    }

    const padFile = file.padEnd(20, ' ');
    const padCluster = (cluster?.name?.substring(0, 36) || 'General').padEnd(36, ' ');
    
    let modelDisplay = assignedModel;
    if (assignedVariant) {
      modelDisplay += ` \x1b[35m[${assignedVariant}]\x1b[0m`;
    }
    
    // Formatting padding safely
    const plainLength = assignedModel.length + (assignedVariant ? assignedVariant.length + 3 : 0);
    const padNeeded = Math.max(0, 41 - plainLength);
    const formattedModel = modelDisplay + ' '.repeat(padNeeded);

    console.log(`│ ${padFile} │ ${padCluster} │ ${formattedModel} │ ${statusStr} │`);
  }
  console.log('└──────────────────────┴──────────────────────────────────────┴───────────────────────────────────────────┴──────────────┘\n');

  return issueCount;
}

/**
 * Prompt user to select a model from available list or enter manual string
 * @param {string[]} availableModels
 * @param {import('node:readline/promises').Interface} rl
 * @param {string} [contextMessage]
 * @returns {Promise<{ model: string, variant?: string }|null>}
 */
async function promptModelSelection(availableModels, rl, contextMessage = 'Pilih AI Model:') {
  console.log(`\n\x1b[1m🔍 ${contextMessage}\x1b[0m`);
  for (let i = 0; i < availableModels.length; i++) {
    const m = availableModels[i];
    const caps = getModelCapabilities(m);
    const badges = [];
    if (caps.vision) badges.push('\x1b[35m[Vision]\x1b[0m');
    if (caps.pdf) badges.push('\x1b[34m[PDF]\x1b[0m');
    if (caps.codingSpecialist) badges.push('\x1b[32m[Coding Specialist]\x1b[0m');
    if (caps.aaIndex) badges.push(`\x1b[33m[AA Index: ${caps.aaIndex}]\x1b[0m`);
    if (caps.supportedVariants?.length) badges.push(`\x1b[35m[Variants: ${caps.supportedVariants.join('/')}]\x1b[0m`);
    badges.push(`\x1b[36m[${Math.round(caps.contextWindow / 1000)}k Context]\x1b[0m`);
    console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${m} ${badges.join(' ')}`);
  }
  console.log(`  \x1b[1m[${availableModels.length + 1}]\x1b[0m Input Model ID Kustom Manual (e.g. anthropic/claude-3-7-sonnet)`);
  console.log('  \x1b[1m[B]\x1b[0m Kembali ke Menu Utama\n');

  while (true) {
    const answer = (await rl.question(`Pilih nomor [1-${availableModels.length + 1}, B]: `)).trim();
    if (answer.toLowerCase() === 'b' || answer === '') {
      return null;
    }

    let selectedModel = null;
    const num = parseInt(answer, 10);
    if (!isNaN(num) && num >= 1 && num <= availableModels.length) {
      selectedModel = availableModels[num - 1];
    } else if (num === availableModels.length + 1) {
      const customModel = (await rl.question('Enter full Model ID (format: provider/model): ')).trim();
      if (customModel.length > 0) {
        selectedModel = customModel;
      }
    } else {
      console.log('\x1b[31mInvalid selection. Please enter a valid number.\x1b[0m');
      continue;
    }

    if (selectedModel) {
      const caps = getModelCapabilities(selectedModel);
      let selectedVariant = caps.defaultVariant;

      if (caps.supportedVariants?.length > 1) {
        console.log(`\n\x1b[1m⚙️  Select Reasoning Effort Variant for '${selectedModel}':\x1b[0m`);
        for (let vi = 0; vi < caps.supportedVariants.length; vi++) {
          console.log(`  \x1b[1m[${vi + 1}]\x1b[0m ${caps.supportedVariants[vi]}`);
        }
        const varAns = (await rl.question(`Select variant [1-${caps.supportedVariants.length}, Default: ${caps.defaultVariant || '1'}]: `)).trim();
        const varNum = parseInt(varAns, 10);
        if (!isNaN(varNum) && varNum >= 1 && varNum <= caps.supportedVariants.length) {
          selectedVariant = caps.supportedVariants[varNum - 1];
        }
      }

      return { model: selectedModel, variant: selectedVariant };
    }
  }
}

/**
 * Run interactive or formatted CLI display for model management
 */
export async function runModelManagerCLI() {
  const { printBanner } = await import('./banner.mjs');
  const { homedir } = await import('node:os');
  const globalAgentsDir = join(homedir(), '.config', 'opencode', 'agents');
  
  printBanner('models');

  const availableModels = await discoverOpenCodeModels();
  let currentMappings = await readAgentModels(globalAgentsDir);

  console.log('\x1b[1m1. Discovered OpenCode Models:\x1b[0m');
  if (availableModels.length === 0) {
    console.log('   \x1b[33m⚠ No models discovered from OpenCode. Using Naru default presets.\x1b[0m\n');
  } else {
    for (const m of availableModels) {
      const caps = getModelCapabilities(m);
      const badges = [];
      if (caps.vision) badges.push('\x1b[35m[Vision]\x1b[0m');
      if (caps.pdf) badges.push('\x1b[34m[PDF]\x1b[0m');
      if (caps.codingSpecialist) badges.push('\x1b[32m[Coding Specialist]\x1b[0m');
      if (caps.aaIndex) badges.push(`\x1b[33m[AA Index: ${caps.aaIndex}]\x1b[0m`);
      if (caps.supportedVariants?.length) badges.push(`\x1b[35m[Variants: ${caps.supportedVariants.join('/')}]\x1b[0m`);
      badges.push(`\x1b[36m[${caps.speed}]\x1b[0m`);
      badges.push(`\x1b[36m[${Math.round(caps.contextWindow / 1000)}k Context]\x1b[0m`);
      console.log(`   - \x1b[1m${m}\x1b[0m ${badges.join(' ')}`);
    }
    console.log('');
  }

  printMappingTable(currentMappings);

  // If running in non-interactive environment (CI / pipe), stop here
  if (!process.stdin.isTTY) {
    return;
  }

  const rl = createInterface({ input, output });

  try {
    while (true) {
      console.log('\x1b[1m📋 Model Configuration Actions:\x1b[0m');
      console.log('  \x1b[1m[1]\x1b[0m Apply 1 Unified Model to All 11 Agents');
      console.log('  \x1b[1m[2]\x1b[0m Configure by Cognitive Role Cluster (Strategic Triad, Coding, QA, DevOps, etc.)');
      console.log('  \x1b[1m[3]\x1b[0m Configure Individual Subagents (Model & Reasoning Variant)');
      console.log('  \x1b[1m[4]\x1b[0m Reset to N.A.R.U. Optimal Benchmark Recommendations');
      console.log('  \x1b[1m[Q]\x1b[0m Save & Exit\n');

      const action = (await rl.question('Select option [1-4, Q]: ')).trim().toLowerCase();

      if (action === 'q' || action === 'quit' || action === 'exit') {
        console.log('\n\x1b[32m✅ Configuration saved. Exiting Model Manager.\x1b[0m\n');
        break;
      }

      // ── Option 1: Unified Single Model ────────────────────────────
      if (action === '1') {
        const chosen = await promptModelSelection(availableModels, rl, 'Select Model to Apply to All 11 Agents:');
        if (chosen) {
          const customMapping = {};
          let warnings = 0;
          for (const file of Object.keys(NARU_DEFAULT_CONFIGS)) {
            customMapping[file] = { model: chosen.model, variant: chosen.variant };
            const val = validateModelForRole(file, chosen.model);
            if (!val.isOptimal) {
              warnings++;
              console.log(`   ${val.warning}`);
            }
          }

          let proceed = true;
          if (warnings > 0) {
            const confirm = (await rl.question('\n⚠️  Capability mismatch detected. Apply anyway? [Y/n] (Default: Y): ')).trim().toLowerCase();
            if (confirm === 'n') proceed = false;
          }

          if (proceed) {
            await applyModelMapping(globalAgentsDir, customMapping);
            console.log(`\n\x1b[32m✓ Successfully applied model '${chosen.model}' to all 11 agents!\x1b[0m\n`);
            currentMappings = await readAgentModels(globalAgentsDir);
            printMappingTable(currentMappings);
          }
        }
      }

      // ── Option 2: By Role Cluster ─────────────────────────────────
      else if (action === '2') {
        console.log('\n\x1b[1mSelect Cognitive Role Cluster to Configure:\x1b[0m');
        const clusterKeys = Object.keys(ROLE_REQUIREMENTS);
        for (let i = 0; i < clusterKeys.length; i++) {
          const k = clusterKeys[i];
          const cl = ROLE_REQUIREMENTS[k];
          console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${cl.name} (${cl.agents.join(', ')})`);
        }
        console.log('  \x1b[1m[B]\x1b[0m Back\n');

        const clChoice = (await rl.question(`Select cluster [1-${clusterKeys.length}, B]: `)).trim();
        const clNum = parseInt(clChoice, 10);
        if (!isNaN(clNum) && clNum >= 1 && clNum <= clusterKeys.length) {
          const selectedKey = clusterKeys[clNum - 1];
          const cluster = ROLE_REQUIREMENTS[selectedKey];
          const chosen = await promptModelSelection(availableModels, rl, `Select Model for Cluster '${cluster.name}':`);
          if (chosen) {
            const patchMapping = {};
            let warnings = 0;
            for (const file of cluster.agents) {
              patchMapping[file] = { model: chosen.model, variant: chosen.variant };
              const val = validateModelForRole(file, chosen.model);
              if (!val.isOptimal) {
                warnings++;
                console.log(`   ${val.warning}`);
              }
            }

            let proceed = true;
            if (warnings > 0) {
              const confirm = (await rl.question('\n⚠️  Capability warning detected. Apply anyway? [Y/n] (Default: Y): ')).trim().toLowerCase();
              if (confirm === 'n') proceed = false;
            }

            if (proceed) {
              await applyModelMapping(globalAgentsDir, patchMapping);
              console.log(`\n\x1b[32m✓ Successfully updated cluster '${cluster.name}' with model '${chosen.model}'!\x1b[0m\n`);
              currentMappings = await readAgentModels(globalAgentsDir);
              printMappingTable(currentMappings);
            }
          }
        }
      }

      // ── Option 3: By Individual Agent ─────────────────────────────
      else if (action === '3') {
        const agentFiles = Object.keys(NARU_DEFAULT_CONFIGS);
        console.log('\n\x1b[1mSelect Subagent to Configure:\x1b[0m');
        for (let i = 0; i < agentFiles.length; i++) {
          const file = agentFiles[i];
          const rawConf = currentMappings[file] || NARU_DEFAULT_CONFIGS[file];
          const currentModel = typeof rawConf === 'string' ? rawConf : rawConf.model;
          const currentVar = typeof rawConf === 'object' && rawConf.variant ? ` (Variant: ${rawConf.variant})` : '';
          console.log(`  \x1b[1m[${(i + 1).toString().padStart(2, ' ')}]\x1b[0m ${file.padEnd(20, ' ')} (Saat ini: \x1b[36m${currentModel}\x1b[0m${currentVar})`);
        }
        console.log('  \x1b[1m[ B]\x1b[0m Back\n');

        const agChoice = (await rl.question(`Select agent [1-${agentFiles.length}, B]: `)).trim();
        const agNum = parseInt(agChoice, 10);
        if (!isNaN(agNum) && agNum >= 1 && agNum <= agentFiles.length) {
          const selectedFile = agentFiles[agNum - 1];
          const chosen = await promptModelSelection(availableModels, rl, `Select Model for '${selectedFile}':`);
          if (chosen) {
            const val = validateModelForRole(selectedFile, chosen.model);
            let proceed = true;
            if (!val.isOptimal) {
              console.log(`\n${val.warning}`);
              const confirm = (await rl.question('⚠️  Apply model despite capability mismatch? [Y/n] (Default: Y): ')).trim().toLowerCase();
              if (confirm === 'n') proceed = false;
            }

            if (proceed) {
              await writeAgentModel(join(globalAgentsDir, selectedFile), chosen.model, chosen.variant);
              console.log(`\n\x1b[32m✓ Successfully updated '${selectedFile}' to model '${chosen.model}' ${chosen.variant ? `(variant: ${chosen.variant})` : ''}!\x1b[0m\n`);
              currentMappings = await readAgentModels(globalAgentsDir);
              printMappingTable(currentMappings);
            }
          }
        }
      }

      // ── Option 4: Reset Defaults ──────────────────────────────────
      else if (action === '4') {
        await applyModelMapping(globalAgentsDir, NARU_DEFAULT_CONFIGS);
        console.log('\n\x1b[32m✓ Successfully reset all 11 agents to N.A.R.U. Optimal Benchmark Recommendations!\x1b[0m\n');
        currentMappings = await readAgentModels(globalAgentsDir);
        printMappingTable(currentMappings);
      }
    }
  } finally {
    rl.close();
  }
}
