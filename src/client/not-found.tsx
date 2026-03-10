import { type FunctionComponent } from 'preact'

export const NotFound:FunctionComponent = function NotFound () {
    return (
        <section class="not-found">
            <h2>404</h2>
            <p>Page not found.</p>
        </section>
    )
}
