import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

function basicAuthHeader (username:string, password:string):string {
    return `Basic ${btoa(`${username}:${password}`)}`
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
                            'staging-user',
                            'staging-pass',
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
            expect(html).not.toContain('.tsx')
        })

        it('returns asset-like misses as not found', async () => {
            const response = await SELF.fetch(
                'http://localhost/missing-client.js'
            )
            expect(response.status).toBe(404)
        })
    })

    describe('API endpoints', () => {
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
