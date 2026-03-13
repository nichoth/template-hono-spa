# Data Model: Dedicated Signup Route

## Entity: Signup Route State

**Purpose**: Represents the client-side state needed to render and submit the dedicated account-creation screen.

**Fields**:
- `method`: `'passkey' | 'password'`
- `identifier`: string
- `displayName`: string
- `password`: string
- `fieldErrors`: partial field-to-message map
- `submitMessage`: string
- `status`: `'idle' | 'working'`

**Validation Rules**:
- `identifier` must be present before account creation can proceed.
- `displayName` may default to the identifier when not explicitly provided by the user.
- `password` is only relevant when the password method is active.
- Changing `method` clears stale method-specific errors and status messaging.

**State Transitions**:
- `idle -> working` when create-account submission begins
- `working -> idle` when submission completes or fails
- `passkey <-> password` when the radio selector changes

## Entity: Method Selection State

**Purpose**: Shared route-level state pattern used on both `/login` and `/signup` to determine which form controls and primary action should be visible.

**Fields**:
- `selectedMethod`: `'passkey' | 'password'`
- `sourceRoute`: `'/login' | '/signup'`

**Validation Rules**:
- Exactly one method is active at a time.
- The visible control set must match `selectedMethod`.

**Relationships**:
- Drives `Signup Route State`
- Drives existing login route rendering behavior

## Entity: Account Creation Submission

**Purpose**: The user-entered signup data sent through the account-creation backend path.

**Fields**:
- `identifier`: string
- `displayName`: string | undefined
- `method`: `'passkey' | 'password'`
- `challengeReference`: string | undefined
- `credential`: registration credential payload | undefined

**Validation Rules**:
- Passkey account creation must use the registration challenge and registration credential returned by the registration flow.
- Signup submission must be distinguishable from sign-in submission by endpoint and outcome messaging.

**Relationships**:
- Uses the existing auth challenge, user, credential, and session persistence already modeled by the backend auth service
