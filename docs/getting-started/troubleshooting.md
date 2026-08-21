# Troubleshooting & Diagnostics

N.A.R.U. provides built-in self-healing and diagnostic mechanisms to ensure production reliability.

---

## 1. System Health Audit (`naru doctor`)

If you encounter missing agents or unrecognized tools, run:
```bash
naru doctor
```
`naru doctor` performs a 4-point health inspection:
1. **Host Environment**: Node.js, Bun, Git, OpenCode CLI presence.
2. **Package Managers**: Detection of bun, npm, cargo, pip, winget, etc.
3. **Subagent Definitions & Role-Model Match**: Ensures 11/11 agents are installed in `~/.config/opencode/agents` and validates cognitive capability matches.
4. **5-MCP Server Connectivity**: Confirms availability of `context7`, `serena`, `codegraph`, `lean-ctx`, and `codebase-memory-mcp`.

---

## 2. Automatic Backup Snapshots & Rollback

Before any installation or modification, N.A.R.U. automatically creates a timestamped safety snapshot in:
```
~/.config/opencode/.backups/snapshot_{TIMESTAMP}/
```
If you ever need to revert to a previous state:
```bash
naru rollback
```

---

## 3. Windows PowerShell Script Execution Policy Fix

If PowerShell blocks running global npm scripts (`File ... cannot be loaded because running scripts is disabled on this system`):
- **Solution A**: Use the standalone native binary `naru.exe` located in `~/.local/bin/naru.exe`.
- **Solution B**: Set execution policy for the current user:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
