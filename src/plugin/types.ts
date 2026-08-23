// src/plugin/types.ts
/**
 * Minimal N.A.R.U. contracts for the stable OpenCode plugin hook API.
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
  sessionID?: string;
  callID?: string;
  callId?: string;
  agent?: string;
  args?: Record<string, any>;
  [key: string]: any;
}

export interface ToolExecuteOutput {
  result?: any;
  output?: any;
  metadata?: Record<string, any>;
  error?: any;
  exitCode?: number;
  [key: string]: any;
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
