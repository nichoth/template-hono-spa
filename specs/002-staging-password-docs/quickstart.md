# Quickstart: Staging Password Docs

## Goal

Validate that `README.md` gives maintainers enough information to configure and rotate staging password protection without reading source files.

## Validation Steps

1. Open `/Users/nick/code/template-hono-spa/README.md`.
2. Confirm the README identifies the staging deployment context explicitly.
3. Confirm the README names both staging secrets exactly:
   - `STAGING_USERNAME`
   - `STAGING_PW`
4. Confirm the README includes the staging secret setup commands or equivalent step-by-step instructions for applying those values.
5. Confirm the README includes at least one CLI command that generates a random password.
6. Confirm the README explains how to rotate the staging password later by updating the staging password secret value.
7. Run repository validation:

```sh
cd /Users/nick/code/template-hono-spa && npm run lint
cd /Users/nick/code/template-hono-spa && HOME=/tmp npm test
```

## Expected Outcome

- A maintainer can complete staging password setup and later password rotation using `README.md` alone.

## Validation Notes

- 2026-03-12: `README.md` now includes a dedicated staging password protection section with the `staging` deployment scope, exact secret names `STAGING_USERNAME` and `STAGING_PW`, and the `wrangler` commands to apply them.
- 2026-03-12: `README.md` includes a CLI password-generation example using `openssl rand -base64 32` and explains that the generated value should be used for `STAGING_PW`.
- 2026-03-12: `README.md` includes staging password rotation guidance and clarifies that username rotation is optional and separate.
- 2026-03-12: `npm run lint` passed after the README update.
- 2026-03-12: `HOME=/tmp npm test` passed with 50 passing tests after aligning existing nav-source assertions with the current shared navigation implementation.
