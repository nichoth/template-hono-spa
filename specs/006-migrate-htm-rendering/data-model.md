# Data Model: Rendering Migration

## Entity: RenderingModule
- Description: Any source module that produces UI markup for client or app composition.
- Fields:
  - `path` (string): Absolute or repository-relative source file path.
  - `runtimeDomain` (enum): `client` or `server`.
  - `extension` (string): Source extension (`.tsx` before migration, `.ts` after migration).
  - `renderSyntax` (enum): `jsx`, `template_literal`, or `non_jsx`.
- Validation rules:
  - Post-migration, `extension` MUST be `.ts` for all migrated rendering modules.
  - Post-migration, `renderSyntax` MUST be `template_literal` for client modules in scope.
  - Post-migration, `renderSyntax` MUST be `non_jsx` for server modules in scope.

## Entity: ImportReference
- Description: A module import that targets a migrated file.
- Fields:
  - `sourcePath` (string): Importing module path.
  - `targetPath` (string): Imported module path.
  - `resolved` (boolean): Whether import resolves after rename/migration.
- Validation rules:
  - Every `ImportReference` targeting migrated files MUST resolve successfully.
  - No import reference may point to removed `.tsx` files after migration.

## Entity: BehaviorContract
- Description: Preserved runtime outcomes expected before and after migration.
- Fields:
  - `surface` (string): Route, component, or endpoint behavior being preserved.
  - `expectedOutcome` (string): Baseline expected output/interaction.
  - `verified` (boolean): Regression verification status.
- Validation rules:
  - All critical route surfaces and endpoint health checks MUST remain verified.

## Relationships
- `RenderingModule` rename/syntax changes require `ImportReference` updates.
- `BehaviorContract` validity depends on migrated `RenderingModule` correctness and resolved imports.

## State Transitions
1. Pre-migration: `.tsx` files exist with JSX in client/server scope.
2. Migrated: files renamed to `.ts`; syntax converted according to scope.
3. Verified: imports resolve and behavior contracts pass test validation.
