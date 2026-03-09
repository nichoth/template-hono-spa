import { render } from 'preact'
import { App } from '../app.js'
import { State } from '../state.js'
import { type FunctionComponent } from 'preact'
import { useComputed } from '@preact/signals'
import { createRouter, routes } from './routes/index.js'
import type { AppState } from './state.js'

const root = document.getElementById('root')

if (root) {
    const state = await State()
    render(<App state={state} />, root)
}

const router = createRouter()

export function App ({ state }:{ state:AppState }) {
    const path = useComputed(() => {
        return normalizePath(state.route.value)
    })

    const match = useComputed(() => {
        return router.match(path.value)
    })

    return (
        <>
            <header class="hero">
                <h1>Hono + Preact</h1>
                <Nav route={path.value} />
            </header>

            <main class="cards">
                {renderRoute(match.value, state)}
            </main>
        </>
    )
}

function Nav ({ route }:{ route:string }) {
    return (
        <nav aria-label="Main navigation">
            <ul>
                {routes.map(appRoute => {
                    return (
                        <li class={route === appRoute.href ? 'active' : ''}>
                            <a href={appRoute.href}>{appRoute.text}</a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

function renderRoute (match:unknown, state:AppState) {
    if (!isRouteMatch(match)) {
        return <NotFound />
    }

    const RouteComponent = match.action(match, state.route.value) as FunctionComponent<{
        state:AppState
    }>

    return <RouteComponent state={state} />
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
    return (
        <section class="card">
            <h2>404</h2>
            <p>Page not found.</p>
        </section>
    )
}

