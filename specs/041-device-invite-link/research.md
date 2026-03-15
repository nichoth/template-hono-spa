# Research: Device Invite Link

## R1: Invitation URL Format

**Decision**: Use the pattern `/:handle/add/:code` where `code`
is a 6-digit numeric string (e.g., `/my-name/add/482901`).

**Rationale**: The user's notes specify a 6-digit numeric code
and a URL containing the user's handle. The handle is already
stored in the `users` table. Including the handle makes the URL
human-readable and gives the new device context about which
account it's joining. The 6-digit numeric code is short enough
to type manually if needed.

**Alternatives considered**:
- UUID-based tokens: More secure but too long to type/share
  verbally. Rejected per user's explicit preference for
  6-digit codes.
- Handle-only with no code: Not unique per invitation.

**Security note**: A 6-digit numeric code has 1,000,000
possible values. Combined with the 15-minute expiry and the
requirement that the invitation must be created by an
authenticated user first, the risk of brute-force is
acceptably low. Rate-limiting on the invite claim endpoint
provides additional protection.

---

## R2: Invitation Storage Strategy

**Decision**: Create a new `device_invitations` table rather
than reusing `auth_challenges`.

**Rationale**: The `auth_challenges` table serves WebAuthn
challenge-response flows with a `challenge_value` that maps
to the cryptographic challenge. Device invitations are a
different concept: they hold a short code, a device name,
and don't involve a challenge value until the new device
actually starts a WebAuthn ceremony. Separating concerns
keeps both tables clean.

**Alternatives considered**:
- Reuse `auth_challenges` with a new purpose value: Would
  require adding columns (device_name, invite_code) or
  overloading `metadata_json`. Muddies the semantics.
- In-memory store: Not viable on Cloudflare Workers (no
  persistent memory between requests).

---

## R3: Two-Phase Registration on the New Device

**Decision**: The invitation page performs a two-step flow:
1. GET `/:handle/add/:code` — serves a page that validates
   the invitation and starts a WebAuthn registration ceremony.
2. POST `/:handle/add/:code` — receives the credential from
   the browser and saves the device.

**Rationale**: This mirrors the existing registration flow
(start/finish) but is triggered by the invitation token
instead of a session cookie. The new device does NOT need
to be logged in — the invitation token is the authorization.

**Alternatives considered**:
- Redirect to a generic `/register-device` page with the
  code as a query param: Works but the URL format from the
  user's notes is cleaner.
- Server-sent events to notify the original device: Could
  add polish later (P3 story) but not needed for MVP.

---

## R4: Copy Button Component

**Decision**: Use `@substrate-system/copy-button` (already in
package.json at `^0.5.24`) for the clipboard copy action next
to the invitation URL.

**Rationale**: Already a dependency. Provides a standard
copy-to-clipboard UI pattern consistent with the rest of
the substrate-system component library.

---

## R5: Invitation Lifecycle and Cleanup

**Decision**: Invitations use status-based lifecycle
(`pending` → `consumed` | `cancelled` | `expired`). Expired
invitations are detected at read-time by comparing
`expires_at` to the current timestamp — no background cleanup
job needed.

**Rationale**: Cloudflare Workers has no cron-like mechanism
in this project. Checking expiry at read-time is simple and
sufficient. Old invitation rows are harmless and can be
cleaned up lazily or ignored.

---

## R6: Client-Side Route for the Invitation Page

**Decision**: Add a new client route `/:handle/add/:code`
that renders the invitation claim page. The server's catch-all
`GET *` handler already serves the SPA shell for unknown
paths, so the client router just needs to match this pattern
and render the appropriate component.

**Rationale**: Follows the existing pattern where the server
serves the SPA shell and the client router picks up the path.
The confirm flow (`/confirm/:code`) works the same way.

**Alternatives considered**:
- Server-rendered page: Would break the SPA pattern.
  The server already delegates all non-API, non-asset
  GET requests to the shell page.

---

## R7: Replacing vs. Augmenting the Existing Add Device Flow

**Decision**: Replace the existing same-device "Add device"
flow entirely. The current flow triggers a WebAuthn ceremony
on the current browser (same device). The new flow generates
an invitation link instead. The invitation link CAN still be
opened on the same device if desired.

**Rationale**: Per the spec's Assumptions section and the
user's feature description, this is a replacement, not an
addition. The edge case of adding a passkey on the same
device is covered because the invitation link works
regardless of which device opens it.
