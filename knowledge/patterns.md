# Pattern Store (RAG-Enabled)

> Dual-form patterns: Skill Guidelines and Procedural Subagent Workflows.
> Max entries: 50 | Indexed via codebase-memory-mcp.

---

## Pattern: P-001 (Goal Baseline Drift Guard)
- **Type**: Skill
- **Context**: Quality Gate 1, 2, and 3 evaluations across all platform types.
- **Guideline**: Cross-check candidate artifacts against immutable `goal-baseline.md`. Report missing stories as Critical Issues and unrequested features as Scope Creep.
- **Metadata**: naru_version="2.0.0", status=VERIFIED, verified_date=2026-08-20

## Pattern: P-002 (Dual-Budget Retry Escalation)
- **Type**: Subagent
- **Context**: Any Quality Gate failure across Gate 1 to Gate 4.
- **Steps**:
  1. Increment `gate_retries` counter on current gate.
  2. Decrement `pipeline_retry_budget` global counter.
  3. Record status to `.opencode/artifacts/gate-status.md`.
  4. If `gate_retries >= 3` or `pipeline_retry_budget <= 0`, stop automatically and escalate to user with `[M]`, `[R]`, `[A]` choices.
  5. If user chooses `[R]`, reset both `pipeline_retry_budget = 8` and all `gate_retries = 0`.
- **Metadata**: naru_version="2.0.0", status=VERIFIED, verified_date=2026-08-20
