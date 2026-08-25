---
layout: default
title: MCP Tooling — N.A.R.U.
---

# MCP Tooling

N.A.R.U. can use Model Context Protocol (MCP) servers to extend code intelligence, documentation retrieval, memory, or platform-specific operations. The exact installed MCP inventory is **environment-dependent**.

This page therefore documents the architectural role of MCPs rather than claiming that every installation has every server enabled.

## Tool Categories

### Context7

Used for current, version-aware third-party documentation when the configured environment provides it.

Typical role:

- verify current API signatures;
- check package/version documentation;
- reduce stale API assumptions.

### Serena

Language-server/semantic tooling used when available for symbol-level code navigation and reference analysis.

Typical role:

- locate symbols;
- inspect definitions;
- find references;
- understand source structure.

### Codegraph

Static code-graph tooling used when available for structural impact analysis.

Typical role:

- explore code areas;
- inspect callers/callees;
- estimate change impact;
- identify affected tests.

### Lean-Ctx

Context composition/compaction tooling used when available to make large repositories more manageable for agents.

Typical role:

- compose relevant context;
- read structured file content;
- compact context where supported;
- search with reduced noise.

### Codebase Memory MCP

Persistent knowledge-graph tooling used when configured.

Typical role:

- persist architectural entities;
- relate components and decisions;
- retrieve prior project knowledge;
- save graph state.

Memory is contextual evidence, not proof of current runtime state.

### Roblox Studio MCP

Platform-specific tooling may be available for Roblox projects when the user's OpenCode environment exposes it.

Typical role:

- inspect/edit Studio scripts;
- interact with a live DataModel;
- support Roblox-specific development and verification.

Do not assume its availability, supported operating systems, or exact tool names without checking the active MCP configuration.

## MCP Assignment

Agent contracts declare which MCP namespaces they are permitted to use. Permissions do not prove that a server is installed or reachable.

The correct operational sequence is:

```text
agent permission
      ↓
MCP configured?
      ↓
MCP reachable?
      ↓
tool call succeeds?
      ↓
use result as evidence
```

## Failure Handling

An unavailable MCP is not automatically a fatal error. The orchestrator should determine whether the missing capability is required for the current task.

Examples:

- missing live documentation may block a version-sensitive API decision;
- missing codegraph may be acceptable for a small isolated edit;
- missing Roblox Studio tooling matters only when live Studio interaction is required.

Report `BLOCKED` or `NOT_APPLICABLE` when appropriate instead of fabricating tool results.

## Security Boundary

MCP servers are external capabilities. Their presence does not automatically make the environment secure, sandboxed, or trustworthy. Sensitive permissions and tool calls must follow the active OpenCode configuration and N.A.R.U. runtime guardrails.
