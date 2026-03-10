import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { Counter } from '../components/counter.js'
import type { AppState } from '../state.js'

export const HomeRoute:FunctionComponent<{
    state:AppState
}> = function HomeRoute ({ state }) {
    return html`
        <p>
            This page is rendered on the
            client with Preact.
        </p>
        <${Counter} count=${state.count} />
    `
}
