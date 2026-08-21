# Quick Start Guide

Get your workspace up and running with N.A.R.U. in three streamlined steps.

---

## Step 1: Scaffold a New Project (`naru new` / `naru create`)

When creating a new application or project from scratch:
```bash
naru new
```
This launches the **Interactive Project Scaffolding Wizard**, prompting for Category, Problem Description, Tech Stack, Database, Authentication, Deployment Target, and MVP User Stories, and generates `.opencode/artifacts/project-brief.md`.

---

## Step 2: Initialize Existing Workspace Memory (`naru init`)

When opening an existing repository or workspace:
```bash
naru init
```
This scaffolds `.opencode/knowledge/sessions/` and `latest.json`. Inside the OpenCode interface, you can type `@naru init` to trigger the **5-MCP Deep Workspace Scanning Pipeline** which maps AST symbols, caller-callee hierarchies, and semantic entities.

---

## Step 3: Configure & Verify AI Models (`naru models`)

Inspect the currently active AI models in OpenCode:
```bash
naru models
```
You can interactively assign models across role clusters, customize individual subagent models, or reset all agents to top-tier empirical benchmark defaults.

---

## Step 3: Run Health Diagnostics (`naru doctor`)

Verify runtime dependencies, package managers, 11 subagents, and 5 MCP servers:
```bash
naru doctor
```
