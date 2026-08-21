---
layout: default
title: 6-MCP Tool Fusion — N.A.R.U.
---

# 6-MCP Semantic Tool Fusion & Complete Tool Catalog

N.A.R.U. integrates **6 Model Context Protocol (MCP) servers** to provide semantic code intelligence, structural call-graphs, live SDK documentation, cross-session memory, and live Roblox Studio manipulation.

---

## Complete 6-MCP Tool Catalog (Discovered from Local Runtime)

### 1. context7 (Upstash Managed Cloud MCP Gateway)
- **Author**: Upstash | **Official Repo**: [`upstash/context7`](https://github.com/upstash/context7)
- **Complete Tool List**:
  - `resolve-library-id`: Resolves exact library package names to Context7 canonical identifiers.
  - `query-docs`: Fetches version-locked, authoritative API documentation and code examples.
- **Assigned Subagents**: `researcher-agent`, `developer-agent`.
- **Architectural Rationale**: Eliminates AI hallucinations of outdated, deprecated, or non-existent 3rd-party library methods by providing live, verified documentation.

---

### 2. serena (Language Server Protocol AST Engine)
- **Author**: Oraios | **Official Repo**: [`oraios/serena`](https://oraios.github.io/serena)
- **Complete Tool List**:
  - `find_symbol`: Locates class, function, interface, and variable symbols using language server semantics.
  - `find_referring_expressions`: Traces every calling site and reference to a symbol across the entire workspace.
  - `get_symbol_definition`: Retrieves the exact source definition and type signature of a symbol.
  - `get_document_symbols`: Returns the full hierarchical symbol tree of an active source file.
- **Assigned Subagents**: `reviewer-agent`, `developer-agent`, `hotfix-agent`.
- **Architectural Rationale**: Provides true LSP semantic understanding without relying on naive regex grepping, enabling precise blast-radius calculations.

---

### 3. codegraph (Static Call-Graph & Impact Analysis Engine)
- **Author**: Colby McHenry | **Official Repo**: [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph)
- **Complete Tool List**:
  - `codegraph_explore`: Explores code areas, relevant symbol definitions, and full call paths in a single pass.
  - `codegraph_impact`: Analyzes all downstream code affected by modifying a specific function or class.
  - `codegraph_callers`: Lists all functions/methods that call a specific symbol.
  - `codegraph_callees`: Lists all functions/methods that a specific symbol calls.
  - `codegraph_affected`: Identifies test files affected by changed source files.
  - `codegraph_node`: Returns symbol source with caller/callee trails and line numbers.
  - `codegraph_files`: Displays structural repository topology from the static index.
  - `codegraph_status`: Reports call-graph indexing status and statistics.
- **Assigned Subagents**: `architect-agent`, `reviewer-agent`, `qa-agent`.
- **Architectural Rationale**: Prevents breaking changes and uncovers dead code by analyzing the interconnected dependency graph of the codebase.

---

### 4. lean-ctx (Context Continuity & AST Compaction Runtime)
- **Author**: yvgude | **Official Repo**: [`yvgude/lean-ctx`](https://leanctx.com)
- **Complete Tool List**:
  - `ctx_compose`: Composes multi-source context from git diffs, AST outlines, and active files.
  - `ctx_compact`: Applies Tree-sitter AST compression to reduce prompt token consumption by up to 50%.
  - `ctx_read`: Reads files with structural token compression.
  - `ctx_grep`: Executes pattern searches with compressed output formats.
  - `ctx_status`: Reports active context continuity status and token savings.
- **Assigned Subagents**: `naru`, `pm-agent`.
- **Architectural Rationale**: Keeps long-running, multi-step agent conversations well within context limits while preserving essential structural details.

---

### 5. codebase-memory-mcp (Persistent Knowledge Graph Memory)
- **Author**: DeusData | **Official Repo**: [`DeusData/codebase-memory-mcp`](https://github.com/DeusData/codebase-memory-mcp)
- **Complete Tool List**:
  - `create_entity`: Stores architectural decisions, domain models, and conventions into SQLite graph memory.
  - `create_relation`: Maps relationships between architectural components and modules.
  - `search_nodes`: Queries persistent knowledge nodes across past sessions.
  - `read_graph`: Retrieves the full cross-session architectural knowledge graph.
  - `save_graph`: Commits session memory snapshots to disk.
  - `delete_entity`: Purges obsolete or superseded architectural entities.
- **Assigned Subagents**: `naru`, `docs-agent`.
- **Architectural Rationale**: Implements two-tier MemGPT episodic memory so that agents retain architectural context and solved incident heuristics across independent runs.

---

### 6. roblox-studio (Roblox Studio Built-in Native StudioMCP 1.0.0)
- **Author**: Roblox Corporation | **Official Docs**: [`create.roblox.com/docs`](https://create.roblox.com/docs/art/ai/mcp-setup)
- **Platform Support**: **Exclusively Windows and macOS** (*Gracefully bypassed on Linux*).
- **Complete Tool List**:
  - `script_read`: Reads script source directly from the live DataModel (`game.ServerScriptService.MyScript`).
  - `multi_edit`: Applies atomic multi-line edits or creates new scripts in Studio.
  - `script_search`: Fuzzy-searches scripts by name across the entire game hierarchy.
  - `script_grep`: Scans string patterns across all scripts in the active DataModel.
  - `generate_mesh`: Generates textured 3D meshes procedurally from text prompts.
  - `generate_material`: Generates custom environmental material variants.
  - `generate_procedural_model`: Generates procedural 3D prop models.
  - `list_roblox_studios`: Discovers all active Roblox Studio instances.
  - `set_active_studio`: Selects the target Studio window for multi-instance management.
- **Assigned Subagents**: `developer-agent`, `architect-agent`, `qa-agent`.
- **Architectural Rationale**: Connects AI agents directly to live Roblox Studio sessions for instant script synchronization, procedural asset creation, and automated playtest execution.
