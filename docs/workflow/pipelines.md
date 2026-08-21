# Pipelines & Quality Gates

N.A.R.U. operates under **4 Distinct Pipeline Modes**:

---

## 0. Step 0: Smart Intent Classification & Dynamic Routing

Before delegating to downstream subagents, Naru classifies every incoming request into one of 5 distinct intent taxonomies:
1. **`GREENFIELD_CREATION`**: New project from scratch ➔ Launches **Interactive Intake Questionnaire Modal** (Category, Stack, DB, Auth, MVP) ➔ Generates `project-brief.md` ➔ Full Production Pipeline.
2. **`FEATURE_MODIFICATION`**: Delta change on existing workspace ➔ Ingests repository topology with `lean-ctx` & `serena` ➔ Standard Feature Pipeline.
3. **`INCIDENT_BUGFIX`**: Error or test failure ➔ Runs blast-radius analysis via `codegraph_impact` ➔ Emergency Hotfix Pipeline.
4. **`INFORMATIONAL_QA`**: Technical questions & architecture discussions ➔ Direct Grounding via `context7` & `codebase-memory-mcp` with full citations (Zero subagent pipeline overhead).
5. **`WORKSPACE_DIAGNOSTIC`**: Maintenance & environment check ➔ Runs 5-MCP scanning or `naru doctor`.

---

## 1. The Production Pipeline Chain & Quality Gates

```text
USER REQUEST
    ↓
[0] SMART INTENT CLASSIFIER & CONFLICT CHECK
    ↓
[1] PM AGENT → prd.md + goal-baseline.md (Immutable)
    ↓
[2] RESEARCHER AGENT → research.md (Grounding & Citations)
    ↓
[3] DEPENDENCY AGENT → dependency-contracts.md (Manifest Lock)
    ↓
[4] ARCHITECT AGENT → architecture.md + ADRs + Risk Matrix
    ↓
[GATE 1] Goal vs Baseline & Architecture Feasibility (Retry budget <= 3, Global <= 8)
    ↓
[5] DEVELOPER AGENT → implementation.md + Milestone Git Commit
    ↓
[GATE 2] Smoke Tests Passed AND Zero No-Bypass Violations?
    ↓
[6] REVIEWER AGENT → review.md (Goal Drift & Security Audit)
    ↓
[GATE 3] Critical/Major Findings Resolved?
    ↓
[7] QA AGENT → qa-report.md (E2E & Vision Multimodal Regression)
    ↓
[GATE 4] Production Readiness & Visual Sign-Off Confirmed?
    ↓
[8] DOCS AGENT → README.md + API Spec + CHANGELOG.md + ADR Sync + save_graph
    ↓
[9] DEPLOY AGENT → Platform Deployment Runbook (bash: ask)
    ↓
NARU → Synthesized Production Summary → USER
```

---

## 2. The 4 Pipeline Modes

1. **Cold-Start Pipeline** (`naru init` / `@naru init`): Indexes unmapped repositories across all 5 MCPs.
2. **Simple Feature Pipeline**: For targeted single-file tasks (`pm` ➔ `developer` ➔ `reviewer` ➔ `qa`).
3. **Full Production Pipeline**: The complete 10-subagent lifecycle with all 4 quality gates.
4. **Emergency Hotfix Pipeline**: Surgical incident reproduction, blast-radius analysis via `codegraph_impact`, and atomic patch commit.

---

## 3. The 6 Interactive Native Question Modal Touchpoints

OpenCode's native `question` tool triggers interactive GUI/TUI modal forms with selectable options and custom write-in (Type Answer) fields across 6 critical SDLC touchpoints:

1. 🏗️ **Greenfield Project Intake (`naru`)**: Captures Category, Runtime, Database, Auth, Deployment, and MVP features.
2. ❓ **Requirement Disambiguation (`pm-agent`)**: Resolves commercial vendor and 3rd-party provider choices (e.g. Stripe vs Midtrans vs Xendit).
3. 🏛️ **Architectural Trade-Off Selection (`architect-agent`)**: Confirms API & paradigm choices (e.g. tRPC vs REST OpenAPI vs GraphQL).
4. ⚠️ **Destructive Migration Sign-Off (`developer-agent` & `hotfix-agent`)**: Requests explicit user confirmation before dropping database tables or executing breaking deletions.
5. 🚨 **Quality Gate 3x Fail Escalation (`naru`)**: Intercepts exhausted retry budgets with an interactive modal: `[Reset Budget +8 / Manual Fix / Abort]`.
6. 🚢 **Deployment Environment Selection (`deploy-agent`)**: Confirms target environment: `[Preview/Staging / Production Live / Dry-Run Script]`.

---

## 4. Core-First Milestone Governance & Anti-Scope Creep Protocol

To prevent premature expansion and cascading regressions (ACM TOSEM 2025; arXiv:2505.02709):
- **Milestone 1 (Core MVP) Lock**: Naru ensures that the primary domain architecture and essential user stories are 100% completed, tested, and passed through Quality Gate 4 before secondary features or non-essential hardening are introduced.
- **Zero Idea Loss (Backlog Staging)**: Any new feature ideas prompted by the user during Milestone 1 are automatically staged into `.opencode/artifacts/backlog.md`.
- **Interactive Scope Governance Modal**: Naru prompts the user with 3 clear governance options via the native `question` modal:
  1. `[1] Focus on Core MVP (Recommended)`: Finish current core milestone first; new feature is queued for Milestone 2.
  2. `[2] Amend Current Milestone Baseline`: Re-run PM-Agent to update PRD and `goal-baseline.md`.
  3. `[3] Pivot Project Scope`: Deprecate current baseline and formulate a new architectural baseline from scratch.
- **Milestone 2+ Transition**: Upon successful deployment of Milestone 1, Naru proactively offers to ingest `backlog.md` with PM-Agent to begin the next milestone.


---

## 🚀 4 Next-Gen Engineering Excellence Protocols

1. **⚡ Autonomous Performance & N+1 Query Eliminator**:
   - Zero N+1 query waterfall: all relational queries require batch/eager fetching (`with`, `include`, DataLoader).
   - Automated index recommendations on foreign key and search columns.
   - Resource lifecycle cleanup (`AbortController`, RAII) and dynamic code-splitting.
2. **🔄 Self-Healing Flaky Test Quarantine Engine**:
   - Automatic identification of flaky tests and quarantine into `.opencode/artifacts/flaky-tests.md`.
   - Automated asynchronous stabilization via deterministic polling assertions (`waitFor`).
3. **📊 Living Architecture & OpenAPI 3.1 Specs**:
   - Automated generation of Mermaid ERDs and Sequence Flowcharts from code AST.
   - Automated extraction of OpenAPI 3.1 Swagger / Postman JSON into `.opencode/artifacts/openapi.json`.
4. **🧠 Meta-Cognitive Heuristics Evolution (Reflexion Loop)**:
   - Automated root-cause heuristic extraction into `.opencode/knowledge/heuristics.md` upon resolving Quality Gate 2/3 failures, preventing duplicate bugs across future sessions.
