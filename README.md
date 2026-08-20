```text
█▀▀█  █▀▀█  █▀▀█  █  █     █▀▀█  █▀▀█  █▀▀█  █▀▀█  ▀█▀  █▀▀▀
█  █  █▄▄█  █▄▄▀  █  █     █▄▄█  █ ▄▄  █▀▀▀  █  █   █   ▀▀▀█
█  █  █  █  █ ▀▄  █  █     █  █  █  █  █     █  █   █      █
█  █  █  █  █  █  █▄▄█     █  █  █▄▄█  █▄▄▄  █  █   █   █▄▄█

System    N.A.R.U. — Next-gen Autonomous Role-based Unified agents (v0.0.2)
Commands  naru setup | naru doctor | naru update
```

# N.A.R.U. — Next-gen Autonomous Role-based Unified agents (v0.0.2)

> **N.A.R.U.** (成る — *to materialize / bring into reality*): Production-grade AI Engineering Manager orchestration system for OpenCode with 10 specialized role-based subagents, dynamic 5-MCP auto-configuration, immutable goal baselines, RAG grounding, and multi-language No-Bypass policies.

---

## 🌟 Key Features (v0.0.2)

- **Naru (AI Team Lead)**: Pure orchestrator running on `opencode/deepseek-v4-flash-free` (1M token context, `reasoningEffort: "max"`) with dual-layer retry budget (`pipeline_retry_budget = 8`, `gate_max_retries = 3`).
- **10 Specialized Subagents**: End-to-end coverage across Requirements (`pm-agent`), Evidence Research (`researcher-agent`), Dependency Contracts (`dependency-agent`), Architecture (`architect-agent`), Development (`developer-agent` on `big-pickle`), Code Review (`reviewer-agent`), Multimodal Vision QA (`qa-agent`), Continuous Docs (`docs-agent`), DevOps Deployment (`deploy-agent`), and Production Hotfixing (`hotfix-agent`).
- **Dynamic 5-MCP Auto-Discovery**: Seamless auto-configuration for `context7`, `serena`, `codegraph`, `lean-ctx`, and `codebase-memory-mcp`.
- **Temporal Grounding & Anti-Cutoff Protocol**: Eliminates *Nostalgia Bias* and *Temporal Blindness* (DateLogicQA benchmark standard). Sanitizes search queries from model training cutoff years and anchors dependencies to live registry truth via `context7`.
- **Native Standalone Binary (`naru.exe`)**: Single-file compiled Bun executable with <10ms startup time, 100% immune to Windows PowerShell ExecutionPolicy errors.
- **Multi-Platform Native Support**: Tailored playbooks for **Web** (Vercel, Cloudflare, Heroku, VPS/Homelab Docker), **Bot** (Discord, Telegram), **Mobile** (React Native, Expo, Flutter), and **Desktop** (Tauri, Electron).
- **RAG & Grounding Layer**: Distinguishes project state queries from factual/technical claims with full citation metadata or explicit `STATUS: KNOWLEDGE_GAP`.
- **Multi-Language No-Bypass Policy**: Universal zero-tolerance policy across TypeScript/JS, Python, Go, Rust, and Java/Kotlin.
- **Multimodal Vision Delegation**: Auto-delegates image attachments, UI mockups, and bug screenshots to Vision models (`mimo-v2.5-free`).

---

## 📦 Global Installation & Quickstart

### Method 1: Bun / NPM Global Install (Recommended)

```bash
# Using Bun (Recommended)
bun install -g github:yoganataa/naru-agents

# Or using NPM
npm install -g github:yoganataa/naru-agents

# Initialize with Smart Setup (Installs 11 Agents + 4 Knowledge Stores + Auto-Configures 5 MCPs)
naru setup
```

### Method 2: Useful CLI Commands

```bash
# Health check & diagnostic
naru doctor

# Auto-update to latest GitHub release/commit
naru update

# Rollback to previous configuration snapshot
naru rollback
```

### Method 3: One-Liner Bash Installer (Linux & macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/yoganataa/naru-agents/main/install.sh | bash
```

---

## 👥 11-Agent Roster & Model Architecture

| Agent | Model | Context | Output | Primary Role |
|---|---|---|---|---|
| `naru` | `opencode/deepseek-v4-flash-free` | 1,048,576 | 384,000 | AI Team Lead & Orchestrator |
| `pm-agent` | `opencode/deepseek-v4-flash-free` | 1,048,576 | 384,000 | Requirements & Goal Baseline |
| `researcher-agent` | `opencode/hy3-free` | 190,000 | 64,000 | Evidence Research & Citations |
| `dependency-agent` | `opencode/hy3-free` | 190,000 | 64,000 | Behavioral Contract Verification |
| `architect-agent` | `opencode/deepseek-v4-flash-free` | 1,048,576 | 384,000 | System Architecture & ADRs |
| `developer-agent` | `opencode/big-pickle` | 200,000 | 32,000 | Core Code Implementation |
| `reviewer-agent` | `opencode/mimo-v2.5-free` | 1,048,576 | 256,000 | Security & No-Bypass Audit |
| `qa-agent` | `opencode/mimo-v2.5-free` | 1,048,576 | 256,000 | Multimodal & Platform Testing |
| `docs-agent` | `opencode/deepseek-v4-flash-free` | 1,048,576 | 384,000 | Auto-Documentation Generator |
| `deploy-agent` | `opencode/hy3-free` | 190,000 | 64,000 | Safe DevOps Release (`bash: ask`) |
| `hotfix-agent` | `opencode/big-pickle` | 200,000 | 32,000 | Root-Cause Production Patches |

---

## 🔄 Production Pipeline & Quality Gates

```
USER GOAL
    ↓
[0] PLATFORM DETECTION (Web / Mobile / Desktop / Bot) & SELF-CONFLICT DIAGNOSTIC
    ↓
[1] PM AGENT → prd.md + goal-baseline.md (v0.0.2 Immutable)
    ↓
[2] RESEARCHER AGENT → research.md (Grounding & Citations)
    ↓
[3] DEPENDENCY AGENT → dependency-contracts.md (Exact Versions & Risk Checks)
    ↓
[4] ARCHITECT AGENT → architecture.md + ADRs + Risk Matrix
    ↓
[GATE 1] Goal vs Baseline & Feasibility (Gate <= 3, Global <= 8)
    ↓
[5] DEVELOPER AGENT → implementation.md + Milestone Git Commit
    ↓
[GATE 2] (a) Smoke Test & Multi-Language No-Bypass Pass? AND (b) Baseline Alignment?
    ↓
[6] REVIEWER AGENT → review.md (Security & Goal Drift Audit)
    ↓
[GATE 3] Critical / Major Review Findings Resolved?
    ↓
[7] QA AGENT → qa-report.md (E2E Integration & Multimodal Visual Regression)
    ↓
[GATE 4] Production Readiness & Visual Sign-Off Confirmed?
    ↓
[8] DOCS AGENT → README.md + OpenAPI/AsyncAPI + CHANGELOG.md + ADR Sync
    ↓
[9] DEPLOY AGENT → Platform Deployment Runbooks (Requires User Confirmation)
    ↓
NARU → Synthesized Production Summary → USER
```

---

## 🛠️ CLI Validation

To validate all agent files and structural contracts:
```bash
node bin/naru-agents.js validate
```

---

## 📚 Architectural Foundations

- **MetaGPT** (`github.com/FoundationAgents/MetaGPT`, ICLR 2024): SOP sequences and isolated artifact boundaries.
- **SWE-agent** (`github.com/princeton-nlp/SWE-agent`, Princeton/Stanford): Agent-Computer Interface (ACI) and token-efficient semantic codebase navigation.
- **LangGraph** (`github.com/langchain-ai/langgraph`): Dual-layer retry budget and human-in-the-loop escalation.
- **DateLogicQA** (ACL / EMNLP 2024): Pre-retrieval temporal query rewriting and anti-cutoff grounding.
- **Haystack** (`github.com/deepset-ai/haystack`): RAG retrieval, citation metadata, and freshness evaluation.
- **Model Context Protocol** (`modelcontextprotocol.io`, Anthropic Standard): Tool-use grounding for semantic code graph and real-time documentation.

---

## License

MIT © [yoganataa](https://github.com/yoganataa)
