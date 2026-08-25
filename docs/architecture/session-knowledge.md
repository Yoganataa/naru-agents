---
layout: default
title: Session Knowledge — N.A.R.U.
---

# Session Knowledge

N.A.R.U. can persist project knowledge across sessions, but documentation must distinguish **repository-backed memory** from claims about a particular memory implementation being active in every installation.

## Knowledge Layers

The repository uses `.opencode/knowledge/` for durable project context and `.opencode/artifacts/` for workflow evidence.

A typical topology is:

```text
.opencode/
├── artifacts/
│   ├── prd.md
│   ├── goal-baseline.md
│   ├── architecture.md
│   ├── implementation.md
│   ├── review.md
│   └── qa-report.md
└── knowledge/
    ├── sessions/
    │   └── {timestamp}/
    ├── architecture-blueprint.md
    ├── heuristics.md
    ├── patterns.md
    └── pipeline-history.md
```

Exact files depend on the workflow and current implementation.

## Session Snapshots

When the documentation workflow creates a session snapshot, it should record facts such as:

- request and scope;
- decisions made;
- files changed;
- checks actually executed;
- unresolved blockers;
- final workflow state.

A session snapshot is historical evidence. It does not become authority over runtime state merely because it contains a status string.

## Institutional Knowledge

Reusable project knowledge may include:

- architectural conventions;
- resolved incident patterns;
- recurring constraints;
- dependency decisions;
- lessons from previous reviews.

Knowledge should be updated from verified project evidence rather than model speculation.

## Knowledge Graph Integrations

When `codebase-memory-mcp` is actually configured and available, the docs workflow can use its graph operations to persist relationships between project entities. The presence of documentation mentioning those operations does not prove that the MCP server is installed, connected, or successfully persisted a graph in a particular run.

## Memory and Truth

Persistent memory is context, not execution proof.

For example:

- a remembered decision does not prove the current code still follows it;
- a stored test result does not prove the test passed today;
- a remembered dependency version does not prove the current lockfile uses it.

Current repository state and actual tool results take precedence when they conflict with historical memory.

## Operational Principle

Use memory to avoid rediscovering context. Use current code, runtime events, and executed checks to establish present truth.
