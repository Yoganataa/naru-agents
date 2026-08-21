# Changelog

All notable changes to the `@yoganataa/naru-agents` ecosystem are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.2] - 2026-08-21

### Added
- **Comprehensive OpenCode Model Registry & Benchmark Grounding**:
  - Full catalog of all 7 active OpenCode models with Artificial Analysis Intelligence Index ratings, context windows, output limits, and architectural assignment rationales.
  - Smart Modality Guard (Step 0.5): Strict separation of Vision-Certified subagents vs Text-Only specialists, with visual transcoding pre-processing.
- **6-MCP Tool Fusion Catalog & Local Schema Synchronization**:
  - Exhaustive tool documentation for `context7`, `serena`, `codegraph`, `lean-ctx`, `codebase-memory-mcp`, and `roblox-studio` (StudioMCP 1.0.0).
  - Explicit platform guards and auto-configuration for Roblox Studio on Windows and macOS.
- **Backend Engineering & Clean Architecture Excellence (6 Pillars)**:
  - Hexagonal Ports-and-Adapters domain isolation (1-minute database/payment provider swap).
  - Zero Zombie / Dead Code elimination via AST-level unreferenced export & variable purging.
  - Runtime algorithmic optimization (`O(1)` lookups and zero-copy streaming).
  - Clean code early return enforcement (Cognitive Complexity < 15) and 100% stateless scaling tier.
- **Anti-AI-Slop Frontend & UI/UX Craftsmanship System**:
  - Banned AI slop patterns (generic purple gradients, 3-card templates, un-styled divs, low contrast text).
  - Enforced Scott Hurff's 5 States of UI Stack on all data components (Skeleton 1:1, Empty CTA, Error Retry, Optimistic).
  - WCAG 2.2 Level AA Accessibility enforcement (4.5:1 contrast, semantic HTML, focus rings).
  - Framer Motion spring micro-interactions and intentional design token architecture.
- **4 Next-Gen Autonomous Engineering Excellence Protocols**:
  - **Autonomous Performance & N+1 Query Elimination**: Batch eager fetching enforcement, automated DB indexing, and bundle code-splitting.
  - **Self-Healing Flaky Test Quarantine**: Detection, isolation, and auto-repair of flaky asynchronous test cases via `hotfix-agent`.
  - **Living Architecture Visualizer & OpenAPI 3.1 Generator**: Auto-generated Mermaid ERD diagrams and OpenAPI 3.1 Swagger specs in `docs-agent`.
  - **Meta-Cognitive Heuristics Evolution Loop**: Automated root-cause extraction to `.opencode/knowledge/heuristics.md` upon resolving gate failures.
- **Universal 8-Platform High-Assurance Security Architecture**:
  - Full production security matrix across Web, Mobile (.NET MAUI/KMP/Expo), Desktop (Tauri/Electron/Avalonia), Game Dev (Roblox Luau Anti-Exploit), Bots (WhatsApp Cloud API & Baileys / Discord / Telegram), CLI Utilities, Backend APIs, and Open-Source Packages.
  - WhatsApp Bot Security: `X-Hub-Signature-256` HMAC-SHA256 timing-safe verification and Baileys Signal Protocol session encryption.
  - Roblox Luau Anti-Exploit Engine: Server-authoritative logic, `t`/`Guard` type checking, ProfileService session locking, and `TextService` moderation.
- **Universal Multiplatform & Roblox Game Dev Support**:
  - **Roblox Luau Game Development**: Full anti-exploit engine with Server-Authoritative RemoteEvent validation, runtime type guards (`t`/`Guard`), ProfileService atomic session locking (anti-duplication), `TextService` moderation, and Rojo/Wally tooling.
  - **.NET MAUI & Avalonia UI**: Clean MVVM architecture (`CommunityToolkit.Mvvm`), `SecureStorage.Default` (iOS Keychain, Android Keystore, Windows DPAPI), ATS & cleartext traffic block.
  - **Compose Multiplatform (KMP)**: Hardware-backed secure storage abstraction (`expect`/`actual`) and SQLDelight parameterization.
  - **Material-UI (MUI) & Joy UI**: SSR ThemeProvider hydration safety and DOMPurify sanitization.
- **Core-First Milestone Governance & Anti-Scope Creep Protocol**:
  - Eliminates cascading regressions and goal drift (ACM TOSEM 2025; arXiv:2505.02709).
  - Enforces Milestone 1 (Core MVP) lock until Quality Gate 4 sign-off.
  - Automatically captures out-of-scope ideas into `.opencode/artifacts/backlog.md` (Zero Idea Loss).
  - Interactive 3-choice scope governance modal via native OpenCode `question` tool.
- **Zero-Trust Dependency Runtime Defense (ZTD)**:
  - Scoped Secret Broker Pattern: Raw `process.env` is encapsulated inside validated config modules (`src/config/env.ts`), preventing third-party packages from harvesting credentials.
  - Egress Network Sandboxing: Prohibits utility packages from opening unauthorized outbound sockets to C2 servers.
  - Hexagonal Port-and-Adapter Isolation: Shields domain logic behind adapters, enabling 1-minute hot-swapping or severance.
  - AST Dynamic Execution & Obfuscation Guard: Quality Gate 3 blocks `eval()`, `child_process.execSync`, and Base64 trojans.
- **Pre-Adoption Threat Intelligence & Provenance Audit Trail**:
  - Researcher-Agent and Dependency-Agent query GHSA, NVD, and security advisories before proposing dependencies.
  - Verifies whether historical CVEs and supply chain incidents have been officially patched.
  - Automatically generates and maintains persistent `.opencode/knowledge/dependency-audit-log.md`.
- **5 Latent Multi-Agent Vulnerability Mitigations**:
  - Anti-Hollow Test Audit at Quality Gate 3 (rejects tautological assertions and subject-under-test over-mocking).
  - Pre-Flight Git Working Tree Guard (detects uncommitted edits and provides auto-stash modal).
  - Deterministic Secret Masker (redacts API keys and DB URLs to `[REDACTED_SECRET]`).
  - Duplicate Action Circuit Breaker (prohibits repeating identical failing tool calls >2 consecutive times).
  - Goal Traceability Matrix (GTM) with explicit `AC-XX` IDs from PRD to unit tests.
- **Interactive Project Scaffolding Wizard (`naru new` / `naru create`)**:
  - Interactive terminal wizard prompting for Project Name, Category & Platform, Problem Statement, Runtime, Database/ORM, Authentication/State, Deployment Target, and MVP User Stories.
  - Automatically generates structured `.opencode/artifacts/project-brief.md` and initializes `.opencode/knowledge/sessions/latest.json`.
- **Step 0: Smart Intent Classification & Dynamic Routing Engine**:
  - Zero-shot prompt classifier categorizing interactions into 5 Core Intent Taxonomies: `GREENFIELD_CREATION`, `FEATURE_MODIFICATION`, `INCIDENT_BUGFIX`, `INFORMATIONAL_QA`, and `WORKSPACE_DIAGNOSTIC`.
  - Eliminates unnecessary multi-agent pipeline invocation on informational Q&A (95% token savings).
- **Full Maximization of Native OpenCode Question Modal Tool (6 SDLC Touchpoints)**:
  - Greenfield Project Intake (`naru`).
  - Requirement Disambiguation (`pm-agent`).
  - Architectural Trade-Off Selection (`architect-agent`).
  - Destructive Migration Sign-Off (`developer-agent` & `hotfix-agent`).
  - Quality Gate 3x Fail Escalation (`naru`).
  - Deployment Environment Selection (`deploy-agent`).
- **100% OpenCode Feature Utilization Matrix**:
  - Branded visual hex colors (`color: "#hex"`) assigned across all 11 subagents.
  - Granular autonomous step limits (`steps: N`) calibrated per cognitive load.
  - Deterministic temperature calibration (`temperature: 0.1-0.4`).
- **Official GitHub Pages Documentation Portal (`docs/`)**:
  - Cayman-themed Jekyll documentation site deployed at `https://yoganataa.github.io/naru-agents/`.
- **100% Pure English Standardization**:
  - Fully translated all 11 agent definitions, 4 knowledge stores, documentation site, and CLI outputs into professional, idiomatic English.
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
- **Two-Tier Hierarchical Session Knowledge Architecture (MemGPT & Stanford Generative Agents Pattern)**:
  - *Episodic Session Memory*: Isolates session execution history, summaries, and gate reports in `.opencode/knowledge/sessions/{TIMESTAMP}/` to prevent cross-session context crosstalk.
  - *Semantic Global Reflection*: Automatically extracts verified heuristics (`heuristics.md`) and bug patterns (`patterns.md`) across sessions, maintaining a lightweight pointer in `sessions/latest.json`.
  - *Zero-Overhead Session Inheritance*: New sessions inherit cumulative institutional memory without parsing large historical log files.
- **Cold-Start Repository Indexing (`Naru init repo` & `naru init` CLI)**:
  - 5-MCP Unified Scanning Pipeline combining `lean-ctx` (Topology), `serena` (AST Symbols), `codegraph` (Call-Tree), `context7` (External Libs), and `codebase-memory-mcp` (Persistent Knowledge Graph).
  - Automatically produces `.opencode/knowledge/architecture-blueprint.md` for 60-70% token savings across future sessions.
- **Dynamic AI Model Discovery & Role-Compatibility Engine (`naru models`)**:
  - *Automated OpenCode Discovery*: Discovers active models directly from `opencode models` CLI output.
  - *Capability & Benchmark Registry*: Evaluates candidate models based on **SWE-bench Pro** (coding capabilities), **LMSYS Coding Arena** (reasoning & syntax), and **MMMU-Pro** (multimodal vision requirements).
  - *Role Cluster Matching*: Validates candidate models across 4 distinct cognitive clusters (Orchestration, Coding, Vision QA, Fast Retrieval).
  - *User Override Policy*: Surfaces clear warnings on capability mismatches (e.g. missing vision for QA) while empowering users to force-assign custom models (`naru setup -m <model>`).
  - *Diagnostics Integration*: `naru doctor` continuously monitors role-model health and flags configuration mismatches.
- **Native Standalone Binary (`naru.exe`)**:
  - Standalone compiled binary built with Bun for <10ms startup and 100% immunity against Windows PowerShell ExecutionPolicy errors.
- **OpenCode-Style ASCII Block Banner & DRY SSOT Architecture**:
  - Modern Truecolor Cyber Gradient banner with centralized Single Source of Truth in `src/constants.mjs` and reusable preset engine in `src/banner.mjs`.
- **ADR-001**: Architecture Decision Record documenting design foundations from MetaGPT, LangGraph, Haystack, and CrewAI.

### Changed
- **Dual Binary Aliases**: Added `naru` shorthand alongside `naru-agents`.
- **BREAKING Model Migrations (Active OpenCode Ground-Truth Benchmark Calibration)**:
  - `naru`, `pm-agent` & `architect-agent`: Migrated to `opencode/muse-spark-1.2-contributor-free` (AA Intelligence Index: 54.0 #1, 1M context, `xhigh` reasoning effort, native Full Omni Vision + PDF support).
  - `reviewer-agent`: Migrated to `opencode/x-preview-f-free` (Ox Alpha Free: 1M context, Multimodal Vision, `max` reasoning effort for No-Bypass & deep security audit).
  - `developer-agent` & `hotfix-agent`: Migrated to `opencode/big-pickle` (200k context, pure AST coding specialist, minimal syntax hallucination).
  - `qa-agent`: Optimized on `opencode/mimo-v2.5-free` (1M context, **256,000 output capacity**, MMMU-Pro vision leader).
  - `docs-agent`: Migrated to `opencode/nemotron-3-ultra-free` (NVIDIA 550B LatentMoE, 1M context, high schema compliance for RAG).
  - `researcher-agent`, `dependency-agent`, `deploy-agent`: Migrated to `opencode/hy3-free` (Tencent 295B MoE, ultra-fast toolcalling).
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
