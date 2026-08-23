// src/plugin/types.ts
/**
 * Minimal N.A.R.U. contracts aligned with OpenCode V1 plugin hooks used by 1.18.x.
 * OpenCode V1 passes tool arguments through the hook output object, not the hook input.
 */

export interface PluginContext {
  client?: any;
  $?: (strings: TemplateStringsArray, ...values: any[]) => Promise<any>;
  project?: {
    root?: string;
    name?: string;
  };
  directory?: string;
  worktree?: string;
}

export interface ToolExecuteInput {
  tool: string;
  sessionID: string;
  callID: string;
  agent?: string;
}

export interface ToolExecuteBeforeOutput {
  args: Record<string, any>;
}

export interface ToolExecuteAfterInput extends ToolExecuteInput {
  args: Record<string, any>;
}

export interface ToolExecuteAfterOutput {
  title?: string;
  output?: string;
  metadata?: Record<string, any>;
  error?: any;
  exitCode?: number;
}

export interface SystemEvent {
  type: string;
  sessionID?: string;
  properties?: Record<string, any>;
  data?: any;
  [key: string]: any;
}

export interface GateVerificationResult {
  allowed: boolean;
  gate: number;
  reason?: string;
}

export interface SecurityScanResult {
  safe: boolean;
  violations: string[];
}
