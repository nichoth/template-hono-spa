import { render, h, Fragment, type FunctionComponent } from 'preact'
import { State } from './state.js'
import { useComputed } from '@preact/signals'
import htm from 'htm'
import { createRouter } from './routes/index.js'
import type { AppState } from './state.js'
import { NotFound } from './not-found.js'
import { Nav } from '../components/nav.js'

const html = htm.bind(h)
const state = State()
const router = createRouter(state)

const App:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const path = useComputed(() => {
        return normalizePath(state.route.value)
    })

    const match = useComputed(() => {
        return router.match(path.value)
    })

    if (!isRouteMatch(match)) {
        return html`<${NotFound} />`
    }

    const ChildNode = match.action(match, state.route.value)

    return html`<${Fragment}>
            <header class="hero">
                <h1>Hono + Preact</h1>
                <${Nav} state=${state} />
            </header>

            <main class="main">
                <${ChildNode} state=${state} />
            </main>
        </${Fragment}>`
}

const root = document.getElementById('root')

if (root) {
    render(html`<${App} state=${state} />`, root)
}

function normalizePath (route:string):string {
    if (!route) return '/'

    const queryStart = route.indexOf('?')
    if (queryStart >= 0) {
        return route.slice(0, queryStart) || '/'
    }

    return route
}

function isRouteMatch (value:unknown):value is {
    action:(match:unknown, path:string) => FunctionComponent<{ state:AppState }>;
} {
    return !!value &&
        typeof value === 'object' &&
        'action' in value &&
        typeof (value as { action:unknown }).action === 'function'
}
