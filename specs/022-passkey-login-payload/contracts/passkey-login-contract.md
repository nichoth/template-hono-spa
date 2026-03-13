# Contract: Passkey Login Request

## Purpose

Define the client/server request and response boundary for passkey login so `State.login` can submit the correct data and interpret the result consistently.

## Contract Rules

1. The client must send the full passkey assertion package returned after the user approves passkey sign-in.
   The required assertion fields are `credentialId`, `authenticatorData`, `clientDataJSON`, and `signature`.
2. The request must clearly separate authenticator-produced assertion data from account-identifying or challenge-correlation context.
   The surrounding context currently consists of `accountIdentifier` and `challengeReference` when those values are available to the client.
3. The contract must identify which passkey assertion fields are required for server verification.
4. The contract must identify which context fields are required, optional, or flow-dependent.
5. The request must contain enough information for the server to correlate the assertion to the correct login attempt or challenge.
6. The success response must contain enough information for the client to update signed-in user state.
7. Failure responses must distinguish at least invalid assertion, malformed request, and expired or mismatched login context.
8. The contract must be explicit enough that developers implementing `State.login` do not need to infer payload contents from browser objects or hidden server assumptions.

## Covered Surfaces

- Client login state boundary in [/Users/nick/code/template-hono-spa/src/client/state.ts](/Users/nick/code/template-hono-spa/src/client/state.ts)
- Current passkey login UI flow in [/Users/nick/code/template-hono-spa/src/client/routes/login.ts](/Users/nick/code/template-hono-spa/src/client/routes/login.ts)
- Future login API handling in [/Users/nick/code/template-hono-spa/src/server/index.ts](/Users/nick/code/template-hono-spa/src/server/index.ts)

## Verification

- Review should confirm the request contract answers “what does the client send to the server?” without missing required fields.
- Review should confirm the response contract answers what `State.login` should expect back on success and on distinct failure categories.
- Implementation should later verify the client request body and response handling match this documented contract.
