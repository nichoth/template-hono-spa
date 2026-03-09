import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import { type AssetPaths, resolveStartupAssets } from './startup-assets.js'
import { formatStartupFailure } from './startup-errors.js'

type Bindings = {
    ASSETS?:Fetcher
    NODE_ENV?:string
}

let cachedAssets:AssetPaths|null = null

const app = new Hono<{ Bindings:Bindings }>()

app.use('/api/*', cors())

app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        service: 'template-hono-preact',
    })
})

app.get('/health', c => {
    return c.json({ status: 'ok' })
})

app.get('/', shellPage)
app.get('/about', shellPage)

app.all('*', (c) => {
    if (!(c.env?.ASSETS)) {
        return c.notFound()
    }

    return c.env.ASSETS.fetch(c.req.raw)
})

export default app

async function getAssetPaths (
    c:Context<{ Bindings:Bindings }>
):Promise<AssetPaths> {
    if (cachedAssets) return cachedAssets

    const result = await resolveStartupAssets(c.env?.ASSETS)
    if (result.warning) {
        console.warn(
            formatStartupFailure({
                cause: result.warning,
                remediation:
                    'Run `npm start` for local dev or '
                    + '`npm run build` before production deploys.'
            })
        )
    }

    cachedAssets = result.assets
    return cachedAssets
}

async function shellPage (c:Context<{ Bindings:Bindings }>) {
    try {
        const isDev = import.meta.env.DEV
        const assets = isDev ?
            { css: '/src/style.css', js: '/src/client/index.tsx' } :
            await getAssetPaths(c)

        if (c.req.header('x-startup-prereq-fail') === '1') {
            throw new Error(
                'Required startup prerequisite is unavailable.'
            )
        }

        const html = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '<meta charset="UTF-8" />',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            '<title>Hono + Preact</title>',
            `<link rel="stylesheet" href="${assets.css || '/assets/index.css'}" />`,
            '</head>',
            '<body>',
            '<div id="root"></div>',
            `<script type="module" src="${assets.js || '/assets/index.js'}"></script>`,
            '</body>',
            '</html>',
        ].join('')

        return c.html(html)
    } catch (err) {
        const cause = err instanceof Error ?
            err.message :
            'Unknown startup error.'

        const message = formatStartupFailure({
            cause,
            remediation:
                'Check local prerequisites and rerun `npm start`.'
        })

        return c.text(message, 500)
    }
}
