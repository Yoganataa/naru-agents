---
layout: default
title: CLI Command Reference — N.A.R.U.
---

# CLI Command Reference & Diagnostics

N.A.R.U. provides a comprehensive suite of command-line utilities for installation, health diagnostics, model management, and cold-start indexing.

---

## 1. naru setup — Smart System Setup

Automates the installation and configuration of all subagents and MCP servers.

```bash
# Interactive setup with confirmation prompts
naru setup

# Fully automated non-interactive setup (CI / Headless)
naru setup --auto
```

**What it does:**
- Creates a safety backup snapshot in `~/.config/opencode/.backups/`.
- Installs 11 subagent files and 4 knowledge base stores into `~/.config/opencode/`.
- Discovers local binaries and auto-configures all 6 MCP servers in `opencode.json`.

---

## 2. naru doctor — System Diagnostic & Health Audit

Performs a thorough, automated diagnostic of your local environment:

```bash
naru doctor
```

**Diagnostic Checks:**
1. **System & Runtime Environment**: Node.js, Bun, Git, OpenCode CLI version, and config directory paths.
2. **Package Managers**: Detects `bun`, `npm`, `cargo`, `pip`, and `winget`.
3. **Agent Definitions & AI Models**: Verifies 11/11 agents installed, role-model alignment, and RAG stores.
4. **6-MCP Server Status**: Tests availability of `context7`, `serena`, `codegraph`, `lean-ctx`, `codebase-memory-mcp`, and `roblox-studio`.

---

## 3. naru models — Interactive Model & Reasoning Manager

Allows discovering local OpenCode models, adjusting reasoning effort variants, or assigning custom models with capability validation:

```bash
# Launch interactive model management menu
naru models

# List discovered OpenCode models and capability badges non-interactively
naru models --list
```

**Available Interactive Actions:**
- **Option 1**: Apply 1 unified model across all 11 subagents.
- **Option 2**: Configure models by Cognitive Role Cluster (Strategic Triad, Coding, QA, DevOps, etc.).
- **Option 3**: Configure individual subagents (Model and Reasoning Variant).
- **Option 4**: Reset all 11 subagents to N.A.R.U. optimal benchmark defaults.

---

## 4. naru init repo — Cold-Start Repository Indexing

Initializes N.A.R.U. in any existing or new repository:

```bash
naru init repo
```

**What it does:**
- Scans the repository using CodeGraph and Serena LSP.
- Generates an architectural blueprint (`.opencode/artifacts/architecture-blueprint.md`).
- Seeds the persistent SQLite knowledge graph via Codebase Memory MCP.

---

## 5. naru backup — Safety Snapshot Manager

Manages configuration backups and rollbacks:

```bash
# Create an immediate configuration snapshot
naru backup

# List all existing safety snapshots
naru backup --list

# Restore configuration from a specific snapshot timestamp
naru backup --restore <snapshot-id>
```

---

## 6. naru validate — Frontmatter & Permission Validator

Validates all subagent markdown files against OpenCode schema standards:

```bash
naru validate
```

Ensures all 11 subagents contain valid YAML frontmatter, step budgets, and granular tool permissions.
