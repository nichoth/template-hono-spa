# Add Device

Add another device to your account. The process must be initialized by an
existing device. That way we avoid a DOS/abuse vector.

1. Existing device must go to `/profile` and click the button "add device"
2. This calls the backend, and the backend creates a record for a pending new
   device. The pending new device has a short id associated with it
   (6 digit numeric), which is used to create the unique URL.
3. The existing device shows a link like `https://example.com/my-name/add/123456`,
   with an icon button to copy the link to clipboard.
4. The backend creates a serverside handler that listend for that route,
   and when it gets a request from a new device with passkey info to that route,
   it adds a DB record for the new device, associating it with the user who
   owns the original/existing device.
5. The new device visits the URL and completes a passkey registration.
   Our backend records the new passkey credential info, and links the new
   device to the account.
