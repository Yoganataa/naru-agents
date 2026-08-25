---
layout: default
title: CLI Reference & Diagnostics — N.A.R.U.
---

# CLI Reference & Diagnostics

The CLI documentation must follow the installed version's actual command surface. Run `naru --help` whenever a command or option is uncertain.

## `naru setup`

Sets up the N.A.R.U. configuration used by the current version.

```bash
naru setup
naru setup --auto
```

Do not assume that setup installs a fixed number of agents, MCP servers, backups, or knowledge stores. Those effects are implementation details of the current CLI.

## `naru doctor`

Runs environment and installation diagnostics:

```bash
naru doctor
```

Treat the command output as the source of truth for the current machine.

## `naru models`

Inspects or manages model configuration exposed by the current CLI:

```bash
naru models
```

Use `naru models --help` to discover options supported by the installed version.

## `naru init`

Initializes N.A.R.U. in a repository according to the current CLI implementation:

```bash
naru init
```

Do not substitute undocumented subcommands or assume that initialization creates a particular MCP/database state without verifying the current source or command output.

## `naru validate`

Validates the repository's N.A.R.U. configuration according to the current validator:

```bash
naru validate
```

## Diagnostics Workflow

When something fails, capture:

1. the exact command;
2. the relevant environment/runtime versions;
3. the complete error message;
4. the exit status;
5. the affected configuration or repository state, excluding secrets.

Then classify the result as `VERIFIED`, `UNKNOWN/BLOCKED`, or another appropriate evidence state. Never turn an unexecuted recovery step into a claimed fix.

## When Documentation and CLI Disagree

The current source and `naru --help` output take precedence over this page. If a command documented here no longer exists, update the documentation rather than preserving an obsolete command for compatibility with old text.
