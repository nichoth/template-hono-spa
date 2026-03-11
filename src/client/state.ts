import { type Signal, signal } from '@preact/signals'
import ky, { type HTTPError } from 'ky'
import Route from 'route-event'
import {
    type RequestFor,
    RequestState
} from '@substrate-system/state'
import Debug from '@substrate-system/debug'
const debug = Debug('template:state')

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    response:Signal<RequestFor<{ message }, HTTPError|Error>>;
    _setRoute?:(path:string) => void;
}

const { start, set, error } = RequestState

/**
 * Setup application state.
 *   - routes
 *   - count
 */
export function State ():AppState {
    const state:AppState = {
        route: signal<string>(location.pathname),
        response: signal<RequestFor<{ message }, HTTPError>>(RequestState()),
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

State.fetch = async function (state:AppState) {
    try {
        start(state.response)
        const res = await ky.get('/api/foobar').json<{ message:string }>()
        await sleep(3000)  // resolve for 3 seconds
        debug('fetch response', res)
        set(state.response, res)
        return res
    } catch (_err) {
        const err = _err as HTTPError
        error(state.response, err)
    }
}

Object.assign(State.fetch, {
    error: async (state:AppState) => {
        start(state.response)
        await sleep(2000)
        error(state.response, new Error('testing errors'))
    }
})

State.Increase = function (state:AppState) {
    state.count.value++
}

State.Decrease = function (state:AppState) {
    state.count.value--
}

function sleep (ms:number):Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
