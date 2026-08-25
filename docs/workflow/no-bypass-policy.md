---
layout: default
title: Security & No-Bypass Policy — N.A.R.U.
---

# Security & No-Bypass Policy

N.A.R.U. uses engineering and security controls to prevent agents from hiding defects or silently bypassing intended quality checks. These controls are **policy requirements for applicable projects**, not proof that an arbitrary application is secure.

## Core No-Bypass Rules

Agents should not hide defects through:

- unexplained type or lint suppression;
- silent error swallowing;
- unsafe optional/error unwrapping used to silence correctness checks;
- skipped or disabled tests without an explicit reason and tracking reference;
- undocumented temporary workarounds;
- unnecessary dynamic execution or obfuscation.

The exact language-specific matrix is maintained in the agent contracts under `agents/`.

## Language Coverage

The policy applies conceptually across the languages supported by the repository's agent guidance. The syntax differs by language, but the intent is consistent:

> Do not make a failure disappear merely because it is inconvenient to fix.

A suppression can be legitimate when required by the project, but it must have an explicit technical reason and the tracking context required by the applicable agent contract.

## Platform-Specific Controls

N.A.R.U. includes conditional guidance for several archetypes, including:

- web/API applications;
- mobile applications;
- desktop applications;
- Roblox experiences;
- messaging bots;
- CLI/developer tools;
- backend services;
- open-source packages.

Only controls relevant to the actual project should be applied. Reviewers must verify the control against implementation and current authoritative documentation.

Examples include input validation and authorization boundaries, secure credential storage, restrictive IPC, server-authoritative Roblox state, webhook signature validation, safe path handling, and dependency/provenance review.

## Frontend and UI

For applicable interfaces, consider:

- loaded, loading/skeleton, empty, error/retry, and mutation/in-flight states;
- semantic controls and keyboard focus;
- WCAG 2.2 AA requirements where applicable;
- responsive layouts for the target device;
- platform-specific UI constraints.

These are review criteria, not automatic proof of visual or accessibility compliance.

## Backend and Architecture

Where appropriate, reviewers should consider:

1. separation between domain logic and infrastructure adapters;
2. unused/dead code;
3. focused domain services;
4. algorithmic complexity;
5. cognitive complexity;
6. stateless scaling requirements.

Exact thresholds and technology choices are project-specific.

## Security Claim Discipline

Do not report any of the following as absolute facts without defined, executed evidence:

- `secure`;
- `zero vulnerabilities`;
- `100% compliant`;
- `production-ready`.

When a control cannot be verified, report `UNKNOWN/BLOCKED` or `NOT_TESTED`.

## Runtime vs Policy

The policy guides agent behavior. The OpenCode plugin is the deterministic enforcement boundary for the tool-level controls implemented in the repository. Prompt text alone must never be presented as a security mechanism.
