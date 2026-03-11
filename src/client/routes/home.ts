import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import { useCallback } from 'preact/hooks'
import { SubstrateButton } from '@substrate-system/button'
import { Counter } from '../components/counter.js'
import { Card } from '../components/card.js'
import { State, type AppState } from '../state.js'
import './home.css'
import { ELLIPSIS } from '../constants.js'
import Debug from '@substrate-system/debug'
const debug = Debug('template:view')

const TEXT = 'This page is rendered on the client with Preact.'

export const HomeRoute:FunctionComponent<{
    state:AppState
}> = function HomeRoute ({ state }) {
    const isSpinning = useSignal(false)
    const httpFetch = useCallback(async () => {
        isSpinning.value = true
        const res = await State.fetch(state)
        debug('response...', res)
        isSpinning.value = false
    }, [])

    return html`<div class="route home home-layout">
        <div class="cards cards-grid" aria-label="Home content grid">
            <${Counter} count=${state.count} />
            <${Card}>${TEXT}<//>
            <${Card} class="fetcher">
                More cards${ELLIPSIS}
                <p>
                    This calls our API server.
                </p>
                <div>
                    <${SubstrateButton.TAG}
                        spinning=${isSpinning.value}
                        onClick=${httpFetch}
                    >Fetch<//>
                </div>
            <//>
        </div>
    </section>`
}
