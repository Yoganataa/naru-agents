// ─── types.ts ── N.A.R.U. OpenCode TypeScript Plugin Contract Schemas ─────────

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
  callId?: string;
  sessionID?: string;
  args?: Record<string, any>;
  [key: string]: any;
}

export interface ToolExecuteOutput {
  result?: any;
  error?: any;
  [key: string]: any;
}

export interface SystemEvent {
  type: "session.created" | "session.idle" | "session.error" | "message.updated" | "file.edited" | string;
  sessionID?: string;
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
