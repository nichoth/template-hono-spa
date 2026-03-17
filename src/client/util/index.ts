import { type Signal, effect } from '@preact/signals'

/**
 * Execute the given function once, after the given signal is truthy.
 */
export function when (sig:Signal<any>, then:()=>any) {
    const dispose = effect(() => {
        if (!sig.value) return
        queueMicrotask(() => {
            dispose()
            then()
        })
    })
}
