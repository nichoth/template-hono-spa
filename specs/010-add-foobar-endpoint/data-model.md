# Data Model: Foobar Endpoint Response

## Entity: FoobarResponse
- Description: JSON payload returned for successful `GET /api/foobar` requests.
- Fields:
  - `ok` (boolean): Indicates successful endpoint processing.
  - `route` (string): Echoes endpoint identity for client verification.
  - `message` (string): Human-readable response label.
- Validation rules:
  - `ok` is always `true` on successful responses.
  - `route` remains stable as `/api/foobar`.
  - Response payload must be valid JSON.

## Entity: MethodOutcome
- Description: Route outcome category based on HTTP method support.
- Fields:
  - `method` (string): Incoming HTTP method.
  - `isSupported` (boolean): Whether method maps to success contract.
  - `statusClass` (enum): success or error.
- Validation rules:
  - `GET` maps to `isSupported=true` and success outcome.
  - Unsupported methods map to `isSupported=false` and non-2xx outcome.

## Relationships
- `MethodOutcome` determines whether `FoobarResponse` is returned.
- Successful request path yields one `FoobarResponse` payload.

## State Transitions
1. Request arrives at `/api/foobar`.
2. Method is evaluated against supported method set.
3. Supported method returns success JSON response.
4. Unsupported method returns non-2xx response without sensitive internals.
