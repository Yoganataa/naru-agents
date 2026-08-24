---
layout: default
title: Security & No-Bypass Policy — N.A.R.U.
---

# Security & No-Bypass Policy

N.A.R.U. uses security and engineering checklists to guide implementation and review. These checks are **policy requirements for applicable projects**, not proof that an arbitrary application is secure.

## No-Bypass Principles

Across supported languages, the agents should avoid:

- unexplained type/lint suppression;
- silent error swallowing;
- unsafe error/optional unwrapping;
- skipped tests without an explicit reason and tracking reference;
- undocumented temporary workarounds;
- dynamic execution or obfuscation patterns where they are not required by the project.

The exact language-specific rules are defined in the relevant agent contracts under `agents/`.

## Platform-Specific Review Guidance

The repository contains review guidance for several software archetypes, including web/API, mobile, desktop, Roblox, messaging bots, CLI tools, backend services, and open-source packages.

These are **conditional controls**. Reviewers should apply only the controls relevant to the actual project and verify them against the implementation and current authoritative documentation.

Examples include:

- validating web/API input and authorization boundaries;
- secure credential storage for mobile applications;
- restrictive desktop IPC and sandbox configuration;
- server-authoritative validation for Roblox remotes;
- cryptographic webhook signature verification for messaging integrations;
- safe path handling for CLI utilities;
- dependency pinning and provenance review for published packages.

A checklist item must not be reported as passed merely because the policy mentions it.

## Backend & Architecture Guidance

The policy encourages:

1. domain isolation from vendor/database adapters where clean architecture is appropriate;
2. removal of dead code;
3. explicit domain services with focused responsibilities;
4. appropriate algorithmic complexity;
5. manageable cognitive complexity;
6. stateless scaling where the deployment model requires it.

Concrete thresholds, technologies, and architecture patterns are project decisions and must be verified rather than assumed.

## Frontend & UI Guidance

For applicable data-driven interfaces, the developer and reviewer should consider:

- loaded, loading/skeleton, empty, error/retry, and mutation/in-flight states;
- semantic controls and keyboard focus;
- WCAG 2.2 AA accessibility requirements;
- responsive layouts appropriate to the target device;
- platform-specific UI constraints for Roblox when Roblox is the project target.

The presence of a checklist does not prove visual, accessibility, or responsive compliance. QA evidence must come from actual applicable checks.

## Security Claim Discipline

Do not report:

- `secure` as an absolute property;
- `zero vulnerabilities` without a defined and executed audit scope;
- `production-ready` without the required project-specific evidence;
- `100% compliant` unless the exact measured scope supports the statement.

When a security control cannot be verified, report `UNKNOWN/BLOCKED` or `NOT_TESTED` rather than guessing.
