import type { AppState } from './state.js'
import { Counter } from './components/counter.js'
import { About } from './routes/about.js'

export function App ({ state }:{ state:AppState }) {
    return (
        <>
            <header class="hero">
                <h1>Hono + Preact</h1>
                <Nav route={state.route.value} />
            </header>

            <main class="cards">
                {renderRoute(state)}
            </main>
        </>
    )
}

function Nav ({ route }:{ route:string }) {
    return (
        <nav aria-label="Main navigation">
            <ul>
                <li class={route === '/' ?
                    'active' :
                    ''}
                >
                    <a href="/">Home</a>
                </li>
                <li class={route === '/about' ?
                    'active' :
                    ''}
                >
                    <a href="/about">About</a>
                </li>
            </ul>
        </nav>
    )
}

function renderRoute (state:AppState) {
    switch (state.route.value) {
        case '/':
            return (
                <>
                    <p>
                        This page is rendered on the
                        server with Hono, then hydrated on
                        the client with Preact.
                    </p>
                    <Counter count={state.count} />
                </>
            )
        case '/about':
            return <About />
        default:
            return <NotFound />
    }
}

function NotFound () {
    return (
        <section class="card">
            <h2>404</h2>
            <p>Page not found.</p>
        </section>
    )
}
