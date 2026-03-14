import { type FunctionComponent } from 'preact'
import { useComputed } from '@preact/signals'
import htm from 'htm'
import { h, Fragment } from 'preact'
import { createRouter } from './client/routes/index.js'
import type { AppState } from './client/state.js'
import { Nav } from './client/components/nav.js'

const router = createRouter()
const html = htm.bind(h)

export function App ({ state }:{ state:AppState }) {
    const path = useComputed(() => {
        return normalizePath(state.route.value)
    })

    const match = useComputed(() => {
        return router.match(path.value)
    })

    return html`<${Fragment}>
            <header class="hero">
                <h1>Hono + Preact</h1>
                <${Nav} state=${state} />
            </header>

            <main class="cards">
                ${renderRoute(match.value, state)}
            </main>
        </${Fragment}>`
}

function renderRoute (match:unknown, state:AppState) {
    if (!isRouteMatch(match)) {
        return html`<${NotFound} />`
    }

    const RouteComponent = match.action(match, state.route.value) as FunctionComponent<{
        state:AppState
    }>

    return html`<${RouteComponent} state=${state} />`
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
    return !!value
        && typeof value === 'object'
        && 'action' in value
        && typeof (value as { action:unknown }).action === 'function'
}

function NotFound () {
    return html`<section class="card">
            <h2>404</h2>
            <p>Page not found.</p>
        </section>`
}
