---
layout: default
title: ADR-001 — N.A.R.U. Architecture
---

# ADR-001: N.A.R.U. Multi-Agent Architecture and Evidence-Grounded Workflow

- **Status:** Accepted
- **Date:** 2026-08-25
- **Scope:** N.A.R.U. orchestration, agent responsibilities, evidence handling, and runtime enforcement

## Context

Earlier N.A.R.U. iterations accumulated broad promises and tightly prescribed pipelines. This created several risks:

1. workflow requirements were treated as universal even when a task did not need them;
2. documentation duplicated model, MCP, and platform claims that could become stale;
3. prompt instructions were sometimes described as if they were deterministic security controls;
4. generated artifacts could be confused with execution evidence;
5. benchmark or checklist language could be mistaken for proof of software quality;
6. fixed gate counts and mandatory agent handoffs increased process overhead for simple tasks.

## Decision

N.A.R.U. uses an evidence-grounded orchestration model with a deterministic runtime enforcement layer.

### 1. State-Based Workflow

The default software-change workflow is:

```text
DISCOVER → RESEARCH* → PLAN → USER APPROVAL → IMPLEMENT → REVIEW → QA → REPORT
```

`RESEARCH` is conditional. Other states may be skipped only when genuinely inapplicable.

### 2. Gate 1 Runtime Authorization

Application-code mutation requires explicit user approval through the native OpenCode `question` tool.

The runtime plugin validates this state. Workspace files are diagnostic artifacts and cannot create authorization by themselves.

### 3. Evidence Classification

Important claims use four classes:

- `VERIFIED`;
- `USER_DECISION`;
- `ASSUMPTION`;
- `UNKNOWN/BLOCKED`.

The system prefers an explicit unknown over an invented success claim.

### 4. Separation of Instruction and Enforcement

Agent Markdown defines role behavior and engineering policy. The OpenCode plugin enforces deterministic tool-level constraints such as mutation gating, role checks, shell restrictions, security-pattern checks, and circuit breaking.

Prompt compliance is not treated as a security boundary.

### 5. Source-of-Truth Documentation

GitHub Pages documentation describes the current repository behavior without duplicating volatile model/MCP metadata unnecessarily. Agent frontmatter is authoritative for model and permission assignments. CLI source and `--help` output are authoritative for commands. Runtime/tool results are authoritative for execution claims.

### 6. Conditional Controls

Security, architecture, testing, UI, and platform controls are applied according to project applicability. A checklist item is not considered passed merely because it appears in policy documentation.

## Consequences

### Positive

- Less workflow overhead for simple tasks.
- Clear distinction between model guidance and deterministic enforcement.
- Reduced documentation drift from volatile model/MCP information.
- More honest reporting of blocked and untested states.
- Gate 1 remains a concrete authorization boundary for application mutation.

### Trade-offs

- Some claims require explicit verification rather than relying on static documentation.
- The workflow is less rigid than a fixed 11-agent assembly line.
- Model/MCP details must be inspected from the active configuration when exact information is required.

## Rejected Assumptions

This ADR intentionally does **not** establish that:

- N.A.R.U. makes arbitrary generated software production-ready;
- a fixed number of MCP servers is present in every installation;
- one model is universally superior;
- a checklist proves security;
- a generated artifact proves implementation correctness;
- every task requires every agent.

## Verification Sources

For current behavior, use:

- `agents/*.md` for agent contracts and model/permission configuration;
- `src/plugin/` for runtime enforcement;
- CLI source and `naru --help` for command behavior;
- actual tool/test output for execution evidence.
