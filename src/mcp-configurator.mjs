// ─── mcp-configurator.mjs ── Safe JSON Fusion Engine ────────────────────────
// Injects and synchronizes the 5 MCP server definitions into opencode.json
// ──────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileExists, discoverMCPServers } from './smart-discovery.mjs';

/**
 * Configure all 5 MCP servers in opencode.json safely without losing custom keys
 * @param {string} targetDir - ~/.config/opencode directory
 * @returns {Promise<{ updated: boolean, mcpSummary: Record<string, string> }>}
 */
export async function configureMCPServers(targetDir) {
  const jsonPath = join(targetDir, 'opencode.json');
  let config = {};

  if (await fileExists(jsonPath)) {
    try {
      const raw = await readFile(jsonPath, 'utf8');
      config = JSON.parse(raw);
    } catch {
      config = {};
    }
  }

  // Ensure root schema
  config.$schema = config.$schema || 'https://opencode.ai/config.json';
  config.mcp = config.mcp || {};

  // Discover local binary paths
  const discovered = await discoverMCPServers();
  const mcpSummary = {};

  // 1. Context7 (Remote Documentation)
  if (!config.mcp.context7) {
    config.mcp.context7 = {
      type: 'remote',
      url: 'https://mcp.context7.com/mcp',
      enabled: true,
    };
    mcpSummary.context7 = 'Configured (Remote Cloud Endpoint)';
  } else {
    mcpSummary.context7 = 'Already Configured (Preserved)';
  }

  // 2. Serena (LSP Code Intelligence)
  if (!config.mcp.serena) {
    config.mcp.serena = {
      type: 'local',
      command: discovered.serena.command || ['serena', 'start-mcp-server', '--project-from-cwd'],
      enabled: true,
      environment: {},
    };
    mcpSummary.serena = discovered.serena.available ? `Configured (${discovered.serena.source})` : 'Configured (Default command)';
  } else {
    mcpSummary.serena = 'Already Configured (Preserved)';
  }

  // 3. Codegraph (Call-Graph Explorer)
  if (!config.mcp.codegraph) {
    config.mcp.codegraph = {
      type: 'local',
      command: discovered.codegraph.command || ['codegraph', 'serve', '--mcp'],
      enabled: true,
    };
    mcpSummary.codegraph = discovered.codegraph.available ? `Configured (${discovered.codegraph.source})` : 'Configured (Default command)';
  } else {
    mcpSummary.codegraph = 'Already Configured (Preserved)';
  }

  // 4. Lean-Ctx (AST Tree-Sitter Compression)
  if (!config.mcp['lean-ctx']) {
    config.mcp['lean-ctx'] = {
      type: 'local',
      command: discovered['lean-ctx'].command || ['lean-ctx'],
      enabled: true,
      environment: {},
    };
    mcpSummary['lean-ctx'] = discovered['lean-ctx'].available ? `Configured (${discovered['lean-ctx'].source})` : 'Configured (Default command)';
  } else {
    mcpSummary['lean-ctx'] = 'Already Configured (Preserved)';
  }

  // 5. Codebase-Memory-MCP (Knowledge Graph Memory)
  if (!config.mcp['codebase-memory-mcp']) {
    config.mcp['codebase-memory-mcp'] = {
      type: 'local',
      command: discovered['codebase-memory-mcp'].command || ['codebase-memory-mcp'],
      enabled: true,
    };
    mcpSummary['codebase-memory-mcp'] = discovered['codebase-memory-mcp'].available ? `Configured (${discovered['codebase-memory-mcp'].source})` : 'Configured (Default command)';
  } else {
    mcpSummary['codebase-memory-mcp'] = 'Already Configured (Preserved)';
  }

  // Save back safely formatted JSON
  await writeFile(jsonPath, JSON.stringify(config, null, 2) + '\n', 'utf8');

  return { updated: true, mcpSummary };
}
