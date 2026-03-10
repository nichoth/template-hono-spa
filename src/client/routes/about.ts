import { type FunctionComponent } from 'preact'
import htm from 'htm'
import { h } from 'preact'
import type { AppState } from '../state.js'

const html = htm.bind(h)

export const AboutRoute:FunctionComponent<{ state:AppState }> = function () {
    return html`<div class="card">
        <h2>About</h2>
        <p>
            Navigation is handled
            client-side with route-event, so page
            transitions happen without a full reload.
        </p>
    </div>`
}
