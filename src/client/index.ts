import { render, h, type FunctionComponent } from 'preact'
import { State } from './state.js'
import { useComputed } from '@preact/signals'
import htm from 'htm'
import { createRouter } from './routes/index.js'
import type { AppState } from './state.js'
import { NotFound } from './not-found.js'
import { Nav } from './components/nav.js'
import Debug from '@substrate-system/debug'
const debug = Debug('template')

const html = htm.bind(h)
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

    debug('the match', match)

    if (!match.value || !match.value.action) {
        return html`<${NotFound} />`
    }

    const ChildNode = match.value.action(match, state.route.value)

    return html`
        <header>
            <${Nav} state=${state} />
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
