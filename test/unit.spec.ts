import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/server/index.js'

describe('Hono worker', () => {
    describe('Homepage', () => {
        it('renders the homepage with HTML structure',
            async () => {
                const request = new Request(
                    'http://example.com/'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request, env, ctx
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(200)
                const html = await response.text()

                expect(html).toContain('<html lang="en">')
                expect(html).toContain('Hono + Preact')
                expect(html).toContain('<div id="root">')
            }
        )

        it('includes __INITIAL_STATE__ script',
            async () => {
                const request = new Request(
                    'http://example.com/'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request, env, ctx
                )
                await waitOnExecutionContext(ctx)

                const html = await response.text()
                expect(html).toContain(
                    'window.__INITIAL_STATE__'
                )
                expect(html).toContain(
                    '"count":5'
                )
            }
        )

        it('SSRs the Counter component', async () => {
            const request = new Request(
                'http://example.com/'
            )
            const ctx = createExecutionContext()
            const response = await worker.fetch(
                request, env, ctx
            )
            await waitOnExecutionContext(ctx)

            const html = await response.text()
            expect(html).toContain('Counter')
            expect(html).toContain('counter-display')
        })
    })

    describe('API endpoints', () => {
        it('GET /api/health returns ok', async () => {
            const request = new Request(
                'http://example.com/api/health'
            )
            const ctx = createExecutionContext()
            const response = await worker.fetch(
                request, env, ctx
            )
            await waitOnExecutionContext(ctx)

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

        it('GET /health returns ok', async () => {
            const request = new Request(
                'http://example.com/health'
            )
            const ctx = createExecutionContext()
            const response = await worker.fetch(
                request, env, ctx
            )
            await waitOnExecutionContext(ctx)

            expect(response.status).toBe(200)
            const data = await response.json() as {
                status:string
            }
            expect(data).toEqual({ status: 'ok' })
        })

        it('returns 404 for unknown routes',
            async () => {
                const request = new Request(
                    'http://example.com/does-not-exist'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request, env, ctx
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(404)
            }
        )
    })
})
