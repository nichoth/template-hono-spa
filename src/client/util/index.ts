import { type Signal, effect } from '@preact/signals'

/**
 * Execute the given function once, after the given signal is truthy.
 */
export function when (sig:Signal<any>, then:()=>any) {
    if (!sig.value) return

    const dispose = effect(() => {
        if (!sig.value) return
        (async () => {
            await then()
            dispose()
        })()
    })
}
