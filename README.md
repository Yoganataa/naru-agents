# @yoganataa/naru-agents

AI Team Lead orchestration system for opencode with 6 role-based sub-agents.

## Features

- **Naru (AI Team Lead)**: Pure orchestrator, never writes code
- **Artifact Chain**: Rigid pipeline PM → Researcher → Architect → Developer → Reviewer → QA
- **Self-Learning**: Naru learns from every pipeline run
- **MCP Integration**: 6 MCP servers (codebase-memory, codegraph, context7, lean-ctx, serena, roblox_studio)
- **Compaction Aware**: Survive context compaction with artifact persistence
- **Interactive TUI**: Browse and select agents visually

## Installation

### Method 1: bunx from GitHub (Recommended)

```bash
# Interactive TUI
bunx github:yoganataa/naru-agents

# CLI - Install to global config
bunx github:yoganataa/naru-agents install --global

# CLI - Install to current project
bunx github:yoganataa/naru-agents install --project .

# CLI - Uninstall
bunx github:yoganataa/naru-agents uninstall --global
```

### Method 2: npx from GitHub

```bash
# Interactive TUI
npx github:yoganataa/naru-agents

# CLI - Install to global config
npx github:yoganataa/naru-agents install --global

# CLI - Install to current project
npx github:yoganataa/naru-agents install --project .
```

### Method 3: Bash script

```bash
# One-liner installation
curl -fsSL https://raw.githubusercontent.com/yoganataa/naru-agents/main/install.sh | bash
```

### Method 4: Manual clone

```bash
# Clone repo
git clone https://github.com/yoganataa/naru-agents.git
cd naru-agents

# Install with bun
bun bin/naru-agents.js install --global

# Or install with node
node bin/naru-agents.js install --global
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--global`, `-g` | Install to global config (`~/.config/opencode/agents/`) |
| `--project`, `-p` | Install to current project (`.opencode/agents/`) |
| `--force`, `-f` | Overwrite existing files |
| `--dry-run`, `-d` | Preview changes without installing |

## TUI Controls

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate |
| `Space` | Toggle selection |
| `Enter` | Install selected agents |
| `a` | Select all |
| `n` | Deselect all |
| `q` | Quit |

## Agent Roster

| Agent | Model | Role |
|-------|-------|------|
| `naru` | deepseek-v4-flash-free | AI Team Lead (Orchestrator) |
| `pm-agent` | deepseek-v4-flash-free | Product Manager |
| `researcher-agent` | deepseek-v4-flash-free | Technology Researcher |
| `architect-agent` | nemotron-3-ultra-free | System Architect |
| `developer-agent` | deepseek-v4-flash-free | Developer |
| `reviewer-agent` | mimo-v2.5-free | Code Reviewer |
| `qa-agent` | mimo-v2.5-free | Quality Assurance |

## Pipeline Modes

- **Simple**: Direct answer (no delegation)
- **Standard**: Skip PM (Researcher → Architect → Developer → Reviewer → QA)
- **Full**: All agents (PM → Researcher → Architect → Developer → Reviewer → QA)
- **Emergency**: Skip to developer (Developer → Reviewer → QA)

## Requirements

- opencode installed
- Bun or Node.js 18+
- Free Zen models available
- MCP servers configured (see opencode.json)

## License

MIT
