import type { Signal } from '@preact/signals'
import { type FunctionComponent } from 'preact'
import { SubstrateButton } from '@substrate-system/button'
import { html } from 'htm/preact'
import { Card } from './card.js'
SubstrateButton.define()

export const Counter:FunctionComponent<{ count:Signal<number> }> = function ({
    count
}) {
    return html`<${Card} title="Counter">
        <div class="counter-display">${count}</div>
        <div class="counter-buttons">
            <${SubstrateButton.TAG}
                class="btn"
                onClick=${() => { count.value-- }}
            >
                -
            <//>
            <${SubstrateButton.TAG}
                class="btn"
                onClick=${() => { count.value = 0 }}
            >
                Reset
            <//>
            <${SubstrateButton.TAG}
                class="btn"
                onClick=${() => { count.value++ }}
            >
                +
            <//>
        </div>
    <//>`
}
