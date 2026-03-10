import { render, type FunctionComponent } from 'preact'
import { State } from './state.js'
import { useComputed } from '@preact/signals'
import { html } from 'htm/preact'
import { createRouter } from './routes/index.js'
import type { AppState } from './state.js'
import { NotFound } from './not-found.js'
import { Nav } from './components/nav.js'
import Debug from '@substrate-system/debug'
const debug = Debug('template')

const state = State()
const router = createRouter(state)

if (import.meta.env.DEV || import.meta.env.MODE === 'staging') {
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
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                        class="avatar"
                    />
                </a>
            </div>
        </header>

        <main class="main">
            <${ChildNode} state=${state} />
        </main>
    `
}

const root = document.getElementById('root')

if (root) {
    render(html`<${App} state=${state} />`, root)
}
