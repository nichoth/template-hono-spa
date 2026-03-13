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
