# template hono preact

A template for web apps with [Hono](https://hono.dev/) and
[Preact](https://preactjs.com/).

This is a server that serves a client-rendered Preact app shell.
At build time, `vite build` (via `@cloudflare/vite-plugin`) produces:
1. A Cloudflare Worker bundle (the server)                                    
2. Client-side JS/CSS assets in public/

At request time, when the Worker handles a GET `/` request, it returns a shell
document with an empty `#root`, initial state, and client script tags. The app
is rendered in the browser by Preact.

```sh
export CODEX_HOME=/Users/nick/code/template-hono-spa/.codex
```

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

<!-- tocstop -->

</details>

## Use

Use the template button in Github's UI, then start the docs:

```sh
mv ./README.example.md README.md
```

## Test

### Run tests

This is both unit tests and integration tests.

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


## Rendering

* Server returns the HTML shell only
* Client script loads and renders the app into `#root`
* Route state is sourced from the browser URL

---

## Notes

I do not understand why we need to run `vite build` twice, but we do.

The empty object in `public/client/vite-manifest.json` is necessary because
the server depends on it when we run the build process.

```js
// package.json
{
  "scripts": {
    "build": "rm -rf ./public && mkdir -p ./public/client && echo '{}' > ./public/client/vite-manifest.json && vite build && vite build",
  }
}
```
