import { type FunctionComponent } from 'preact'
import type { AppState } from '../../state.js'

export const AboutRoute:FunctionComponent<{ state:AppState }> = function () {
    return <div class="card">
        <h2>About</h2>
        <p>
            Navigation is handled
            client-side with route-event, so page
            transitions happen without a full reload.
        </p>
    </div>
}
