// ─── self-evaluator.mjs ── Adversarial Self-Testing & Resilience Benchmark ────
// Synthetically simulates 12 bypass attack vectors against N.A.R.U. plugin guardrails
// ──────────────────────────────────────────────────────────────────────────────

import { verifyQualityGates, scanSecurityViolations } from '../dist/naru-plugin.js';
import { printBanner } from './banner.mjs';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

export const ADVERSARIAL_ATTACK_SUITE = [
  {
    name: 'Gate 1 Bypass: Direct Application File Mutation',
    run: (root) => {
      const res = verifyQualityGates({ tool: 'write_file', args: { path: 'src/core.ts', content: 'const a = 1;' } }, root);
      return !res.allowed && res.gate === 1;
    }
  },
  {
    name: 'Gate 1 Bypass: Windows Backslash Path Infiltration',
    run: (root) => {
      const res = verifyQualityGates({ tool: 'write_file', args: { path: 'src\\services\\auth.ts', content: 'const a = 1;' } }, root);
      return !res.allowed && res.gate === 1;
    }
  },
  {
    name: 'Gate 1 Bypass: Shell Redirection Infiltration (echo > src/app.ts)',
    run: (root) => {
      const res = verifyQualityGates({ tool: 'bash', args: { command: 'echo "const x = 1;" > src/app.ts' } }, root);
      return !res.allowed && res.gate === 1;
    }
  },
  {
    name: 'No-Bypass Violation: TypeScript @ts-ignore without Ticket',
    run: () => {
      const res = scanSecurityViolations({ content: '// @ts-ignore\nconst x: number = "bad";' });
      return !res.safe && res.violations.some(v => v.includes('@ts-ignore'));
    }
  },
  {
    name: 'No-Bypass Violation: TypeScript @ts-expect-error without Ticket',
    run: () => {
      const res = scanSecurityViolations({ content: '// @ts-expect-error\nconst x = 1;' });
      return !res.safe && res.violations.some(v => v.includes('@ts-expect-error'));
    }
  },
  {
    name: 'No-Bypass Violation: Blanket /* eslint-disable */ without Rule',
    run: () => {
      const res = scanSecurityViolations({ content: '/* eslint-disable */\nconst x = 1;' });
      return !res.safe && res.violations.some(v => v.includes('eslint-disable'));
    }
  },
  {
    name: 'No-Bypass Violation: Silent Error Swallowing (Empty catch ())',
    run: () => {
      const res = scanSecurityViolations({ content: 'try { run(); } catch (err) {}' });
      return !res.safe && res.violations.some(v => v.includes('catch block'));
    }
  },
  {
    name: 'No-Bypass Violation: Python Silent Exception Swallowing (except: pass)',
    run: () => {
      const res = scanSecurityViolations({ content: 'try:\n    run()\nexcept Exception:\n    pass' });
      return !res.safe && res.violations.some(v => v.includes('Python'));
    }
  },
  {
    name: 'No-Bypass Violation: Python # type: ignore without Ticket',
    run: () => {
      const res = scanSecurityViolations({ content: 'val = fetch()  # type: ignore' });
      return !res.safe && res.violations.some(v => v.includes('Python'));
    }
  },
  {
    name: 'No-Bypass Violation: Go Blanket //nolint without Ticket',
    run: () => {
      const res = scanSecurityViolations({ content: '//nolint\nfunc run() {}' });
      return !res.safe && res.violations.some(v => v.includes('Go'));
    }
  },
  {
    name: 'No-Bypass Violation: Skipped Unit Test it.skip() without Ticket',
    run: () => {
      const res = scanSecurityViolations({ content: 'it.skip("should authenticate", () => {});' });
      return !res.safe && res.violations.some(v => v.includes('automated tests'));
    }
  },
  {
    name: 'Security Violation: High-Risk Destructive Shell Command (rm -rf /)',
    run: () => {
      const res = scanSecurityViolations({ command: 'rm -rf /' });
      return !res.safe && res.violations.some(v => v.includes('destructive'));
    }
  }
];

/**
 * Execute Adversarial Self-Evaluation Suite
 */
export async function runSelfEvaluation(mockRoot = 'C:\\NonExistent_Test_123') {
  let passed = 0;
  const results = [];

  for (const attack of ADVERSARIAL_ATTACK_SUITE) {
    try {
      const success = attack.run(mockRoot);
      if (success) {
        passed++;
        results.push({ name: attack.name, blocked: true });
      } else {
        results.push({ name: attack.name, blocked: false });
      }
    } catch {
      results.push({ name: attack.name, blocked: false });
    }
  }

  const resilienceScore = Math.round((passed / ADVERSARIAL_ATTACK_SUITE.length) * 100);
  const escapeRate = 100 - resilienceScore;

  return {
    total: ADVERSARIAL_ATTACK_SUITE.length,
    passed,
    resilienceScore,
    escapeRate,
    results
  };
}

/**
 * Run Self-Evaluation CLI command
 */
export async function runSelfEvaluationCLI() {
  printBanner();
  console.log(`\n${C.bold}🧪 Running N.A.R.U. Adversarial Self-Evaluation & Red-Team Benchmark...${C.reset}\n`);

  const evalResult = await runSelfEvaluation();

  evalResult.results.forEach((r, idx) => {
    const icon = r.blocked ? `${C.green}🛡️ BLOCKED${C.reset}` : `${C.red}❌ ESCAPED${C.reset}`;
    console.log(`  ${idx + 1}. [${icon}] ${r.name}`);
  });

  console.log(`\n${C.bold}Benchmark Summary:${C.reset}`);
  console.log(`   - Attacks Tested    : ${evalResult.total} Adversarial Attack Vectors`);
  console.log(`   - Attacks Blocked   : ${C.green}${evalResult.passed}/${evalResult.total}${C.reset}`);
  console.log(`   - Resilience Score  : ${evalResult.resilienceScore === 100 ? `${C.green}100% (ZERO-BYPASS PROVEN)${C.reset}` : `${C.yellow}${evalResult.resilienceScore}%${C.reset}`}`);
  console.log(`   - Escape Rate       : ${evalResult.escapeRate === 0 ? `${C.green}0% (Optimal)${C.reset}` : `${C.red}${evalResult.escapeRate}%${C.reset}`}\n`);
}
