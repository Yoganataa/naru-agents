---
layout: default
title: Installation Guide — N.A.R.U.
---

# Installation Guide

N.A.R.U. is distributed directly via GitHub and pre-compiled native executables for **Windows**, **macOS**, and **Linux**.

---

## 1. Global Installation Methods

### Method A: Using Bun (Recommended)
```bash
bun install -g github:yoganataa/naru-agents
naru setup --auto
```

### Method B: Using NPM
```bash
npm install -g github:yoganataa/naru-agents
naru setup --auto
```

### Method C: Using Standalone Native Binary
Download or compile the single-file binary (`naru.exe` on Windows, `naru` on Linux/macOS) and place it in your system `PATH` (e.g. `~/.local/bin/`):
```bash
naru setup --auto
```

---

## 2. What naru setup --auto Does

When you run `naru setup --auto`, the installer automatically executes:
1. **Safety Backup**: Creates an immutable snapshot of your existing OpenCode configuration in `~/.config/opencode/.backups/`.
2. **Subagent Installation**: Copies all 11 subagents and the knowledge base into `~/.config/opencode/agents/` and `~/.config/opencode/knowledge/`.
3. **6-MCP Auto-Configuration**: Discovers locally installed MCP tools and merges configurations for all 6 servers (`context7`, `serena`, `codegraph`, `lean-ctx`, `codebase-memory-mcp`, and `roblox-studio`) into `~/.config/opencode/opencode.json`.
4. **Post-Install Doctor Audit**: Runs an automatic health check verifying runtime dependencies, agent models, and MCP tool availability.

---

## 3. System Requirements

- **Operating System**: Windows 10/11 (x64), macOS 12+ (Apple Silicon / Intel), Linux (Ubuntu 20.04+, Debian 11+, Fedora 38+, Arch Linux).
- **Runtimes**: Node.js 18+ or Bun 1.0+.
- **OpenCode CLI**: OpenCode CLI installed and accessible in your shell (`opencode`).
- **Version Control**: Git 2.30+.

---

## 4. Post-Installation Verification

Run the diagnostic doctor to confirm all systems are operational:

```bash
naru doctor
```
