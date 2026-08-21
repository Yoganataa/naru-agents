---
layout: default
---

# ADR-001: N.A.R.U. (v0.0.2) Multi-Agent Architecture and Production RAG Grounding

- **Status:** Accepted
- **Date:** 2026-08-20
- **Authors:** Naru AI Team & Lead Engineer
- **References:**
  - MetaGPT: `https://github.com/FoundationAgents/MetaGPT` (SOPs & Artifact Chain)
  - LangGraph: `https://github.com/langchain-ai/langgraph` (State Persistence & Global Retry Budget)
  - Haystack: `https://github.com/deepset-ai/haystack` (RAG Indexing, Citations & Freshness)
  - CrewAI: `https://github.com/crewAIInc/crewAI` (Role-Based Execution)

---

## Context

In prototype iterations, multi-agent pipelines revealed several failure modes:
1. **Cascading Hallucinations & Goal Drift**: Downstream agents deviated from initial requirements over multiple iterations.
2. **Infinite Loops in Quality Gates**: Gates could alternate failures without ever exhausting a global budget or escalating to human operators.
3. **Dependency Behavioral Surprises**: Libraries recommended during research failed at runtime due to version incompatibilities or missing features in the specified release.
4. **Single-Language Bias**: Guardrails were focused on TypeScript, ignoring Go, Python, Rust, and Java.
5. **Ungrounded Interactive Responses**: Orchestrators answered direct user questions from parametric memory without verifiable citations.

## Decision

We have established **N.A.R.U. (v0.0.2)**, introducing an 11-agent sequential assembly line with the following structural pillars:

### 1. Sequential SOPs & Immutable Goal Baseline (MetaGPT Foundation)
- The pipeline initiates with `pm-agent` generating both `prd.md` and an immutable `goal-baseline.md` with explicit `naru_version: "0.0.2"`.
- Every gate validates against this baseline contract to ensure zero drift.

### 2. Dual-Layer Retry Budget (LangGraph Foundation)
- To eliminate unbounded retry cycles, we implement:
  - `gate_max_retries = 3` per gate.
  - `pipeline_retry_budget = 8` globally.
- Selecting `[R] Reset Budget (+8)` simultaneously resets the global budget to 8 AND resets all per-gate counters to 0.

### 3. Dependency Behavioral Contracts (`dependency-agent`)
- Pre-commits candidate libraries to strict 4-pillar contract testing (Feature existence in exact version, behavioral stability in range, peer dependency compatibility, and stability).
- `STATUS: CONDITIONAL` permits usage only with explicit ADR risk notation and 1-click user confirmation.
- `STATUS: REJECTED` requires minimal 2 verified alternatives.

### 4. Multi-Language No-Bypass Policy
- Enforces strict prohibition against silencing exceptions, blank ignores, or unlinked test skips across Go, Python, JavaScript, TypeScript, Rust, Dart, Kotlin, C, C++, C#, or Java.

### 5. Production RAG Grounding & Interactive Query Distinction (Haystack Foundation)
- **Internal State Queries**: Answered instantly from local artifacts with zero RAG latency.
- **Technical / Domain Claims**: Retrieved from indexed verified memory (`codebase-memory-mcp`) and live docs (`context7`), requiring full citations (`source_url`, `source_type`, `verified_date`, freshness status).
- Claims lacking evidence return `STATUS: KNOWLEDGE_GAP` and halt execution rather than speculating.

## Consequences

### Positive
- **Deterministic Production Quality**: Eliminates undetected regressions and dependency mismatches before coding begins.
- **Polyglot Readiness**: Native support for Go (e.g., `syncer-go-api`), Python, Rust, Java, and TypeScript projects.
- **Traceability**: Every technical decision links directly to official documentation or peer-reviewed literature.

### Trade-offs & Mitigations
- **Increased Pipeline Steps**: 11 agents introduce more sequential handoffs. *Mitigation*: Simple and Standard modes remain available for quick tasks that do not require full lifecycle execution.
