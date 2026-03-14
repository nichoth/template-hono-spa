# Data Model: Real Passkey Login Backend

## User Account

**Purpose**: Represents a person who can register passkeys, sign in, and own sessions.

**Fields**:
- `id`: Stable internal account identifier
- `identifier`: Unique sign-in identifier used by the person
- `display_name`: Optional user-facing display name
- `status`: Account lifecycle state such as active, disabled, or deleted
- `created_at`: Account creation timestamp
- `updated_at`: Last account update timestamp

**Relationships**:
- One user account has many passkey credentials
- One user account has many auth challenges
- One user account has many sessions
- One user account has many auth events

**Validation Rules**:
- `identifier` must be unique among active sign-in accounts
- Disabled or deleted accounts cannot create new sessions

## Passkey Credential

**Purpose**: Represents one registered authenticator associated with a user account.

**Fields**:
- `id`: Stable credential record identifier
- `user_id`: Owning user account
- `credential_id`: Unique passkey credential identifier
- `public_key_material`: Verification material needed for assertions
- `sign_count`: Most recent authenticator counter value when available
- `transport_hints`: Optional authenticator transport metadata
- `nickname`: Optional user-visible label for the credential
- `status`: Active or revoked state
- `created_at`: Registration timestamp
- `last_used_at`: Most recent successful authentication timestamp

**Relationships**:
- Belongs to one user account

**Validation Rules**:
- `credential_id` must be unique
- Revoked credentials cannot satisfy sign-in

## Auth Challenge

**Purpose**: Represents a time-limited registration or authentication challenge issued by the backend.

**Fields**:
- `id`: Stable challenge identifier
- `user_id`: Optional related user account for existing-user flows
- `identifier`: Optional sign-in identifier for pre-account or discovery flows
- `purpose`: Registration or authentication
- `challenge_value`: Server-issued challenge data
- `status`: Pending, used, expired, or invalidated
- `expires_at`: Challenge expiry timestamp
- `created_at`: Issuance timestamp
- `used_at`: Completion timestamp when consumed

**Relationships**:
- May belong to one user account

**Validation Rules**:
- Challenge can be consumed at most once
- Expired or invalidated challenges must be rejected
- Challenge purpose must match the ceremony being completed

## Session

**Purpose**: Represents an authenticated relationship between a client and a user account.

**Fields**:
- `id`: Stable session record identifier
- `user_id`: Authenticated user account
- `session_token`: Opaque session identifier presented by the client
- `status`: Active, expired, or revoked
- `created_at`: Session issuance timestamp
- `expires_at`: Session expiry timestamp
- `revoked_at`: Explicit invalidation timestamp when applicable
- `last_seen_at`: Most recent validated use timestamp

**Relationships**:
- Belongs to one user account

**Validation Rules**:
- `session_token` must be unique
- Revoked or expired sessions must not return authenticated user state

## Auth Event

**Purpose**: Represents an auditable security event related to account access.

**Fields**:
- `id`: Stable event identifier
- `user_id`: Optional related user account
- `session_id`: Optional related session
- `challenge_id`: Optional related challenge
- `event_type`: Registration success, registration failure, sign-in success, sign-in failure, sign-out, session expiry, or invalid session use
- `result`: Success or failure
- `occurred_at`: Event timestamp
- `detail`: Structured failure or context detail

**Relationships**:
- May belong to one user account
- May reference one session
- May reference one challenge

## State Transitions

### Auth Challenge
- `pending` -> `used` on successful ceremony completion
- `pending` -> `expired` when validity window passes
- `pending` -> `invalidated` when superseded, cancelled, or force-closed

### Session
- `active` -> `revoked` on sign-out or backend invalidation
- `active` -> `expired` when session lifetime passes

### Passkey Credential
- `active` -> `revoked` if removed or disabled in a later management flow

### User Account
- `active` -> `disabled` or `deleted` through later account lifecycle administration
