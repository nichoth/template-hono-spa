import type { Signal } from '@preact/signals'
import { type FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { Card } from './card.js'

export const Counter:FunctionComponent<{ count:Signal<number> }> = function ({
    count
}) {
    return html`<${Card} title="Counter">
        <div class="counter-display">${count}</div>
        <div class="counter-buttons">
            <substrate-button
                class="btn"
                onClick=${() => { count.value-- }}
            >
                -
            </substrate-button>
            <substrate-button
                class="btn"
                onClick=${() => { count.value = 0 }}
            >
                Reset
            </substrate-button>
            <substrate-button
                class="btn"
                onClick=${() => { count.value++ }}
            >
                +
            </substrate-button>
        </div>
    <//>`
}
