import { type FunctionComponent } from 'preact'
import htm from 'htm'
import { h } from 'preact'

const html = htm.bind(h)

export const NotFound:FunctionComponent = function NotFound () {
    return html`<section class="not-found">
        <h2>404</h2>
        <p>Page not found.</p>
    </section>`
}
