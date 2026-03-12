import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'

export const AboutRoute:FunctionComponent<{ state:AppState }> = function () {
    return html`<div class="route about">
        <h2>About</h2>
        <p>
            Navigation is handled
            client-side with <a href="https://www.npmjs.com/package/route-event">
            <code>route-event</code></a>, so page transitions happen without a
            full reload.
        </p>
    </div>`
}
