---
layout: default
title: Universal Security & Engineering Policy — N.A.R.U.
---

# Universal Security & Engineering Policy

N.A.R.U. enforces zero-compromise engineering standards across all 8 supported software platforms.

---

## Universal 8-Platform High-Assurance Security Matrix

1. **Web Applications & SaaS**:
   - Zero raw SQL concatenation (strictly use Drizzle, Prisma, or Kysely).
   - Strict Zod / TypeBox schema validation on all API inputs.
   - Anti-IDOR ownership verification (`where: { userId: session.user.id }`).
   - Dynamic HTML sanitization via `DOMPurify` to eliminate XSS.
2. **Mobile Applications (React Native, Flutter, MAUI, KMP)**:
   - Hardware-backed secure storage (iOS Keychain, Android Keystore, Windows DPAPI). Unencrypted `AsyncStorage` is strictly prohibited.
   - Cleartext traffic disabled (`usesCleartextTraffic="false"`) and iOS ATS enforced with TLS 1.3.
3. **Desktop Applications (Tauri, Electron, Avalonia UI)**:
   - Electron process sandboxing (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
   - Tauri IPC permission scoping in `capabilities` manifest.
4. **Game Development & Virtual Worlds (Roblox Luau / Rojo / Wally)**:
   - Server-Authoritative Physics: Distance validation (`Magnitude <= maxRange`), raycast line-of-sight checks, and debounce cooldowns.
   - Strict ban on `RemoteFunction:InvokeClient()` to prevent server thread deadlock.
   - Token-Bucket Rate Limiting (20 calls/sec per player).
   - Anti-Map Stealing via Hollow World chunking (`ServerStorage` vs `Workspace`) and honeypot decoy remotes.
   - `ProfileService` DataStore session locking.
5. **Messaging Bots (WhatsApp, Discord, Telegram, Slack)**:
   - WhatsApp Cloud API: `X-Hub-Signature-256` verification with `crypto.timingSafeEqual`.
   - Baileys Session Hardening: Signal Protocol keys (`creds.json`) encrypted with `chmod 600` and `.gitignore` enforcement.
   - Discord Bot API: Ed25519 cryptographic signature verification.
6. **CLI Tools & Developer Utilities**:
   - Anti-path traversal with `path.resolve()` (strictly isolated within workspace).
   - Safe temporary file nonces (`os.tmpdir()`) and SIGINT cleanup.
7. **Backend APIs & Microservices**:
   - Scoped Secret Broker: `process.env` encapsulated in `src/config/env.ts` with Zod validation.
   - GraphQL query depth limiters and per-IP rate limiting.
8. **Open-Source Packages & SDKs**:
   - Zero-Trust Dependency Architecture (ZTD): Exact version locking and SLSA provenance verification via Context7.

---

## 6 Pillars of Backend & Clean Architecture Excellence

1. **Hexagonal Domain Isolation (Ports-and-Adapters)**: `src/domain/` is 100% pure and strictly isolated from ORMs and 3rd-party vendor SDKs.
2. **Zero Zombie / Dead Code Mandate (Knip Standard)**: Zero unused imports, unreferenced variables, or dead module exports.
3. **Atomic Domain Services (DRY & SRP)**: Reusable business rules encapsulated in single-responsibility domain services.
4. **Runtime Algorithmic Efficiency**: `O(1)` Set/Map lookups, zero-copy streams (`ReadableStream`), and Transactional Outbox pattern.
5. **Clean Code & Low Cognitive Complexity**: Early return guard clauses with SonarQube Cognitive Complexity < 15.
6. **Elastic Horizontal Scalability**: Stateless tier with Redis session stores.

---

## Anti-AI-Slop Frontend Craftsmanship

1. **Mandatory 5 States of UI Stack**: Every data component implements Loaded, Skeleton Shimmer, Empty, Error with Retry, and Optimistic UI states.
2. **Accessibility (WCAG 2.2 AA)**: Minimum 4.5:1 text contrast ratio, mandatory focus rings (`focus-visible:ring-2`), and 48x48px touch targets.
3. **Roblox Multi-Screen Responsive UI**: `UDim2.fromScale()` paired with `UIAspectRatioConstraint` (1.0 for icons, 16/9 for banners), `UISizeConstraint` (Min 120x48px, Max 800x600px), `UIFlexItem` flexbox wrapping, and `DeviceSafeInsets` mobile notch handling.
