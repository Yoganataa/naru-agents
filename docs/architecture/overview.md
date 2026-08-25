---
layout: default
title: Agent Architecture — N.A.R.U.
---

# Agent Architecture

N.A.R.U. separates engineering responsibilities across one primary orchestrator and ten specialized agents. The agent files under `agents/` are the source of truth for model assignments, permissions, and role-specific instructions.

## Agent Responsibilities

| Agent | Responsibility |
|---|---|
| `naru` | Orchestration, workflow state, delegation, gates, and evidence-based reporting |
| `pm` | Requirements, scope, user stories, acceptance criteria, and goal baseline |
| `researcher` | External technical, compatibility, and security evidence |
| `dependency` | Dependency compatibility, provenance, and version assessment |
| `architect` | Architecture, contracts, ADRs, and implementation task breakdown |
| `developer` | Implementation and tests after Gate 1 approval |
| `reviewer` | Independent correctness, security, drift, and test-quality review |
| `qa` | Applicable build, type-check, test, and runtime verification |
| `docs` | Evidence-based documentation and knowledge consolidation |
| `deploy` | Release and deployment operations |
| `hotfix` | Narrowly scoped incident and regression fixes |

## Responsibility Boundaries

```text
                         ┌──────────────┐
                         │     naru     │
                         │ Orchestrator │
                         └──────┬───────┘
                                │
             ┌──────────────────┼──────────────────┐
             ↓                  ↓                  ↓
            pm             researcher         dependency
             │                  │                  │
             └──────────────────┼──────────────────┘
                                ↓
                           architect
                                │
                                ↓
                         USER APPROVAL
                            Gate 1
                                │
                                ↓
                           developer
                                │
                                ↓
                            reviewer
                                │
                                ↓
                               qa
                                │
                         ┌──────┴──────┐
                         ↓             ↓
                       docs         deploy

                    hotfix handles scoped incidents.
```

## Orchestration vs Enforcement

The architecture intentionally has two control planes:

### Agent instruction plane

Markdown contracts describe responsibilities, workflow expectations, evidence discipline, and role boundaries. They guide model behavior but cannot be treated as a security boundary.

### Runtime enforcement plane

The OpenCode plugin under `src/plugin/` enforces tool-level constraints independently of prompt compliance. The current implementation includes mutation authorization, project-root validation, pre-Gate-1 shell restrictions, role checks, security-pattern checks, circuit breaking, and native-question Gate 1 runtime state.

## Gate 1

For application changes, the native OpenCode `question` response is the authorization source. The runtime plugin validates the approval against the current planning state.

A generated artifact containing `APPROVED` is not equivalent to runtime authorization.

## Agent Selection

N.A.R.U. should delegate only when the task benefits from the specialist's responsibility. A simple informational question does not need the complete software-change pipeline. A bugfix does not require pretending that it is a greenfield project. Workflow depth should follow task risk and applicability.

## Evidence Boundaries

Architecture documents describe intended structure. They do not prove implementation conformance. That is established later by review, tests, runtime checks, or other direct evidence.

See [Workflow & Quality Gates](../workflow/pipelines.md) and the [N.A.R.U. Contract](../NARU-CONTRACT.md).
