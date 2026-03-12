import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from 'cloudflare:test'
import { signal } from '@preact/signals'
import {
    type RequestFor,
    RequestState
} from '@substrate-system/state'
import type { HTTPError } from 'ky'
import { describe, it, expect, vi } from 'vitest'
import worker from '../src/server/index.js'
import {
    resolveDeploymentContext
} from '../src/server/deployment-context.js'
import {
    resolveStartupAssets
} from '../src/server/startup-assets.js'
import {
    formatStartupFailure
} from '../src/server/startup-errors.js'
import { createRouter, routes, isKnownClientRoute } from '../src/client/routes/index.js'
import {
    submitLoginValues,
    startPasskeyLogin,
    PASSKEY_UI_ONLY_LOGIN_MESSAGE,
} from '../src/client/routes/login.js'
import type { AppState } from '../src/client/state.js'

vi.mock('@substrate-system/button', () => ({
    SubstrateButton: {
        TAG: 'button',
        define: () => {},
    },
}))

const sourceFiles = import.meta.glob('/src/**/*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

const cssSourceFiles = import.meta.glob('/src/**/*.css', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

function createTestState ():AppState {
    return {
        route: signal('/'),
        count: signal(0),
        response: signal<RequestFor<{ message:string }, HTTPError>>(
            RequestState()
        ),
    }
}

function findBlockedColorLines (source:string):string[] {
    const blockedColorPattern = /#[0-9a-fA-F]{3,8}\b|rgb[a]?\(|hsl[a]?\(|\b(?:black|white|transparent)\b/

    return source
        .split('\n')
        .map(line => line.replace(/\/\*.*?\*\//g, '').trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith('--'))
        .filter(line => blockedColorPattern.test(line))
}

describe('Hono worker', () => {
    describe('Deployment context', () => {
        it('requires auth only for the staging branch', () => {
            expect(resolveDeploymentContext('staging', 'main')).toEqual({
                branchName: 'staging',
                environmentType: 'staging',
                requiresAuth: true,
            })

            expect(resolveDeploymentContext('main', 'main')).toEqual({
                branchName: 'main',
                environmentType: 'main',
                requiresAuth: false,
            })
        })

        it('keeps non-staging non-main branches public', () => {
            expect(resolveDeploymentContext('preview', 'main')).toEqual({
                branchName: 'preview',
                environmentType: 'preview',
                requiresAuth: false,
            })

            expect(resolveDeploymentContext(undefined, 'main')).toEqual({
                branchName: 'unknown',
                environmentType: 'unknown',
                requiresAuth: false,
            })
        })

        it('keeps localhost requests public outside the test branch override path',
            async () => {
                const request = new Request(
                    'http://localhost/api/health'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request,
                    {
                        ...env,
                        NODE_ENV: 'production',
                        MAIN_BRANCH: 'main',
                        DEPLOY_BRANCH: 'staging',
                    },
                    ctx,
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(200)
            }
        )
    })

    describe('App shell routes', () => {
        it('renders homepage shell HTML',
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
                expect(html).toContain('<div id="root"></div>')
                expect(html).not.toContain('__INITIAL_STATE__')
                expect(html).not.toContain('counter-display')
            }
        )

        it('serves shell for deep-link routes', async () => {
            const request = new Request(
                'http://example.com/some/new/path'
            )
            const ctx = createExecutionContext()
            const response = await worker.fetch(
                request, env, ctx
            )
            await waitOnExecutionContext(ctx)

            expect(response.status).toBe(200)
            const html = await response.text()
            expect(html).toContain('<div id="root"></div>')
        })

        it('returns not found for asset-like route misses',
            async () => {
                const request = new Request(
                    'http://example.com/missing-file.js'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request, env, ctx
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(404)
            }
        )

        it('does not serve shell for vite module client path',
            async () => {
                const request = new Request(
                    'http://example.com/@vite/client'
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
    })

    describe('Client route definitions', () => {
        it('keeps centralized nav route metadata', () => {
            expect(routes).toEqual([
                { href: '/', text: 'Home' },
                { href: '/about', text: 'About' },
                { href: '/login', text: 'Login' },
            ])
        })

        it('maps known routes and rejects unknown ones', () => {
            const router = createRouter(createTestState())
            expect(router.match('/')).toBeTruthy()
            expect(router.match('/about')).toBeTruthy()
            expect(router.match('/login')).toBeTruthy()
            expect(router.match('/missing')).toBeFalsy()
            expect(isKnownClientRoute('/about')).toBe(true)
            expect(isKnownClientRoute('/login')).toBe(true)
            expect(isKnownClientRoute('/missing')).toBe(false)
        })

        it('keeps shared nav structure aligned with centralized routes', () => {
            const navSource = sourceFiles['/src/client/components/nav.ts']

            expect(navSource).toContain('desktop-nav')
            expect(navSource).toContain('mobile-nav-menu')
            expect(navSource).toContain('routes.map')
        })

        it('wires the hamburger trigger to mobile menu open and close events', () => {
            const navSource = sourceFiles['/src/client/components/nav.ts']

            expect(navSource).toContain('HamburgerTwo.TAG')
            expect(navSource).toContain("HamburgerTwo.event('open')")
            expect(navSource).toContain("HamburgerTwo.event('close')")
            expect(navSource).toContain('mobile-nav-trigger')
            expect(navSource).toContain('mobile-nav-menu')
        })

        it('renders the shared route links inside the mobile menu container', () => {
            const navSource = sourceFiles['/src/client/components/nav.ts']

            expect(navSource).toContain('nav-links-mobile')
            expect(navSource).toContain('renderNavItems(currentPath)')
            expect(navSource).toContain("props.currentPath === props.href ? 'active' : ''")
            expect(navSource).toContain("isMenuOpen.value ? 'open' : ''")
            expect(navSource).toContain('hidden=${')
            expect(navSource).toContain('!isMenuOpen')
        })

        it('keeps desktop nav inline while closing the mobile menu on route and viewport changes', () => {
            const navSource = sourceFiles['/src/client/components/nav.ts']

            expect(navSource).toContain("const MEDIA_QUERY = '(width >= 680px)'")
            expect(navSource).toContain('window.matchMedia(MEDIA_QUERY)')
            expect(navSource).toContain('hamburgerRef.current.isOpen = false')
            expect(navSource).toContain('}, [currentPath])')
            expect(navSource).toContain('desktop-nav')
            expect(navSource).toContain('mobile-nav-menu')
        })
    })

    describe('Login route', () => {
        it('renders a login heading with a radio selector for passkey and password', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']
            const clientIndexSource = sourceFiles['/src/client/index.ts']

            expect(loginSource).toContain('<h2>Login</h2>')
            expect(loginSource).toContain('radio-input')
            expect(loginSource).toContain('class="login-methods"')
            expect(loginSource).toContain('login-method-option')
            expect(loginSource).toContain('name="sign-in-method"')
            expect(loginSource).toContain('label="Passkey"')
            expect(loginSource).toContain('label="Password"')
            expect(loginSource).toContain("const activeMethod = useSignal<SignInMethod>('passkey')")
            expect(clientIndexSource).toContain('@substrate-system/radio-input')
        })

        it('keeps passkey as the default selected path in the radio selector', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']

            expect(loginSource).toContain('checked=')
            expect(loginSource).toContain("activeMethod.value === 'passkey'")
            expect(loginSource).toContain('Continue with passkey')
            expect(loginSource)
                .toContain('Sign in using your device (Face ID, fingerprint, or Windows Hello).')
        })

        it('returns missing-field errors without clearing valid values for password sign-in', () => {
            const result = submitLoginValues({
                identifier: 'nick@example.com',
                password: '',
            })

            expect(result.values).toEqual({
                identifier: 'nick@example.com',
                password: '',
            })
            expect(result.errors).toEqual({
                password: 'Enter your password.',
            })
            expect(result.message).toBe('')
        })

        it('returns the UI-only password message when values are complete', () => {
            const result = submitLoginValues({
                identifier: 'nick@example.com',
                password: 'secret',
            })

            expect(result.values).toEqual({
                identifier: 'nick@example.com',
                password: 'secret',
            })
            expect(result.errors).toEqual({})
            expect(result.message)
                .toBe('Login is not connected yet. No sign-in was performed.')
        })

        it('starts a passkey login attempt without requiring a password', () => {
            const result = startPasskeyLogin()

            expect(result.method).toBe('passkey')
            expect(result.message).toBe(PASSKEY_UI_ONLY_LOGIN_MESSAGE)
        })

        it('renders password fields only for the password path', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']

            expect(loginSource).toContain("activeMethod.value === 'password'")
            expect(loginSource).toContain('password-input')
            expect(loginSource).toContain('Username or Email')
            expect(loginSource).toContain('Log in with password')
        })

        it('keeps the password option available as fallback from the same selector', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']

            expect(loginSource).toContain('value="password"')
            expect(loginSource).toContain('value="passkey"')
            expect(loginSource).toContain('Choose how you want to sign in.')
            expect(loginSource).toContain('Use your username or email and password.')
            expect(loginSource).toContain('Sign in using your device (Face ID, fingerprint, or Windows Hello).')
        })
    })

    describe('Shared color tokens', () => {
        it('keeps maintained stylesheets free of direct color literals', () => {
            const maintainedStyles = [
                '/src/style.css',
                '/src/client/components/card.css',
                '/src/client/components/nav.css',
                '/src/client/routes/home.css',
                '/src/client/routes/login.css',
                '/src/client/routes/profile.css',
            ]

            const offenders = maintainedStyles.flatMap(path => {
                const source = cssSourceFiles[path]
                const blockedLines = findBlockedColorLines(source)

                return blockedLines.map(line => `${path}: ${line}`)
            })

            expect(offenders).toEqual([])
        })
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

        it('uses deploy-valid fallback assets when manifest is missing',
            async () => {
                const fetcher = {
                    fetch: async () => new Response('', { status: 404 })
                } as unknown as Fetcher

                const result = await resolveStartupAssets(fetcher)
                expect(result.recovered).toBe(true)
                expect(result.assets).toEqual({
                    css: '/assets/index.css',
                    js: '/assets/index.js',
                })
                expect(result.warning).toContain(
                    'Vite manifest was not found at vite-manifest.json.'
                )
            }
        )

        it('reports invalid manifest data without returning broken asset paths',
            async () => {
                const fetcher = {
                    fetch: async () => new Response(
                        JSON.stringify({}),
                        { status: 200 }
                    )
                } as unknown as Fetcher

                const result = await resolveStartupAssets(fetcher)
                expect(result.recovered).toBe(true)
                expect(result.assets).toEqual({
                    css: '/assets/index.css',
                    js: '/assets/index.js',
                })
                expect(result.warning).toContain(
                    'Vite manifest at vite-manifest.json is missing index.html entry.'
                )
            }
        )

        it('requests the client manifest path from the asset binding',
            async () => {
                let requestedUrl = ''
                const fetcher = {
                    fetch: async (input:RequestInfo | URL) => {
                        requestedUrl = String(input)
                        return new Response('', { status: 404 })
                    }
                } as unknown as Fetcher

                await resolveStartupAssets(fetcher)
                expect(requestedUrl)
                    .toBe('http://assets/vite-manifest.json')
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

    describe('Migration constraints', () => {
        it('server entry keeps non-JSX source', () => {
            const serverSource = sourceFiles['/src/server/index.ts']
            expect(serverSource).toBeTruthy()
            expect(serverSource).not.toMatch(/return\s*\(\s*</)
            expect(serverSource).not.toMatch(/return\s*</)
        })

        it('source tree has no remaining .tsx files', () => {
            const tsxFiles = import.meta.glob('/src/**/*.tsx', { eager: true })
            expect(Object.keys(tsxFiles)).toEqual([])
        })
    })
})
