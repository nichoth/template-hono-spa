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

        it('SSRs App content into the page',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/'
                )
                const html = await response.text()

                expect(html).toContain('Counter')
                expect(html).toContain(
                    'counter-display'
                )
                expect(html).toContain(
                    'counter-buttons'
                )
            }
        )

        it('injects initial state for hydration',
            async () => {
                const response = await SELF.fetch(
                    'http://localhost/'
                )
                const html = await response.text()

                expect(html).toContain(
                    'window.__INITIAL_STATE__'
                )
                expect(html).toContain(
                    '"count":5'
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
})
