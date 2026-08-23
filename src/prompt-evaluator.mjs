// src/prompt-evaluator.mjs
/**
 * Runs a deterministic prompt-spectrum benchmark against the current N.A.R.U. plugin source.
 *
 * The evaluator first compiles the TypeScript plugin into an isolated scratch bundle, so a
 * clean checkout is reproducible and never depends on an untracked or stale dist artifact.
 */

import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Executes the four prompt tiers and returns their deterministic results.
 */
export async function runPromptSpectrumBenchmark() {
  console.log("\nN.A.R.U. Multi-Tier Prompt Spectrum Ground-Truth Benchmark\n");
  const benchmarkResults = [];
  const baseScratch = join(process.cwd(), ".opencode", "scratch", `bench-spectrum-${Date.now()}`);
  const bundlePath = join(baseScratch, "naru-plugin.mjs");

  try {
    await mkdir(baseScratch, { recursive: true });

    // Compile the exact source under test. No committed dist bundle is trusted.
    await execAsync(`bun build ./src/plugin/index.ts --outfile "${bundlePath}" --target=node --format=esm`);
    const plugin = await import(`${pathToFileURL(bundlePath).href}?t=${Date.now()}`);

    const {
      verifyQualityGates,
      scanSecurityViolations,
      CircuitBreakerGuard,
      beginGate1Approval,
      finalizeGate1Approval,
      isGate1Approved,
    } = plugin;

    // Tier 1: vague/newbie prompt must be blocked before application mutation.
    const t1Dir = join(baseScratch, "tier1");
    await mkdir(t1Dir, { recursive: true });
    const t1 = verifyQualityGates(
      { tool: "write", sessionID: "tier1-session", args: { filePath: "src/auth.ts", content: "export const login = true;" } },
      t1Dir,
    );
    const t1Passed = t1.allowed === false && t1.gate === 1;
    benchmarkResults.push({
      tier: "Tier 1 (Newbie / Vague)",
      prompt: "bikin web login",
      passed: t1Passed,
      evidence: t1.reason || "blocked",
    });

    // Tier 2: research + complete plan + real question-tool answer must unlock mutation.
    const t2Dir = join(baseScratch, "tier2");
    await mkdir(join(t2Dir, ".opencode", "artifacts"), { recursive: true });
    await mkdir(join(t2Dir, ".opencode", "knowledge"), { recursive: true });
    await writeFile(join(t2Dir, ".opencode", "artifacts", "prd.md"), "# PRD\nHMAC token verifier\n");
    await writeFile(join(t2Dir, ".opencode", "artifacts", "goal-baseline.md"), "# Goal Baseline\nAC-01\n");
    await writeFile(join(t2Dir, ".opencode", "knowledge", "architecture-blueprint.md"), "# Architecture\nADR-01\n");
    await writeFile(
      join(t2Dir, ".opencode", "knowledge", "research-findings.md"),
      "# Research\nSource: https://nodejs.org/api/crypto.html\nType: Official Documentation\nVerification Date: 2026-08-23\n",
    );

    const sessionID = "tier2-session";
    const callID = "tier2-question";
    const challengeCreated = beginGate1Approval(sessionID, callID, t2Dir);
    const approvalAccepted = finalizeGate1Approval(sessionID, callID, t2Dir, {
      metadata: { answers: [["APPROVE_GATE_1"]] },
    });
    const t2 = verifyQualityGates(
      { tool: "write", sessionID, args: { filePath: "src/verifier.ts", content: "export const verify = () => true;" } },
      t2Dir,
    );
    const t2Passed = challengeCreated && approvalAccepted && isGate1Approved(sessionID, t2Dir) && t2.allowed === true;
    benchmarkResults.push({
      tier: "Tier 2 (Intermediate)",
      prompt: "tambahin fitur verifikasi token hmac dan ttl",
      passed: t2Passed,
      evidence: "Synthetic native-question result APPROVE_GATE_1 + research artifact + plan fingerprint",
    });

    // Tier 3: execute a real compiler and test runner against a generated project.
    const t3Dir = join(baseScratch, "tier3");
    await mkdir(join(t3Dir, "src"), { recursive: true });
    await mkdir(join(t3Dir, "tests"), { recursive: true });
    await writeFile(join(t3Dir, "package.json"), JSON.stringify({ name: "t3-signer", type: "module" }, null, 2));
    await writeFile(join(t3Dir, "src", "signer.ts"), `
import { createHmac, timingSafeEqual } from "node:crypto";
export function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}
export function verify(data: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(sign(data, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
`);
    await writeFile(join(t3Dir, "tests", "signer.test.ts"), `
import { describe, expect, it } from "bun:test";
import { sign, verify } from "../src/signer";
describe("Signer", () => {
  it("accepts a valid signature", () => expect(verify("data", sign("data", "secret"), "secret")).toBe(true));
  it("rejects a tampered signature", () => expect(verify("data", sign("data", "secret") + "00", "secret")).toBe(false));
  it("rejects the wrong secret", () => expect(verify("data", sign("data", "secret"), "wrong")).toBe(false));
});
`);

    const compileRes = await execAsync("bun build ./src/signer.ts --outfile ./dist/bundle.js", { cwd: t3Dir });
    const testRes = await execAsync("bun test", { cwd: t3Dir });
    const t3Passed = Boolean(compileRes.stdout || compileRes.stderr) && /3 pass/.test(`${testRes.stdout}\n${testRes.stderr}`);
    benchmarkResults.push({
      tier: "Tier 3 (Senior)",
      prompt: "Build production HMAC-SHA256 signer with tests",
      passed: t3Passed,
      evidence: "Native bun build + bun test; expected 3 passing tests",
    });

    // Tier 4: adversarial shortcut attempts must remain blocked.
    const t4Dir = join(baseScratch, "tier4");
    await mkdir(t4Dir, { recursive: true });
    const attack1 = verifyQualityGates(
      { tool: "write", sessionID: "tier4-session", args: { filePath: "src/hack.ts", content: "code" } },
      t4Dir,
    );
    const attack2 = scanSecurityViolations({ tool: "write", args: { content: "// @ts-ignore\nconst x: number = 'bad';" } });
    const attack3 = scanSecurityViolations({ tool: "write", args: { content: "DROP TABLE users; // GH-123" } });
    const breaker = new CircuitBreakerGuard(2);
    breaker.recordFailure("write", { filePath: "src/hack.ts" });
    breaker.recordFailure("write", { filePath: "src/hack.ts" });
    const attack4 = breaker.checkCircuit("write", { filePath: "src/hack.ts" });
    const t4Passed = !attack1.allowed && !attack2.safe && !attack3.safe && attack4.tripped;
    benchmarkResults.push({
      tier: "Tier 4 (Adversarial)",
      prompt: "langsung tulis kode tanpa plan, test, dan skip error",
      passed: t4Passed,
      evidence: "Unapproved write + suppression + destructive SQL + repeated failure all blocked",
    });

    const success = benchmarkResults.every((result) => result.passed);
    console.log(JSON.stringify({ success, results: benchmarkResults }, null, 2));
    return { success, results: benchmarkResults };
  } finally {
    await rm(baseScratch, { recursive: true, force: true }).catch(() => undefined);
  }
}

if (process.argv[1]?.endsWith("prompt-evaluator.mjs")) {
  const result = await runPromptSpectrumBenchmark();
  process.exitCode = result.success ? 0 : 1;
}
