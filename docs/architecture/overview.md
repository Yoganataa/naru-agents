---
layout: default
title: 11-Agent Cognitive Roster — N.A.R.U.
---

# 11-Agent Cognitive Roster & System Architecture

N.A.R.U. divides autonomous software development across **5 Specialized Cognitive Clusters** to prevent context contamination and maximize execution fidelity.

---

## Complete 11-Agent Configuration Matrix

| Subagent | Color Hex | Default Model & Variant | Steps Limit | Temperature | Modality | Core Responsibility |
|---|---|---|---|---|---|---|
| **`naru.md`** | `#6366f1` | `muse-spark-1.2 [high]` | 25 | 0.3 | Full Omni | AI Team Lead, Step 0 Intent Classifier, Form Modals, Heuristics Reflexion |
| **`pm-agent.md`** | `#3b82f6` | `muse-spark-1.2 [xhigh]` | 15 | 0.2 | Full Omni | PRD Formulation, Goal Traceability Matrix (`AC-XX`), Backlog Staging |
| **`researcher-agent.md`** | `#06b6d4` | `hy3-free [medium]` | 15 | 0.4 | Text-Only | Evidence-Based Research & Pre-Adoption Threat Intelligence (GHSA/NVD) |
| **`dependency-agent.md`** | `#0ea5e9` | `hy3-free [low]` | 12 | 0.1 | Text-Only | Exact Manifest Version Locking, Zero-Trust Dependency (ZTD), SLSA Provenance |
| **`architect-agent.md`** | `#8b5cf6` | `muse-spark-1.2 [xhigh]` | 15 | 0.2 | Full Omni | Hexagonal Ports-and-Adapters, System Topology, ADRs, Roblox Architecture |
| **`developer-agent.md`** | `#10b981` | `big-pickle [auto]` | 25 | 0.2 | Code Spec | Fullstack Code Synthesis, 5 States of UI Stack, O(1) Efficiency, No-Bypass |
| **`reviewer-agent.md`** | `#f59e0b` | `x-preview-f-free [max]` | 15 | 0.1 | Omni Reason | Quality Gate 3 Security Audit, Anti-Slop Check, AST Zero Dead Code Purge |
| **`qa-agent.md`** | `#ec4899` | `mimo-v2.5-free [auto]` | 20 | 0.3 | Vision OCR | Quality Gate 4 Testing, Screenshot OCR Diffing, Flaky Test Quarantine |
| **`docs-agent.md`** | `#a855f7` | `nemotron-3-ultra-free [auto]` | 15 | 0.3 | Text-Only | Living Mermaid ERD, OpenAPI 3.1 Specs, Secret Masking, `save_graph` Sync |
| **`deploy-agent.md`** | `#14b8a6` | `hy3-free [low]` | 10 | 0.1 | Text-Only | Multi-Platform DevOps, Non-Root Containers, Egress Sandboxing, CI/CD |
| **`hotfix-agent.md`** | `#ef4444` | `big-pickle [auto]` | 20 | 0.1 | Code Spec | Root-Cause Incident Hotfixing, Flaky Test Stabilization, AST Patching |

---

## The 5 Specialized Cognitive Clusters

### 1. Strategic & Architectural Triad (naru, pm-agent, architect-agent)
- **Model Anchor**: Meta Muse Spark 1.2 Free (AA Index 54.0, 1M context, Vision + PDF).
- **Mission**: Governs the project lifecycle. Naru classifies incoming intent and renders interactive intake forms; PM-Agent translates requirements into measurable acceptance criteria (`AC-XX`); Architect-Agent designs hexagonal domain boundaries and authors Architecture Decision Records (`ADR-XXX`).

### 2. Autonomous Implementation Specialists (developer-agent, hotfix-agent)
- **Model Anchor**: Big Pickle (Frontier Coding Specialist).
- **Mission**: Developer-Agent synthesizes production code adhering to the 5 States of UI Stack, O(1) algorithms, and zero N+1 database waterfalls; Hotfix-Agent resolves urgent live incidents by reproducing defects with regression tests before patching.

### 3. Dual-Layer Quality & Security Audit (reviewer-agent, qa-agent)
- **Model Anchor**: Ox Alpha Free [max reasoning] & MiMo V2.5 [Vision OCR].
- **Mission**: Reviewer-Agent enforces **Quality Gate 3** via adversarial AST security audits (OWASP Top 10, anti-slop frontend standards, zero dead code mandate); QA-Agent enforces **Quality Gate 4** via Playwright E2E suites, multi-device visual regression OCR, and packet flood fuzzing.

### 4. Fast Retrieval & Supply-Chain Operations (researcher-agent, dependency-agent, deploy-agent)
- **Model Anchor**: Hy3 Free (Ultra-fast sub-second latency).
- **Mission**: Researcher-Agent fetches verified library documentation via Context7 and audits GHSA/NVD databases; Dependency-Agent locks exact package manifests (Zero-Trust Dependency); Deploy-Agent writes hardened non-root release runbooks.

### 5. Knowledge Reflection & Living Documentation (docs-agent)
- **Model Anchor**: Nemotron 3 Ultra Free (High-throughput bulk text).
- **Mission**: Extracts live AST schemas to generate interactive Mermaid ERDs, OpenAPI 3.1 specifications, sanitized changelogs, and persists cross-session learnings into SQLite graph memory.
