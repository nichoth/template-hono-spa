# Contract: Foobar API Endpoint

## Interface Type
HTTP endpoint contract for server route `/api/foobar`.

## Scope
Defines request and response expectations for successful JSON retrieval and unsupported method handling.

## Contract Requirements
1. `GET /api/foobar` must return HTTP 200.
2. Successful `GET /api/foobar` responses must return valid JSON with a stable top-level structure.
3. Successful `/api/foobar` responses must declare a JSON content type.
4. Unsupported methods to `/api/foobar` must return non-2xx responses.
5. Error outcomes must not expose stack traces, secrets, or internal configuration values.
6. Existing endpoint behavior (for example `/api/health`) must remain unchanged.

## Acceptance Scenarios
1. Successful GET:
   - Given a request to `GET /api/foobar`,
   - When server routing resolves the endpoint,
   - Then response is HTTP 200 and JSON.
2. Unsupported method:
   - Given a request to `POST /api/foobar`,
   - When the route receives the method,
   - Then response is non-2xx and not the success payload.
3. Non-regression:
   - Given a request to `GET /api/health`,
   - When endpoint updates are present,
   - Then existing health response behavior is unchanged.

## Out of Scope
- Authentication, authorization, or permission model changes.
- Persistent storage writes or schema changes.
- Client UI changes.
