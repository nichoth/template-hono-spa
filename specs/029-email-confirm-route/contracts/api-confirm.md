# API Contract: `POST /api/confirm`

## Request
- **Endpoint:** `POST /api/confirm`
- **Body:** JSON object with:
  - `identifier` (string, optional): Email or username associated with the account. The client populates this when known (e.g., extracted from query or stored state).
  - `code` (string, required): The confirmation code path segment; the server validates this token strictly.
- **Headers:** Standard worker headers suffice; no additional auth required (the code itself proves intent).

## Responses
- **200 OK**: `{ status: "confirmed", identifier: "<identifier>" }`. Indicates activation succeeded. The client can display success UI and optionally pre-fill the login identifier.
- **400 Bad Request**: `{ error: "invalid_code", message: "Code is invalid or malformed." }`. Means the code format failed validation.
- **409 Conflict**: `{ error: "expired_code", message: "Code expired." }`. Means the token is no longer usable.
- **429 Too Many Requests** (if rate limiting exists): Standard rate-limit response (client should show throttle message).
- **5xx Server Errors**: Display generic retry guidance and surface telemetry if necessary.

## Notes
- The server logs codes only on localhost/development; production logs must omit them.
- The client should be resilient to network failures (retry, guidance copy) even if the API is unreachable.
