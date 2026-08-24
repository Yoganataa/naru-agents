---
layout: default
title: Workflow & Quality Gates — N.A.R.U.
---

# Workflow & Quality Gates

N.A.R.U. uses an evidence-grounded workflow. The orchestrator may skip a state only when it is genuinely inapplicable and must explain material deviations.

## Workflow

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

### Discover

Classify the request as a question, change, bugfix, audit/setup task, or another applicable workflow. Inspect the existing repository before proposing modifications.

### Research

Research is required for current, version-sensitive, security-sensitive, vendor-specific, or otherwise consequential decisions. Prefer authoritative sources. Do not fabricate evidence.

### Plan

For software changes, the planning package normally includes:

- `.opencode/artifacts/prd.md`
- `.opencode/artifacts/goal-baseline.md`
- `.opencode/knowledge/architecture-blueprint.md`
- relevant research and dependency evidence when required

### User Approval — Gate 1

Before application-code mutation:

1. Present the plan and material evidence.
2. Invoke the native OpenCode `question` tool.
3. Request the exact approval option `APPROVE_GATE_1`.
4. Delegate implementation only after runtime authorization is established.

Writing `APPROVED` into a workspace file does not grant authority. Changing the approved planning package invalidates its runtime approval fingerprint.

### Implement

`developer` or `hotfix` implements only against the approved scope and architecture. The orchestrator does not silently broaden scope.

### Review

`reviewer` independently checks correctness, goal alignment, architecture, security-relevant paths, dependency assumptions, and test authenticity against the actual diff.

### QA

`qa` executes checks that are applicable to the project and reports their actual results. A check that cannot run is recorded as `BLOCKED` or `NOT_TESTED`; an irrelevant check is `NOT_APPLICABLE`.

### Report

Final claims are classified as:

- `VERIFIED`
- `USER_DECISION`
- `ASSUMPTION`
- `UNKNOWN/BLOCKED`

## Runtime Enforcement

The OpenCode plugin is the deterministic enforcement boundary. Agent Markdown is an instruction layer, not a security boundary.

The current plugin includes runtime checks for mutation authorization, project-root boundaries, pre-Gate-1 shell restrictions, role permissions, security-pattern checks, circuit breaking, and native-question-based Gate 1 state.

## Quality Gate Semantics

N.A.R.U. should not be described as having a universal fixed set of four gates for every task. Gate behavior depends on the applicable workflow and evidence available.

For software changes, the central hard boundary is **Gate 1: explicit user approval before application-code mutation**. Review and QA are subsequent verification stages, not proof that every possible security or correctness property has been established.

## Evidence Rules

- A checklist is not evidence that a property is satisfied.
- A planned test is not evidence that it passed.
- A model benchmark is not evidence of behavior in a particular run.
- A generated artifact is not proof that the implementation matches it.
- QA results apply only to checks actually executed.
