---
layout: default
title: Installation Guide — N.A.R.U.
---

# Installation Guide

N.A.R.U. is distributed from the GitHub repository as an npm package source. The repository also contains build scripts for producing binaries; availability of a prebuilt release artifact must not be assumed unless a release explicitly provides one.

## Requirements

The current `package.json` declares:

- Node.js `>=18.0.0`;
- Bun `>=1.0`.

Git is required for Git-based installation and repository development. OpenCode is required to use the agents and plugin integration.

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

The package declares these relevant scripts:

```text
npm test
npm run test:plugin
npm run bench:prompts
npm run docs:preview
npm run build:plugin
npm run build:bin
npm run build:all
```

Run the script that matches the verification or build target you actually need. A successful build command is not evidence that the resulting application is production-ready.

## Verify the Installation

Run:

```bash
naru doctor
```

For a repository validation check:

```bash
naru validate
```

For the plugin test suite:

```bash
bun test src/plugin/guardrail.test.ts
```

Record the actual command output when reporting verification. Do not infer a passing result from the existence of a command.

## Important Notes

The installer and runtime behavior are defined by the current source under `bin/` and `src/`. This documentation intentionally avoids claiming a fixed set of installed MCP servers, operating-system support matrix, backup semantics, or precompiled binaries unless those details are verified in the current implementation.
