import { type Context, Hono } from 'hono'
import { cors } from 'hono/cors'
import {
    credentialsMatch,
    parseBasicAuthHeader,
} from './basic-auth.js'
import { resolveDeploymentContext } from './deployment-context.js'
import { unauthorizedBasicAuthResponse } from './access-response.js'
import { type AssetPaths, resolveStartupAssets } from './startup-assets.js'
import { formatStartupFailure } from './startup-errors.js'

type Bindings = {
    ASSETS?:Fetcher
    NODE_ENV?:string
    DEPLOY_BRANCH?:string
    MAIN_BRANCH?:string
    STAGING_BASIC_AUTH_USERNAME?:string
    STAGING_PW?:string
    BASIC_AUTH_REALM?:string
}

let cachedAssets:AssetPaths|null = null

const app = new Hono<{ Bindings:Bindings }>()
const FOOBAR_RESPONSE = {
    ok: true,
    route: '/api/foobar',
    message: 'foobar',
} as const

app.use('*', async (c, next) => {
    const context = resolveDeploymentContext(
        resolveRequestBranch(c),
        c.env?.MAIN_BRANCH,
    )

    if (!context.requiresAuth) {
        await next()
        return
    }

    const credential = parseBasicAuthHeader(
        c.req.header('authorization')
    )

    if (
        credentialsMatch(
            credential,
            c.env?.STAGING_BASIC_AUTH_USERNAME,
            c.env?.STAGING_PW,
        )
    ) {
        await next()
        return
    }

    return unauthorizedBasicAuthResponse(c.env?.BASIC_AUTH_REALM)
})

app.use('/api/*', cors())

app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        service: 'template-hono-preact',
    })
})

app.get('/api/foobar', (c) => {
    return c.json(FOOBAR_RESPONSE, 200)
})

app.all('/api/foobar', (c) => {
    return c.json(
        { error: 'method_not_allowed' },
        405,
    )
})

app.get('/health', c => {
    return c.json({ status: 'ok' })
})

app.get('*', async (c) => {
    const pathname = new URL(c.req.url).pathname

    if (shouldServeShell(pathname)) {
        return shellPage(c)
    }

    return fetchAsset(c)
})

app.all('*', (c) => {
    return fetchAsset(c)
})

export default app

function fetchAsset (c:Context<{ Bindings:Bindings }>) {
    if (!(c.env?.ASSETS)) {
        return c.notFound()
    }

    return c.env.ASSETS.fetch(c.req.raw)
}

function resolveRequestBranch (c:Context<{ Bindings:Bindings }>):string|undefined {
    if (c.env?.NODE_ENV === 'test') {
        const overrideBranch = c.req.header('x-deploy-branch')
        if (overrideBranch) return overrideBranch
    }

    return c.env?.DEPLOY_BRANCH
}

function shouldServeShell (pathname:string):boolean {
    if (pathname === '/health') return false
    if (pathname === '/api' || pathname.startsWith('/api/')) return false
    if (
        pathname.startsWith('/@')
        || pathname.startsWith('/__vite')
        || pathname.startsWith('/node_modules/')
    ) {
        return false
    }

    return !looksLikeAssetPath(pathname)
}

function looksLikeAssetPath (pathname:string):boolean {
    return /\.[a-z0-9]+$/i.test(pathname)
}

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
            { css: '/src/style.css', js: '/src/client/index.ts' } :
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
