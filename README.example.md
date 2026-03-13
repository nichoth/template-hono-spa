# Project Name

A template for web apps with [Hono](https://hono.dev/) and
[Preact](https://preactjs.com/).

This is a server for a client-rendered Preact app and API endpoints.
At build time, `vite build` (via `@cloudflare/vite-plugin`) produces:
1. A Cloudflare Worker bundle (the server)
2. Client-side JS/CSS assets in `public/`

At request time, when the Worker handles app-page requests, it returns a shell
document with an empty `#root` plus client script tags. The app is rendered in
the browser by Preact.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Use](#use)
- [Test](#test)
  * [Run tests](#run-tests)
  * [Open a browser with visual test results](#open-a-browser-with-visual-test-results)
- [Develop](#develop)
  * [Local Dev](#local-dev)
- [Deploy](#deploy)
  * [Backend Auth](#backend-auth)
  * [Passkey Login Test Flow](#passkey-login-test-flow)
- [Rendering](#rendering)
- [Notes](#notes)
  * [Create a Random String (eg a password)](#create-a-random-string-eg-a-password)

<!-- tocstop -->

</details>

## Use

Use the template button in GitHub's UI, then start the docs:

```sh
mv ./README.example.md README.md
```

## Test

### Run tests

This runs both unit tests and integration tests.

```sh
npm test
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

### Local Dev

Locally we are using [Vite](https://vite.dev/) as server. In the
[vite config](./vite.config.js) we use the `@cloudflare/vite-plugin`.
It integrates the Cloudflare Worker (the Hono app) with the Vite server.
The plugin embeds a Cloudflare Worker runtime inside Vite's dev server.

Vite gives us HMR and bundling. The Vite plugin runs the worker code.

Vite builds to `public/`, but we do not use that folder during development.

## Deploy

### Backend Auth

Passkey auth uses a Cloudflare D1 database bound as `AUTH_DB`.

The checked-in [`wrangler.jsonc`](./wrangler.jsonc) and
[`wrangler.test.jsonc`](./wrangler.test.jsonc) already expect that binding
name. Before you can use registration, login, session restore, or logout, you
need to create real D1 databases and replace the placeholder database IDs.

Create the production/local database:

```sh
wrangler d1 create template-hono-spa-auth
```

Create the staging database:

```sh
wrangler d1 create staging-template-hono-spa-auth
```

Update [`wrangler.jsonc`](./wrangler.jsonc):

1. Replace the placeholder `database_id` for the default `AUTH_DB` binding.
2. Replace the placeholder `database_id` for `env.staging.AUTH_DB`.
3. Keep the binding name as `AUTH_DB` so the Worker and tests continue to match.

Apply the auth schema migration to the default database:

```sh
wrangler d1 migrations apply template-hono-spa-auth
```

Apply the auth schema migration to staging:

```sh
wrangler d1 migrations apply staging-template-hono-spa-auth --env staging
```

For local development, start the app after the D1 binding is configured:

```sh
npm start
```

Cloudflare setup checklist:

1. Create the default D1 database with
   `wrangler d1 create template-hono-spa-auth`.
2. Create the staging D1 database with
   `wrangler d1 create staging-template-hono-spa-auth`.
3. Replace the placeholder `database_id` values in
   [`wrangler.jsonc`](./wrangler.jsonc).
4. Keep the binding name `AUTH_DB` in default and staging config.
5. Apply the checked-in migration from
   [`migrations/0001_auth_schema.sql`](./migrations/0001_auth_schema.sql)
   to each database.
6. Start local dev with `npm start` or deploy with
   `wrangler deploy` / `wrangler deploy --env staging`.

For tests, [`wrangler.test.jsonc`](./wrangler.test.jsonc) provisions an
isolated `AUTH_DB` binding and the test runner applies the same schema shape,
so no extra local test-only setup is required beyond installing dependencies.

Current backend auth services:

1. `AUTH_DB` D1 binding for users, credentials, challenges, sessions,
   and auth events
2. Cookie-based session handling backed by D1
3. Existing optional staging basic-auth secrets for the `staging` environment

No extra auth secret is currently required for session signing because sessions
are stored server-side in D1 with opaque random tokens.

### Passkey Login Test Flow

1. Frontend:
   - `/login` can create an account with a passkey
   - `/login` can sign in with an existing passkey
   - the client restores the current session on load
   - the authenticated view supports sign-out
2. Backend:
   - `POST /api/auth/register/start`
   - `POST /api/auth/register/finish`
   - `POST /api/auth/login/start`
   - `POST /api/auth/login/finish`
   - `GET /api/session`
   - `POST /api/logout`

How to test passkey auth locally:

1. Complete the Cloudflare auth backend setup above so `AUTH_DB`
   points at a real local/default D1 database.
2. Run `npm start`.
3. Open `http://localhost:8888/login`.
4. Leave the selector on `Passkey`.
5. Enter a new email or username.
6. Optionally enter a display name.
7. Click `Create account with passkey`.
8. Complete the browser/device passkey prompt.
9. Confirm the page shows the authenticated state.
10. Refresh the page and confirm the session is restored.
11. Click `Sign out` and confirm the authenticated state disappears.
12. Enter the same identifier again.
13. Click `Continue with passkey`.
14. Complete the browser/device passkey prompt.
15. Confirm you are signed in again.

What to verify during testing:

1. Registration creates a user, stored passkey credential, and session in D1.
2. Login works with one valid passkey ceremony for an existing account.
3. `GET /api/session` returns authenticated state after login and
   unauthenticated state after logout.
4. `POST /api/logout` invalidates the previous session.
5. The same `AUTH_DB` binding name is used in local, test,
   and staging environments.


## Rendering

* Server returns the HTML shell only
* Client script loads and renders the app into `#root`
* Route state is sourced from the browser URL
* Client route definitions live in `src/client/routes/index.ts`
* Server keeps ownership of `/api/*` and `/health`

## Notes

### Create a Random String (eg a password)

```sh
openssl rand -base64 32
```
