import { type Context, Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { cors } from 'hono/cors'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import {
    credentialsMatch,
    parseBasicAuthHeader,
} from './basic-auth.js'
import { resolveDeploymentContext } from './deployment-context.js'
import { unauthorizedBasicAuthResponse } from './access-response.js'
import { type AssetPaths, resolveStartupAssets } from './startup-assets.js'
import { formatStartupFailure } from './startup-errors.js'
import {
    AUTH_SESSION_COOKIE,
    AuthError,
    createAuthService,
    type EmailConfirmationRequest,
} from './auth/index.js'

type Bindings = {
    ASSETS?:Fetcher
    AUTH_DB:D1Database
    NODE_ENV?:string
    DEPLOY_BRANCH?:string
    MAIN_BRANCH?:string
    STAGING_USERNAME?:string
    STAGING_PW?:string
    BASIC_AUTH_REALM?:string
    AUTH_SESSION_TTL_SECONDS?:string
}

let cachedAssets:AssetPaths|null = null

const app = new Hono<{ Bindings:Bindings }>()
const authService = createAuthService()
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
            c.env?.STAGING_USERNAME,
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

app.post('/api/auth/register/start', async (c) => {
    try {
        const body = await c.req.json<{
            identifier:string;
            displayName?:string;
        }>()

        const result = await authService.startRegistration(
            c.env.AUTH_DB,
            c.req.url,
            body,
        )

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/auth/register/finish', async (c) => {
    try {
        const body = await c.req.json<{
            challengeReference:string;
            credential:unknown;
        }>()

        const result = await authService.finishRegistration(
            c.env.AUTH_DB,
            c.req.url,
            body as never,
        )

        logLocalConfirmUrl(
            c.req.url,
            result.response.identifier,
            result.confirmationCode,
        )

        return c.json(result.response, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/auth/passkey/register', async (c) => {
    try {
        const body = await c.req.json<{
            challengeReference:string;
            credential:unknown;
        }>()

        const result = await authService.finishRegistration(
            c.env.AUTH_DB,
            c.req.url,
            body as never,
        )

        logLocalConfirmUrl(
            c.req.url,
            result.response.identifier,
            result.confirmationCode,
        )

        return c.json(result.response, 200)
    } catch (err) {
        return authErrorResponse(c, err as Error)
    }
})

app.post('/api/confirm', async (c) => {
    try {
        const body = await c.req.json<EmailConfirmationRequest>()
        const result = await authService.confirmEmail(
            c.env.AUTH_DB,
            body,
        )

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/auth/login/start', async (c) => {
    try {
        const body = await c.req.json<{
            identifier:string;
        }>()

        const result = await authService.startAuthentication(
            c.env.AUTH_DB,
            c.req.url,
            body,
        )

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/auth/login/finish', async (c) => {
    try {
        const body = await c.req.json<{
            challengeReference:string;
            credential:unknown;
        }>()

        const result = await authService.finishAuthentication(
            c.env.AUTH_DB,
            c.req.url,
            body as never,
        )

        setSessionCookie(c, result.sessionToken)
        return c.json(result.response, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/auth/passkey/login', async (c) => {
    try {
        const body = await c.req.json<{
            challengeReference:string;
            credential:unknown;
        }>()

        const result = await authService.finishAuthentication(
            c.env.AUTH_DB,
            c.req.url,
            body as never,
        )

        setSessionCookie(c, result.sessionToken)
        return c.json(result.response, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.get('/api/auth/passkey/devices', async (c) => {
    try {
        const sessionToken = getCookie(
            c, AUTH_SESSION_COOKIE,
        )
        const session =
            await authService.getCurrentSession(
                c.env.AUTH_DB, sessionToken,
            )
        if (!session.authenticated) {
            return c.json({
                error: 'unauthenticated',
                message: 'Session is required.',
            }, 401)
        }

        const devices =
            await authService.listRegisteredDevices(
                c.env.AUTH_DB,
                session.user.id,
            )

        return c.json(devices.map(device => ({
            deviceId: device.id,
            credentialId: device.credential_id,
            credentialName: device.credential_name,
            aaguid: device.aaguid,
            transports: device.transports_json ?
                JSON.parse(device.transports_json) :
                [],
            createdAt: new Date(
                device.created_at,
            ).toISOString(),
            lastUsedAt: device.last_used_at ?
                new Date(
                    device.last_used_at,
                ).toISOString() :
                null,
            isRevoked: Boolean(device.is_revoked),
        })), 200)
    } catch (err) {
        return authErrorResponse(c, err as Error)
    }
})

app.patch(
    '/api/auth/passkey/devices/:deviceId/revoke',
    async (c) => {
        try {
            const sessionToken = getCookie(
                c, AUTH_SESSION_COOKIE,
            )
            const session =
                await authService.getCurrentSession(
                    c.env.AUTH_DB, sessionToken,
                )
            if (!session.authenticated) {
                return c.json({
                    error: 'unauthenticated',
                    message: 'Session is required.',
                }, 401)
            }

            const deviceId = c.req.param('deviceId')
            await authService.revokeRegisteredDevice(
                c.env.AUTH_DB,
                session.user.id,
                deviceId,
            )

            return c.body(null, 204)
        } catch (err) {
            return authErrorResponse(c, err as Error)
        }
    },
)

app.post('/api/auth/passkey/devices/invite', async (c) => {
    try {
        const sessionToken = getCookie(
            c, AUTH_SESSION_COOKIE,
        )
        const session =
            await authService.getCurrentSession(
                c.env.AUTH_DB, sessionToken,
            )
        if (!session.authenticated) {
            return c.json({
                error: 'unauthenticated',
                message: 'Session is required.',
            }, 401)
        }
        if (session.loginMethod !== 'passkey') {
            return c.json({
                error: 'not_passkey_user',
                message: 'Only passkey accounts '
                    + 'can add devices.',
            }, 403)
        }

        const body = await c.req.json<{
            deviceName:string;
        }>()

        const result =
            await authService.createDeviceInvitation(
                c.env.AUTH_DB,
                c.req.url,
                session.user.id,
                body.deviceName,
            )

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.get(
    '/api/auth/passkey/devices/invites',
    async (c) => {
        try {
            const sessionToken = getCookie(
                c, AUTH_SESSION_COOKIE,
            )
            const session =
                await authService.getCurrentSession(
                    c.env.AUTH_DB, sessionToken,
                )
            if (!session.authenticated) {
                return c.json({
                    error: 'unauthenticated',
                    message: 'Session is required.',
                }, 401)
            }

            const invitations =
                await authService
                    .listDeviceInvitations(
                        c.env.AUTH_DB,
                        session.user.id,
                    )

            return c.json(invitations, 200)
        } catch (err) {
            return authErrorResponse(c, err)
        }
    },
)

app.delete(
    '/api/auth/passkey/devices/invite/:inviteCode',
    async (c) => {
        try {
            const sessionToken = getCookie(
                c, AUTH_SESSION_COOKIE,
            )
            const session =
                await authService.getCurrentSession(
                    c.env.AUTH_DB, sessionToken,
                )
            if (!session.authenticated) {
                return c.json({
                    error: 'unauthenticated',
                    message: 'Session is required.',
                }, 401)
            }

            const inviteCode =
                c.req.param('inviteCode')
            await authService
                .cancelDeviceInvitation(
                    c.env.AUTH_DB,
                    session.user.id,
                    inviteCode,
                )

            return c.body(null, 204)
        } catch (err) {
            return authErrorResponse(c, err)
        }
    },
)

app.get(
    '/api/auth/passkey/devices/invite/:code',
    async (c) => {
        try {
            const { code } = c.req.param()
            const invitation =
                await authService.getInvitationInfo(
                    c.env.AUTH_DB,
                    code,
                )
            return c.json(invitation, 200)
        } catch (err) {
            return authErrorResponse(c, err)
        }
    },
)

app.post(
    '/api/auth/passkey/devices/invite/:code/claim/start',
    async (c) => {
        try {
            const code = c.req.param('code')
            const result =
                await authService.startInviteClaim(
                    c.env.AUTH_DB,
                    c.req.url,
                    code,
                )

            return c.json(result, 200)
        } catch (err) {
            return authErrorResponse(c, err)
        }
    },
)

app.post(
    '/api/auth/passkey/devices/invite/:code/claim/finish',
    async (c) => {
        try {
            const code = c.req.param('code')
            const body = await c.req.json<{
                challengeReference:string;
                credential:unknown;
            }>()

            const result =
                await authService.finishInviteClaim(
                    c.env.AUTH_DB,
                    c.req.url,
                    code,
                    body as never,
                )

            return c.json(result, 200)
        } catch (err) {
            return authErrorResponse(c, err)
        }
    },
)

app.get('/api/session', async (c) => {
    try {
        const sessionToken = getCookie(c, AUTH_SESSION_COOKIE)
        const result = await authService.getCurrentSession(
            c.env.AUTH_DB,
            sessionToken,
        )

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
})

app.post('/api/logout', async (c) => {
    try {
        const sessionToken = getCookie(c, AUTH_SESSION_COOKIE)
        const result = await authService.logout(
            c.env.AUTH_DB,
            sessionToken,
        )

        deleteCookie(c, AUTH_SESSION_COOKIE, {
            path: '/',
        })

        return c.json(result, 200)
    } catch (err) {
        return authErrorResponse(c, err)
    }
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
        console.log('**NOT ASSETS**')
        return c.notFound()
    }

    return c.env.ASSETS.fetch(c.req.raw)
}

function setSessionCookie (
    c:Context<{ Bindings:Bindings }>,
    sessionToken:string,
) {
    // 1 month
    const ttlSeconds = Number(c.env.AUTH_SESSION_TTL_SECONDS || '2592000')

    setCookie(c, AUTH_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
        secure: !isLocalhostRequest(c.req.url),
        maxAge: ttlSeconds,
    })
}

function authErrorResponse (
    c:Context<{ Bindings:Bindings }>,
    err:unknown,
) {
    if (err instanceof AuthError) {
        return c.json({
            error: err.code,
            message: err.message,
        }, err.status as ContentfulStatusCode)
    }

    const message = err instanceof Error ?
        err.message :
        'Unknown authentication error.'

    return c.json({
        error: 'internal_error',
        message,
    }, 500)
}

function resolveRequestBranch (c:Context<{ Bindings:Bindings }>):string|undefined {
    if (c.env?.NODE_ENV === 'test') {
        const overrideBranch = c.req.header('x-deploy-branch')
        if (overrideBranch) return overrideBranch
    }

    if (isLocalhostRequest(c.req.url)) {
        return c.env?.MAIN_BRANCH || 'main'
    }

    return c.env?.DEPLOY_BRANCH
}

function isLocalhostRequest (requestUrl:string):boolean {
    const hostname = new URL(requestUrl).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
}

function logLocalConfirmUrl (
    requestUrl:string,
    identifier:string,
    confirmationCode:string,
):void {
    if (!isLocalhostRequest(requestUrl)) return
    const origin = new URL(requestUrl).origin
    const confirmUrl = `${origin}/confirm/${encodeURIComponent(confirmationCode)}`
    console.log(
        '\n[auth] Account created for',
        identifier
    )
    console.log('[auth] Confirm URL:', confirmUrl, '\n')
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

    console.log(
        '[getAssetPaths] ASSETS binding:',
        c.env?.ASSETS ? 'present' : 'missing'
    )
    const result = await resolveStartupAssets(c.env?.ASSETS)
    if (result.warning) {
        console.warn(
            formatStartupFailure({
                cause: result.warning,
                remediation:
                    'Run `npm start` for local dev or '
                    + '`npm run build` and verify `public/client/` assets are deployed.'
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
            `<link rel="stylesheet" href="${assets.css || '/client/index.css'}" />`,
            '</head>',
            '<body>',
            '<div id="root"></div>',
            `<script type="module" src="${assets.js || '/client/index.js'}"></script>`,
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
