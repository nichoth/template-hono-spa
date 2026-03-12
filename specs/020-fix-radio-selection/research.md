# Phase 0 Research: Fix Radio Selection

## Decision 1: Keep the shared radio-input control and fix the login route’s selection synchronization

- **Decision**: Preserve the installed radio-input custom element and its stylesheet, and focus implementation on aligning the route-local selection state with the radio control so the selected indicator updates on the first click.
- **Rationale**: The user explicitly wants the shared control and stylesheet. The bug described is behavioral: the visible selection appears late or requires an extra interaction.
- **Alternatives considered**:
  - Replace the radio-input element with native inputs or custom buttons: rejected because it would ignore the requested shared control.
  - Restyle the selector again without touching the event/state contract: rejected because it would not address the double-click selection bug.

## Decision 2: Treat first-click selection as a state synchronization problem between the custom element and route-local signals

- **Decision**: Investigate and adjust how the login route listens for method changes and reflects the current method into the radio-input attributes so the custom element and route-local signal stay in sync.
- **Rationale**: The current login route already stores the selected method locally. The reported lag strongly suggests the custom element’s internal radio state and the signal-driven rerender are not synchronizing cleanly on the first interaction.
- **Alternatives considered**:
  - Move selection state into shared app state: rejected because the bug is confined to one route and does not require broader state sharing.
  - Add a second layer of temporary UI state just for the selector: rejected because it would increase complexity and risk further divergence.

## Decision 3: Keep passkey and password content updates coupled to the same selected method source of truth

- **Decision**: Maintain a single route-local source of truth for both the selected radio option and the method-specific content shown below the selector.
- **Rationale**: The feature request calls out “something with the state,” and the safest correction is to avoid split or duplicated state between visual selection and visible login content.
- **Alternatives considered**:
  - Let the radio-input element manage selection independently from the route content: rejected because it risks the exact stale-selection bug the user reported.
  - Decouple content changes from radio selection timing: rejected because the spec requires immediate synchronization.

## Decision 4: Expand regression coverage around first-click selection and synchronized content

- **Decision**: Extend the current unit-source assertions and login-route integration checks to cover first-click selection expectations, continued shared radio styling usage, and method-content synchronization.
- **Rationale**: The repository already protects login route structure and behavior with Vitest. This bug fix belongs in that existing regression seam.
- **Alternatives considered**:
  - Rely on manual browser verification alone: rejected because this is a state-sync bug that should stay covered automatically.
  - Add a separate browser automation harness for this issue: rejected because the repo’s current testing strategy already covers route behavior sufficiently.
