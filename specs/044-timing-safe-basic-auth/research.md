# Research: Timing-Safe Basic Auth Comparison

## Decision 1: Constant-time comparison primitive

**Decision**: Use `crypto.subtle.timingSafeEqual` from the Web Crypto API.

**Rationale**: Available natively in Cloudflare Workers (and all modern Web
Crypto environments) with no third-party dependency. Operates on
`ArrayBuffer` / `TypedArray` — inputs are encoded via `TextEncoder`.

**Alternatives considered**:
- `timingSafeEqual` from Node.js `crypto` module — not available in
  Cloudflare Workers.
- Third-party `safe-compare` / `scmp` npm packages — adds dependency,
  unnecessary when the platform provides the primitive.
- Hashing both sides with HMAC and comparing digests — more complex, same
  security property, higher latency.

---

## Decision 2: Handling inputs of different lengths

**Decision**: When encoded byte lengths differ, execute a dummy
`crypto.subtle.timingSafeEqual(aBytes, aBytes)` call to maintain constant
execution time within the function body, then return `false`.

**Rationale**: `timingSafeEqual` requires both `ArrayBuffer` arguments to have
identical `byteLength`; passing buffers of different sizes throws a
`TypeError`. The dummy comparison keeps the function's own hot path uniform
in length regardless of input sizes, satisfying FR-005.

The pattern (pseudocode):
```
encode a → aBytes
encode b → bBytes
if aBytes.length !== bBytes.length:
    crypto.subtle.timingSafeEqual(aBytes, aBytes)  // dummy, constant work
    return false
return crypto.subtle.timingSafeEqual(aBytes, bBytes)
```

**Alternatives considered**:
- Pad the shorter buffer to equal length — more code, same result, padding
  logic is easy to get wrong.
- Compare length first and early-return — leaks length information; rejected
  by FR-005.
- XOR all bytes into an accumulator — manual implementation, more error-prone
  than the platform primitive.

---

## Decision 3: Scope of change

**Decision**: Introduce a private `timingSafeStringEqual` helper inside
`src/server/basic-auth.ts` and call it twice in `credentialsMatch` (once for
username, once for password). No other files change.

**Rationale**: The spec explicitly scopes the fix to `credentialsMatch` in
`src/server/basic-auth.ts`. No other comparison sites were found.

**Alternatives considered**:
- Export the helper as a shared utility — not needed by any other caller;
  YAGNI.

---

## Decision 4: Test approach

**Decision**: Add a `describe('Basic Auth')` block to `test/unit.spec.ts`
covering:
1. `parseBasicAuthHeader` — malformed and valid header parsing
   (FR-006: existing behavior unchanged).
2. `credentialsMatch` — valid, wrong-password, wrong-username, both-wrong,
   empty string, missing secrets, and differing-length inputs.

No timing-based automated test for the constant-time property (User Story 3,
P2): verifying constant-time execution reliably in a test runner is
infeasible and the spec acknowledges this; SC-003 says code review is the
verification path for that property.

**Alternatives considered**:
- Statistical timing test — unreliable in a shared CI environment; not
  required by spec.
