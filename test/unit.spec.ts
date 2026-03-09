import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../src/server/index.js'
import {
    resolveStartupAssets
} from '../src/server/startup-assets.js'
import {
    formatStartupFailure
} from '../src/server/startup-errors.js'

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

        it('does not inject server bootstrap state',
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
                expect(html).not.toContain(
                    '__INITIAL_STATE__'
                )
            }
        )

        it('returns a client-rendered shell', async () => {
            const request = new Request(
                'http://example.com/'
            )
            const ctx = createExecutionContext()
            const response = await worker.fetch(
                request, env, ctx
            )
            await waitOnExecutionContext(ctx)

            const html = await response.text()
            expect(html).toContain('<div id="root"></div>')
            expect(html).not.toContain('counter-display')
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

    describe('Startup asset resolution', () => {
        it('falls back to default assets when no binding exists',
            async () => {
                const result = await resolveStartupAssets()
                expect(result.recovered).toBe(true)
                expect(result.assets).toEqual({
                    css: '/assets/index.css',
                    js: '/assets/index.js',
                })
                expect(result.warning).toContain(
                    'Static asset binding'
                )
            }
        )

        it('reads manifest asset paths from asset binding',
            async () => {
                const fetcher = {
                    fetch: async () => new Response(
                        JSON.stringify({
                            'index.html': {
                                file: 'client/index.js',
                                css: ['client/index.css']
                            }
                        }),
                        { status: 200 }
                    )
                } as unknown as Fetcher

                const result = await resolveStartupAssets(fetcher)
                expect(result.recovered).toBe(false)
                expect(result.assets).toEqual({
                    css: '/client/index.css',
                    js: '/client/index.js',
                })
            }
        )
    })

    describe('Startup failure messaging', () => {
        it('formats actionable failure text', () => {
            const message = formatStartupFailure({
                cause: 'Manifest missing',
                remediation: 'Run npm start'
            })
            expect(message).toContain(
                'Startup prerequisite error: Manifest missing'
            )
            expect(message).toContain(
                'Next step: Run npm start'
            )
        })
    })
})
