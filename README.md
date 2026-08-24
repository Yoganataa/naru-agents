# N.A.R.U.

**Next-gen Autonomous Role-based Unified Agents** for OpenCode.

N.A.R.U. is an engineering orchestration layer that coordinates specialized agents through an evidence-grounded software workflow. Its design separates **LLM instructions** from **deterministic runtime enforcement** provided by the OpenCode plugin.

> N.A.R.U. does not guarantee that generated software is secure, correct, or production-ready. Results depend on the project, available tools, configured models, and checks that actually run.

## Workflow

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

For software changes, application-code mutation is intended to begin only after **Gate 1** receives explicit user approval through the native OpenCode `question` tool. The runtime plugin enforces this boundary at the tool level.

## Evidence Model

N.A.R.U. distinguishes four evidence states:

- **VERIFIED** — supported by an actual tool result, artifact, command result, or runtime event.
- **USER_DECISION** — explicitly selected by the user.
- **ASSUMPTION** — low-risk assumption that is explicitly labeled.
- **UNKNOWN/BLOCKED** — not established by available evidence.

Prompts, generated artifacts, and model memory are not treated as proof of execution.

## Agent Team

The repository contains a primary `naru` orchestrator and specialized agents for requirements, research, dependency analysis, architecture, implementation, review, QA, documentation, deployment, and hotfix work.

| Agent | Responsibility |
|---|---|
| `naru` | Workflow orchestration, gates, delegation, and evidence-based reporting |
| `pm` | Requirements, scope, user stories, and acceptance criteria |
| `researcher` | External technical and security evidence |
| `dependency` | Dependency compatibility, provenance, and version assessment |
| `architect` | Architecture, ADRs, contracts, and implementation planning |
| `developer` | Implementation and tests after approval |
| `reviewer` | Independent correctness, security, drift, and test-quality review |
| `qa` | Build, test, runtime, and other applicable verification |
| `docs` | Evidence-based documentation and knowledge consolidation |
| `deploy` | Release and deployment operations |
| `hotfix` | Narrowly scoped incident and regression fixes |

Agent model assignments and permissions are defined in `agents/` and should be treated as the source of truth.

## Runtime Guardrails

The OpenCode plugin provides deterministic enforcement for the workflow. The current implementation includes checks for:

- application mutation authorization;
- project-root path boundaries;
- read-only shell restrictions before Gate 1;
- role permissions;
- security-pattern checks;
- repeated-action circuit breaking;
- native-question-based Gate 1 runtime state.

Agent Markdown files are instructions, not a security boundary.

## Installation

The package currently declares Node.js `>=18.0.0` and Bun `>=1.0` in `package.json`.

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
bun test src/plugin/guardrail.test.ts
```

Available package scripts are defined in `package.json`, including `test`, `test:plugin`, `bench:prompts`, `docs:preview`, `build:plugin`, `build:bin`, and `build:all`.

## CLI

The package exposes the `naru` and `naru-agents` binaries. Verify the installed command set with `naru --help`; documentation should not be treated as an exhaustive command contract unless it matches the current CLI source.

Documented commands include:

```bash
naru setup --auto
naru doctor
naru models
naru init
naru validate
```

## Documentation

The documentation site is under [`docs/`](docs/).

- [N.A.R.U. Contract](docs/NARU-CONTRACT.md) — concise behavioral and evidence contract.
- [Quick Start](docs/getting-started/quick-start.md) — user workflow.
- [Installation](docs/getting-started/installation.md) — installation and verification.
- [Architecture](docs/architecture/overview.md) — agent responsibilities and system structure.
- [Pipelines](docs/workflow/pipelines.md) — workflow states and gate semantics.
- [Session Knowledge](docs/architecture/session-knowledge.md) — session and knowledge model.
- [Architecture Decisions](docs/adr/) — recorded architectural decisions.

Preview the documentation locally with:

```bash
npm run docs:preview
```

## Limitations and Claim Discipline

N.A.R.U. intentionally avoids treating broad policy statements as universal guarantees.

- A security checklist does not prove an application is secure.
- A planned test is not evidence that the test passed.
- A model name or benchmark score is not evidence of behavior in a specific run.
- An artifact saying `APPROVED` does not grant Gate 1 authority; runtime state does.
- A generated architecture document does not prove that implementation matches it.
- A QA result applies only to checks that were actually executed.

These constraints are part of the system design.

## Contributing

When changing workflow behavior, update the relevant agent contract, runtime enforcement, and documentation together. Prefer verified implementation or tool results over assumptions. If a capability cannot be demonstrated from the repository, document it as unknown rather than presenting it as fact.

## License

MIT. See [LICENSE](LICENSE).
