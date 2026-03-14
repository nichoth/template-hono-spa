# Show login state Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a desktop-only login status indicator next to the header avatar so the user can see whether they are authenticated and which account is active.

**Architecture:** Compute the login label from the restored session state in the client shell, then render it in the desktop header between the nav links and avatar. Keep the existing avatar/link structure untouched while styling the new text within the global layout CSS.

**Tech Stack:** Preact + @preact/signals-based client shell, global CSS bundle (Lightning CSS via Vite), Vitest for regression verification.

---

### Task 1: Update the client shell markup

**Files:**
- Modify: `src/client/index.ts`

**Step 1: Compute the login label**
- Add a `useComputed` that inspects `state.user.value.data`. When `authenticated` is true, return `logged in as ${data.user?.identifier}`; otherwise return `logged in as anonymous`. Default to the anonymous string while the request is pending.

**Step 2: Render the label in the header**
- Insert a new element (e.g., `<p class="login-status">${loginLabel.value}</p>`) between the `<${Nav}>` component and the avatar wrapper so it sits to the left of the blur hash avatar.

**Step 3: Run the baseline test suite**
- Run `npm test` to ensure the existing CI-friendly tests still pass with the new markup.

**Step 4: Commit this change**
- `git add src/client/index.ts`
- `git commit -m "feat: add header login status"`

### Task 2: Style the login label for desktop only

**Files:**
- Modify: `src/style.css`

**Step 1: Add `.login-status` styling**
- Ensure it inherits the nav link color, uses `font-size: 1rem` minimum, and includes spacing (e.g., margin or gap) so it sits naturally between the nav and avatar.

**Step 2: Hide on mobile**
- Wrap the rule with `@media (max-width: 679px)` (or the established nav breakpoint) so the login text is `display: none` on mobile to preserve the current layout while remaining visible on desktop.

**Step 3: Run the baseline test suite**
- Run `npm test` again to validate styling changes do not break tooling/linters.

**Step 4: Commit the CSS change**
- `git add src/style.css`
- `git commit -m "style: scope login status text"`

### Task 3: Verify and prepare for review

**Files:**
- None (final verification step)

**Step 1: Smoke test locally**
- Launch `npm run dev`, open the desktop header in a browser, and confirm the login label updates with mocked auth state (authenticated and anonymous). Ensure mobile viewports hide the text.

**Step 2: Run `npm test` once more**
- Expect the suite to pass as a final regression check.

**Step 3: Stage all remaining changes**
- `git add .` (or targeted files if any remain)

**Step 4: Commit full story for QA**
- `git commit -m "feat: show login state in header"`

**Step 5: Push branch if ready**
- `git push --set-upstream origin 030-show-login-state`
