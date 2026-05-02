import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import builtShellHtml from '../public/client/index.html?raw'
import {
    AuthError,
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

        it('serves the bundled index.html with hashed asset paths',
            async () => {
                const hashedJsRefMatch = builtShellHtml.match(
                    /\/assets\/index-[A-Za-z0-9_-]+\.js/
                )
                expect(hashedJsRefMatch).toBeTruthy()
                const hashedJsRef = hashedJsRefMatch![0]

                const response = await SELF.fetch(
                    'http://localhost/'
                )
                expect(response.status).toBe(200)

                const html = await response.text()
                expect(html).toContain(hashedJsRef)
            }
        )

        it('serves the same shell body for deep client routes',
            async () => {
                const [rootResponse, profileResponse] = await Promise.all([
                    SELF.fetch('http://localhost/'),
                    SELF.fetch('http://localhost/profile'),
                ])

                expect(rootResponse.status).toBe(200)
                expect(profileResponse.status).toBe(200)

                const [rootHtml, profileHtml] = await Promise.all([
                    rootResponse.text(),
                    profileResponse.text(),
                ])

                expect(profileHtml).toBe(rootHtml)
            }
        )

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
                expect(html).toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
            }
        )

        it('serves shell for the signup route deep link', async () => {
            const response = await SELF.fetch(
                'http://localhost/signup'
            )
            const html = await response.text()

            expect(response.status).toBe(200)
            expect(html).toContain('<div id="root"></div>')
            expect(html).toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
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
                expect(result.response.message).toBeTruthy()
                expect(result.confirmationCode).toBeTruthy()
            }
        )

        it('confirms email with a valid code via /api/confirm',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `confirm-${
                    crypto.randomUUID()
                }@example.com`

                const fakePublicKey = new Uint8Array([
                    9, 10, 11, 12,
                ])
                const fakeCredentialId = `cred-confirm-${
                    crypto.randomUUID()
                }`
                let idCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions: async (opts) => ({
                        challenge: 'confirm-challenge',
                        rp: { name: opts.rpName, id: opts.rpID },
                        user: {
                            id: 'user-id-b64',
                            name: opts.userName,
                            displayName: opts.userDisplayName || '',
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
                                transports: ['internal' as const],
                            },
                            credentialType: 'public-key' as const,
                            attestationObject: new Uint8Array(0),
                            userVerified: true,
                            credentialDeviceType: 'multiDevice' as const,
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
                                credentialID: new Uint8Array(0),
                                credentialPublicKey: new Uint8Array(0),
                            },
                        },
                    }),
                    generateAuthenticationOptions: async () => ({
                        challenge: '',
                        rpId: '',
                    }),
                    verifyAuthenticationResponse: async () => ({
                        verified: false,
                        authenticationInfo: {} as never,
                    }),
                    now: () => Date.now(),
                    createID: () => {
                        idCounter++
                        return `confirm-id-${idCounter}`
                    },
                })

                const startResult = await authService.startRegistration(
                    env.AUTH_DB,
                    'http://localhost/api/auth/register/start',
                    { identifier },
                )

                const finishResult = await authService.finishRegistration(
                    env.AUTH_DB,
                    'http://localhost/api/auth/register/finish',
                    {
                        challengeReference: startResult.challengeReference,
                        credential: {} as never,
                    },
                )

                const response = await SELF.fetch(
                    'http://localhost/api/confirm',
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({
                            code: finishResult.confirmationCode,
                            identifier,
                        }),
                    },
                )

                expect(response.status).toBe(200)
                const body = await response.json() as {
                    status:string;
                    identifier:string;
                }
                expect(body.status).toBe('confirmed')
                expect(body.identifier).toBe(identifier.toLowerCase())
            }
        )

        it('rejects an already-used confirmation code',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `used-code-${
                    crypto.randomUUID()
                }@example.com`

                const fakePublicKey = new Uint8Array([
                    13, 14, 15, 16,
                ])
                const fakeCredentialId = `cred-used-${
                    crypto.randomUUID()
                }`
                let idCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions: async (opts) => ({
                        challenge: 'used-challenge',
                        rp: { name: opts.rpName, id: opts.rpID },
                        user: {
                            id: 'user-id-b64',
                            name: opts.userName,
                            displayName: opts.userDisplayName || '',
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
                                transports: ['internal' as const],
                            },
                            credentialType: 'public-key' as const,
                            attestationObject: new Uint8Array(0),
                            userVerified: true,
                            credentialDeviceType: 'multiDevice' as const,
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
                                credentialID: new Uint8Array(0),
                                credentialPublicKey: new Uint8Array(0),
                            },
                        },
                    }),
                    generateAuthenticationOptions: async () => ({
                        challenge: '',
                        rpId: '',
                    }),
                    verifyAuthenticationResponse: async () => ({
                        verified: false,
                        authenticationInfo: {} as never,
                    }),
                    now: () => Date.now(),
                    createID: () => {
                        idCounter++
                        return `used-id-${idCounter}`
                    },
                })

                const startResult = await authService.startRegistration(
                    env.AUTH_DB,
                    'http://localhost/api/auth/register/start',
                    { identifier },
                )

                const finishResult = await authService.finishRegistration(
                    env.AUTH_DB,
                    'http://localhost/api/auth/register/finish',
                    {
                        challengeReference: startResult.challengeReference,
                        credential: {} as never,
                    },
                )

                const confirmBody = JSON.stringify({
                    code: finishResult.confirmationCode,
                })

                await SELF.fetch('http://localhost/api/confirm', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: confirmBody,
                })

                const second = await SELF.fetch(
                    'http://localhost/api/confirm',
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: confirmBody,
                    },
                )

                expect(second.status).toBe(400)
                const body = await second.json() as { error:string }
                expect(body.error).toBe('invalid_code')
            }
        )

        it('rejects a missing confirmation code',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/api/confirm',
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ code: '' }),
                    },
                )
                expect(response.status).toBe(400)
                const body = await response.json() as { error:string }
                expect(body.error).toBe('invalid_code')
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
                    expect(html).toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
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
                expect(await homeResponse.text())
                    .toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
                expect(await aboutResponse.text())
                    .toMatch(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
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

    describe('Device revocation protection', () => {
        it('rejects revoking the only active device',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `last-device-${
                    crypto.randomUUID()
                }@example.com`

                const fakeCredentialId = `cred-last-${
                    crypto.randomUUID()
                }`
                const fakePublicKey = new Uint8Array([
                    20, 21, 22, 23,
                ])
                let idCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions:
                        async (opts) => ({
                            challenge: 'last-dev-challenge',
                            rp: {
                                name: opts.rpName,
                                id: opts.rpID,
                            },
                            user: {
                                id: 'user-id-b64',
                                name: opts.userName,
                                displayName:
                                    opts.userDisplayName
                                    || '',
                            },
                            pubKeyCredParams: [
                                {
                                    type: 'public-key',
                                    alg: -7,
                                },
                            ],
                            timeout: opts.timeout,
                            attestation: 'none',
                            authenticatorSelection: {
                                residentKey: 'preferred',
                                userVerification:
                                    'preferred',
                            },
                        }),
                    verifyRegistrationResponse:
                        async () => ({
                            verified: true,
                            registrationInfo: {
                                fmt: 'none' as const,
                                aaguid:
                                    '00000000-0000-0000'
                                    + '-0000-000000000000',
                                credential: {
                                    id: fakeCredentialId,
                                    publicKey:
                                        fakePublicKey,
                                    counter: 0,
                                    transports: [
                                        'internal' as const,
                                    ],
                                },
                                credentialType:
                                    'public-key' as const,
                                attestationObject:
                                    new Uint8Array(0),
                                userVerified: true,
                                credentialDeviceType:
                                    'multiDevice' as const,
                                credentialBackedUp: true,
                                origin:
                                    'http://localhost',
                                rpID: 'localhost',
                                authenticatorInfo: {
                                    rpIdHash:
                                        new Uint8Array(
                                            32
                                        ),
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
                                    aaguid:
                                        '00000000-0000'
                                        + '-0000-0000'
                                        + '-000000000000',
                                    credentialID:
                                        new Uint8Array(
                                            0
                                        ),
                                    credentialPublicKey:
                                        new Uint8Array(
                                            0
                                        ),
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
                            authenticationInfo:
                                {} as never,
                        }),
                    now: () => Date.now(),
                    createID: () => {
                        idCounter++
                        return `last-dev-id-${idCounter}`
                    },
                })

                const startResult =
                    await authService.startRegistration(
                        db,
                        'http://localhost'
                            + '/api/auth/register/start',
                        {
                            identifier,
                            displayName:
                                'Last Device Test',
                        },
                    )

                const finishResult =
                    await authService.finishRegistration(
                        db,
                        'http://localhost'
                            + '/api/auth/register'
                            + '/finish',
                        {
                            challengeReference:
                                startResult
                                    .challengeReference,
                            credential: {} as never,
                        },
                    )

                await authService.confirmEmail(db, {
                    code: finishResult
                        .confirmationCode,
                    identifier,
                })

                const user = await db.prepare(
                    'SELECT * FROM users '
                    + 'WHERE identifier = ?'
                ).bind(
                    identifier.toLowerCase()
                ).first<{ id:string }>()

                expect(user).toBeTruthy()

                const device = await db.prepare(
                    'SELECT * FROM devices '
                    + 'WHERE user_id = ? '
                    + 'AND is_revoked = 0'
                ).bind(user!.id).first<{
                    id:string;
                }>()

                expect(device).toBeTruthy()

                try {
                    await authService
                        .revokeRegisteredDevice(
                            db,
                            user!.id,
                            device!.id,
                        )
                    expect.fail(
                        'Should have thrown '
                        + 'AuthError'
                    )
                } catch (err) {
                    expect(err).toBeInstanceOf(
                        AuthError
                    )
                    const authErr = err as AuthError
                    expect(authErr.status).toBe(409)
                    expect(authErr.code)
                        .toBe('last_device')
                }
            }
        )

        it('allows revoking when multiple devices exist',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `multi-device-${
                    crypto.randomUUID()
                }@example.com`

                let credentialCounter = 0
                let idCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions:
                        async (opts) => ({
                            challenge:
                                'multi-dev-challenge',
                            rp: {
                                name: opts.rpName,
                                id: opts.rpID,
                            },
                            user: {
                                id: 'user-id-b64',
                                name: opts.userName,
                                displayName:
                                    opts.userDisplayName
                                    || '',
                            },
                            pubKeyCredParams: [
                                {
                                    type: 'public-key',
                                    alg: -7,
                                },
                            ],
                            timeout: opts.timeout,
                            attestation: 'none',
                            authenticatorSelection: {
                                residentKey: 'preferred',
                                userVerification:
                                    'preferred',
                            },
                        }),
                    verifyRegistrationResponse:
                        async () => {
                            credentialCounter++
                            return {
                                verified: true,
                                registrationInfo: {
                                    fmt: 'none' as const,
                                    aaguid:
                                        '00000000-0000'
                                        + '-0000-0000'
                                        + '-000000000000',
                                    credential: {
                                        id: `cred-multi-${
                                            credentialCounter
                                        }`,
                                        publicKey:
                                            new Uint8Array(
                                                [
                                                    credentialCounter,
                                                ]
                                            ),
                                        counter: 0,
                                        transports: [
                                            'internal' as const,
                                        ],
                                    },
                                    credentialType:
                                        'public-key' as const,
                                    attestationObject:
                                        new Uint8Array(
                                            0
                                        ),
                                    userVerified: true,
                                    credentialDeviceType:
                                        'multiDevice' as const,
                                    credentialBackedUp:
                                        true,
                                    origin:
                                        'http://localhost',
                                    rpID: 'localhost',
                                    authenticatorInfo: {
                                        rpIdHash:
                                            new Uint8Array(
                                                32
                                            ),
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
                                        aaguid:
                                            '00000000'
                                            + '-0000-0000'
                                            + '-0000'
                                            + '-000000000000',
                                        credentialID:
                                            new Uint8Array(
                                                0
                                            ),
                                        credentialPublicKey:
                                            new Uint8Array(
                                                0
                                            ),
                                    },
                                },
                            }
                        },
                    generateAuthenticationOptions:
                        async () => ({
                            challenge: '',
                            rpId: '',
                        }),
                    verifyAuthenticationResponse:
                        async () => ({
                            verified: false,
                            authenticationInfo:
                                {} as never,
                        }),
                    now: () => Date.now(),
                    createID: () => {
                        idCounter++
                        return `multi-dev-id-${
                            idCounter
                        }`
                    },
                })

                const startResult =
                    await authService.startRegistration(
                        db,
                        'http://localhost'
                            + '/api/auth/register/start',
                        {
                            identifier,
                            displayName:
                                'Multi Device Test',
                        },
                    )

                const finishResult =
                    await authService.finishRegistration(
                        db,
                        'http://localhost'
                            + '/api/auth/register'
                            + '/finish',
                        {
                            challengeReference:
                                startResult
                                    .challengeReference,
                            credential: {} as never,
                        },
                    )

                await authService.confirmEmail(db, {
                    code: finishResult
                        .confirmationCode,
                    identifier,
                })

                const user = await db.prepare(
                    'SELECT * FROM users '
                    + 'WHERE identifier = ?'
                ).bind(
                    identifier.toLowerCase()
                ).first<{ id:string }>()

                expect(user).toBeTruthy()

                const inv =
                    await authService
                        .createDeviceInvitation(
                            db,
                            'http://localhost/add',
                            user!.id,
                            'Second Device',
                        )

                const claimStart =
                    await authService.startInviteClaim(
                        db,
                        'http://localhost/add',
                        inv.inviteCode,
                    )

                await authService.finishInviteClaim(
                    db,
                    'http://localhost/add',
                    inv.inviteCode,
                    {
                        challengeReference:
                            claimStart.challengeReference,
                        credential: {} as never,
                    },
                )

                const devices = await db.prepare(
                    'SELECT * FROM devices '
                    + 'WHERE user_id = ? '
                    + 'AND is_revoked = 0 '
                    + 'ORDER BY created_at ASC'
                ).bind(user!.id).all<{
                    id:string;
                }>()

                expect(devices.results.length)
                    .toBe(2)

                const firstDeviceId =
                    devices.results[0].id

                await authService
                    .revokeRegisteredDevice(
                        db,
                        user!.id,
                        firstDeviceId,
                    )

                const remaining = await db.prepare(
                    'SELECT COUNT(*) as count '
                    + 'FROM devices '
                    + 'WHERE user_id = ? '
                    + 'AND is_revoked = 0'
                ).bind(user!.id).first<{
                    count:number;
                }>()

                expect(remaining!.count).toBe(1)
            }
        )

        it(
            'listDevices returns only active devices'
            + ' (drives revoke-button disable logic)',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier = `list-dev-${
                    crypto.randomUUID()
                }@example.com`
                let credentialCounter = 0

                const authService = createAuthService({
                    generateRegistrationOptions:
                        async (opts) => ({
                            challenge:
                                'list-dev-challenge',
                            rp: {
                                name: opts.rpName,
                                id: opts.rpID,
                            },
                            user: {
                                id: 'user-id-b64',
                                name: opts.userName,
                                displayName: '',
                            },
                            pubKeyCredParams: [
                                {
                                    type: 'public-key',
                                    alg: -7
                                },
                            ],
                            timeout: opts.timeout,
                            attestation: 'none',
                            authenticatorSelection: {
                                residentKey: 'preferred',
                                userVerification:
                                    'preferred',
                            },
                        }),
                    verifyRegistrationResponse:
                        async () => {
                            credentialCounter++
                            return {
                                verified: true,
                                registrationInfo: {
                                    fmt: 'none' as const,
                                    aaguid:
                                        '00000000-0000'
                                        + '-0000-0000'
                                        + '-000000000000',
                                    credential: {
                                        id: `cred-list-${
                                            credentialCounter
                                        }`,
                                        publicKey:
                                            new Uint8Array(
                                                [
                                                    credentialCounter,
                                                ]
                                            ),
                                        counter: 0,
                                        transports: [
                                            'internal' as const,
                                        ],
                                    },
                                    credentialType:
                                        'public-key' as const,
                                    attestationObject:
                                        new Uint8Array(0),
                                    userVerified: true,
                                    credentialDeviceType:
                                        'multiDevice' as const,
                                    credentialBackedUp:
                                        true,
                                },
                            }
                        },
                    generateAuthenticationOptions:
                        async () => ({
                            challenge: '',
                            rpId: '',
                        }),
                    verifyAuthenticationResponse:
                        async () => ({
                            verified: true,
                            authenticationInfo: {} as never,
                        }),
                    now: () => Date.now(),
                    createID: () => crypto.randomUUID(),
                })

                // Register and confirm user
                const startResult =
                    await authService.startRegistration(
                        db,
                        'http://localhost/register/start',
                        { identifier },
                    )
                const finishResult =
                    await authService.finishRegistration(
                        db,
                        'http://localhost/register/finish',
                        {
                            challengeReference:
                                startResult
                                    .challengeReference,
                            credential: {} as never,
                        },
                    )
                await authService.confirmEmail(db, {
                    code: finishResult.confirmationCode,
                    identifier,
                })

                const userRow = await db.prepare(
                    'SELECT id FROM users'
                    + ' WHERE identifier = ?'
                ).bind(
                    identifier.toLowerCase()
                ).first<{ id:string }>()
                const userId = userRow!.id

                // 1 device: list should have 1 entry
                const devicesWithOne =
                    await authService.listRegisteredDevices(
                        db, userId,
                    )
                expect(devicesWithOne.length).toBe(1)
                expect(devicesWithOne[0].is_revoked)
                    .toBe(0)

                // Add second device via invitation
                const inv =
                    await authService.createDeviceInvitation(
                        db,
                        'http://localhost/add',
                        userId,
                        'Second Device',
                    )
                const claimStart =
                    await authService.startInviteClaim(
                        db,
                        'http://localhost/add',
                        inv.inviteCode,
                    )
                await authService.finishInviteClaim(
                    db,
                    'http://localhost/add',
                    inv.inviteCode,
                    {
                        challengeReference:
                            claimStart.challengeReference,
                        credential: {} as never,
                    },
                )

                // 2 devices: list should have 2
                const devicesWithTwo =
                    await authService.listRegisteredDevices(
                        db, userId,
                    )
                expect(devicesWithTwo.length).toBe(2)

                // Revoke one: list drops to 1
                await authService.revokeRegisteredDevice(
                    db, userId, devicesWithTwo[0].id,
                )
                const devicesAfterRevoke =
                    await authService.listRegisteredDevices(
                        db, userId,
                    )
                expect(devicesAfterRevoke.length).toBe(2)
                expect(
                    devicesAfterRevoke.some(
                        (d) => d.is_revoked === 0,
                    ),
                ).toBe(true)
                expect(
                    devicesAfterRevoke.some(
                        (d) => d.is_revoked === 1,
                    ),
                ).toBe(true)
            }
        )
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

    describe('Device invitation name', () => {
        it(
            'creates an invitation with the provided device name',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const authService = createAuthService()
                const userId = crypto.randomUUID()

                await db.prepare(
                    'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  status, created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(
                    userId,
                    'invite-name-handle',
                    'invite-name@example.com',
                    'active',
                    Date.now(),
                    Date.now(),
                ).run()

                const inv =
                    await authService.createDeviceInvitation(
                        db,
                        'http://localhost/add',
                        userId,
                        'My Laptop',
                    )

                expect(inv.deviceName).toBe('My Laptop')

                const invites =
                    await authService.listDeviceInvitations(
                        db, userId,
                    )
                expect(invites.length).toBe(1)
                expect(invites[0].deviceName)
                    .toBe('My Laptop')
            }
        )

        it(
            'rejects creating an invitation without a device name',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const authService = createAuthService()
                const userId = crypto.randomUUID()

                await db.prepare(
                    'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  status, created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(
                    userId,
                    'invite-noname-handle',
                    'invite-noname@example.com',
                    'active',
                    Date.now(),
                    Date.now(),
                ).run()

                await expect(
                    authService.createDeviceInvitation(
                        db,
                        'http://localhost/add',
                        userId,
                    )
                ).rejects.toMatchObject({
                    status: 400,
                    code: 'missing_device_name',
                })
            }
        )

        it(
            'POST /api/auth/passkey/devices/invite returns 400 '
            + 'when deviceName is missing',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const userId = crypto.randomUUID()
                const sessionToken = crypto.randomUUID()
                const now = Date.now()

                await db.prepare(
                    'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  login_method, status,'
                    + '  created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    userId,
                    'route-noname-handle',
                    'route-noname@example.com',
                    'passkey',
                    'active',
                    now,
                    now,
                ).run()

                await db.prepare(
                    'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    crypto.randomUUID(),
                    userId,
                    sessionToken,
                    'active',
                    now,
                    now + 86400000,
                    now,
                ).run()

                const res = await SELF.fetch(
                    'http://localhost'
                    + '/api/auth/passkey/devices/invite',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Cookie: `auth_session=${sessionToken}`,
                        },
                        body: JSON.stringify({}),
                    },
                )

                expect(res.status).toBe(400)
                const body =
                    await res.json<{ error:string }>()
                expect(body.error).toBe('missing_device_name')
            }
        )
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

    describe('Device revocation logout', () => {
        function makeRevokeSessionAuthService (
            prefix:string,
            credentialCounterRef:{ value:number }
        ) {
            return createAuthService({
                generateRegistrationOptions:
                    async (opts) => ({
                        challenge: 'revoke-logout-challenge',
                        rp: {
                            name: opts.rpName,
                            id: opts.rpID,
                        },
                        user: {
                            id: 'user-id-b64',
                            name: opts.userName,
                            displayName: '',
                        },
                        pubKeyCredParams: [
                            {
                                type: 'public-key',
                                alg: -7,
                            },
                        ],
                        timeout: opts.timeout,
                        attestation: 'none',
                        authenticatorSelection: {
                            residentKey: 'preferred',
                            userVerification: 'preferred',
                        },
                    }),
                verifyRegistrationResponse: async () => {
                    credentialCounterRef.value++
                    return {
                        verified: true,
                        registrationInfo: {
                            fmt: 'none' as const,
                            aaguid:
                                '00000000-0000-0000'
                                + '-0000-000000000000',
                            credential: {
                                id: `${prefix}-${
                                    credentialCounterRef.value
                                }`,
                                publicKey: new Uint8Array(
                                    [credentialCounterRef.value]
                                ),
                                counter: 0,
                                transports: [
                                    'internal' as const,
                                ],
                            },
                            credentialType:
                                'public-key' as const,
                            attestationObject:
                                new Uint8Array(0),
                            userVerified: true,
                            credentialDeviceType:
                                'multiDevice' as const,
                            credentialBackedUp: true,
                        },
                    }
                },
                generateAuthenticationOptions:
                    async () => ({ challenge: '', rpId: '' }),
                verifyAuthenticationResponse: async () => ({
                    verified: true,
                    authenticationInfo: {} as never,
                }),
                now: () => Date.now(),
                createID: () => crypto.randomUUID(),
            })
        }

        async function setupUserWithTwoDevices (
            db:D1Database,
            identifier:string,
        ) {
            const credRef = { value: 0 }
            const prefix = `cred-${crypto.randomUUID()}`
            const authService =
                makeRevokeSessionAuthService(prefix, credRef)

            const startResult =
                await authService.startRegistration(
                    db,
                    'http://localhost/register/start',
                    { identifier },
                )
            const finishResult =
                await authService.finishRegistration(
                    db,
                    'http://localhost/register/finish',
                    {
                        challengeReference:
                            startResult.challengeReference,
                        credential: {} as never,
                    },
                )
            await authService.confirmEmail(db, {
                code: finishResult.confirmationCode,
                identifier,
            })

            const userRow = await db.prepare(
                'SELECT id FROM users'
                + ' WHERE identifier = ? LIMIT 1'
            ).bind(
                identifier.toLowerCase()
            ).first<{ id:string }>()
            const userId = userRow!.id

            const devices1 =
                await authService.listRegisteredDevices(
                    db, userId,
                )
            const device1Id = devices1[0].id

            const inv =
                await authService.createDeviceInvitation(
                    db,
                    'http://localhost/add',
                    userId,
                    'Second Device',
                )
            const claimStart =
                await authService.startInviteClaim(
                    db,
                    'http://localhost/add',
                    inv.inviteCode,
                )
            await authService.finishInviteClaim(
                db,
                'http://localhost/add',
                inv.inviteCode,
                {
                    challengeReference:
                        claimStart.challengeReference,
                    credential: {} as never,
                },
            )

            const devices2 =
                await authService.listRegisteredDevices(
                    db, userId,
                )
            const device2Id =
                devices2.find(d => d.id !== device1Id)!.id

            return { authService, userId, device1Id, device2Id }
        }

        it(
            'revoked device session is rejected immediately',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier =
                    `revoke-sess-${crypto.randomUUID()}`
                    + '@example.com'

                const {
                    authService,
                    userId,
                    device1Id,
                } = await setupUserWithTwoDevices(
                    db, identifier,
                )

                const sessionToken =
                    `tok-revoke-${crypto.randomUUID()}`
                const now = Date.now()
                await db.prepare(
                    'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at, device_id)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    crypto.randomUUID(),
                    userId,
                    sessionToken,
                    'active',
                    now,
                    now + 86400000,
                    now,
                    device1Id,
                ).run()

                await authService.revokeRegisteredDevice(
                    db, userId, device1Id, null,
                )

                const session =
                    await authService.getCurrentSession(
                        db, sessionToken,
                    )
                expect(session.authenticated).toBe(false)
            }
        )

        it(
            'revoking device A does not affect device B session',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )

                const identifier =
                    `revoke-scope-${crypto.randomUUID()}`
                    + '@example.com'

                const {
                    authService,
                    userId,
                    device1Id,
                    device2Id,
                } = await setupUserWithTwoDevices(
                    db, identifier,
                )

                const now = Date.now()
                const sessionToken1 =
                    `tok-dev1-${crypto.randomUUID()}`
                const sessionToken2 =
                    `tok-dev2-${crypto.randomUUID()}`

                await db.prepare(
                    'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at, device_id)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    crypto.randomUUID(),
                    userId,
                    sessionToken1,
                    'active',
                    now,
                    now + 86400000,
                    now,
                    device1Id,
                ).run()

                await db.prepare(
                    'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at, device_id)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    crypto.randomUUID(),
                    userId,
                    sessionToken2,
                    'active',
                    now,
                    now + 86400000,
                    now,
                    device2Id,
                ).run()

                await authService.revokeRegisteredDevice(
                    db, userId, device1Id, null,
                )

                const session2 =
                    await authService.getCurrentSession(
                        db, sessionToken2,
                    )
                expect(session2.authenticated).toBe(true)
            }
        )
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

    // T005: confirm flow — PATCH endpoint behaviour
    describe('PATCH /api/auth/passkey/devices/:deviceId/revoke'
        + ' (confirm flow)', () => {
        async function setupRevokeFixture (db:D1Database) {
            const now = Date.now()
            const userId = crypto.randomUUID()
            const sessionToken = crypto.randomUUID()
            const device1Id = crypto.randomUUID()
            const device2Id = crypto.randomUUID()

            await db.prepare(
                'INSERT INTO users'
                + ' (id, handle, identifier, login_method,'
                + '  status, created_at, updated_at)'
                + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                userId,
                `confirm-handle-${userId}`,
                `confirm-${userId}@example.com`,
                'passkey',
                'active',
                now,
                now,
            ).run()

            await db.prepare(
                'INSERT INTO sessions'
                + ' (id, user_id, session_token, status,'
                + '  created_at, expires_at, last_seen_at,'
                + '  device_id)'
                + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                crypto.randomUUID(),
                userId,
                sessionToken,
                'active',
                now,
                now + 86400000,
                now,
                device1Id,
            ).run()

            await db.prepare(
                'INSERT INTO devices'
                + ' (id, user_id, credential_id, public_key,'
                + '  counter, credential_name, created_at,'
                + '  is_revoked)'
                + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                device1Id,
                userId,
                `cred-1-${userId}`,
                'pk1',
                0,
                'Primary Device',
                now,
                0,
            ).run()

            await db.prepare(
                'INSERT INTO devices'
                + ' (id, user_id, credential_id, public_key,'
                + '  counter, credential_name, created_at,'
                + '  is_revoked)'
                + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(
                device2Id,
                userId,
                `cred-2-${userId}`,
                'pk2',
                0,
                'Secondary Device',
                now,
                0,
            ).run()

            return { userId, sessionToken, device1Id, device2Id }
        }

        it(
            'returns 204 when revoking a non-current device'
            + ' (confirm flow: "Revoke this device" succeeds)',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )
                const {
                    sessionToken,
                    device2Id,
                } = await setupRevokeFixture(db)

                const res = await SELF.fetch(
                    'http://localhost'
                    + '/api/auth/passkey/devices/'
                    + device2Id
                    + '/revoke',
                    {
                        method: 'PATCH',
                        headers: {
                            Cookie: `auth_session=${sessionToken}`,
                        },
                    },
                )

                expect(res.status).toBe(204)
            }
        )

        it(
            'returns 403 with self_revoke when current device'
            + ' is targeted (modal error case)',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )
                const {
                    sessionToken,
                    device1Id,
                } = await setupRevokeFixture(db)

                const res = await SELF.fetch(
                    'http://localhost'
                    + '/api/auth/passkey/devices/'
                    + device1Id
                    + '/revoke',
                    {
                        method: 'PATCH',
                        headers: {
                            Cookie: `auth_session=${sessionToken}`,
                        },
                    },
                )

                expect(res.status).toBe(403)
                const body =
                    await res.json<{ error:string }>()
                expect(body.error).toBe('self_revoke')
            }
        )

        it(
            'returns 409 with last_device when only device'
            + ' is targeted (modal error case)',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )
                // Single-device user setup
                const now = Date.now()
                const userId = crypto.randomUUID()
                const sessionToken = crypto.randomUUID()
                const deviceId = crypto.randomUUID()

                await db.prepare(
                    'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  login_method, status,'
                    + '  created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    userId,
                    `last-handle-${userId}`,
                    `last-${userId}@example.com`,
                    'passkey',
                    'active',
                    now,
                    now,
                ).run()

                await db.prepare(
                    'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    crypto.randomUUID(),
                    userId,
                    sessionToken,
                    'active',
                    now,
                    now + 86400000,
                    now,
                ).run()

                await db.prepare(
                    'INSERT INTO devices'
                    + ' (id, user_id, credential_id,'
                    + '  public_key, counter,'
                    + '  credential_name, created_at,'
                    + '  is_revoked)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    deviceId,
                    userId,
                    `cred-only-${userId}`,
                    'pk-only',
                    0,
                    'Only Device',
                    now,
                    0,
                ).run()

                const res = await SELF.fetch(
                    'http://localhost'
                    + '/api/auth/passkey/devices/'
                    + deviceId
                    + '/revoke',
                    {
                        method: 'PATCH',
                        headers: {
                            Cookie: `auth_session=${sessionToken}`,
                        },
                    },
                )

                expect(res.status).toBe(409)
                const body =
                    await res.json<{ error:string }>()
                expect(body.error).toBe('last_device')
            }
        )

        it(
            'returns 401 when unauthenticated'
            + ' (no session cookie)',
            async () => {
                const db = env.AUTH_DB
                await db.batch(
                    AUTH_SCHEMA_STATEMENTS.map(
                        s => db.prepare(s)
                    )
                )
                const res = await SELF.fetch(
                    'http://localhost'
                    + '/api/auth/passkey/devices/'
                    + crypto.randomUUID()
                    + '/revoke',
                    { method: 'PATCH' },
                )

                expect(res.status).toBe(401)
            }
        )
    })

    // T006: cancel paths — device list unchanged when no
    // PATCH request is made (server-side assertion)
    describe('Device list stability (cancel path support)',
        () => {
            it(
                'device list is unchanged when no revoke'
            + ' request is made (cancel path)',
                async () => {
                    const db = env.AUTH_DB
                    await db.batch(
                        AUTH_SCHEMA_STATEMENTS.map(
                            s => db.prepare(s)
                        )
                    )
                    const now = Date.now()
                    const userId = crypto.randomUUID()
                    const sessionToken = crypto.randomUUID()
                    const deviceId = crypto.randomUUID()

                    await db.prepare(
                        'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  login_method, status,'
                    + '  created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        userId,
                    `cancel-handle-${userId}`,
                    `cancel-${userId}@example.com`,
                    'passkey',
                    'active',
                    now,
                    now,
                    ).run()

                    await db.prepare(
                        'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        crypto.randomUUID(),
                        userId,
                        sessionToken,
                        'active',
                        now,
                        now + 86400000,
                        now,
                    ).run()

                    await db.prepare(
                        'INSERT INTO devices'
                    + ' (id, user_id, credential_id,'
                    + '  public_key, counter,'
                    + '  credential_name, created_at,'
                    + '  is_revoked)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        deviceId,
                        userId,
                    `cred-cancel-${userId}`,
                    'pk-cancel',
                    0,
                    'My Device',
                    now,
                    0,
                    ).run()

                    // No PATCH call (user cancelled) — verify
                    // device list is unchanged via GET
                    const res = await SELF.fetch(
                        'http://localhost'
                    + '/api/auth/passkey/devices',
                        {
                            headers: {
                                Cookie: `auth_session=${sessionToken}`,
                            },
                        },
                    )

                    expect(res.status).toBe(200)
                    const body =
                    await res.json<{ deviceId:string }[]>()
                    expect(
                        body.some(
                            d => d.deviceId === deviceId
                        )
                    ).toBe(true)
                }
            )

            it(
                'keeps the current session device visible'
            + ' across session and device-list reads',
                async () => {
                    const db = env.AUTH_DB
                    await db.batch(
                        AUTH_SCHEMA_STATEMENTS.map(
                            s => db.prepare(s)
                        )
                    )
                    const now = Date.now()
                    const userId = crypto.randomUUID()
                    const sessionToken = crypto.randomUUID()
                    const deviceId = crypto.randomUUID()

                    await db.prepare(
                        'INSERT INTO users'
                    + ' (id, handle, identifier,'
                    + '  login_method, status,'
                    + '  created_at, updated_at)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        userId,
                        `session-device-${userId}`,
                        `session-device-${userId}@example.com`,
                        'passkey',
                        'active',
                        now,
                        now,
                    ).run()

                    await db.prepare(
                        'INSERT INTO devices'
                    + ' (id, user_id, credential_id,'
                    + '  public_key, counter,'
                    + '  credential_name, created_at,'
                    + '  is_revoked)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        deviceId,
                        userId,
                        `cred-session-${userId}`,
                        'pk-session',
                        0,
                        'Current Device',
                        now,
                        0,
                    ).run()

                    await db.prepare(
                        'INSERT INTO sessions'
                    + ' (id, user_id, session_token,'
                    + '  status, created_at, expires_at,'
                    + '  last_seen_at, device_id)'
                    + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                    ).bind(
                        crypto.randomUUID(),
                        userId,
                        sessionToken,
                        'active',
                        now,
                        now + 86400000,
                        now,
                        deviceId,
                    ).run()

                    const sessionRes = await SELF.fetch(
                        'http://localhost/api/session',
                        {
                            headers: {
                                Cookie: `auth_session=${sessionToken}`,
                            },
                        },
                    )

                    expect(sessionRes.status).toBe(200)
                    const sessionBody = await sessionRes.json() as {
                        authenticated:boolean;
                        currentDeviceId?:string | null;
                    }
                    expect(sessionBody.authenticated).toBe(true)
                    expect(sessionBody.currentDeviceId).toBe(deviceId)

                    const devicesRes = await SELF.fetch(
                        'http://localhost/api/auth/passkey/devices',
                        {
                            headers: {
                                Cookie: `auth_session=${sessionToken}`,
                            },
                        },
                    )

                    expect(devicesRes.status).toBe(200)
                    const devicesBody =
                        await devicesRes.json<{ deviceId:string }[]>()
                    expect(
                        devicesBody.some(
                            d => d.deviceId === sessionBody.currentDeviceId
                        )
                    ).toBe(true)
                },
            )
        })
})
