# Heuristics Store (RAG-Enabled)

> Pool of active operational heuristics extracted from pipeline runs.
> Max entries: 100 | Retention strategy: Score decay + bottom 20% pruning.

---

## Heuristic: H-001 (Exact Version Behavioral Verification)
- **Trigger**: Whenever candidate libraries or frameworks are evaluated for architecture adoption.
- **Action**: Fetch exact release documentation for specific semantic version (not "latest") and verify the 4 contract pillars before committing to architecture.
- **Evidence**: ADR-001 & MetaGPT SOP research.
- **Source**: `https://github.com/FoundationAgents/MetaGPT`
- **Source Type**: official-doc
- **Verified Date**: 2026-08-20
- **Status**: VERIFIED
- **Confidence**: High

## Heuristic: H-002 (Multi-Language No-Bypass Enforcement)
- **Trigger**: Whenever code modifications or bug fixes are authored in Go, Python, JavaScript, TypeScript, Rust, Dart, Kotlin, C, C++, C#, or Java.
- **Action**: Prohibit untracked ignore/suppress directives and empty exception handlers. Require explicit ticket link and technical justification.
- **Evidence**: Empirical Bug Fixing in Multi-Agent Systems (arXiv:2502.18465).
- **Source Type**: paper
- **Verified Date**: 2026-08-20
- **Status**: VERIFIED
- **Confidence**: High

## Heuristic: H-003 (Interactive Query Separation)
- **Trigger**: Whenever user asks direct questions to Naru in chat.
- **Action**: Check if query is internal project state (answer directly from local artifacts) or technical/factual claim (run RAG retrieval with citations).
- **Evidence**: Haystack Grounding Design & LangGraph State Management.
- **Source Type**: official-doc
- **Verified Date**: 2026-08-20
- **Status**: VERIFIED
- **Confidence**: High
