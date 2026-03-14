import { type FunctionComponent } from 'preact'
import { batch, useComputed, useSignal, useSignalEffect } from '@preact/signals'
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
    // const isSpinning = useSignal(false)
    const isPending = useComputed<boolean>(() => {
        return state.response.value.pending
    })

    // this is just b/c the UI feels weird if both buttons spin at the same time
    const errClick = useSignal(false)
    const fetchClick = useSignal(false)

    const httpFetch = useCallback(async () => {
        fetchClick.value = true
        const res = await State.fetch(state)
        debug('response in the view...', res)
    }, [])

    const errorFetch = useCallback(async () => {
        errClick.value = true
        await State.fetch.error(state)
    }, [])

    // unset the button clicks when the request resolves
    useSignalEffect(() => {
        if (!isPending.value) {
            debug('not pending')
            batch(() => {
                errClick.value = false
                fetchClick.value = false
            })
        }
    })

    return html`<div class="route home">
        <div class="cards-scroll" aria-label="Scrollable home cards">
            <div class="cards cards-grid" aria-label="Home content grid">
                <${Counter} count=${state.count} />
                <${Card}>${TEXT}<//>
                <${Card} class="fetcher">
                    <span>More cards${ELLIPSIS}</span>
                    <p>
                        This calls our API server, but adds a delay
                        so we can see the button spin.
                    </p>
                    <div>
                        <${SubstrateButton.TAG}
                            spinning=${isPending.value && fetchClick.value}
                            onClick=${httpFetch}
                        >Fetch<//>

                        <${SubstrateButton.TAG}
                            spinning=${isPending.value && errClick.value}
                            onClick=${errorFetch}
                        >Error<//>
                    </div>

                    <pre>
                        ${JSON.stringify(state.response.value, errorReplacer, 2)}
                    </pre>
                <//>
            </div>
        </div>
    </div>`
}

function errorReplacer (_key, value) {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
        }
    }
    return value
};
