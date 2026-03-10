import { type FunctionComponent } from 'preact'
import htm from 'htm'
import { h, Fragment } from 'preact'
import { Counter } from '../../components/counter.js'
import type { AppState } from '../state.js'

const html = htm.bind(h)

export const HomeRoute:FunctionComponent<{ state:AppState }> = function HomeRoute (
    { state }:{ state:AppState }
) {
    return html`<${Fragment}>
            <p>
                This page is rendered on the
                client with Preact.
            </p>
            <${Counter} count=${state.count} />
        </${Fragment}>`
}
