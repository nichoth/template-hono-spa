# Research: HTM Rendering + TS Extension Migration

## Migration Inventory (Captured During Setup)

- `src/app.tsx`
- `src/server/index.tsx`
- `src/client/index.tsx`
- `src/client/not-found.tsx`
- `src/client/routes/about.tsx`
- `src/client/routes/home.tsx`
- `src/components/button.tsx`
- `src/components/card.tsx`
- `src/components/counter.tsx`
- `src/components/nav.tsx`

## Decision 1: Remove JSX from server entry module completely
- Decision: Convert `src/server/index.tsx` to `src/server/index.ts` and keep it pure TypeScript/string response logic with no JSX syntax.
- Rationale: Server rendering does not rely on JSX and user explicitly requires zero JSX on server.
- Alternatives considered:
  - Keep `.tsx` extension with no JSX: rejected due to requirement to move to `.ts`.
  - Leave server unchanged and migrate only client: rejected due to explicit server directive.

## Decision 2: Rename all `.tsx` rendering files in scope to `.ts`
- Decision: Rename all current `.tsx` files in `src/` to `.ts` and update import paths/references.
- Rationale: Ensures consistent extension policy and avoids mixed source conventions.
- Alternatives considered:
  - Rename only server files: rejected because requirement requests extension migration broadly.
  - Keep fallback aliases without renames: rejected because extension consistency remains unresolved.

## Decision 3: Use template-literal rendering for client modules
- Decision: Convert client render components/routes to template-literal based rendering style.
- Rationale: Aligns with requested syntax pattern and reference template approach.
- Alternatives considered:
  - Retain JSX in clients: rejected by feature objective.
  - Mix JSX and template literals: rejected due to consistency requirement.

## Decision 4: Preserve behavioral parity through existing tests plus targeted migration checks
- Decision: Reuse current integration/unit tests and add targeted checks for extension/import and syntax migration.
- Rationale: Existing tests already validate route and health behavior; targeted checks guard migration regressions.
- Alternatives considered:
  - Manual verification only: rejected due to regression risk.
  - Full new end-to-end suite: rejected as too costly for migration-focused scope.

## Decision 5: Update build/runtime references after file renames
- Decision: Update dev shell asset paths and any direct source references from `.tsx` to `.ts` where needed.
- Rationale: Prevents broken module loading in development and ensures entrypoint resolution.
- Alternatives considered:
  - Rely on implicit resolver behavior without updating explicit paths: rejected due to fragility.

## Reference-Aligned Rendering Conventions
- Use `import htm from 'htm'` + `const html = htm.bind(h)` in rendering modules.
- Prefer `html\`...\`` templates for component output instead of JSX returns.
- Use `${...}` interpolation for dynamic values and component invocations.
- Keep non-rendering server logic JSX-free and extension-aligned with `.ts`.
