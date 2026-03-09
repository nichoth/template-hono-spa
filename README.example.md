# a project

Description here.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Develop](#develop)
  * [Local Dev](#local-dev)
- [Components](#components)
  * [`page.tsx`](#pagetsx)
- [The Datastar SSR pattern](#the-datastar-ssr-pattern)

<!-- tocstop -->

</details>

## Test

### Run tests

```sh
npm test
```

### Open a browser with visual test results

```sh
npm run test:ui
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
is why the worker works locally.

Vite builds to `public/`, but we do not use that folder during development.


## Components

In the worker file (`./src/server/index.tsx`), it checks if we are in local dev
or production. In dev, `ASSETS` doesn't exist; it returns `notFound()` and Vite
handles it. In production, `ASSETS` does exist, so it serves the static asset.

When you run npm start, the Cloudflare Vite plugin routes requests to your
Hono server at `src/server/index.tsx:126`, which renders the Page component.
This Page component uses the `.tsx` components (TimestampCard, GreetingCard,
CounterCard, QuoteCard) which are server-side rendered.


### `page.tsx`

The `page.tsx` is a layout skeleton that accepts props.

```ts
export const Page:FC<PropsWithChildren<PageProps>> = ({
    title,
    signals = {},
    children
})
```

Any site pages should extend this template, and pass in content and signals.
An example is [./src/components/home-page.tsx](./src/components/home-page.tsx).

---

## The Datastar SSR pattern

* Server renders the full HTML with components
* `data-signals` initializes the reactive state
* Datastar library (loaded via CDN) handles client-side reactivity
* API endpoints return SSE responses that update signals

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
