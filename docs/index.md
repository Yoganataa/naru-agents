---
layout: default
title: N.A.R.U. — Documentation
---

<div class="hero-container">
  <div class="hero-badge">
    <span class="badge-pulse"></span>
    <span>Evidence-grounded OpenCode orchestration</span>
  </div>

  <h1 class="hero-headline">
    N.A.R.U. <span class="gradient-text">for OpenCode</span>
  </h1>

  <p class="hero-subheadline">
    A role-based engineering orchestration layer that separates agent instructions from deterministic runtime guardrails and keeps important claims tied to evidence.
  </p>

  <div class="hero-actions">
    <a href="{{ site.baseurl }}/getting-started/quick-start" class="action-btn btn-primary-glow">
      <i class="fa-solid fa-bolt"></i> Quick Start →
    </a>
    <a href="{{ site.baseurl }}/architecture/overview" class="action-btn btn-glass">
      <i class="fa-solid fa-users-gear"></i> Agent Architecture
    </a>
    <a href="https://github.com/{{ site.repository }}" target="_blank" rel="noreferrer" class="action-btn btn-glass">
      <i class="fa-brands fa-github"></i> GitHub Repository
    </a>
  </div>
</div>

---

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

The native OpenCode `question` response is the source of Gate 1 authorization. Workspace files are never treated as proof of approval.

## Evidence Model

N.A.R.U. uses four explicit evidence classes:

| Class | Meaning |
|---|---|
| `VERIFIED` | Supported by a tool result, artifact, command result, or runtime event |
| `USER_DECISION` | Explicitly selected by the user |
| `ASSUMPTION` | Low-risk assumption that is explicitly labeled |
| `UNKNOWN/BLOCKED` | Not established by available evidence |

This documentation follows the same rule: a planned capability is not described as an executed result.

## Agent Team

The repository currently contains a primary `naru` orchestrator plus 10 specialized agents:

| Agent | Responsibility |
|---|---|
| `naru` | Orchestration, gates, delegation, and reporting |
| `pm` | Requirements and acceptance criteria |
| `researcher` | External evidence |
| `dependency` | Dependency assessment |
| `architect` | Architecture and ADRs |
| `developer` | Implementation and tests |
| `reviewer` | Independent review |
| `qa` | Applicable verification |
| `docs` | Documentation and knowledge consolidation |
| `deploy` | Release operations |
| `hotfix` | Scoped incident fixes |

## Runtime Guardrails

The plugin under `src/plugin/` is the deterministic enforcement layer. Its current guard surface includes mutation authorization, project-root validation, pre-Gate-1 shell restrictions, role permissions, security-pattern checks, circuit breaking, and Gate 1 runtime state.

Agent Markdown remains an instruction layer. It is not a standalone security boundary.

## Installation

The package currently declares Node.js `>=18.0.0` and Bun `>=1.0`.

```bash
bun install -g github:yoganataa/naru-agents
naru setup --auto
```

or:

```bash
npm install -g github:yoganataa/naru-agents
naru setup --auto
```

See the [Installation Guide]({{ site.baseurl }}/getting-started/installation) for verification commands.

## Documentation

- [N.A.R.U. Contract]({{ site.baseurl }}/NARU-CONTRACT)
- [Quick Start]({{ site.baseurl }}/getting-started/quick-start)
- [Installation]({{ site.baseurl }}/getting-started/installation)
- [Agent Architecture]({{ site.baseurl }}/architecture/overview)
- [Workflow & Quality Gates]({{ site.baseurl }}/workflow/pipelines)
- [Session Knowledge]({{ site.baseurl }}/architecture/session-knowledge)
- [Architecture Decisions]({{ site.baseurl }}/adr/ADR-001-v2-architecture-and-rag)

## Claim Discipline

N.A.R.U. does not claim that an arbitrary generated application is secure, correct, or production-ready. A security checklist, benchmark, generated artifact, or planned test is not by itself evidence of runtime behavior.

The documentation and agent contracts intentionally prefer an explicit `UNKNOWN/BLOCKED` result over an invented success claim.
