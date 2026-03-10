import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import './not-found.css'

export const NotFound:FunctionComponent = function NotFound () {
    return html`<div class="not-found">
        <h2>404</h2>
        <p>Page not found.</p>
    </div>`
}
