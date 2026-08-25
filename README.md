# N.A.R.U.

**Next-gen Autonomous Role-based Unified Agents** for OpenCode.

N.A.R.U. is an engineering orchestration layer for coordinating specialized agents through an evidence-grounded software workflow. It separates **agent instructions** from **deterministic runtime enforcement** provided by the OpenCode plugin.

> N.A.R.U. is not a guarantee that generated software is secure, correct, or production-ready. Results depend on the project, models, tools, configuration, and verification that actually runs.

## What N.A.R.U. Does

N.A.R.U. organizes engineering work into explicit responsibilities:

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

For software changes, **Gate 1** is the hard boundary before application-code mutation. Authorization comes from the native OpenCode `question` response, not from a file containing `APPROVED`.

## Evidence Model

Every important claim is classified as one of:

| Class | Meaning |
|---|---|
| `VERIFIED` | Supported by an actual tool result, artifact, command result, or runtime event |
| `USER_DECISION` | Explicitly selected by the user |
| `ASSUMPTION` | Low-risk assumption that is explicitly labeled |
| `UNKNOWN/BLOCKED` | Not established by available evidence |

Plans, prompts, model memory, and generated status files are not execution evidence.

## Agent Team

| Agent | Responsibility |
|---|---|
| `naru` | Orchestration, workflow state, gates, delegation, and reporting |
| `pm` | Requirements, scope, user stories, acceptance criteria, and goal baseline |
| `researcher` | External technical, compatibility, and security evidence |
| `dependency` | Dependency compatibility, provenance, and version assessment |
| `architect` | Architecture, contracts, ADRs, and implementation planning |
| `developer` | Implementation and tests after approval |
| `reviewer` | Independent correctness, security, drift, and test-quality review |
| `qa` | Applicable build, type-check, test, and runtime verification |
| `docs` | Evidence-based documentation and knowledge consolidation |
| `deploy` | Release and deployment operations |
| `hotfix` | Narrowly scoped incident and regression fixes |

Exact model assignments, permissions, and step limits live in `agents/` and are the source of truth.

## Runtime Guardrails

The plugin under `src/plugin/` provides deterministic tool-boundary enforcement. The current implementation includes checks for:

- application mutation authorization;
- project-root path boundaries;
- read-only shell restrictions before Gate 1;
- role permissions;
- security-pattern checks;
- repeated-action circuit breaking;
- native-question-based Gate 1 runtime state.

Agent Markdown is an instruction layer. It is not, by itself, a security boundary.

## Installation

The current package declares Node.js `>=18.0.0` and Bun `>=1.0`.

### Bun

```bash
bun install -g github:yoganataa/naru-agents
naru setup --auto
```

### npm

```bash
npm install -g github:yoganataa/naru-agents
naru setup --auto
```

### Local development

```bash
git clone https://github.com/Yoganataa/naru-agents.git
cd naru-agents
bun install
```

Run the verification commands that are relevant to your change. Do not treat the existence of a script as proof that it passed.

## CLI

The repository exposes the `naru` and `naru-agents` binaries. The authoritative command surface is the current CLI source; use `naru --help` on the installed version.

Common commands currently documented by the repository include:

```bash
naru setup --auto
naru doctor
naru models
naru init
naru validate
```

## Documentation Site

The complete documentation lives under [`docs/`](docs/) and is intended to be published through GitHub Pages.

- [Overview](docs/index.md)
- [Quick Start](docs/getting-started/quick-start.md)
- [Installation](docs/getting-started/installation.md)
- [CLI Reference & Diagnostics](docs/getting-started/troubleshooting.md)
- [Agent Architecture](docs/architecture/overview.md)
- [Models & Reasoning](docs/architecture/models-and-reasoning.md)
- [MCP Tooling](docs/architecture/mcp-servers.md)
- [Session Knowledge](docs/architecture/session-knowledge.md)
- [Workflow & Quality Gates](docs/workflow/pipelines.md)
- [Security & No-Bypass Policy](docs/workflow/no-bypass-policy.md)
- [Architecture Decisions](docs/adr/)

## Claim Discipline

N.A.R.U. deliberately avoids presenting policy as proof.

- A security checklist does not prove an application is secure.
- A planned test is not evidence that the test passed.
- A benchmark score is not evidence of behavior in a particular run.
- A generated artifact does not prove implementation matches the artifact.
- A workspace approval marker does not authorize Gate 1.
- QA results apply only to checks that were actually executed.

When evidence is unavailable, N.A.R.U. should report `UNKNOWN/BLOCKED`, `NOT_TESTED`, or `NOT_APPLICABLE` as appropriate.

## Contributing

When changing N.A.R.U. behavior, update the relevant agent contract, runtime enforcement, and documentation together. Prefer repository evidence and actual tool results over assumptions.

## License

MIT. See [LICENSE](LICENSE).
