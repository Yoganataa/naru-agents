---
layout: default
title: Workflow & Quality Gates — N.A.R.U.
---

# Workflow & Quality Gates

N.A.R.U. uses an evidence-grounded workflow. It is a state machine, not a promise that every request must traverse every state.

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

A state may be skipped only when it is genuinely inapplicable. Material deviations should be explicit.

## 1. Discover

Classify the request and inspect the relevant repository state before proposing changes.

Typical intents include:

- informational question;
- feature/change;
- bugfix/incident;
- audit/setup/diagnostic.

The orchestrator should use the smallest workflow that is sufficient for the task's risk and evidence requirements.

## 2. Research

Research is required when the decision depends materially on external or changing evidence, including current APIs, versions, security advisories, vendor behavior, or compatibility.

Evidence priority:

1. official documentation, source, and release notes;
2. standards, advisories, registries, and peer-reviewed research;
3. reputable maintained implementations when primary evidence is insufficient.

Do not impose arbitrary citation counts. The objective is sufficient authoritative evidence for the decision.

## 3. Plan

For a normal software change, planning establishes:

- scope and non-goals;
- user stories and acceptance criteria;
- implementation sequence;
- architecture and dependency decisions;
- material risks;
- open decisions requiring user input.

Typical artifacts are:

```text
.opencode/artifacts/prd.md
.opencode/artifacts/goal-baseline.md
.opencode/knowledge/architecture-blueprint.md
```

Research and dependency artifacts are added when applicable.

## 4. User Approval — Gate 1

Before application-code mutation:

1. present the plan and material evidence;
2. invoke the native OpenCode `question` tool;
3. request `APPROVE_GATE_1`;
4. allow implementation only after runtime authorization is established.

The runtime plugin, not a workspace marker file, is the authority.

If the planning state changes after approval, authorization must be re-established.

## 5. Implement

`developer` or `hotfix` implements only the approved scope and architecture. Changes that materially alter the approved plan require a new decision rather than silent scope expansion.

## 6. Review

`reviewer` independently evaluates the actual diff for:

- goal alignment and scope drift;
- architectural consistency;
- correctness and maintainability;
- security-relevant paths;
- dependency/API assumptions;
- authentic tests rather than hollow tests.

## 7. QA

`qa` runs checks applicable to the actual project and records their real outcomes.

```text
PASS
FAIL
BLOCKED
NOT_APPLICABLE
NOT_TESTED
```

`NOT_TESTED` and `BLOCKED` are not converted into `PASS`.

## 8. Report

N.A.R.U. reports evidence using four classes:

- `VERIFIED` — directly supported;
- `USER_DECISION` — explicitly selected;
- `ASSUMPTION` — explicitly labeled;
- `UNKNOWN/BLOCKED` — unresolved or unavailable.

## Runtime Enforcement

The OpenCode plugin is the deterministic tool-boundary layer. Current guard categories include mutation authorization, project-root boundaries, pre-Gate-1 shell restrictions, role permissions, security-pattern checks, circuit breaking, and native-question-based Gate 1 state.

## What Gates Do Not Mean

A gate does not prove every property of the software.

- Gate 1 proves authorization state, not code quality.
- Review proves only what the reviewer actually inspected.
- QA proves only what was actually executed and observed.
- A security checklist does not prove the absence of vulnerabilities.
- A benchmark does not prove behavior in an unrelated run.
