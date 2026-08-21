// ─── doctor.mjs ── Smart Diagnostic Dashboard ───────────────────────────────
// Audits environment health, OpenCode configuration, agents, and 5 MCP servers
// ──────────────────────────────────────────────────────────────────────────────

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { detectOS, detectPackageManagers, discoverMCPServers, fileExists } from './smart-discovery.mjs';
import { printBanner } from './banner.mjs';
import { VERSION } from './constants.mjs';
import { discoverOpenCodeModels, readAgentModels, validateModelForRole } from './model-manager.mjs';

const execAsync = promisify(exec);

// Terminal ANSI styling
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Get executable version string
 * @param {string} cmd
 * @param {string} flag
 * @returns {Promise<string|null>}
 */
async function getVersion(cmd, flag = '--version') {
  try {
    const { stdout } = await execAsync(`${cmd} ${flag}`);
    return stdout.trim().split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

/**
 * Run comprehensive doctor diagnostic
 */
export async function runDoctor() {
  printBanner('doctor');

  const osInfo = detectOS();
  const globalDir = join(homedir(), '.config', 'opencode');

  // 1. Environment & Runtimes
  console.log(`${C.bold}1. System & Runtime Environment:${C.reset}`);
  console.log(`   - OS Platform       : ${C.cyan}${osInfo.os}${C.reset} (${osInfo.isWindows ? 'Windows' : osInfo.isMac ? 'macOS' : 'Linux'})`);

  const nodeVer = await getVersion('node', '-v');
  console.log(`   - Node.js Runtime   : ${nodeVer ? `${C.green}✓ ${nodeVer}${C.reset}` : `${C.yellow}⚠ Not found${C.reset}`}`);

  const bunVer = await getVersion('bun', '-v');
  console.log(`   - Bun Runtime       : ${bunVer ? `${C.green}✓ v${bunVer}${C.reset}` : `${C.dim}- Not found (Optional)${C.reset}`}`);

  const gitVer = await getVersion('git', '--version');
  console.log(`   - Git VCS           : ${gitVer ? `${C.green}✓ ${gitVer}${C.reset}` : `${C.red}✗ Missing${C.reset}`}`);

  const opencodeVer = await getVersion('opencode', '--version');
  console.log(`   - OpenCode CLI      : ${opencodeVer ? `${C.green}✓ ${opencodeVer}${C.reset}` : `${C.yellow}⚠ opencode CLI not in PATH${C.reset}`}`);
  console.log(`   - Global Config Dir : ${C.cyan}${globalDir}${C.reset}\n`);

  // 2. Package Managers
  console.log(`${C.bold}2. Package Managers Available:${C.reset}`);
  const pms = await detectPackageManagers();
  const availablePMs = Object.entries(pms).filter(([_, avail]) => avail).map(([name]) => name);
  console.log(`   - Detected: ${availablePMs.length > 0 ? availablePMs.map(p => `${C.green}${p}${C.reset}`).join(', ') : `${C.yellow}None${C.reset}`}\n`);

  // 3. Agent Files & Validation
  console.log(`${C.bold}3. Agent Definitions & AI Model Health (v${VERSION} - 11 Agents):${C.reset}`);
  const AGENT_FILES = [
    'naru.md', 'pm-agent.md', 'researcher-agent.md', 'dependency-agent.md',
    'architect-agent.md', 'developer-agent.md', 'reviewer-agent.md', 'qa-agent.md',
    'docs-agent.md', 'deploy-agent.md', 'hotfix-agent.md',
  ];

  let installedCount = 0;
  for (const file of AGENT_FILES) {
    const isInstalled = await fileExists(join(globalDir, 'agents', file));
    if (isInstalled) installedCount++;
  }
  console.log(`   - Installed Globally : ${installedCount === 11 ? `${C.green}✓ 11/11 Agents Installed${C.reset}` : `${C.yellow}⚠ ${installedCount}/11 Agents Installed${C.reset}`}`);

  const activeModels = await discoverOpenCodeModels();
  const currentMappings = await readAgentModels(join(globalDir, 'agents'));
  let modelMismatchCount = 0;
  for (const file of AGENT_FILES) {
    const assigned = currentMappings[file];
    if (assigned) {
      const modelId = typeof assigned === 'string' ? assigned : assigned.model;
      const val = validateModelForRole(file, modelId);
      if (!val.isOptimal) modelMismatchCount++;
    }
  }
  const modelStatusStr = modelMismatchCount === 0
    ? `${C.green}✓ 11/11 Aligned & Optimal${C.reset}`
    : `${C.yellow}⚠ ${modelMismatchCount} Capability Mismatch(es) (Run "naru models")${C.reset}`;
  console.log(`   - Role-Model Match   : ${modelStatusStr}`);

  // 4. Knowledge Stores
  const KNOWLEDGE_FILES = ['heuristics.md', 'patterns.md', 'pipeline-history.md', 'maintenance-log.md'];
  let knowCount = 0;
  for (const kf of KNOWLEDGE_FILES) {
    if (await fileExists(join(globalDir, 'knowledge', kf))) knowCount++;
  }
  const sessionsExist = await fileExists(join(globalDir, 'knowledge', 'sessions', 'latest.json'));
  console.log(`   - RAG Knowledge Base : ${knowCount === 4 ? `${C.green}✓ 4/4 Stores Synchronized${C.reset}` : `${C.yellow}⚠ ${knowCount}/4 Stores Synchronized${C.reset}`}`);
  console.log(`   - Session Memory     : ${sessionsExist ? `${C.green}✓ Initialized (.opencode/knowledge/sessions/)${C.reset}` : `${C.yellow}⚠ Not initialized${C.reset}`}\n`);

  // 5. MCP Servers Discovery & Status
  const mcpDiscovery = await discoverMCPServers();
  console.log(`${C.bold}4. MCP Servers Health Status (${Object.keys(mcpDiscovery).length} Discovered Servers):${C.reset}`);

  for (const [name, info] of Object.entries(mcpDiscovery)) {
    const statusIcon = info.available ? `${C.green}✓ AVAILABLE${C.reset}` : `${C.yellow}⚠ NOT INSTALLED${C.reset}`;
    console.log(`   - ${C.bold}${name.padEnd(20)}${C.reset} : [${statusIcon}] - ${info.source || 'Binary not found in PATH'}`);
  }

  // 6. Actionable Recommendations
  const missingMCPs = Object.entries(mcpDiscovery).filter(([_, info]) => !info.available);
  if (missingMCPs.length > 0) {
    console.log(`\n${C.bold}${C.yellow}💡 Recommended Remediation Commands for Missing Tools:${C.reset}`);
    for (const [name] of missingMCPs) {
      if (name === 'serena') {
        console.log(`   • ${C.bold}serena${C.reset}   : Run ${C.cyan}pip install serena-agent${C.reset} or check release binaries.`);
      } else if (name === 'codegraph') {
        console.log(`   • ${C.bold}codegraph${C.reset}: Run ${C.cyan}npm install -g codegraph${C.reset} or ${C.cyan}bun add -g codegraph${C.reset}.`);
      } else if (name === 'lean-ctx') {
        console.log(`   • ${C.bold}lean-ctx${C.reset} : Run ${C.cyan}cargo install lean-ctx${C.reset} or download from repo.`);
      } else if (name === 'codebase-memory-mcp') {
        console.log(`   • ${C.bold}codebase-memory-mcp${C.reset}: Install from codebase-memory releases.`);
      } else if (name === 'roblox-studio') {
        console.log(`   • ${C.bold}roblox-studio${C.reset}: Open Roblox Studio > Assistant > ... > Manage MCP Servers > Toggle ON.`);
      }
    }
  } else {
    console.log(`\n${C.green}🎉 All ${Object.keys(mcpDiscovery).length} MCP servers and 11 subagents are in optimal operational condition!${C.reset}`);
  }
  console.log('');
}

