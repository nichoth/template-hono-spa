import { render, type FunctionComponent } from 'preact'
import { useComputed } from '@preact/signals'
import { BlurHash } from '@substrate-system/blur-hash'
import { HamburgerTwo } from '@substrate-system/hamburger-two'
import '@substrate-system/input'
import '@substrate-system/password-input'
import '@substrate-system/radio-input'
import { html } from 'htm/preact'
import { createRouter } from './routes/index.js'
import type { AppState } from './state.js'
import { State } from './state.js'
import { NotFound } from './not-found.js'
import { Nav } from './components/nav.js'
import Debug from '@substrate-system/debug'
import profileUrl from './profile_avatar_placeholder.png'
const debug = Debug('template')

BlurHash.define()

const state = State()
const router = createRouter(state)

State.restoreSession(state)

if (typeof document !== 'undefined') {
    HamburgerTwo.define()
}

if (import.meta.env.DEV || import.meta.env.MODE === 'staging') {
    localStorage.setItem('DEBUG', 'template,template:*')
    // @ts-expect-error dev
    window.state = state
} else {
    localStorage.removeItem('DEBUG')
}

const App:FunctionComponent<{ state:AppState }> = function ({ state }) {
    debug('rendering...', state)

    const match = useComputed(() => {
        const path = state.route.value
        return router.match(path)
    })

    const loginLabel = useComputed<string>(() => {
        if (!state.user.value.data?.authenticated) return 'anonymous'

        const identifier = state.user.value.data?.user.identifier
        return `Logged in as ${identifier}`
    })

    if (!match.value || !match.value.action) {
        return html`<${NotFound} />`
    }

    const ChildNode = match.value.action(match, state.route.value)

    return html`
        <header>
            <h1 class="logo">
                <a href="/">T</a>  ${/* <-- site logo here */null}
            </h1>
            <${Nav} state=${state} />
            <p class="login-status" aria-live="polite">
                ${loginLabel.value}
            </p>
            <div class="avatar">
                <a href="/profile">
                    <${BlurHash.TAG}
                        width="2rem"
                        height="2rem"
                        alt="profile avatar picture"
                        src="${profileUrl}"
                        placeholder="UJOp*|of~qofxufQWBfQ-;fQIUfQIUfQt7fQ"
                    ><//>
                </a>
            </div>
        </header>

        <${ChildNode} state=${state} />
    `
}

const root = document.getElementById('root')

if (root) {
    render(html`<${App} state=${state} />`, root)
}
