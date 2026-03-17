# Notes

## Passkeys

Transitioning to passkeys is a great move for security, but it does change the
"shape" of your user table. Since passkeys use **WebAuthn**
(public-key cryptography), you’re essentially ditching the password hash for a
set of cryptographic credentials.

You are correct: you **must** store the public key. However, that’s only one
piece of the puzzle.

---

## What to Store in Your Database

To successfully authenticate a user via passkey, your database needs to track a
few specific fields. You should treat "Passkeys" as a one-to-many relationship
(a user might have a passkey on their phone and another on their laptop).

### 1. The Core Credential Data

| Field | Description |
| --- | --- |
| **Credential ID** | A unique identifier for the passkey (used to look up the right key during login). |
| **Public Key** | The cryptographic key used to verify the user's signature. |
| **Counter** | An integer that tracks how many times the key has been used (helps detect cloned authenticators). |
| **Transports** | A list of how the device communicates (e.g., `usb`, `ble`, `nfc`, `internal`). |

### 2. The User Identity

* **User ID:** A permanent, unique internal ID (UUID is best). **Crucial:**
  Avoid using the email as the primary key for WebAuthn, as emails can change.
* **User Handle:** A random byte array (usually 64 bytes) that the authenticator
  stores. This is what links the physical device to the account.

### 3. Metadata (For a better UX)

Since "Public Key #1" means nothing to a human, you should also store:

* **Credential Name:** e.g., "iPhone 15" or "Yubikey."
* **AAGUID:** This identifies the *type* of device
  (e.g., "Google Password Manager" vs. "Apple iCloud Keychain").
* **Created/Last Used:** Standard timestamps for account management.

---

## The Workflow Logic

When a user tries to log in, the process looks like this:

1. **Challenge:** Your server sends a random "challenge" to the user's device.
2. **Sign:** The user’s device uses its **Private Key** (which you never see)
   to sign that challenge.
3. **Verify:** The device sends the signature back. You use the **Public Key**
   in your database to verify that the signature is valid.


> **A Quick Tip on Security:**
> Unlike passwords, you don't need to "salt and hash" a public key.
> It’s public by design! However, you should still ensure your
> **Credential IDs** are protected against enumeration and that you are strictly
> validating the **Origin** and **RP ID** (Relying Party ID) during the
> handshake to prevent phishing.

