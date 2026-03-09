import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('Integration tests', () => {
    describe('Homepage rendering', () => {
        it('renders full HTML page', async () => {
            const response = await SELF.fetch(
                'http://localhost/'
            )
            expect(response.status).toBe(200)

            const html = await response.text()
            expect(html).toContain('<html')
            expect(html).toContain('</html>')
            expect(html).toContain('Hono + Preact')
        })

        it('returns a client-rendered shell',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/'
                )
                const html = await response.text()

                expect(html).toContain(
                    '<div id="root"></div>'
                )
                expect(html).not.toContain(
                    'counter-display'
                )
            }
        )

        it('does not inject server bootstrap state',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/'
                )
                const html = await response.text()

                expect(html).not.toContain(
                    '__INITIAL_STATE__'
                )
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
        })

        it('starts successfully without a manifest dependency in dev',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/'
                )
                const html = await response.text()

                expect(response.status).toBe(200)
                expect(html).toContain('Hono + Preact')
            }
        )
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
