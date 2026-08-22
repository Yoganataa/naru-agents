// ─── session-lifecycle.ts ── Two-Tier MemGPT Session Lifecycle Engine ─────────
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SystemEvent, PluginContext } from "../types.js";

export function handleSessionLifecycle(event: SystemEvent, context: PluginContext): void {
  const root = context.project?.root || context.directory || process.cwd();
  const sessionsDir = join(root, ".opencode", "knowledge", "sessions");

  if (event.type === "session.created") {
    try {
      if (!existsSync(sessionsDir)) {
        mkdirSync(sessionsDir, { recursive: true });
      }
      const latestPath = join(sessionsDir, "latest.json");
      const sessionData = {
        active_session_id: event.sessionID || new Date().toISOString(),
        started_at: new Date().toISOString(),
        status: "ACTIVE",
        version: "0.0.2",
        guardrails_active: true
      };
      writeFileSync(latestPath, JSON.stringify(sessionData, null, 2), "utf8");
    } catch {
      // Non-blocking
    }
  }

  if (event.type === "session.idle") {
    try {
      const latestPath = join(sessionsDir, "latest.json");
      if (existsSync(latestPath)) {
        const sessionData = {
          last_session_id: event.sessionID || new Date().toISOString(),
          ended_at: new Date().toISOString(),
          status: "IDLE_COMPLETED",
          version: "0.0.2",
          guardrails_active: true
        };
        writeFileSync(latestPath, JSON.stringify(sessionData, null, 2), "utf8");
      }
    } catch {
      // Non-blocking
    }
  }
}
