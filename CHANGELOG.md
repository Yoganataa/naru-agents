# Changelog

All notable changes to the `@yoganataa/naru-agents` ecosystem are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.2] - 2026-08-21

### Added
- **4 New Specialized Subagents**:
  - `dependency-agent`: Behavioral contract verification against exact release documentation. Supports `STATUS: VERIFIED`, `STATUS: CONDITIONAL`, `STATUS: REJECTED`, and `STATUS: KNOWLEDGE_GAP`.
  - `docs-agent`: Automated generation of README, OpenAPI/AsyncAPI, CHANGELOG, and platform deployment runbooks.
  - `deploy-agent`: Platform-specific deployment orchestration (Vercel, Cloudflare, Heroku, VPS/Homelab Docker, Discord/Telegram Bots) with mandatory `bash: "*": "ask"` safety approval.
  - `hotfix-agent`: Production incident resolution specialist adhering to strict No-Bypass root-cause fixes and regression test generation.
- **RAG Grounding & Interactive Query Protocol**:
  - Distinguishes internal project state queries (fast zero-overhead path) from factual/technical claims.
  - Mandatory citation metadata table (`source_url`, `source_type`, `verified_date`, freshness status) across all technical outputs.
  - Explicit `STATUS: KNOWLEDGE_GAP` declaration halting ungrounded speculative reasoning.
- **Dual-Layer Retry Budget (LangGraph Pattern)**:
  - Global `pipeline_retry_budget = 8` preventing unbounded ping-pong loops across gates.
  - Per-gate `gate_max_retries = 3` with automated escalation to user on budget depletion.
  - User action `[R]` resets both global budget to 8 and all gate retry counters to 0.
- **Multi-Language No-Bypass Matrix**:
  - Cross-language enforcement across TypeScript/JavaScript, Python, Go, Rust, and Java/Kotlin.
  - Scanner detects language from file extensions and prohibits unlinked ignores, silences, or skips.
- **Multimodal Visual Regression Testing**:
  - `qa-agent` and `reviewer-agent` equipped with vision capabilities (`mimo-v2.5-free`) to inspect Playwright screenshots and emulator captures.
- **Temporal Grounding & Anti-Cutoff Protocol**:
  - Eliminates *Nostalgia Bias* and *Temporal Blindness* (DateLogicQA benchmark standard).
  - Search Query Sanitizer: Strictly prohibits appending model training cutoff years (e.g. `2024`, `2025`) into search queries.
  - Step-Back & Structural Release Pattern: Enforces queries targeting `latest stable changelog`, `site:github.com/.../releases`, and `migration guide`.
  - Registry-as-Ground-Truth: Enforces live package version verification via `context7` (`resolve-library-id`, `query-docs`) and package manifests (`npm`, `PyPI`, `crates.io`).
- **Smart System Installer & 5 MCP Auto-Discovery**:
  - Dynamic discovery and automated configuration for `context7`, `serena`, `codegraph`, `lean-ctx`, and `codebase-memory-mcp` in `opencode.json`.
  - Automated safety snapshot backup and 1-click rollback (`naru rollback`).
  - Terminal health diagnostic check (`naru doctor`).
- **Native Standalone Binary (`naru.exe`)**:
  - Standalone compiled binary built with Bun for <10ms startup and 100% immunity against Windows PowerShell ExecutionPolicy errors.
- **OpenCode-Style ASCII Block Banner & DRY SSOT Architecture**:
  - Modern Truecolor Cyber Gradient banner with centralized Single Source of Truth in `src/constants.mjs` and reusable preset engine in `src/banner.mjs`.
- **ADR-001**: Architecture Decision Record documenting design foundations from MetaGPT, LangGraph, Haystack, and CrewAI.

### Changed
- **Dual Binary Aliases**: Added `naru` shorthand alongside `naru-agents`.
- **BREAKING Model Migrations**:
  - `naru` & `architect-agent`: Upgraded to `opencode/deepseek-v4-flash-free` (1,048,576 token context and 384,000 output capacity with max reasoning effort).
  - `developer-agent` & `hotfix-agent`: Migrated to `opencode/big-pickle` (200,000 token context for deep reasoning and code synthesis).
  - `researcher-agent`, `dependency-agent`, `deploy-agent`: Migrated to `opencode/hy3-free` (190,000 token context for high tool-call reliability).
  - `pm-agent` & `docs-agent`: Optimized on `opencode/deepseek-v4-flash-free` (1,048,576 token context, max effort mode for PM baseline).
  - `reviewer-agent` & `qa-agent`: Optimized on `opencode/mimo-v2.5-free` (1,048,576 token context with Vision multimodal).
- **Validator Engine (`src/validator.mjs`)**:
  - Replaced static step counter rules with flexible SOP step structure validation.
  - Added deploy safety check (`bash: "*": "ask"`), code modification MCP check, and citation/knowledge gap check for technical agents.
- **Installer Engine (`src/installer.mjs`)**:
  - Updated `AGENT_FILES` list to atomize installation across all 11 agents.

---

## [0.0.1] - 2026-08-20

### Added
- Initial alpha release with 7 role-based agents (`naru`, `pm-agent`, `researcher-agent`, `architect-agent`, `developer-agent`, `reviewer-agent`, `qa-agent`).
- Interactive CLI / TUI for agent installation and configuration.
- Basic compaction awareness via `.opencode/artifacts/` persistence.
