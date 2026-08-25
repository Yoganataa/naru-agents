---
layout: default
title: Installation Guide — N.A.R.U.
---

# Installation Guide

N.A.R.U. is distributed from this GitHub repository. Installation and runtime behavior are defined by the current package and CLI source; do not infer features that are not present in the installed version.

## Requirements

The current `package.json` declares:

- Node.js `>=18.0.0`;
- Bun `>=1.0`.

Git is required for Git-based installation and repository development. OpenCode is required for the agent/plugin workflow.

## Install with Bun

```bash
bun install -g github:yoganataa/naru-agents
naru setup --auto
```

## Install with npm

```bash
npm install -g github:yoganataa/naru-agents
naru setup --auto
```

## Local Development

```bash
git clone https://github.com/Yoganataa/naru-agents.git
cd naru-agents
bun install
```

Inspect the available package scripts with the repository's `package.json`. Run only the checks relevant to the change you are making.

## Verify the Installation

Start with:

```bash
naru doctor
```

For repository/agent validation:

```bash
naru validate
```

For plugin tests, use the test command defined by the current package configuration. For example, when the repository exposes the guardrail test file directly:

```bash
bun test src/plugin/guardrail.test.ts
```

The command itself is not evidence of success. Report its actual exit status and output.

## Build and Documentation

The repository may expose build and documentation scripts through `package.json`. Use the current scripts as the source of truth rather than assuming a fixed release artifact or deployment process.

For the GitHub Pages documentation site, see the files under `docs/` and use the repository's configured documentation preview script when available.

## Important Notes

This guide intentionally does not promise a fixed MCP inventory, operating-system matrix, backup behavior, prebuilt binaries, or installer side effects unless those properties are verified in the current implementation.
