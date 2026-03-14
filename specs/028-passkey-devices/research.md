# Research Log: Passkey device backend

## Decision: Model passkeys as a child table in D1 (users + devices)

**Rationale**: The project already relies on Cloudflare D1; relational tables naturally capture the one-to-many relationship between users and their registered devices, and SQL constraints ensure uniqueness of credential IDs and referential integrity.

**Alternatives considered**:

- Store passkey metadata as JSON blobs on the `users` row (rejected because counters and unique credential checks become difficult and D1 lacks efficient JSON indexing).
- Keep passkey data in a separate storage service (rejected to avoid introducing new infrastructure and to keep auth flows consolidated in D1).

## Decision: Persist full WebAuthn metadata (credential ID, public key, counter, transports, AAGUID, names, timestamps)

**Rationale**: WebAuthn login requires the public key and counter, and UX best practices ask for human-readable names/AAGUID for future auditing. Having explicit columns also makes revocation queries and counter bumps straightforward.

**Alternatives considered**:

- Store only the public key and counter (rejected because transports/AAGUID/credential name help with audits and help operations teams map devices to users).
- Rely solely on user handles without storing credential metadata (rejected because WebAuthn login cannot proceed without the credential ID and public key).
