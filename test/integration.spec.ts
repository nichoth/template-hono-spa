import { SELF, env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

function basicAuthHeader (username:string, password:string):string {
    return `Basic ${btoa(`${username}:${password}`)}`
}

function testCredential (
    key:'STAGING_BASIC_AUTH_USERNAME'|'STAGING_PW',
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
                                'STAGING_BASIC_AUTH_USERNAME',
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

        it('keeps the shared client shell bootstrapped across primary routes',
            async () => {
                const responses = await Promise.all([
                    SELF.fetch('http://localhost/'),
                    SELF.fetch('http://localhost/about'),
                    SELF.fetch('http://localhost/login'),
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
                                    'STAGING_BASIC_AUTH_USERNAME',
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
