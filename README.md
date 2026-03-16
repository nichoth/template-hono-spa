# template hono spa

A template for web apps with [Hono](https://hono.dev/) and
[Preact](https://preactjs.com/).

This is a Cloudflare worker that serves a client-rendered Preact app.
At build time, `vite build` (via `@cloudflare/vite-plugin`) produces:

1. A Cloudflare Worker bundle (the server)                                    
2. Client-side JS/CSS assets in public/

At request time, when the Worker handles app-page requests, it returns a shell
document with an empty `#root` plus client script tags. The app is rendered in
the browser by Preact.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Use](#use)
  * [Open a browser with visual test results](#open-a-browser-with-visual-test-results)
- [Develop](#develop)
- [Cloudflare](#cloudflare)
  * [D1](#d1)
  * [Websockets](#websockets)
- [Local Dev](#local-dev)
- [Deploy](#deploy)
  * [Staging Password Protection](#staging-password-protection)
- [Test](#test)
  * [Run tests](#run-tests)
  * [Testing passkeys](#testing-passkeys)
- [Claude](#claude)
  * [Example](#example)
  * [Superpowers](#superpowers)
- [openspec](#openspec)
  * [1. `openspec init`](#1-openspec-init)
- [Some links](#some-links)

<!-- tocstop -->

</details>

## Use

Use the template button in Github's UI, then start the docs:

```sh
mv ./README.example.md README.md
```

### Open a browser with visual test results

```sh
npm run test:open
```

## Develop

Start a Vite server at `localhost:8888`.

```sh
npm start
```

## Passwordlessness

We do passwordless via passkeys, aka the device's _biometric_ auth.

See the `passkey_credentials` table:

```js
{
    "id": "uuid (primary key)",
    "user_id": "uuid (foreign key → users)",
    "credential_id": "unique string from the authenticator",
    "public_key": "base64-encoded public key",
    "counter": 0,

    // a hint from the authenticator about how it communicates
    // The values come from the WebAuthn spec
    //
    // internal: built into the device
    //   (Touch ID, Face ID, Windows Hello, Android fingerprint)  
    // hybrid — cross-device auth via QR code / BLE
    //   (e.g. using your phone to authenticate on a desktop)
    //
    // Other possible values: usb, nfc, ble, smart-card
    "transports_json": "[\"internal\", \"hybrid\"]",

    // the WebAuthn concept of whether the passkey is tied to one device
    "device_type": "singleDevice | multiDevice",

    "backed_up": 0,  // a SQLite integer boolean (0/1)
    "status": "active",
    "created_at": 1710000000,
    "last_used_at": 1710001000
  }
```

## Cloudflare

This uses Cloudflare as web host and for some infratructure.

### D1

### Websockets


## Local Dev

Locally we are using [Vite](https://vite.dev/) as server. In the
[vite config](./vite.config.js) we use a plugin, `@cloudflare/vite-plugin`.
It integrates the cloudflare worker (the Hono app) with the vite server.
The `@cloudflare/vite-plugin` embeds a Cloudflare Worker runtime inside Vite's  
dev server. 

Vite gives us HMR and bundling. The Vite plugin runs the worker code, which
is why the worker server works locally.

Vite builds to `public/`, but we do not use that folder during development.

`npm start` is the canonical local entrypoint and should work from a clean
checkout. Missing generated `public/client/vite-manifest.json` should not
prevent local startup.

If startup prerequisites fail, the server now returns an actionable message
that includes a concrete next step.

## Deploy

### Staging Password Protection

The Cloudflare `staging` environment is protected with HTTP basic auth. This
only applies to the staging deploy flow:

```sh
wrangler deploy --env staging
```

Set the staging secrets in Cloudflare with these env variables:

```sh
wrangler secret put STAGING_USERNAME --env staging
wrangler secret put STAGING_PW --env staging
```

Generate a strong random password from the CLI before setting `STAGING_PW`. One
simple option is:

```sh
openssl rand -base64 32
```

Copy the generated value and use it when `wrangler secret put STAGING_PW --env staging`
prompts for the secret.

Recommended setup flow:

1. Choose the staging username you want to use.
2. Run `wrangler secret put STAGING_USERNAME --env staging`.
3. Generate a fresh password with `openssl rand -base64 32`.
4. Run `wrangler secret put STAGING_PW --env staging` and paste the generated password.
5. Deploy staging with `wrangler deploy --env staging`.

To rotate staging access later, generate a new password and update
`STAGING_PW` in the `staging` environment again. You only need to change
`STAGING_USERNAME` if you also want to rotate the username.

Do not reuse the checked-in example values from local files as real deployment
credentials.

## Test

### Run tests

This is both unit tests and integration tests.

```sh
npm test
```

### Testing passkeys

"Incognito" windows don't really work as a second device. You can use a
different chrome profile though.


## Claude

### Example

```
Use the Nitpicker agent to review this codebase 
```

or mention specific "agents" with the `@` symbol, ie `@Nitpciker

### Superpowers

[A Claude plugin](https://github.com/obra/superpowers) to make it better.

#### Install

```
/plugin marketplace add obra/superpowers-marketplace
```

```
/plugin install superpowers@superpowers-marketplace
```

#### How to Use

Highly recommended to use these slash commands in order:

##### Phase 1: Brainstorming (`/superpowers:brainstorm`)

Instead of writing code immediately, Claude acts as a Socratic architect.

How to use: `/superpowers:brainstorm`

```
"I want to add a user authentication system"
```

What happens: Claude will ask clarifying questions
(database choice, edge cases, auth providers) until it has enough information
to create a Design Document.

##### Phase 2: Planning (`/superpowers:write-plan`)

Once the design is approved, you convert it into a concrete checklist.

How to use: /superpowers:write-plan

What happens: Claude generates a PLAN.md with micro-tasks
(usually 2–5 minutes each). In recent versions (Claude Code v2.1.16+),
this integrates with native task management so you can see a progress bar.

##### Phase 3: Execution (`/superpowers:execute-plan`)

This is where the actual coding happens.

How to use:

```
/superpowers:execute-plan
```

What happens: Claude iterates through the plan. It often spawns sub-agents to
implement individual tasks, ensuring that one agent writes the code while
another (the "Reviewer") verifies it against the spec.

#### Key "Superpower" Skills

Once installed, many of these skills activate automatically based on
your requests:

**Test-Driven Development (TDD)**: If you ask Claude to fix a bug or add a
feature, it is instructed to write a failing test first (Red), implement the
fix (Green), and then cleanup (Refactor).

**Git Worktrees**: Superpowers can automatically create a git worktree for a new
feature. This allows you to work on multiple branches simultaneously without
clobbering your main working directory.

**Systematic Debugging**: Instead of guessing, Claude follows a 4-phase root
cause analysis process to trace bugs to their source before attempting a fix.

#### Pro-Tips for Success

The Session Start Hook: When you start a session, look for a message saying
`<session-start-hook>`. This confirms Superpowers is active. If Claude seems to
be ignoring the rules, remind it: "Use your superpowers for this task."

Reviewing Work: Because Superpowers often uses worktrees, the code might be in
a different folder than where you started. Use git worktree list to see where
Claude is currently working.

Manual Override: If a task is extremely simple and the "brainstorming" feels
like overkill, you can tell Claude: "Skip the brainstorm for this,
it's a one-line fix."

Check the Docs: The skill definitions are stored in markdown files.
If you want to see exactly how a skill works (e.g., the TDD rules),
you can ask Claude:

```
@/Users/yourname/.claude/plugins/cache/Superpowers/skills/test-driven-development/SKILL.md (the path may vary by OS).
```

#### The deprecated commands

```
Execute the plan
```

## [openspec](https://github.com/Fission-AI/OpenSpec/)

> We recommend Opus 4.5 and GPT 5.2 for both planning and implementation.

### 1. `openspec init`



---


## Superpowers

[An agentic skills framework & software development methodology that works.](https://github.com/obra/superpowers)

### The Basic Superpowers Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas
   through questions, explores alternatives, presents design in sections for
   validation. Saves design document.
2. **using-git-worktrees** - Activates after design approval. Creates isolated
   workspace on new branch, runs project setup, verifies clean test baseline.
3. **writing-plans** - Activates with approved design. Breaks work into
   bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.
4. **subagent-driven-development** or **executing-plans** - Activates with plan.
   Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.
5. **test-driven-development** - Activates during implementation. Enforces
   RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.
6. **requesting-code-review** - Activates between tasks. Reviews against plan,
   reports issues by severity. Critical issues block progress.
7. **finishing-a-development-branch** - Activates when tasks complete.
   Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows,
not suggestions.


---


## Some links

* [Verification-Driven Development (VDD)](https://gist.github.com/dollspace-gay/45c95ebfb5a3a3bae84d8bebd662cc25)
  (using `nitpicker` agent in Claude for this)
