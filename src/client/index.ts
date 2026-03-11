import { render, type FunctionComponent } from 'preact'
import { useComputed } from '@preact/signals'
import { BlurHash } from '@substrate-system/blur-hash'
import { html } from 'htm/preact'
import { createRouter } from './routes/index.js'
import type { AppState } from './state.js'
import { State } from './state.js'
import { NotFound } from './not-found.js'
import { Nav } from './components/nav.js'
import { SubstrateButton } from '@substrate-system/button'
import Debug from '@substrate-system/debug'
import profileUrl from './profile_avatar_placeholder.png'
const debug = Debug('template')

BlurHash.define()

const state = State()
const router = createRouter(state)

if (typeof document !== 'undefined') {
    SubstrateButton.define()
}

if (import.meta.env.DEV) {
    localStorage.setItem('DEBUG', 'template,template:*')
} else {
    localStorage.removeItem('DEBUG')
}

const App:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const match = useComputed(() => {
        const path = state.route.value
        return router.match(path)
    })

    debug('the match', match.value)

    if (!match.value || !match.value.action) {
        return html`<${NotFound} />`
    }

    const ChildNode = match.value.action(match, state.route.value)

    return html`
        <header>
            <h1>
                <a href="/">T</a>  ${/* <-- site logo here */null}
            </h1>
            <${Nav} state=${state} />
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
