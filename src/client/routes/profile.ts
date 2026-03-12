import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import './profile.css'

export const ProfileRoute:FunctionComponent<{ state:AppState }> = function () {
    return html`<div class="route profile">
        <h2>Profile</h2>
        <p>
            Profile data goes here.
        </p>
    </div>`
}
