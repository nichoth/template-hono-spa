# Research Notes: Custom media breakpoint usage

## Breakpoint reuse decision
- **Decision**: Replace the hard-coded `@media (max-width: 679px)` with `@media (--small)` defined in `src/_variables.css`.
- **Rationale**: LightningCSS compiles custom media, so referencing `--small` keeps breakpoint management centralized and ensures future updates propagate to all rules using the same variable.
- **Alternatives considered**: Leaving the hard-coded media (which risks drift) or defining a new custom media (unnecessary since `--small` already matches the desired threshold).
