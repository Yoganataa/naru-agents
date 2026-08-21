---
layout: default
title: AI Models & Reasoning — N.A.R.U.
---

# AI Models, Reasoning Variants & Modality Architecture

N.A.R.U. pairs each specialized subagent with an AI model calibrated on **Artificial Analysis Intelligence Index (AA Index)** benchmarks, context window capacity, and modality certification.

---

## Complete OpenCode Model Registry & Performance Indicators

| OpenCode Model | AA Index | Context Window | Output Limit | Modality | Category & Tier | Assigned Subagents | Technical Rationale & Role Fit |
|---|---|---|---|---|---|---|---|
| **`opencode/muse-spark-1.2-contributor-free`** | **54.0** (#1) | 1,048,576 | 131,072 | Full Omni (Vision + PDF) | Frontier Omni & Reasoning | `naru` (`high`)<br>`pm-agent` (`xhigh`)<br>`architect-agent` (`xhigh`) | **Highest overall intelligence index (54.0)**. 1M token context allows multi-page PDF PRD ingestion, wireframe parsing, and zero-loss ADR formulation. |
| **`opencode/x-preview-f-free`** | **50.0** (#2) | 1,000,000 | 131,072 | Omni Reasoning | Frontier Adversarial Reasoning | `reviewer-agent` (`max`) | **Deepest adversarial reasoning mode (`max`)** for Quality Gate 3. Evaluates complex AST diffs, OWASP Top 10 vulnerabilities, anti-slop frontend standards, and No-Bypass adherence. |
| **`opencode/nemotron-3-ultra-free`** | **48.2** | 1,000,000 | 128,000 | Text-Only | High-Throughput Bulk Text | `docs-agent` (Auto) | **Fastest long-form token throughput**. Generates Living Architecture Mermaid ERDs, OpenAPI 3.1 specifications, and changelogs without rate-limit bottlenecks. |
| **`opencode/big-pickle`** | **47.0** | 200,000 | 32,000 | Code Specialist | Frontier Autonomous Coding | `developer-agent` (Auto)<br>`hotfix-agent` (Auto) | **Dedicated code synthesis specialist**. Optimized for multi-file AST edits, O(1) runtime efficiency, clean hexagonal domain services, and root-cause hotfixing. |
| **`opencode/mimo-v2.5-free`** | **43.0** | 1,048,576 | 256,000 | Vision OCR | Multimodal QA & OCR | `qa-agent` (Auto) | **Multimodal Vision OCR specialist**. Performs pixel-level visual regression, UI screenshot diffing, and automated Roblox playtest log analysis. |
| **`opencode/hy3-free`** | **41.0** | 190,000 | 64,000 | Text-Only | Ultra-Fast Sub-Second Engine | `researcher-agent` (`medium`)<br>`dependency-agent` (`low`)<br>`deploy-agent` (`low`) | **Sub-second response latency**. Enables real-time web search grounding, package manifest dependency locking, and DevOps runbook generation with zero pipeline lag. |
| **`opencode/nemotron-3.5-lightning-free`** | **38.0** | 262,144 | 262,144 | Text-Only | Lightweight Fast Execution | *Utility / Fallback Engine* | Lightweight execution model for rapid auxiliary tasks. |

---

## Step 0.5: Smart Modality Guard (Vision vs Text-Only AI Delegation)

To eliminate API Error 400 (`Model does not support image modality`) and visual hallucinations:

1. **Vision-Certified Subagents** (`pm-agent`, `architect-agent`, `reviewer-agent`, `qa-agent`): Native multi-modal models that directly ingest raw screenshots, Figma mockups, layout diagrams, and PDF PRDs.
2. **Text-Only Subagents** (`researcher-agent`, `dependency-agent`, `docs-agent`, `deploy-agent`): High-speed text specialists that **never receive raw images directly**.
3. **Visual Transcoding Pre-Processor**: If a text-only subagent requires information from a visual screenshot (e.g. `docs-agent` generating OpenAPI specs from a Swagger screenshot), Naru or QA-Agent first transcodes the visual image into a **Structured Markdown AST** (Endpoints, HTTP methods, headers, schemas, colors, OCR text) before passing it to the text-only subagent.
