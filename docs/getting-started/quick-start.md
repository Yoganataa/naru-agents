---
layout: default
title: Quick Start Tutorial — N.A.R.U.
---

# Quick Start & User Workflow Tutorial

Learn how to use N.A.R.U. inside OpenCode to build production-grade software applications from scratch.

---

## Step 1: Open Your Workspace in OpenCode

Navigate to your project directory and start the OpenCode interactive interface:

```bash
cd my-project
opencode
```

---

## Step 2: Invoke Naru as Team Lead Orchestrator

In the OpenCode prompt, invoke Naru using the `@naru` mention:

```text
@naru Build a modern fullstack SaaS dashboard with user authentication, PostgreSQL database, and Stripe subscriptions.
```

---

## Step 3: Interactive Intake Questionnaire (Step 0)

Naru will immediately classify your intent as `GREENFIELD_CREATION` and invoke OpenCode's native interactive modal form to capture requirements without guessing:

1. **Category & Target Platform**: Select from Web Fullstack (Next.js 15), Mobile App (React Native / Expo), Backend API, Bot, Desktop (Tauri), etc.
2. **Language & Runtime**: Select TypeScript / Bun, TypeScript / Node.js, Python, Go, or Rust.
3. **Database & ORM**: Select PostgreSQL + Drizzle, SQLite + Drizzle, PostgreSQL + Prisma, or MongoDB.
4. **Authentication & State**: Select Better-Auth, NextAuth.js / Auth.js, JWT, or Zustand.
5. **Target Deployment**: Select Vercel, Cloudflare, Docker VPS, or Standalone Binary.
6. **Must-Have MVP Stories**: Select core user stories or enter custom requirements.

---

## Step 4: Autonomous Pipeline Execution & Quality Gates

Once you submit the intake form, Naru writes `.opencode/artifacts/project-brief.md` and sequentially drives the specialized subagents through the 4 Quality Gates:

1. **Product Management (pm-agent)**: Creates `prd.md`, backlog, and the Goal Traceability Matrix (`AC-XX`).
2. **Technical Research (researcher-agent)**: Validates modern library versions via Context7 and checks GHSA/NVD threat databases.
3. **Dependency Locking (dependency-agent)**: Locks exact manifest versions and verifies SLSA provenance.
4. **Architecture Design (architect-agent)**: Creates Clean Architecture blueprints, ADR records, and system topology. *(Passes Quality Gate 1 & 2)*.
5. **Code Synthesis (developer-agent)**: Writes production code, implementing the 5 States of UI Stack, O(1) algorithms, and No-Bypass security.
6. **Adversarial Security Audit (reviewer-agent)**: Audits code for OWASP Top 10 vulnerabilities, anti-slop standards, and purges all dead code. *(Enforces Quality Gate 3)*.
7. **Automated E2E Testing (qa-agent)**: Runs Playwright tests, visual regression OCR, and packet flood fuzzing. *(Enforces Quality Gate 4)*.
8. **Documentation & Memory (docs-agent)**: Generates Mermaid ERDs, OpenAPI 3.1 specifications, and commits session learnings to SQLite graph memory.
9. **Release Runbook (deploy-agent)**: Prepares containerized release scripts and production deployment guides.

---

## Step 5: Final Production Delivery

Naru synthesizes all generated artifacts and presents a clean, verified release summary with 100% requirement traceability.
