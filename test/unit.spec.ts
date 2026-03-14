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
import {
    buildLoginRequestBody,
} from '../src/client/state.js'
import { createRouter, routes, isKnownClientRoute } from '../src/client/routes/index.js'
import {
    submitLoginValues,
    startPasskeyLogin,
    PASSKEY_UI_ONLY_LOGIN_MESSAGE,
    UI_ONLY_LOGIN_MESSAGE,
    getRadioCheckedAttr,
    resolveSelectedMethod,
} from '../src/client/routes/login.js'
import type { AppState } from '../src/client/state.js'
import viteConfigSource from '../vite.config.js?raw'
import styleCssSource from '../src/style.css?inline'
import cardCssSource from '../src/client/components/card.css?inline'
import navCssSource from '../src/client/components/nav.css?inline'
import homeCssSource from '../src/client/routes/home.css?inline'
import loginCssSource from '../src/client/routes/login.css?inline'
import profileCssSource from '../src/client/routes/profile.css?inline'
import signupCssSource from '../src/client/routes/signup.css?inline'

vi.mock('@substrate-system/button', () => ({
    SubstrateButton: {
        TAG: 'button',
        define: () => {},
    },
}))

vi.mock('@substrate-system/radio-input', () => ({
    RadioInput: {
        TAG: 'radio-input',
        define: () => {},
    },
}))

const sourceFiles = import.meta.glob('/src/**/*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

const cssSourceFiles:Record<string, string> = {
    '/src/style.css': styleCssSource,
    '/src/client/components/card.css': cardCssSource,
    '/src/client/components/nav.css': navCssSource,
    '/src/client/routes/home.css': homeCssSource,
    '/src/client/routes/login.css': loginCssSource,
    '/src/client/routes/profile.css': profileCssSource,
    '/src/client/routes/signup.css': signupCssSource,
}

function createTestState ():AppState {
    return {
        route: signal('/'),
        count: signal(0),
        user: signal<RequestFor<{ data:Record<string, unknown> }, HTTPError>>(
            RequestState()
        ),
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

        it('POST /api/auth/register/start returns registration options and a challenge reference',
            async () => {
                const request = new Request(
                    'http://example.com/api/auth/register/start',
                    {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({
                            identifier: `person-${crypto.randomUUID()}@example.com`,
                            displayName: 'Test Person',
                        }),
                    }
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request,
                    env,
                    ctx,
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(200)
                const data = await response.json() as {
                    challengeReference:string;
                    options:{
                        challenge:string;
                        rp:{ id?:string; name:string };
                        user:{ name:string; displayName:string; id:string };
                    };
                }

                expect(data.challengeReference).toBeTruthy()
                expect(data.options.challenge).toBeTruthy()
                expect(data.options.rp.name).toBeTruthy()
                expect(data.options.user.name).toContain('@example.com')
                expect(data.options.user.displayName).toBe('Test Person')
            }
        )

        it('GET /api/session returns an unauthenticated result when no session cookie is present',
            async () => {
                const request = new Request(
                    'http://example.com/api/session'
                )
                const ctx = createExecutionContext()
                const response = await worker.fetch(
                    request,
                    env,
                    ctx,
                )
                await waitOnExecutionContext(ctx)

                expect(response.status).toBe(200)
                const data = await response.json() as {
                    authenticated:boolean;
                }

                expect(data.authenticated).toBe(false)
            }
        )

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
                { href: '/signup', text: 'Create Account' },
            ])
        })

        it('maps known routes and rejects unknown ones', () => {
            const router = createRouter(createTestState())
            expect(router.match('/')).toBeTruthy()
            expect(router.match('/about')).toBeTruthy()
            expect(router.match('/login')).toBeTruthy()
            expect(router.match('/signup')).toBeTruthy()
            expect(router.match('/confirm')).toBeTruthy()
            expect(router.match('/confirm/abc123')).toBeTruthy()
            expect(router.match('/missing')).toBeFalsy()
            expect(isKnownClientRoute('/about')).toBe(true)
            expect(isKnownClientRoute('/login')).toBe(true)
            expect(isKnownClientRoute('/signup')).toBe(true)
            expect(isKnownClientRoute('/confirm')).toBe(true)
            expect(isKnownClientRoute('/confirm/abc123')).toBe(true)
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
        it('keeps a visible route from login to signup', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']

            expect(loginSource).toContain('Create an account')
            expect(loginSource).toContain('href="/signup"')
        })

        it('builds a passkey login request body with assertion data and context separated', () => {
            const result = buildLoginRequestBody({
                method: 'passkey',
                assertion: {
                    credentialId: 'cred-123',
                    authenticatorData: 'auth-data',
                    clientDataJSON: 'client-data',
                    signature: 'sig-123',
                    userHandle: 'user-handle',
                },
                context: {
                    accountIdentifier: 'nick@example.com',
                    challengeReference: 'challenge-123',
                },
            })

            expect(result).toEqual({
                method: 'passkey',
                assertion: {
                    credentialId: 'cred-123',
                    authenticatorData: 'auth-data',
                    clientDataJSON: 'client-data',
                    signature: 'sig-123',
                    userHandle: 'user-handle',
                },
                context: {
                    accountIdentifier: 'nick@example.com',
                    challengeReference: 'challenge-123',
                },
            })
        })

        it('omits optional passkey fields from the login request body when they are absent', () => {
            const result = buildLoginRequestBody({
                method: 'passkey',
                assertion: {
                    credentialId: 'cred-123',
                    authenticatorData: 'auth-data',
                    clientDataJSON: 'client-data',
                    signature: 'sig-123',
                },
                context: {},
            })

            expect(result).toEqual({
                method: 'passkey',
                assertion: {
                    credentialId: 'cred-123',
                    authenticatorData: 'auth-data',
                    clientDataJSON: 'client-data',
                    signature: 'sig-123',
                },
                context: {},
            })
        })

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

        it('keeps the login screen focused on sign-in only for the passkey path', () => {
            const loginSource = sourceFiles['/src/client/routes/login.ts']
            const stateSource = sourceFiles['/src/client/state.ts']

            expect(loginSource).not.toContain('Create passkey account')
            expect(loginSource).not.toContain('Display Name')
            expect(loginSource).not.toContain('Create account')
            expect(stateSource).toContain('State.registerWithPasskey')
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
                .toBe(UI_ONLY_LOGIN_MESSAGE)
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

        it('resolves the selected method from nested radio-input change events', () => {
            const event = {
                target: null,
                composedPath: () => [
                    { tagName: 'LABEL' },
                    {
                        tagName: 'RADIO-INPUT',
                        getAttribute: (name:string) => name === 'value' ?
                            'password' :
                            name === 'name' ?
                                'sign-in-method' :
                                null,
                    },
                ],
            } as unknown as Event

            expect(resolveSelectedMethod(event)).toBe('password')
        })

        it('uses presence-style checked attributes for custom radio-input elements', () => {
            expect(getRadioCheckedAttr('passkey', 'passkey')).toBe('checked')
            expect(getRadioCheckedAttr('passkey', 'password')).toBe(null)
        })
    })

    describe('Signup route', () => {
        it('renders a dedicated create-account heading with the shared radio selector', () => {
            const signupSource = sourceFiles['/src/client/routes/signup.ts']

            expect(signupSource).toContain('<h2>Create Account</h2>')
            expect(signupSource).toContain('./login.css')
            expect(signupSource).toContain('radio-input')
            expect(signupSource).toContain('value="passkey"')
            expect(signupSource).toContain('value="password"')
        })

        it('keeps signup submission on the registration path rather than the login path', () => {
            const stateSource = sourceFiles['/src/client/state.ts']
            const signupSource = sourceFiles['/src/client/routes/signup.ts']

            expect(stateSource).toContain('State.registerWithPasskey')
            expect(stateSource).toContain('/api/auth/register/start')
            expect(stateSource).toContain('/api/auth/register/finish')
            expect(signupSource).toContain('Create account')
            expect(signupSource).toContain('Back to sign in')
        })

        it('tells the visitor to confirm their email address after successful signup', () => {
            const stateSource = sourceFiles['/src/client/state.ts']
            const signupSource = sourceFiles['/src/client/routes/signup.ts']
            const serverSource = sourceFiles['/src/server/index.ts']
            const registerFinishHandler = serverSource.match(
                /app\.post\('\/api\/auth\/register\/finish'[\s\S]*?app\.post\('\/api\/auth\/login\/start'/,
            )?.[0] ?? ''

            expect(stateSource).toContain('confirmation_pending')
            expect(signupSource).toContain('Confirm your email address')
            expect(registerFinishHandler).not.toContain('setSessionCookie(c, result.sessionToken)')
        })
    })

    describe('Home card layout', () => {
        it('wraps home cards in a dedicated scroll container', () => {
            const homeSource = sourceFiles['/src/client/routes/home.ts']

            expect(homeSource).toContain('cards-scroll')
            expect(homeSource).toContain('cards cards-grid')
        })

        it('keeps the three home cards in the expected route structure', () => {
            const homeSource = sourceFiles['/src/client/routes/home.ts']
            const cardMatches = homeSource.match(/<\$\{Card\}/g) ?? []

            expect(homeSource).toMatch(/<\$\{Counter\}/)
            expect(cardMatches).toHaveLength(2)
            expect(homeSource).toContain('class="fetcher"')
        })

        it('preserves the fetcher controls and response panel inside the home card markup', () => {
            const homeSource = sourceFiles['/src/client/routes/home.ts']

            expect(homeSource).toContain('This calls our API server')
            expect(homeSource).toContain('>Fetch<//>')
            expect(homeSource).toContain('>Error<//>')
            expect(homeSource).toContain('<pre>')
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
                '/src/client/routes/signup.css',
            ]

            const offenders = maintainedStyles.flatMap(path => {
                const source = cssSourceFiles[path]
                const blockedLines = findBlockedColorLines(source)

                return blockedLines.map(line => `${path}: ${line}`)
            })

            expect(offenders).toEqual([])
        })
    })

    describe('Vite config compatibility', () => {
        it('disables the Cloudflare inspector port in Vite config for local startup compatibility', () => {
            expect(viteConfigSource)
                .toContain('cloudflare({ inspectorPort: false })')
        })

        it('wraps Cloudflare plugin config to remove deprecated optimizeDeps.esbuildOptions before Vite resolves it', () => {
            expect(viteConfigSource)
                .toContain('wrapCloudflarePluginsForVite8')
            expect(viteConfigSource)
                .toContain('configEnvironment: wrapConfigHook(plugin.configEnvironment)')
            expect(viteConfigSource)
                .toContain('rolldownOptions.resolve.symlinks = !esbuildOptions.preserveSymlinks')
        })

        it('keeps the current build output contract explicit in Vite config', () => {
            expect(viteConfigSource).toContain("outDir: './public'")
            expect(viteConfigSource).toContain("manifest: 'vite-manifest.json'")
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
