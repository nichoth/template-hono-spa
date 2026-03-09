# template hono preact

A template for web apps with [Hono](https://hono.dev/) and
[Preact](https://preactjs.com/).

This is a server that renders JSX with `preact-render-to-string`.
At build time, `vite build` (via `@cloudflare/vite-plugin`) produces:
1. A Cloudflare Worker bundle (the server)                                    
2. Client-side JS/CSS assets in public/

At request time, when the Worker handles a GET `/` request, it SSRs the page.
`preact-render-to-string` renders `<App initialCount={5} />` into HTML, the Page
component wraps it in a full document, and the __INITIAL_STATE__ script tag
is injected. The server sets the initial count state to `5`.


<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Use](#use)
- [Test](#test)
  * [Run tests](#run-tests)
  * [Open a browser with visual test results](#open-a-browser-with-visual-test-results)
- [Develop](#develop)
  * [Local Dev](#local-dev)
- [Components](#components)
  * [`page.tsx`](#pagetsx)
- [The SSR + Hydration Pattern](#the-ssr--hydration-pattern)
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


## Components

In the worker file (`./src/server/index.tsx`), it checks if we are in local dev
or production. In dev, `ASSETS` doesn't exist; it returns `notFound()` and Vite
handles it. In production, `ASSETS` does exist, so it serves the static asset.

When you run `npm start`, the Cloudflare Vite plugin routes requests
to your Hono server at
[`src/server/index.tsx`](./src/server/index.tsx), which renders the
`Page` component. The shared `App` component (containing `Counter`,
`Card`) is server-side rendered into that page.

### `page.tsx`

The `page.tsx` is a layout skeleton that accepts props.

```ts
export function Page ({
    title,
    appProps,
    isDev = false,
    assets,
    children
}:PageProps)
```

It injects `appProps` as `window.__INITIAL_STATE__` so the client
can hydrate with the same data.

---

## The SSR + Hydration Pattern

* Server renders the full HTML with Preact components
  via `preact-render-to-string`
* `window.__INITIAL_STATE__` passes initial props to the client
* The client calls `hydrate()` to attach event handlers
  to the existing DOM

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
