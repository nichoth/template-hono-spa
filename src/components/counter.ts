import type { Signal } from '@preact/signals'
import { type FunctionComponent } from 'preact'
import htm from 'htm'
import { h } from 'preact'
import { Button } from './button.js'
import { Card } from './card.js'

const html = htm.bind(h)

export const Counter:FunctionComponent<{ count:Signal<number> }> = function (
    { count }:{ count:Signal<number> }
) {
    return html`<${Card} title="Counter">
            <div class="counter-display">{count}</div>
            <div class="counter-buttons">
                <${Button}
                    class="btn"
                    onClick=${() => { count.value-- }}
                >
                    -
                </${Button}>
                <${Button}
                    class="btn"
                    onClick=${() => { count.value = 0 }}
                >
                    Reset
                </${Button}>
                <${Button}
                    class="btn"
                    onClick=${() => { count.value++ }}
                >
                    +
                </${Button}>
            </div>
        </${Card}>`
}
