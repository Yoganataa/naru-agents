# Multi-Language No-Bypass Policy

N.A.R.U. enforces a strict zero-tolerance code quality contract across all programming languages:

---

## Prohibited Anti-Patterns

| Forbidden Category | TypeScript / JS (`.ts`, `.js`) | Python (`.py`) | Go (`.go`) | Rust (`.rs`) | Java / Kotlin (`.java`, `.kt`) |
|---|---|---|---|---|---|
| **Suppress Lint/Type** | `@ts-ignore`, `@ts-expect-error` without ticket | `# type: ignore`, `# noqa` blanket | `//nolint` without issue link | `#[allow(...)]` blanket | `@SuppressWarnings` blanket |
| **Silent Error Swallow** | `catch {}` empty, `.catch(()=>{})` | `except: pass`, `except Exception: pass` | `if err != nil {}` empty, `_ = err` | `let _ = res;` on fallible Result | `catch (Exception e) {}` empty |
| **Unsafe Unwrap** | Non-null `!` silencing type error | Dict access without `.get()`/try | Ignoring error return | `.unwrap()` / `.expect()` on prod path | `Optional.get()` without `isPresent()` |
| **Skip / Disable Test** | `.skip()`, `xit()`, `test.todo()` | `@pytest.mark.skip`, `unittest.skip` | `t.Skip()` without ticket link | `#[ignore]` without ticket | `@Disabled` without ticket |
| **Untracked Workaround**| `// TODO` / `// FIXME` without issue | `# FIXME` without issue link | `// TODO` without issue link | `// TODO` without issue link | `// TODO` without issue link |

---

## 🛡️ Anti-Hollow & Tautological Test Audit (Quality Gate 3)

Reviewer-Agent strictly audits test suites to eliminate the "False Green / Hollow Mock" failure mode:
1. **Tautological Assertions Prohibited**: Rejecting tests asserting trivial constants (`expect(true).toBe(true)`, `assert 1 == 1`).
2. **Subject-Under-Test Over-Mocking Prohibited**: Mocking the exact function under test is strictly rejected. Mocks are only allowed for external I/O (Database, Network, Filesystem).
3. **Zero-Assertion Tests Prohibited**: Tests executing code without explicit assertions are flagged as violations.

---

## 🔒 Pre-Flight Git Working Tree & Secret Sanitizer Guards

1. **Pre-Flight Git Working Tree Safety**: Before code modifications, Naru checks `git status --porcelain` and offers an interactive modal to auto-stash or commit manual changes, preventing accidental work loss.
2. **Deterministic Secret Masking**: All logs, stack traces, and status reports automatically redact API keys (`sk-*`, `ghp_*`), database connection strings, and Bearer tokens to `[REDACTED_SECRET]`.
3. **Duplicate Action Circuit Breaker**: Prohibits agents from executing identical failing tool calls more than 2 consecutive times, eliminating cognitive deadlocks.

---

## 🛡️ Universal 8-Platform High-Assurance Security Architecture

To guarantee 100% security across all software archetypes:
1. **🌐 Web & SaaS (Next.js/Remix/MUI)**: Parameterized ORM (Zero SQLi), Zod input/output schemas, anti-IDOR tenant checks, strict CSP, DOMPurify anti-XSS.
2. **📱 Mobile Apps (.NET MAUI/Expo/Flutter/KMP)**: Mandatory hardware-backed `SecureStorage` (iOS Keychain, Android Keystore, Windows DPAPI), `usesCleartextTraffic="false"`, TLS 1.3, deep link validation.
3. **🖥️ Desktop Apps (Tauri/Electron/Avalonia UI)**: Electron `contextIsolation: true` & `sandbox: true`, Tauri IPC capabilities scoping in Rust, `ProtectedData` credential vaults.
4. **🎮 Game Dev (Roblox Luau/Rojo/Wally/Unity/Godot)**: Server-Authoritative logic ("Never Trust The Client"), runtime RemoteEvent type checking (`t`/`Guard`), ProfileService session locking (anti-duplication DataStore), `TextService` filtering.
5. **🤖 Bots & Messaging (WhatsApp/Discord/Telegram/Slack)**: WhatsApp Cloud API `X-Hub-Signature-256` HMAC-SHA256 verification using `crypto.timingSafeEqual` on raw body, Baileys `creds.json` encrypted storage with `chmod 600` and `.gitignore`, Discord Ed25519 signature checks, Admin JID/Role RBAC.
6. **⌨️ CLI Utilities (Node/Bun/Rust/Go/Python)**: Anti-Path Traversal (`path.resolve()`), anti-argument injection, safe temp file nonces (`os.tmpdir()`), safe SIGINT cleanup.
7. **🔌 Backend APIs (FastAPI/Go Gin/Elysia/Axum/ASP.NET Core/tRPC)**: Scoped Secret Broker (`src/config/env.ts`), GraphQL query complexity limiting, timing-safe crypto equality, rate limiting per IP/Token.
8. **📦 Open-Source Packages (NPM/Crates/NuGet/Wally)**: Zero-Trust Dependency Architecture (ZTD), exact version pinning, export encapsulation, SLSA provenance.

## 🎨 Anti-AI-Slop Frontend & UI/UX Craftsmanship Standard

To eliminate generic AI slop (Nature 2024 / Scott Hurff / Refactoring UI / WCAG 2.2 AA):
1. **Banned Patterns**: Generic purple-to-indigo gradients, the 3-identical-card syndrome, washed-out gray text (`#9ca3af`), and clickable `<div>` elements without keyboard access.
2. **Mandatory 5 States of UI Stack**: Every data component must implement:
   - *Loaded State*
   - *Skeleton Shimmer State* (1:1 dimensions, CLS < 0.1)
   - *Empty State* (with clear Call-to-Action button)
   - *Error State* (with interactive "Try Again" retry trigger)
   - *Optimistic UI / Disabled Mutation State* (instant feedback + loading spinner)
3. **Accessibility (WCAG 2.2 AA)**: Minimum contrast ratio >= 4.5:1, semantic HTML (`<button>`, `<main>`, `<nav>`, `<dialog>`), `focus-visible:ring-2`, and minimum 48x48px mobile touch targets.
4. **Physics-Based Spring Transitions**: Natural Framer Motion spring physics (`stiffness: 300`, `damping: 25`).

---

## 🏛️⚙️ Backend & Clean Architecture Excellence (6 Pillars)

To guarantee enterprise scalability and zero technical debt:
1. **Hexagonal Domain Isolation**: `src/domain/` is pure business logic with zero framework/ORM dependencies.
2. **Zero Zombie / Dead Code Mandate**: AST-level purging of unused imports, unreferenced variables, and dead exports.
3. **Reusability & Atomic Services**: Reusable domain services with Single Responsibility Principle (SRP).
4. **Runtime Efficiency**: `O(1)` Map/Set lookups, zero-copy stream processing, and Transactional Outbox Pattern.
5. **Clean Code**: Early returns (Cognitive Complexity < 15) and self-documenting naming.
6. **Stateless Scalability**: 100% stateless backend tier with Redis/JWT sessions for instant horizontal scaling.

