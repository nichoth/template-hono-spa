import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import render from 'preact-render-to-string'
import { App } from '../app.js'
import { State, type SerializedState } from '../state.js'
import { Page } from '../components/page.js'
import manifestJson from '../../public/client/vite-manifest.json'

type Bindings = {
    ASSETS:Fetcher
    NODE_ENV?:string
}

interface ViteManifest {
    'index.html'?:{
        file:string
        css?:string[]
    }
}

const manifest:ViteManifest = manifestJson
let cachedAssets:{ css:string, js:string }|null = null

const app = new Hono<{ Bindings:Bindings }>()

app.use('/api/*', cors())

/**
 * Health check
 */
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        service: 'template-hono-preact',
    })
})

app.get('/health', c => {
    return c.json({ status: 'ok' })
})

/**
 * Page routes -- SSR with Preact, hydrated
 * on the client
 */
app.get('/', ssrPage)
app.get('/about', ssrPage)

/**
 * Serve static assets (frontend)
 */
app.all('*', (c) => {
    if (!(c.env?.ASSETS)) {
        return c.notFound()
    }

    return c.env.ASSETS.fetch(c.req.raw)
})

export default app

function getAssetPaths ():{ css:string, js:string } {
    if (cachedAssets) return cachedAssets

    const entry = manifest['index.html']
    if (entry) {
        cachedAssets = {
            js: `/${entry.file}`,
            css: entry.css?.[0] ?
                `/${entry.css[0]}` :
                ''
        }
        return cachedAssets
    }

    return {
        css: '/assets/index.css',
        js: '/assets/index.js',
    }
}

/**
 * SSR page handler.
 * Renders the app for any page route.
 */
async function ssrPage (c:Context<{ Bindings:Bindings }>) {
    const path = new URL(c.req.url).pathname
    const isDev = import.meta.env.DEV
    const assets = isDev ? undefined : getAssetPaths()

    const pageProps:SerializedState = {
        route: path,
        count: 5,
    }

    const state = await State(pageProps)

    const html = '<!DOCTYPE html>' + render(
        <Page
            title="Hono + Preact"
            pageProps={pageProps}
            isDev={isDev}
            assets={assets}
        >
            <App state={state} />
        </Page>
    )

    return c.html(html)
}
