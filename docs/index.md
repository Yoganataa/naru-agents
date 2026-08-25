---
layout: default
title: N.A.R.U. — Documentation
---

<div class="hero-container">
  <div class="hero-badge"><span class="badge-pulse"></span><span>Evidence-grounded OpenCode orchestration</span></div>
  <h1 class="hero-headline">N.A.R.U. <span class="gradient-text">for OpenCode</span></h1>
  <p class="hero-subheadline">A role-based engineering orchestration layer that separates agent instructions from deterministic runtime guardrails and ties consequential claims to evidence.</p>
  <div class="hero-actions">
    <a href="{{ site.baseurl }}/getting-started/quick-start" class="action-btn btn-primary-glow"><i class="fa-solid fa-bolt"></i> Quick Start →</a>
    <a href="{{ site.baseurl }}/architecture/overview" class="action-btn btn-glass"><i class="fa-solid fa-users-gear"></i> Agent Architecture</a>
    <a href="https://github.com/{{ site.repository }}" target="_blank" rel="noreferrer" class="action-btn btn-glass"><i class="fa-brands fa-github"></i> GitHub Repository</a>
  </div>
</div>

## What N.A.R.U. Is

N.A.R.U. coordinates specialized engineering agents around a stateful workflow. The model is intentionally split into two layers:

1. **Instruction layer** — agent contracts under `agents/` guide reasoning and responsibilities.
2. **Runtime layer** — the OpenCode plugin under `src/plugin/` enforces tool-level constraints that must not depend solely on model obedience.

N.A.R.U. does not guarantee that generated software is secure, correct, or production-ready.

## Core Workflow

```text
DISCOVER
   ↓
RESEARCH (when evidence is required)
   ↓
PLAN
   ↓
USER APPROVAL
   ↓
IMPLEMENT
   ↓
REVIEW
   ↓
QA
   ↓
REPORT
```

A workflow state may be skipped only when it is genuinely inapplicable. Material deviations should be explicit.

## Gate 1

For software changes, application-code mutation is blocked until the native OpenCode `question` tool returns the explicit `APPROVE_GATE_1` choice for the current planning state.

Workspace files are diagnostic artifacts, not authorization tokens.

## Evidence Model

| Class | Meaning |
|---|---|
| `VERIFIED` | Supported by an actual tool result, artifact, command result, or runtime event |
| `USER_DECISION` | Explicitly selected by the user |
| `ASSUMPTION` | Low-risk assumption that is explicitly labeled |
| `UNKNOWN/BLOCKED` | Not established by available evidence |

The same evidence model applies to this documentation. A planned feature is not documented as an executed result.

## Agent Team

N.A.R.U. currently defines one primary orchestrator and ten specialized agents. See [Agent Architecture]({{ site.baseurl }}/architecture/overview) for boundaries and [Models & Reasoning]({{ site.baseurl }}/architecture/models-and-reasoning) for configuration details.

## Runtime Guardrails

The current plugin guard surface includes mutation authorization, workspace path validation, pre-Gate-1 shell restrictions, role permissions, security-pattern checks, circuit breaking, and native-question-based Gate 1 runtime state.

These are implementation facts about the repository; they are not a claim that arbitrary generated applications are secure.

## Start Here

- [Quick Start]({{ site.baseurl }}/getting-started/quick-start)
- [Installation]({{ site.baseurl }}/getting-started/installation)
- [CLI Reference & Diagnostics]({{ site.baseurl }}/getting-started/troubleshooting)
- [Agent Architecture]({{ site.baseurl }}/architecture/overview)
- [Models & Reasoning]({{ site.baseurl }}/architecture/models-and-reasoning)
- [MCP Tooling]({{ site.baseurl }}/architecture/mcp-servers)
- [Session Knowledge]({{ site.baseurl }}/architecture/session-knowledge)
- [Workflow & Quality Gates]({{ site.baseurl }}/workflow/pipelines)
- [Security & No-Bypass Policy]({{ site.baseurl }}/workflow/no-bypass-policy)
- [Architecture Decisions]({{ site.baseurl }}/adr/ADR-001-v2-architecture-and-rag)

## Claim Discipline

Do not report `secure`, `zero vulnerabilities`, `100% compliant`, or `production-ready` as absolute facts without a defined scope and actual evidence. When a property cannot be verified, report it as `UNKNOWN/BLOCKED` or `NOT_TESTED`.
