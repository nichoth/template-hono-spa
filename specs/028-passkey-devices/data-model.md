# Data Model: Passkey device backend

## Users

- **Purpose**: Represents the account owner linked to passkey devices.  
- **Fields**:
  - `id` (UUID, primary key): Immutable identifier referenced by devices.  
  - `handle` (binary/varbinary, unique): Random bytes that WebAuthn uses to tie a device to the account.  
  - `email` (text): Snapshot of the user-supplied email at registration.  
  - `created_at` (timestamp): When the passkey-enabled account was created.  
- **Validation**: `id` must be non-null and unique; `handle` must be generated securely per account.

## Devices

- **Purpose**: Stores one WebAuthn credential per row, keeping metadata and revocation state.  
- **Fields**:
  - `id` (UUID, primary key): Internal identifier for device records.  
  - `user_id` (UUID, foreign key → `users.id`): Owner reference.  
  - `credential_id` (text/binary, unique): WebAuthn credential identifier used during login lookups.  
  - `public_key` (text/binary): Stored public key used to verify signatures.  
  - `counter` (integer): Monotonic usage counter to detect cloned authenticators.  
  - `transports` (text array): How the device communicates (e.g., `usb`, `internal`).  
  - `aaguid` (text): Authenticator Attestation GUID for auditing.  
  - `credential_name` (text): Human-readable label like “iPhone 15” or “Yubikey.”  
  - `created_at` (timestamp): When the device registered.  
  - `last_used_at` (timestamp): When the device last authenticated successfully.  
  - `is_revoked` (boolean): Marks credentials that should no longer authenticate.
- **Validation**: `credential_id` must be unique; `counter` must be >= 0 and only increase; `is_revoked` defaults false.

## Relationships & Transitions

- Each `device` row points to exactly one `user`; deleting a user cascades to devices (but devices can be soft-revoked).  
- Registration creates rows in both tables; authentication reads the `device`, loads the linked `user`, verifies via `public_key`, and increments `counter` + `last_used_at`.  
- Revocation flips `is_revoked` or deletes the row, preventing future logins for that credential ID.
