# Email Confirmation Route Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated `/confirm/:code` SPA route that posts the emailed confirmation code to the API and guides users through success and error states without hitting a 404.
**Architecture:** Extend the existing Preact + `route-event` router with a dedicated confirm view rendered inside the standard SPA shell, have that view POST `{ identifier?, code }` to `POST /api/confirm`, and rely on the Hono backend to validate the code before the UI transitions to success or failure screens.
**Tech Stack:** TypeScript (ES2022) throughout (`vite`/`esbuild` on the client, `Hono` on the server), Preact + routing helpers, `ky` for fetch calls, Cloudflare Workers deployment (with D1-backed auth storage), and Vitest 3.2 + `@cloudflare/vitest-pool-workers` for testing.

---

## Summary

The front-end must treat `/confirm/:code` as a first-class route, use the SPA shell, capture the code, optionally enrich it with the identifier if visible, call `/api/confirm`, and surface immediate success or error guidance with accessible controls tied to resending codes or returning to login.

## Technical Context

**Language/Version:** TypeScript (ES2022) running in a browser bundle (Vite 8) and Cloudflare Workers (Node-compatible runtime).  
**Primary Dependencies:** `preact`, `htm/preact`, `@substrate-system/routes`, `route-event`, `ky`, `@substrate-system/*` UI controls, `Hono`, `@cloudflare/d1`, and `@simplewebauthn` helpers already used by auth endpoints.  
**Storage:** Cloudflare D1 stores users, challenges, and confirmation codes; the UI does not persist data beyond local route state.  
**Testing:** Vitest 3.2 with `@cloudflare/vitest-pool-workers` for backend contracts plus DOM assertions (e.g., `@testing-library/preact`) for client behavior.  
**Target Platform:** Cloudflare Workers for the API, browsers for the SPA.  
**Project Type:** Web application (single-page Preact client coupled with a Hono API).  
**Performance Goals:** Maintain SPA route transitions under ~300ms and keep confirm API round trips under ~2s in staging so the user sees feedback immediately.  
**Constraints:** Must never expose codes outside email/terminal logs in dev, avoid 404s when matching `/confirm` paths, and keep keyboard/ARIA accessibility for success/error banners.  
**Scale/Scope:** Focused strictly on the email confirmation flow; no changes to broader authentication flows or other pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution gates are defined inside `.specify/memory/constitution.md` (the file only contains placeholders), so this feature introduces no governance violations.

## Project Structure

### Documentation (this feature)

```text
specs/029-email-confirm-route/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── confirm-route.md
│   └── api-confirm.md
└── tasks.md   # created later by /speckit.tasks
```

### Source Code

```text
src/
├── app.ts                # worker entry that wires Hono and shell serving
├── client/
│   ├── components/       # shared component library (Nav, NotFound, etc.)
│   ├── routes/           # route modules (home, login, signup, profile)
│   ├── state.ts          # global signal store and API helpers
│   └── index.ts          # SPA bootstrap (router, render)
├── server/
│   ├── auth/             # registration & login helpers
│   ├── index.ts          # Hono app, routing, shell serving
│   ├── db/               # D1 helpers for users/devices/challenges
│   └── basic-auth.ts     # staging auth guard
├── style.css             # global styles
└── worker-configuration.d.ts
```

**Structure Decision:** The existing single `src/` project already defines both client (Preact SPA) and server (Hono worker) artifacts; no additional directories are needed. The confirm feature will touch `src/client/routes` for the new route/view and `src/server/index.ts` (or auth helpers) for any API contract adjustments.

