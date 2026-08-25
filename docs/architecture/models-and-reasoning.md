---
layout: default
title: AI Models & Reasoning — N.A.R.U.
---

# AI Models & Reasoning

N.A.R.U. assigns models to agent roles through the OpenCode agent definitions under `agents/`. Model identifiers, reasoning variants, step limits, and temperatures are configuration and may change independently of this documentation.

## Source of Truth

For exact current assignments, inspect the corresponding agent file:

```text
agents/naru.md
agents/pm.md
agents/researcher.md
agents/dependency.md
agents/architect.md
agents/developer.md
agents/reviewer.md
agents/qa.md
agents/docs.md
agents/deploy.md
agents/hotfix.md
```

Do not treat a benchmark score, context-window number, or model nickname as proof of behavior in a particular run.

## Role-Oriented Assignment

Different roles can use different models and reasoning variants because their workloads differ:

| Role | Primary concern |
|---|---|
| `naru` | orchestration and long-horizon planning |
| `pm` | requirements and acceptance criteria |
| `researcher` | evidence retrieval and source comparison |
| `dependency` | compatibility and provenance analysis |
| `architect` | architecture and trade-off reasoning |
| `developer` | implementation and tests |
| `reviewer` | adversarial review and defect detection |
| `qa` | execution-oriented verification |
| `docs` | technical documentation |
| `deploy` | release/deployment operations |
| `hotfix` | focused incident remediation |

The exact configured model belongs in the agent frontmatter. This avoids duplicating rapidly changing provider/model metadata in the GitHub Pages site.

## Reasoning Variants

Where supported by OpenCode, variants such as `low`, `medium`, `high`, `xhigh`, `max`, or `auto` can be selected according to role and task cost. Higher reasoning is not automatically better for every operation.

## Multimodal Work

Do not assume that every configured model accepts images, PDFs, or other modalities. When a task requires visual input, verify the active model/provider capabilities from the current OpenCode configuration.

If a selected model cannot consume the required modality, use a compatible model or transform the input into a reliable structured representation.

## Changing Models

Treat model changes as configuration changes. Verify, where relevant:

- exact provider/model identifier;
- modality support;
- context and output constraints;
- reasoning-variant support;
- tool compatibility;
- availability and rate limits.

Material model decisions should be recorded with evidence rather than benchmark-based marketing claims.
