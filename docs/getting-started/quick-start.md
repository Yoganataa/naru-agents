---
layout: default
title: Quick Start — N.A.R.U.
---

# Quick Start

This guide shows the intended N.A.R.U. workflow without assuming that every request needs the full lifecycle.

## 1. Open the Workspace

Start OpenCode in the repository you want N.A.R.U. to work on:

```bash
cd my-project
opencode
```

## 2. Ask Naru

Use the primary `naru` agent for engineering work:

```text
@naru Add authentication to the existing application.
```

For a simple informational question, Naru may answer directly instead of launching a software-change pipeline.

## 3. Discovery

For repository changes, Naru inspects the existing workspace first and classifies the request. Typical categories include feature work, bug fixing, audit/setup, and informational questions.

The existing codebase is evidence. The agent should not redesign or rewrite components merely because a preferred pattern exists elsewhere.

## 4. Research When Required

Research is required when a decision depends materially on current external facts, such as:

- current APIs or SDK behavior;
- package/version compatibility;
- security advisories;
- vendor-specific behavior;
- changing platform requirements.

Stable concepts do not require arbitrary citation counts.

## 5. Planning

For a normal software change, planning should establish:

- requirements and scope;
- explicit non-goals;
- acceptance criteria;
- implementation sequence;
- relevant architecture and dependency decisions;
- material risks and open decisions.

The planning package normally uses:

```text
.opencode/artifacts/prd.md
.opencode/artifacts/goal-baseline.md
.opencode/knowledge/architecture-blueprint.md
```

Additional research/dependency artifacts are added when applicable.

## 6. Gate 1 — User Approval

Before application-code mutation, Naru presents the plan and invokes OpenCode's native `question` tool.

The explicit approval choice is:

```text
APPROVE_GATE_1
```

The runtime plugin validates this approval against the current planning state. Writing `APPROVED` to a file never grants authority.

If the approved planning package changes, approval must be obtained again.

## 7. Implementation

After Gate 1, `developer` or `hotfix` implements the approved scope. They should not silently add features or change architectural decisions without returning to the appropriate decision point.

## 8. Review

`reviewer` evaluates the actual diff against the goal baseline, architecture, relevant evidence, security-sensitive paths, dependencies, and test authenticity.

Review is independent of implementation.

## 9. QA

`qa` runs checks that are applicable to the project and reports actual outcomes:

```text
PASS
FAIL
BLOCKED
NOT_APPLICABLE
NOT_TESTED
```

A test that was planned but not executed is not a pass.

## 10. Report

Naru separates:

- `VERIFIED` — directly evidenced;
- `USER_DECISION` — explicitly selected;
- `ASSUMPTION` — explicitly labeled;
- `UNKNOWN/BLOCKED` — unresolved or unavailable.

This prevents generated plans, intended commands, and model claims from being confused with execution evidence.

## Next Steps

- [Installation Guide](installation.md)
- [Agent Architecture](../architecture/overview.md)
- [Workflow & Quality Gates](../workflow/pipelines.md)
- [Security & No-Bypass Policy](../workflow/no-bypass-policy.md)
- [N.A.R.U. Contract](../NARU-CONTRACT.md)
