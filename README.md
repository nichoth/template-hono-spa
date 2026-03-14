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
  * [Local Dev](#local-dev)
- [Deploy](#deploy)
  * [Staging Password Protection](#staging-password-protection)
- [Test](#test)
  * [Run tests](#run-tests)
- [Rendering](#rendering)

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

## Cloduflare

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

## Claude

```
 Use the Nitpicker agent to review this codebase 
```
