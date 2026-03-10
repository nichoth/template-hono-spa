import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { Counter } from '../components/counter.js'
import { Card } from '../components/card.js'
import type { AppState } from '../state.js'
import './home.css'
import { ELLIPSIS } from '../constants.js'

const TEXT = 'This page is rendered on the client with Preact.'

export const HomeRoute:FunctionComponent<{
    state:AppState
}> = function HomeRoute ({ state }) {
    return html`<section class="route home home-layout">
        <div class="cards cards-grid" aria-label="Home content grid">
            <${Counter} count=${state.count} />
            <${Card} description=${TEXT} />
            <${Card}>More cards${ELLIPSIS}<//>
        </div>
    </section>`
}
