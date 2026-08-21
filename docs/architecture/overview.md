# System Architecture & 11-Agent Cognitive Roster

N.A.R.U. organizes autonomous software engineering into **5 Specialized Cognitive Clusters** to prevent context contamination and maximize execution fidelity.

---

## 👥 11-Agent Roster & OpenCode Configuration Matrix

| Subagent | Color Hex | Default Model & Variant | Steps Limit | Temperature | Modality | Core Responsibility |
|---|---|---|---|---|---|---|
| 👑 **`naru.md`** | `#6366f1` | `muse-spark-1.2 [high]` | 25 | 0.3 | 👁️ OMNI | AI Team Lead, Step 0 Intent Classifier, Form Modals, Heuristics Reflexion |
| 📋 **`pm-agent.md`** | `#3b82f6` | `muse-spark-1.2 [xhigh]` | 15 | 0.2 | 👁️ OMNI | PRD Formulation, Goal Traceability Matrix (`AC-XX`), Backlog Staging |
| 🔍 **`researcher-agent.md`** | `#06b6d4` | `hy3-free [medium]` | 15 | 0.4 | 📝 TEXT | Evidence-Based Research & Pre-Adoption Threat Intelligence (GHSA/NVD) |
| 📦 **`dependency-agent.md`** | `#0ea5e9` | `hy3-free [low]` | 12 | 0.1 | 📝 TEXT | Exact Manifest Version Locking, Zero-Trust Dependency (ZTD), SLSA Provenance |
| 🏛️ **`architect-agent.md`** | `#8b5cf6` | `muse-spark-1.2 [xhigh]` | 15 | 0.2 | 👁️ OMNI | Hexagonal Ports-and-Adapters, System Topology, ADRs, Roblox Architecture |
| ⚡ **`developer-agent.md`** | `#10b981` | `big-pickle [auto]` | 25 | 0.2 | 📝 CODE | Fullstack Code Synthesis, 5 States of UI Stack, O(1) Efficiency, No-Bypass |
| 🛡️ **`reviewer-agent.md`** | `#f59e0b` | `x-preview-f-free [max]` | 15 | 0.1 | 👁️ OMNI | Quality Gate 3 Security Audit, Anti-Slop Check, AST Zero Dead Code Purge |
| 👁️ **`qa-agent.md`** | `#ec4899` | `mimo-v2.5-free [auto]` | 20 | 0.3 | 👁️ VISION | Quality Gate 4 Testing, Screenshot OCR Diffing, Flaky Test Quarantine |
| 📚 **`docs-agent.md`** | `#a855f7` | `nemotron-3-ultra-free [auto]` | 15 | 0.3 | 📝 TEXT | Living Mermaid ERD, OpenAPI 3.1 Specs, Secret Masking, `save_graph` Sync |
| 🚢 **`deploy-agent.md`** | `#14b8a6` | `hy3-free [low]` | 10 | 0.1 | 📝 TEXT | Multi-Platform DevOps, Non-Root Containers, Egress Sandboxing, CI/CD |
| 🛠️ **`hotfix-agent.md`** | `#ef4444` | `big-pickle [auto]` | 20 | 0.1 | 📝 CODE | Root-Cause Incident Hotfixing, Flaky Test Stabilization, AST Patching |

---

## 🏛️ The 5 Specialized Cognitive Clusters

1. **Strategic & Architectural Triad** (`naru`, `pm-agent`, `architect-agent`):
   - Anchored on **Meta Muse Spark 1.2 Free** (AA Index 54.0, 1M token context, Full Omni Vision + PDF).
   - Responsible for project initiation, interactive intake questionnaires, requirement formulation, and Clean Architecture blueprints.
2. **Autonomous Implementation Specialists** (`developer-agent`, `hotfix-agent`):
   - Anchored on **Big Pickle** (Frontier Coding Specialist).
   - Responsible for multi-file AST implementation, O(1) algorithms, and immediate bug resolution.
3. **Dual-Layer Quality & Security Audit** (`reviewer-agent`, `qa-agent`):
   - Anchored on **Ox Alpha Free [max]** (Adversarial Reasoning) and **MiMo V2.5** (Multimodal Vision OCR).
   - Reviewer enforces Gate 3 (OWASP, Anti-Slop, Dead Code); QA enforces Gate 4 (E2E testing, visual regression, exploit fuzzing).
4. **Fast Retrieval & Supply-Chain Operations** (`researcher-agent`, `dependency-agent`, `deploy-agent`):
   - Anchored on **Hy3 Free** (Ultra-fast sub-second latency).
   - Responsible for live documentation search, zero-trust dependency pinning, and deployment runbooks.
5. **Knowledge Reflection & Documentation** (`docs-agent`):
   - Anchored on **Nemotron 3 Ultra Free** (High-throughput bulk text).
   - Responsible for OpenAPI 3.1 Swagger JSON, Mermaid ERDs, and cross-session knowledge synchronization.
