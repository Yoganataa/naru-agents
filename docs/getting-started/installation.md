# Installation Guide

N.A.R.U. provides zero-friction installation options tailored for **Windows**, **macOS**, and **Linux** environments.

---

## Method 1: Native Single-File Binary (Recommended)

Compiled directly into a self-contained native executable using Bun. It features **sub-10ms startup times**, requires **zero Node.js or Bun runtime dependencies on host**, and is completely immune to Windows PowerShell `ExecutionPolicy` restrictions.

### Windows (PowerShell):
```powershell
# Run smart automated setup
naru setup --auto

# Inspect model configurations
naru models

# Run system health diagnostics
naru doctor
```

---

## Method 2: Global Package Manager (Bun / npm)

```bash
# Install globally using Bun (Recommended)
bun install -g github:yoganataa/naru-agents

# Or install globally using npm
npm install -g github:yoganataa/naru-agents

# Launch the Smart Setup Wizard
naru setup
```

---

## Method 3: One-Liner Shell Script (Linux & macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/yoganataa/naru-agents/main/install.sh | bash
```

---

## Method 4: Zero-Install Instant Execution

Execute directly without global installation:

```bash
# Using Bun
bunx github:yoganataa/naru-agents setup --auto

# Using npx
npx github:yoganataa/naru-agents setup --auto
```

---

## 🛠️ Optional: Installing MCP Servers for Full 5-MCP Fusion

While N.A.R.U. operates out-of-the-box, installing all 5 local MCP servers unlocks deep AST symbol resolution, caller-callee exploration, and persistent SQLite knowledge graphs:
- 🌐 **`context7`**: Remote Cloud (Zero install)
- 🔍 **`serena`**: `pipx install serena`
- 🕸️ **`codegraph`**: `npm install -g codegraph-mcp`
- ⚡ **`lean-ctx`**: `cargo install lean-ctx`
- 🧠 **`codebase-memory-mcp`**: `npm install -g codebase-memory-mcp`

Read the complete [**5-MCP Installation Guide**](../architecture/mcp-servers.md) for full cross-platform instructions and official repository links.

