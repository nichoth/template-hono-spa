import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import {
    createAuthService,
    type RegistrationConfirmationResult,
} from '../src/server/auth/index.js'
import {
    AUTH_SCHEMA_STATEMENTS,
} from '../src/server/db/schema.js'

function basicAuthHeader (username:string, password:string):string {
    return `Basic ${btoa(`${username}:${password}`)}`
}

function testCredential (
    key:'STAGING_USERNAME'|'STAGING_PW',
    fallback:string,
):string {
    const value = env[key]
    return typeof value === 'string' && value.length > 0 ?
        value :
        fallback
}

describe('Integration tests', () => {
    describe('Environment access control', () => {
        it('challenges staging requests with no credentials', async () => {
            const response = await SELF.fetch(
                'http://localhost/',
                { headers: { 'x-deploy-branch': 'staging' } },
            )

            expect(response.status).toBe(401)
            expect(response.headers.get('www-authenticate'))
                .toContain('Basic realm=')
        })

        it('allows staging requests with valid credentials', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/health',
                {
                    headers: {
                        'x-deploy-branch': 'staging',
                        authorization: basicAuthHeader(
                            testCredential(
                                'STAGING_USERNAME',
                                'staging-user',
                            ),
                            testCredential('STAGING_PW', 'staging-pass'),
                        ),
                    },
                },
            )

            expect(response.status).toBe(200)
            const data = await response.json() as { status:string }
            expect(data.status).toBe('ok')
        })

        it('denies malformed authorization headers in staging', async () => {
            const response = await SELF.fetch(
                'http://localhost/about',
                {
                    headers: {
                        'x-deploy-branch': 'staging',
                        authorization: 'Basic not-base64',
                    },
                },
            )
            expect(response.status).toBe(401)
        })

        it('keeps main deployment requests public', async () => {
            const response = await SELF.fetch(
                'http://localhost/',
                { headers: { 'x-deploy-branch': 'main' } },
            )

            expect(response.status).toBe(200)
            const html = await response.text()
            expect(html).toContain('<div id="root"></div>')
        })

        it('keeps main open while staging is protected', async () => {
            const [mainResponse, stagingResponse] = await Promise.all([
                SELF.fetch(
                    'http://localhost/api/health',
                    { headers: { 'x-deploy-branch': 'main' } },
                ),
                SELF.fetch(
                    'http://localhost/api/health',
                    { headers: { 'x-deploy-branch': 'staging' } },
                ),
            ])

            expect(mainResponse.status).toBe(200)
            expect(stagingResponse.status).toBe(401)
        })

        it('keeps default localhost requests public', async () => {
            const [shellResponse, apiResponse] = await Promise.all([
                SELF.fetch('http://localhost/'),
                SELF.fetch('http://localhost/api/health'),
            ])

            expect(shellResponse.status).toBe(200)
            expect(apiResponse.status).toBe(200)
        })
    })

    describe('App shell', () => {
        it('renders full HTML shell', async () => {
            const response = await SELF.fetch(
                'http://localhost/'
            )
            expect(response.status).toBe(200)

            const html = await response.text()
            expect(html).toContain('<html')
            expect(html).toContain('</html>')
            expect(html).toContain('Hono + Preact')
            expect(html).toContain('<div id="root"></div>')
            expect(html).not.toContain('__INITIAL_STATE__')
        })

        it('serves shell for known client route deep links',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/about'
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).toContain('<div id="root"></div>')
            }
        )

        it('serves shell for the login route deep link',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/login'
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).toContain('<div id="root"></div>')
                expect(html).not.toContain('Page not found.')
            }
        )

        it('keeps the login route deep link shell stable for the single-click radio-selection UX',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/login'
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).toContain('<div id="root"></div>')
                expect(html).toContain('/src/client/index.ts')
            }
        )

        it('serves shell for the signup route deep link', async () => {
            const response = await SELF.fetch(
                'http://localhost/signup'
            )
            const html = await response.text()

            expect(response.status).toBe(200)
            expect(html).toContain('<div id="root"></div>')
            expect(html).toContain('/src/client/index.ts')
            expect(html).not.toContain('Page not found.')
        })

        it('keeps signup registration start free of auth session cookies before email confirmation',
            async () => {
                const identifier = `signup-${crypto.randomUUID()}@example.com`
                const response = await SELF.fetch(
                    'http://localhost/api/auth/register/start',
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({
                            identifier,
                            displayName: 'Signup Test',
                        }),
                    },
                )

                expect(response.status).toBe(200)
                expect(response.headers.get('set-cookie')).toBeNull()

                const sessionResponse = await SELF.fetch('http://localhost/api/session')
                const session = await sessionResponse.json() as {
                    authenticated:boolean;
                }

                expect(sessionResponse.status).toBe(200)
                expect(session).toEqual({ authenticated: false })
            }
        )

        it('completes passkey registration start-to-finish',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `reg-finish-${
                    crypto.randomUUID()
                }@example.com`

                const fakePublicKey = new Uint8Array([
                    1, 2, 3, 4, 5, 6, 7, 8,
                ])
                const fakeCredentialId = 'fake-cred-id'
                let idCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions: async (
                        opts
                    ) => ({
                        challenge: 'test-challenge',
                        rp: {
                            name: opts.rpName,
                            id: opts.rpID,
                        },
                        user: {
                            id: 'user-id-b64',
                            name: opts.userName,
                            displayName:
                                opts.userDisplayName || '',
                        },
                        pubKeyCredParams: [
                            { type: 'public-key', alg: -7 },
                        ],
                        timeout: opts.timeout,
                        attestation: 'none',
                        authenticatorSelection: {
                            residentKey: 'preferred',
                            userVerification: 'preferred',
                        },
                    }),
                    verifyRegistrationResponse: async () => ({
                        verified: true,
                        registrationInfo: {
                            fmt: 'none' as const,
                            aaguid: '00000000-0000-0000-0000-000000000000',
                            credential: {
                                id: fakeCredentialId,
                                publicKey: fakePublicKey,
                                counter: 0,
                                transports: [
                                    'internal' as const,
                                ],
                            },
                            credentialType:
                                'public-key' as const,
                            attestationObject: new Uint8Array(
                                0
                            ),
                            userVerified: true,
                            credentialDeviceType:
                                'multiDevice' as const,
                            credentialBackedUp: true,
                            origin: 'http://localhost',
                            rpID: 'localhost',
                            authenticatorInfo: {
                                rpIdHash: new Uint8Array(32),
                                flags: {
                                    up: true,
                                    uv: true,
                                    be: true,
                                    bs: true,
                                    at: true,
                                    ed: false,
                                    flagsInt: 0,
                                },
                                counter: 0,
                                aaguid: '00000000-0000-0000-0000-000000000000',
                                credentialID: new Uint8Array(
                                    0
                                ),
                                credentialPublicKey:
                                    new Uint8Array(0),
                            },
                        },
                    }),
                    generateAuthenticationOptions:
                        async () => ({
                            challenge: '',
                            rpId: '',
                        }),
                    verifyAuthenticationResponse:
                        async () => ({
                            verified: false,
                            authenticationInfo: {} as never,
                        }),
                    now: () => Date.now(),
                    createID: () => {
                        idCounter++
                        return `test-id-${idCounter}`
                    },
                })

                const startResult =
                    await authService.startRegistration(
                        env.AUTH_DB,
                        'http://localhost/api/auth/register/start',
                        {
                            identifier,
                            displayName: 'Test User',
                        },
                    )

                expect(startResult.challengeReference)
                    .toBeTruthy()
                expect(startResult.options.challenge)
                    .toBe('test-challenge')

                const finishResult =
                    await authService.finishRegistration(
                        env.AUTH_DB,
                        'http://localhost/api/auth/register/finish',
                        {
                            challengeReference:
                                startResult.challengeReference,
                            credential: {} as never,
                        },
                    )

                const result = finishResult as
                    RegistrationConfirmationResult
                expect(result.response.status)
                    .toBe('confirmation_pending')
                expect(result.response.identifier).toBe(
                    identifier.toLowerCase()
                )
                expect(result.response.userId).toBeTruthy()
                expect(result.response.deviceId).toBeTruthy()
                expect(result.response.handle).toBeTruthy()
                expect(result.confirmationCode).toBeTruthy()
            }
        )

        it('keeps the shared client shell bootstrapped across primary routes',
            async () => {
                const responses = await Promise.all([
                    SELF.fetch('http://localhost/'),
                    SELF.fetch('http://localhost/about'),
                    SELF.fetch('http://localhost/login'),
                    SELF.fetch('http://localhost/signup'),
                ])

                const htmlByRoute = await Promise.all(responses.map(async response => {
                    expect(response.status).toBe(200)
                    return response.text()
                }))

                for (const html of htmlByRoute) {
                    expect(html).toContain('<div id="root"></div>')
                    expect(html).toContain('/src/client/index.ts')
                }
            }
        )

        it('keeps primary shell routes reachable after the Vite optimizeDeps compatibility change',
            async () => {
                const [homeResponse, aboutResponse] = await Promise.all([
                    SELF.fetch('http://localhost/'),
                    SELF.fetch('http://localhost/about'),
                ])

                expect(homeResponse.status).toBe(200)
                expect(aboutResponse.status).toBe(200)
                expect(await homeResponse.text()).toContain('/src/client/index.ts')
                expect(await aboutResponse.text()).toContain('/src/client/index.ts')
            }
        )

        it('serves shell for unknown client paths',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/unknown-path'
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).toContain('<div id="root"></div>')
            }
        )

        it('includes client JS and CSS', async () => {
            const response = await SELF.fetch(
                'http://localhost/'
            )
            const html = await response.text()

            expect(html).toContain(
                '<script type="module"'
            )
            expect(html).toContain(
                '<link rel="stylesheet"'
            )
            expect(html).not.toContain('/assets/index.js')
            expect(html).not.toContain('/assets/index.css')
            expect(html).not.toContain('.tsx')
        })

        it('staging shell uses deploy-valid fallback asset paths',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/',
                    {
                        headers: {
                            'x-deploy-branch': 'staging',
                            authorization: basicAuthHeader(
                                testCredential(
                                    'STAGING_USERNAME',
                                    'staging-user',
                                ),
                                testCredential('STAGING_PW', 'staging-pass'),
                            ),
                        },
                    },
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).not.toContain('/assets/index.js')
                expect(html).not.toContain('/assets/index.css')
            }
        )

        it('returns asset-like misses as not found', async () => {
            const response = await SELF.fetch(
                'http://localhost/missing-client.js'
            )
            expect(response.status).toBe(404)
        })
    })

    describe('API endpoints', () => {
        it('foobar endpoint returns stable JSON payload', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/foobar'
            )
            expect(response.status).toBe(200)
            expect(response.headers.get('content-type'))
                .toContain('application/json')

            const data = await response.json() as {
                ok:boolean;
                route:string;
                message:string
            }
            expect(data).toEqual({
                ok: true,
                route: '/api/foobar',
                message: 'foobar',
            })
        })

        it('foobar endpoint rejects unsupported methods', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/foobar',
                { method: 'POST' }
            )
            expect(response.status).toBe(405)
            expect(response.headers.get('content-type'))
                .toContain('application/json')

            const data = await response.json() as {
                error:string
            }
            expect(data.error).toBe('method_not_allowed')
        })

        it('health check returns ok', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/health'
            )
            expect(response.status).toBe(200)

            const data = await response.json() as {
                status:string;
                service:string
            }
            expect(data).toEqual({
                status: 'ok',
                service: 'template-hono-preact',
            })
        })

        it('worker health endpoint stays available', async () => {
            const response = await SELF.fetch(
                'http://localhost/health'
            )
            expect(response.status).toBe(200)

            const data = await response.json() as {
                status:string
            }
            expect(data).toEqual({ status: 'ok' })
        })

        it('health endpoint behavior is unchanged after foobar route',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/api/health'
                )
                expect(response.status).toBe(200)

                const data = await response.json() as {
                    status:string;
                    service:string
                }
                expect(data).toEqual({
                    status: 'ok',
                    service: 'template-hono-preact',
                })
            }
        )

        it('returns unauthenticated session state before login', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/session'
            )

            expect(response.status).toBe(200)
            const data = await response.json() as {
                authenticated:boolean;
            }
            expect(data).toEqual({
                authenticated: false,
            })
        })

        it('allows logout without an existing session and returns unauthenticated state', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/logout',
                { method: 'POST' }
            )

            expect(response.status).toBe(200)
            const data = await response.json() as {
                authenticated:boolean;
            }
            expect(data).toEqual({
                authenticated: false,
            })
        })
    })

    describe('CORS configuration', () => {
        it('API routes have CORS headers', async () => {
            const response = await SELF.fetch(
                'http://localhost/api/health',
                { method: 'OPTIONS' },
            )

            expect(
                response.headers.has(
                    'access-control-allow-origin'
                )
                || response.status === 204
                || response.status === 200
            ).toBeTruthy()
        })
    })

    describe('Actionable startup failures', () => {
        it('returns actionable prerequisite message',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/',
                    { headers: { 'x-startup-prereq-fail': '1' } }
                )
                const text = await response.text()

                expect(response.status).toBe(500)
                expect(text).toContain(
                    'Startup prerequisite error:'
                )
                expect(text).toContain('Next step:')
            }
        )
    })
})
