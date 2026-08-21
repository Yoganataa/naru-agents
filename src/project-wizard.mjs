// ─── project-wizard.mjs ── Interactive Project Scaffolding Wizard (naru new) ───
// Formulates structured .opencode/artifacts/project-brief.md for greenfield projects
// ──────────────────────────────────────────────────────────────────────────────

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

export async function runProjectWizard() {
  const { printBanner } = await import('./banner.mjs');
  printBanner('new');

  const rl = createInterface({ input, output });

  try {
    console.log('\x1b[1m📋 N.A.R.U. Interactive Project Scaffolding Wizard\x1b[0m');
    console.log('\x1b[90mAnswer the following prompts to construct your structured project brief:\x1b[0m\n');

    // 1. Project Name & Directory
    const rawName = await rl.question('\x1b[1m1. Project Name / Directory\x1b[0m (Default: current directory): ');
    const projectName = rawName.trim() || 'current-workspace';

    // 2. Category & Platform
    console.log('\n\x1b[1m2. Select Project Category & Platform:\x1b[0m');
        const categories = [
      'Web Fullstack Application (Next.js / Remix / SvelteKit / Nuxt / MUI)',
      'Cross-Platform Multiplatform (.NET MAUI / Compose Multiplatform / Avalonia UI / Flutter)',
      'Roblox Game / Experience (Luau / Rojo / Wally / Knit / Fusion)',
      'Mobile Application (React Native / Expo / Flutter / Android / iOS)',
      'Desktop Application (Tauri / Electron / Avalonia UI / .NET MAUI)',
      'Backend API & Microservice (FastAPI / Go Gin / Bun Elysia / Rust Axum / ASP.NET Core)',
      'Interactive Bot (Discord / Telegram / WhatsApp / Slack)',
      'CLI Tool / Developer Utility (Node / Bun / Rust / Go / Python)',
      'Open-Source Library / Package (NPM / Crates.io / PyPI / NuGet / Wally)',
    ];
    for (let i = 0; i < categories.length; i++) {
      console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${categories[i]}`);
    }
    const catChoice = await rl.question(`Select category [1-${categories.length}, Default: 1]: `);
    const catIndex = parseInt(catChoice.trim(), 10);
    const category = (!isNaN(catIndex) && catIndex >= 1 && catIndex <= categories.length)
      ? categories[catIndex - 1]
      : categories[0];

    // 3. Description & Problem Statement
    console.log('\n\x1b[1m3. Project Purpose & Description:\x1b[0m');
    const description = (await rl.question('Briefly describe the product and the core problem it solves: ')).trim() ||
      'Production-grade application designed for scalability, type-safety, and modular architecture.';

    // 4. Primary Language & Runtime
    console.log('\n\x1b[1m4. Primary Language & Runtime:\x1b[0m');
        const runtimes = [
      'TypeScript / Bun (High Performance & Modern ESM)',
      'TypeScript / Node.js (Enterprise Ecosystem)',
      'C# / .NET 8/9 (.NET MAUI / Avalonia UI / ASP.NET Core / Blazor)',
      'Luau (Roblox Studio / Rojo / Wally / Lune CLI)',
      'Kotlin (Compose Multiplatform / KMP / Android)',
      'Python (Python 3.12+ / FastAPI / AI)',
      'Go (Go 1.23+ / High Concurrency)',
      'Rust (Cargo / Memory-Safe Systems)',
    ];
    for (let i = 0; i < runtimes.length; i++) {
      console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${runtimes[i]}`);
    }
    const rtChoice = await rl.question(`Select runtime [1-${runtimes.length}, Default: 1]: `);
    const rtIndex = parseInt(rtChoice.trim(), 10);
    const runtime = (!isNaN(rtIndex) && rtIndex >= 1 && rtIndex <= runtimes.length)
      ? runtimes[rtIndex - 1]
      : runtimes[0];

    // 5. Database & ORM
    console.log('\n\x1b[1m5. Database & ORM Stack:\x1b[0m');
    const databases = [
      'PostgreSQL + Drizzle ORM (Type-safe & lightweight)',
      'PostgreSQL + Prisma ORM (Schema-first & migration-rich)',
      'SQLite / Turso + Drizzle ORM (Embedded & Edge-ready)',
      'MongoDB + Mongoose (Document store)',
      'None / Stateless API',
    ];
    for (let i = 0; i < databases.length; i++) {
      console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${databases[i]}`);
    }
    const dbChoice = await rl.question(`Select database [1-${databases.length}, Default: 1]: `);
    const dbIndex = parseInt(dbChoice.trim(), 10);
    const database = (!isNaN(dbIndex) && dbIndex >= 1 && dbIndex <= databases.length)
      ? databases[dbIndex - 1]
      : databases[0];

    // 6. Authentication & State
    console.log('\n\x1b[1m6. Authentication & State Management:\x1b[0m');
    const auths = [
      'Better-Auth / Lucia (Modern Type-Safe & Framework-Agnostic)',
      'NextAuth.js / Auth.js (OAuth & Session management)',
      'JWT / Bearer Token Architecture',
      'Zustand / Redux Toolkit (Client State)',
      'None / Public Service',
    ];
    for (let i = 0; i < auths.length; i++) {
      console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${auths[i]}`);
    }
    const authChoice = await rl.question(`Select auth & state [1-${auths.length}, Default: 1]: `);
    const authIndex = parseInt(authChoice.trim(), 10);
    const auth = (!isNaN(authIndex) && authIndex >= 1 && authIndex <= auths.length)
      ? auths[authIndex - 1]
      : auths[0];

    // 7. Target Deployment Platform
    console.log('\n\x1b[1m7. Target Deployment Platform:\x1b[0m');
    const deployments = [
      'Vercel / Cloudflare Pages (Serverless Edge)',
      'Docker / VPS / Railway / Render (Containerized)',
      'Expo EAS (App Store & Google Play)',
      'Standalone Binary Distribution',
    ];
    for (let i = 0; i < deployments.length; i++) {
      console.log(`  \x1b[1m[${i + 1}]\x1b[0m ${deployments[i]}`);
    }
    const depChoice = await rl.question(`Select deployment [1-${deployments.length}, Default: 1]: `);
    const depIndex = parseInt(depChoice.trim(), 10);
    const deployment = (!isNaN(depIndex) && depIndex >= 1 && depIndex <= deployments.length)
      ? deployments[depIndex - 1]
      : deployments[0];

    // 8. Core Features & MVP Scope
    console.log('\n\x1b[1m8. Must-Have MVP Core Features:\x1b[0m');
    console.log('\x1b[90m(Enter 3-5 core user stories, separated by comma or semicolon)\x1b[0m');
    const rawFeatures = await rl.question('MVP Features (Default: User Auth, Dashboard, Core CRUD): ');
    const featuresList = (rawFeatures.trim() || 'User Authentication, Responsive Dashboard, Core Domain CRUD, Error Boundary')
      .split(/[,;]/)
      .map(f => f.trim())
      .filter(Boolean);

    // ── Generate Structured Project Brief Markdown ──────────────────
    const briefContent = `# Project Intake Brief: ${projectName}

- **Created At**: ${new Date().toISOString()}
- **Category & Platform**: ${category}
- **Primary Runtime**: ${runtime}
- **Database & ORM**: ${database}
- **Authentication & State**: ${auth}
- **Deployment Target**: ${deployment}

---

## 1. Problem Statement & Purpose
${description}

---

## 2. MVP Core User Stories
${featuresList.map((f, i) => `${i + 1}. **${f}**`).join('\n')}

---

## 3. Engineering Constraints & No-Bypass Policies
- Universal zero-tolerance policy against silent exception swallowing and unlinked test skips.
- Dynamic 5-MCP tool fusion (\`context7\`, \`serena\`, \`codegraph\`, \`lean-ctx\`, \`codebase-memory-mcp\`).
- Immutable Goal Baseline verification enforced at Quality Gates 1, 2, 3, and 4.
`;

    // Write to .opencode/artifacts/project-brief.md
    const artifactsDir = join(process.cwd(), '.opencode', 'artifacts');
    const sessionsDir = join(process.cwd(), '.opencode', 'knowledge', 'sessions');
    
    await mkdir(artifactsDir, { recursive: true });
    await mkdir(sessionsDir, { recursive: true });

    const briefPath = join(artifactsDir, 'project-brief.md');
    await writeFile(briefPath, briefContent, 'utf8');

    const latestJsonPath = join(sessionsDir, 'latest.json');
    try {
      await access(latestJsonPath);
    } catch {
      await writeFile(latestJsonPath, JSON.stringify({
        initialized: new Date().toISOString(),
        project_name: projectName,
        status: "INTAKE_COMPLETED",
        version: "0.0.2"
      }, null, 2), 'utf8');
    }

    console.log('\n\x1b[32m✅ Project Brief Successfully Generated!\x1b[0m');
    console.log(`   - Intake Artifact : .opencode/artifacts/project-brief.md`);
    console.log(`   - Session Pointer : .opencode/knowledge/sessions/latest.json\n`);
    console.log('\x1b[1m🚀 Next Step:\x1b[0m Open OpenCode and run \x1b[36m@naru start\x1b[0m to initiate PM requirements formulation and full production pipeline!\n');

  } finally {
    rl.close();
  }
}
