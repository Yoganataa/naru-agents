---
layout: default
title: Agent Architecture — N.A.R.U.
---

# Agent Architecture

N.A.R.U. separates software-engineering responsibilities across a primary orchestrator and specialized agents. The repository currently contains 11 agent definitions.

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

The exact model, temperature, step limit, and permissions for each agent are defined in the corresponding file under `agents/`. Documentation should not override those definitions.

## Responsibility Boundaries

```text
                    ┌──────────────┐
                    │    naru      │
                    │ Orchestrator │
                    └──────┬───────┘
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
       Requirements & Evidence       Architecture
       pm / researcher /             architect / dependency
       dependency
             │                           │
             └─────────────┬─────────────┘
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
                  ┌────────┴────────┐
                  ↓                 ↓
                docs             deploy

              hotfix is used for scoped incidents.
```

## Runtime Enforcement

The repository also contains an OpenCode plugin under `src/plugin/`. It is the deterministic enforcement layer for the workflow.

Current guard categories include:

- mutation authorization;
- workspace path validation;
- read-only shell restrictions before Gate 1;
- role permissions;
- security-pattern checks;
- circuit breaking for repeated failures;
- native-question-based Gate 1 runtime state.

This separation is important: prompt instructions can guide an agent, but runtime guards are responsible for enforcing tool-level constraints.

## Evidence and Limitations

N.A.R.U. does not claim that its agent roster or guardrails make arbitrary generated software secure or production-ready. Verification is scoped to the checks that actually run for a particular task.

See the [N.A.R.U. Contract](../NARU-CONTRACT.md) for the canonical evidence and workflow rules.
