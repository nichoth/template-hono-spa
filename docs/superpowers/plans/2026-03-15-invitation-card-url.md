# Invitation Card URL Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development
> (if subagents available) or superpowers:executing-plans to implement this plan.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each pending invitation's URL with a copy button inside the
invitation card.

**Architecture:** Pure UI change. The URL is constructed client-side as
`${location.origin}/add/${inv.inviteCode}` — no server or type changes
needed. The existing `invite-url-row` + `CopyButton` pattern (used for
the newly-created invite) is reused inside each invitation card.

**Tech Stack:** TypeScript, Preact + htm, `@substrate-system/copy-button`

---

## Chunk 1: Render URL row in each invitation card

### Task 1: Add URL row to `.invitation-item` template

**Files:**
- Modify: `src/client/routes/profile.ts:308-334`
- Modify: `src/client/routes/profile.css` (`.invitation-item` block)

The current card layout is:

```
[ invitation-info (name + expires) ]  [ Cancel button ]
```

The new layout should be:

```
[ invitation-info (name + expires)       ]  [ Cancel button ]
[ invite-url-row (code + copy button)    ]
```

The URL row spans the full width below the name/cancel row.
Change `.invitation-item` from `display:flex; align-items:center`
(single row) to `flex-direction:column` so the URL row sits below.
Wrap the existing info+cancel pair in a new `invitation-header` div
to keep them on one line.

- [ ] **Step 1: Update the template in `profile.ts`**

  Find the `<li class="invitation-item card" ...>` block
  (lines ~309–334) and replace it with:

  ```ts
  <li
      class="invitation-item card"
      key=${inv.inviteCode}
  >
      <div class="invitation-header">
          <div class="invitation-info">
              <span class="invitation-name">
                  ${inv.deviceName || 'Unnamed'}
              </span>
              <span class="invitation-expires">
                  Expires ${formatExpiration(inv.expiresAt)}
              </span>
          </div>
          <${SubstrateButton.TAG}
              class="invitation-cancel-btn"
              type="button"
              onClick=${() =>
                  onCancelInvite(inv.inviteCode)
              }
              disabled=${cancelPending.value ===
                  inv.inviteCode}
              spinning=${cancelPending.value ===
                  inv.inviteCode}
          >
              Cancel
          <//>
      </div>
      <div class="invite-url-row">
          <code class="invite-url card">
              ${location.origin}/add/${inv.inviteCode}
          </code>
          <${CopyButton.TAG}
              payload=${`${location.origin}/add/${inv.inviteCode}`}
          ><//>
      </div>
  </li>
  ```

- [ ] **Step 2: Update CSS in `profile.css`**

  Change `.invitation-item` to column layout and add
  `.invitation-header`:

  ```css
  & .invitation-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  & .invitation-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
  }
  ```

  (`.invitation-info`, `.invitation-name`, `.invitation-expires`,
  `.invitation-cancel-btn` rules are unchanged.)

- [ ] **Step 3: Run the tests**

  ```sh
  npm test 2>&1 | tail -5
  ```

  Expected: `Tests: 0 failed | N passed`

- [ ] **Step 4: Commit**

  ```sh
  git add src/client/routes/profile.ts \
          src/client/routes/profile.css
  git commit -m "feat: show invite URL with copy button on each invitation card"
  ```
