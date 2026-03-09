import { type Signal, signal } from '@preact/signals'

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    _setRoute?:(path:string) => void;
}

/**
 * The serializable shape of state, used for
 * __INITIAL_STATE__ transfer from server to client.
 */
export interface SerializedState {
    route?:string;
    count?:number;
}

/**
 * Setup application state.
 *   - routes
 *   - count
 *
 * On the client, dynamically imports route-event to
 * handle client-side navigation.
 * On the server, just creates signals from the
 * given initial values.
 */
export async function State (
    opts?:SerializedState
):Promise<AppState> {  // eslint-disable-line indent
    const isBrowser = typeof document !== 'undefined'

    const state:AppState = {
        route: signal<string>(
            isBrowser ?
                location.pathname + location.search :
                (opts?.route ?? '/')
        ),
        count: signal<number>(opts?.count ?? 0),
    }

    if (isBrowser) {
        const { default: Route } = await import('route-event')
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
    }

    return state
}

State.Increase = function (state:AppState) {
    state.count.value++
}

State.Decrease = function (state:AppState) {
    state.count.value--
}
