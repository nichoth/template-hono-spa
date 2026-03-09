import { type FunctionComponent } from 'preact'

export const About:FunctionComponent = function () {
    return (
        <section class="card">
            <h2>About</h2>
            <p>
                Components are shared between server
                and client. Navigation is handled
                client-side with route-event, so page
                transitions happen without a full reload.
            </p>
        </section>
    )
}

