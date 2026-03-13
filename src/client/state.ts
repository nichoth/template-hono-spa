import { type Signal, signal } from '@preact/signals'
import ky, { type HTTPError } from 'ky'
import Route from 'route-event'
import {
    type RequestFor,
    RequestState
} from '@substrate-system/state'
import Debug from '@substrate-system/debug'
const debug = Debug('template:state')

export type LoginUser = {
    [key:string]: unknown
}

export type LoginResponse = {
    data:LoginUser
}

export type PasswordLoginCredentials = {
    method:'password';
    identifier:string;
    password:string;
}

export type PasskeyAssertion = {
    credentialId:string;
    authenticatorData:string;
    clientDataJSON:string;
    signature:string;
    userHandle?:string;
}

export type PasskeyLoginContext = {
    accountIdentifier?:string;
    challengeReference?:string;
}

export type PasskeyLoginCredentials = {
    method:'passkey';
    assertion:PasskeyAssertion;
    context:PasskeyLoginContext;
}

export type LoginCredentials = PasswordLoginCredentials|PasskeyLoginCredentials

export type PasswordLoginRequestBody = {
    method:'password';
    identifier:string;
    password:string;
}

export type PasskeyLoginRequestBody = {
    method:'passkey';
    assertion:{
        credentialId:string;
        authenticatorData:string;
        clientDataJSON:string;
        signature:string;
        userHandle?:string;
    };
    context:{
        accountIdentifier?:string;
        challengeReference?:string;
    };
}

export type LoginRequestBody = PasswordLoginRequestBody|PasskeyLoginRequestBody

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    user:Signal<RequestFor<LoginResponse, HTTPError>>
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
        user: signal<RequestFor<LoginResponse, HTTPError>>(RequestState()),
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

State.login = async function (state:AppState, credentials:LoginCredentials) {
    start(state.user)
    try {
        const user = await ky.post('/api/login', {
            json: buildLoginRequestBody(credentials),
        }).json<LoginResponse>()
        debug('login response...', user)
        set(state.user, user)
    } catch (_err) {
        const err = _err as HTTPError
        error(state.user, err)
    }
}

State.fetch = Object.assign(
    async function (state:AppState) {
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
    },

    {
        error: async function (state:AppState) {
            start(state.response)
            await sleep(2000)
            error(state.response, new Error('testing errors'))
        }
    }
)

function sleep (ms:number):Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function buildLoginRequestBody (credentials:LoginCredentials):LoginRequestBody {
    if (credentials.method === 'password') {
        // early return -- password
        return {
            method: 'password',
            identifier: credentials.identifier,
            password: credentials.password,
        }
    }

    // passkey
    return {
        method: 'passkey',
        assertion: {
            credentialId: credentials.assertion.credentialId,
            authenticatorData: credentials.assertion.authenticatorData,
            clientDataJSON: credentials.assertion.clientDataJSON,
            signature: credentials.assertion.signature,
            ...(credentials.assertion.userHandle ?
                { userHandle: credentials.assertion.userHandle } :
                {}),
        },
        context: {
            ...(credentials.context.accountIdentifier ?
                { accountIdentifier: credentials.context.accountIdentifier } :
                {}),
            ...(credentials.context.challengeReference ?
                { challengeReference: credentials.context.challengeReference } :
                {}),
        },
    }
}
