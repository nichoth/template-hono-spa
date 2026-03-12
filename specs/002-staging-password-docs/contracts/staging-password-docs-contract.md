# Documentation Contract: Staging Password Setup

## Purpose

Define the minimum documentation content that `README.md` must provide for staging password setup and rotation.

## Required README Coverage

1. The README must identify that password protection applies to the staging deployment context.
2. The README must name both staging secret identifiers exactly:
   - `STAGING_BASIC_AUTH_USERNAME`
   - `STAGING_PW`
3. The README must show how maintainers apply the secrets to the staging environment.
4. The README must include at least one CLI command that generates a random password value.
5. The README must explain how a maintainer can rotate the staging password later by replacing the staging password secret value.

## Acceptance Signals

- A maintainer can copy the documented secret names without consulting `wrangler.jsonc`
- A maintainer can distinguish staging-only protection from other deployment contexts
- A maintainer can generate a fresh password with the documented CLI example
- A maintainer can determine which credential value must be replaced during password rotation
