# N.A.R.U. Contract

This document is the concise behavioral model for N.A.R.U. It intentionally distinguishes **workflow intent** from **runtime enforcement**.

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

A state may be skipped only when it is genuinely inapplicable to the request. The orchestrator must explain material deviations instead of silently changing the workflow.

## Evidence Model

Every important claim belongs to one of four classes:

- **VERIFIED** — supported by a tool result, artifact, command result, or runtime event.
- **USER_DECISION** — explicitly selected by the user.
- **ASSUMPTION** — necessary, low-risk, and explicitly labeled.
- **UNKNOWN/BLOCKED** — not established by available evidence.

Model memory is not evidence for current or version-sensitive claims.

## Gate 1

For software changes:

1. Requirements and architecture are prepared.
2. Required research evidence is recorded.
3. The user is shown the plan and relevant evidence.
4. The native OpenCode `question` tool requests `APPROVE_GATE_1`.
5. Application-code mutation is allowed only after the runtime plugin validates that approval for the current planning fingerprint.

Writing an approval marker to a workspace file never creates authority.

## Agent Responsibilities

| Agent | Responsibility | Must not do |
|---|---|---|
| `naru` | orchestration and gates | application implementation |
| `pm` | requirements and acceptance criteria | architecture or implementation |
| `researcher` | external evidence | invent facts or make final architecture decisions |
| `dependency` | dependency compatibility/provenance | claim complete security |
| `architect` | design, ADRs, implementation tasks | implementation |
| `developer` | implementation and tests | self-approval |
| `reviewer` | independent review | implementation |
| `qa` | execution and verification | invent passing results |
| `docs` | evidence-based documentation | invent capabilities |
| `deploy` | release/deployment operations | bypass approval |
| `hotfix` | scoped incident fixes | bypass evidence requirements |

## Runtime vs Prompt

Agent Markdown is an instruction layer. It is not a security boundary.

The OpenCode plugin is responsible for deterministic tool-level enforcement such as:

- mutation gating;
- role restrictions;
- shell restrictions before Gate 1;
- security pattern checks;
- retry/circuit limits.

Compiler, test runner, runtime checks, and actual OpenCode traces are the source of truth for their respective claims.

## Claim Discipline

Do not describe a capability as universal, production-ready, zero-bypass, secure, sandboxed, or fully verified unless the implementation and tested scope directly justify that wording.

A benchmark result applies only to the cases actually executed.

## Research Discipline

Use the strongest applicable authoritative source first. Cross-check independent sources when the primary source leaves meaningful ambiguity or risk. Do not impose arbitrary citation counts or freshness windows on stable standards and concepts.
