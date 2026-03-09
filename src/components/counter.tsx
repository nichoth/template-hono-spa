import type { Signal } from '@preact/signals'
import { type FunctionComponent } from 'preact'
import { Button } from './button.js'
import { Card } from './card.js'

export const Counter:FunctionComponent<{ count:Signal<number> }> = function (
    { count }:{ count:Signal<number> }
) {
    return (
        <Card
            title="Counter"
            description={
                'An interactive counter with '
                + 'Preact hydration:'
            }
        >
            <div class="counter-display">{count}</div>
            <div class="counter-buttons">
                <Button
                    class="btn"
                    onClick={() => { count.value-- }}
                >
                    &ndash;
                </Button>
                <Button
                    class="btn"
                    onClick={() => { count.value = 0 }}
                >
                    Reset
                </Button>
                <Button
                    class="btn"
                    onClick={() => { count.value++ }}
                >
                    +
                </Button>
            </div>
        </Card>
    )
}
