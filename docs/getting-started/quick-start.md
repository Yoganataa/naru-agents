---
layout: default
title: Quick Start — N.A.R.U.
---

# Quick Start

This guide describes the verified workflow model rather than promising a fixed pipeline for every project.

## 1. Open the Workspace

Start OpenCode in the repository you want to work on:

```bash
cd my-project
opencode
```

The exact OpenCode installation and invocation options depend on your OpenCode setup.

## 2. Use Naru as the Orchestrator

Ask the `naru` agent to perform the task. For example:

```text
@naru Add authentication to the existing application.
```

Naru should first inspect the repository and determine the applicable workflow.

## 3. Discovery and Research

For a software change, Naru determines scope and gathers the evidence required for consequential decisions.

Research is not mandatory for every task. It is expected when the answer depends on current APIs, versions, security advisories, vendor behavior, or other external facts.

## 4. Planning

The planning phase produces the artifacts required by the current workflow. For a normal software change this includes the requirements/goal baseline and architecture blueprint, plus research or dependency evidence when applicable.

The plan should identify:

- scope and non-goals;
- acceptance criteria;
- implementation sequence;
- material risks;
- decisions requiring user input.

## 5. Gate 1 — User Approval

Before application-code mutation, Naru presents the plan and invokes the native OpenCode `question` tool.

The approval option is:

```text
APPROVE_GATE_1
```

Only runtime authorization from that native response grants the implementation boundary. A file containing `APPROVED` does not.

If the approved planning package changes, the runtime approval becomes invalid and the plan must be approved again.

## 6. Implementation, Review, and QA

After approval:

1. `developer` implements the approved scope and tests.
2. `reviewer` independently reviews the actual diff.
3. `qa` runs checks that are applicable to the project.

QA reports actual outcomes. It must not convert unavailable checks into passing results.

Typical status values are:

```text
PASS
FAIL
BLOCKED
NOT_APPLICABLE
NOT_TESTED
```

## 7. Evidence-Based Report

Naru reports results using explicit evidence classes:

- `VERIFIED`
- `USER_DECISION`
- `ASSUMPTION`
- `UNKNOWN/BLOCKED`

This prevents a generated plan, model response, or intended test from being presented as an executed result.

## Next Steps

- Read the [N.A.R.U. Contract](../NARU-CONTRACT.md).
- Review the [Agent Architecture](../architecture/overview.md).
- Review [Workflow & Quality Gates](../workflow/pipelines.md).
- See the [Installation Guide](installation.md) for package setup.
