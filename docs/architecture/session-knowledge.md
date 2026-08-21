# Two-Tier Hierarchical Session Knowledge

Inspired by **MemGPT** and **Stanford Generative Agents**, N.A.R.U. separates agent memory into 2 distinct layers:

---

## Layer 1: Episodic Session Memory (Isolated per Session)
Stored in `.opencode/knowledge/sessions/{ISO_TIMESTAMP}/`:
- `session-summary.md`: Goals achieved, modified files, test results, and execution duration.
- `gate-status.md`: Quality Gate 1–4 pass/fail records.
- Prevents cross-session context crosstalk (*Zero Hallucination Contamination*).

## Layer 2: Semantic Global Reflection (Cross-Session Cumulative)
Managed by `docs-agent` and `naru`:
- `heuristics.md`: Project domain engineering rules and architectural patterns.
- `patterns.md`: Verified recurring bug solutions.
- `pipeline-history.md`: Chronological execution milestone log.
- `sessions/latest.json`: Pointer to the most recent milestone.
- **Knowledge Graph Persistence**: Automatically saved to disk via `codebase-memory-mcp` (`save_graph`).
