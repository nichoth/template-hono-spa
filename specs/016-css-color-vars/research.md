# Phase 0 Research: Shared Color Variables

## Decision 1: Extend the existing root token set instead of creating a second color registry

- **Decision**: Keep the authoritative color token definitions in [src/style.css](/Users/nick/code/template-hono-spa/src/style.css) and expand that existing `:root` token set to cover every maintained UI color still expressed as a literal.
- **Rationale**: The repository already defines shared design tokens in the global stylesheet and consumes them across component and route CSS. Extending the same location keeps token discovery simple and avoids splitting semantic colors across multiple files with overlapping responsibility.
- **Alternatives considered**:
  - Move all colors into [src/_variables.css](/Users/nick/code/template-hono-spa/src/_variables.css): rejected because that file currently scopes custom media only, so repurposing it would mix unrelated responsibilities and require broader import churn.
  - Create a new dedicated color-token file: rejected because the current scale does not justify another style entry point.

## Decision 2: Use semantic token names for missing literals rather than reusing generic color words

- **Decision**: Add or refine token names based on meaning, such as surface, inverse text, overlay, and error text, instead of continuing to use raw names like `white`, `black`, or one-off literal values at the point of use.
- **Rationale**: The feature’s maintainability benefit depends on being able to change palette values without rewriting usage sites. Semantic names document intent and let multiple components share the same token even if the literal value changes later.
- **Alternatives considered**:
  - Keep generic names like `--color-white` and `--color-black` for all usage: rejected because they encode raw pigment rather than purpose and encourage ad hoc usage.
  - Rename every existing token in one pass: rejected because the spec emphasizes bounded scope and preserving current intent, not performing a broad visual-system redesign.

## Decision 3: Limit implementation scope to maintained application CSS and repository-owned styling surfaces

- **Decision**: Replace color literals only in repository-owned maintained styles, including global styles, shared component styles, and route styles, while excluding third-party package internals.
- **Rationale**: The spec explicitly scopes the work to maintained application styles. This produces a complete outcome for code the repo owns without taking on uncontrolled dependency CSS or vendored assets.
- **Alternatives considered**:
  - Attempt to override or patch third-party package styles: rejected because those files are not maintained here and would expand scope beyond the request.
  - Restrict work to only the currently discovered literal values: rejected because future-proofing requires documenting the rule for all maintained color usage, not just the currently flagged lines.

## Decision 4: Add regression coverage by checking maintained stylesheet content for direct color literals

- **Decision**: Add a focused automated check in the existing test suite that scans maintained application stylesheets for direct color literals and named color keywords other than allowed neutral keywords such as `transparent` where needed.
- **Rationale**: The spec’s main measurable outcome is zero direct color literals in active maintained styles. A repository-level content check protects that requirement better than route-only assertions and fits the current Vitest-based workflow.
- **Alternatives considered**:
  - Rely on manual review only: rejected because the feature is specifically about preventing regression.
  - Introduce a new dedicated stylelint rule set first: rejected because the repo already depends on Vitest and ESLint, and a targeted test is lower-friction for this scoped feature.
