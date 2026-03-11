import { type Signal, signal } from '@preact/signals'
import ky from 'ky'
import Route from 'route-event'
import Debug from '@substrate-system/debug'
const debug = Debug('template:state')

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    _setRoute?:(path:string) => void;
}

/**
 * Setup application state.
 *   - routes
 *   - count
 */
export function State ():AppState {
    const state:AppState = {
        route: signal<string>(location.pathname),
        count: signal<number>(0),
    }

    // listen for route changes
    const onRoute = Route()
    state._setRoute = onRoute.setRoute.bind(onRoute)

    /**
     * Set the app state to match the browser URL.
     */
    onRoute((path:string, data) => {
        state.route.value = path
        // handle scroll state like a web browser
        // (restore scroll position on back/forward)
        if (data.popstate) {
            return window.scrollTo(
                data.scrollX,
                data.scrollY
            )
        }
        // if this was a link click (not back
        // button), scroll to top
        window.scrollTo(0, 0)
    })

    return state
}

State.fetch = async function (_state:AppState) {
    const res = await ky.get('/api/foobar').json()
    debug('fetch response', res)
}

State.Increase = function (state:AppState) {
    state.count.value++
}

State.Decrease = function (state:AppState) {
    state.count.value--
}
