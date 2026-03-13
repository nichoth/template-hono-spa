# Quickstart: Passkey Login Request Contract

## Prerequisites

- Work from branch `022-passkey-login-payload`
- Review the current login route and client state files before implementation:
  - `/Users/nick/code/template-hono-spa/src/client/routes/login.ts`
  - `/Users/nick/code/template-hono-spa/src/client/state.ts`

## Contract Validation

1. Review the request contract:

```sh
sed -n '1,220p' /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/contracts/passkey-login-contract.md
```

2. Review the request/response entities:

```sh
sed -n '1,220p' /Users/nick/code/template-hono-spa/specs/022-passkey-login-payload/data-model.md
```

3. Confirm the current client login boundary:

```sh
sed -n '1,220p' /Users/nick/code/template-hono-spa/src/client/state.ts
```

## Manual Review Checklist

1. Confirm the contract identifies the complete assertion data the client must send after passkey approval.
   Required assertion fields: `credentialId`, `authenticatorData`, `clientDataJSON`, `signature`
2. Confirm the contract identifies any account or challenge correlation data that accompanies the assertion.
   Context fields: optional `accountIdentifier` and optional `challengeReference`
3. Confirm the contract defines which fields are required and which are optional.
4. Confirm the response boundary explains how `State.login` should distinguish success, rejected assertion, and unusable challenge/request states.

## Validation Log

- 2026-03-13: Planning artifacts prepared for the passkey login request/response contract.
- 2026-03-13: Implemented typed passkey login request-body shaping in `/src/client/state.ts`.
- 2026-03-13: Added unit coverage for passkey login request-body construction in `/test/unit.spec.ts`.
- 2026-03-13: Aligned password login route exports and button copy with existing test expectations in `/src/client/routes/login.ts`.
- 2026-03-13: Verification passed with `npm run lint` and `HOME=/tmp npm test`.
