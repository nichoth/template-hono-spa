import { type Signal, signal } from '@preact/signals'
import ky, { type HTTPError } from 'ky'
import Route from 'route-event'
import {
    type RequestFor,
    RequestState,
} from '@substrate-system/state'
import Debug from '@substrate-system/debug'
import {
    startAuthentication as beginBrowserAuthentication,
} from '@simplewebauthn/browser'
import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'

const debug = Debug('template:state')

export type AuthUser = {
    id:string;
    identifier:string;
    displayName:string | null;
}

export type SessionResponse = {
    authenticated:false;
} | {
    authenticated:true;
    user:AuthUser;
    session:{
        expiresAt:string;
    };
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

export type PasskeyLoginValues = {
    identifier:string;
}

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    user:Signal<RequestFor<SessionResponse, HTTPError|Error>>;
    response:Signal<RequestFor<{ message:string }, HTTPError|Error>>;
    _setRoute?:(path:string) => void;
}

const { start, set, error } = RequestState

export function State ():AppState {
    const state:AppState = {
        route: signal<string>(location.pathname),
        user: signal<RequestFor<SessionResponse, HTTPError|Error>>(RequestState()),
        response: signal<RequestFor<{ message:string }, HTTPError|Error>>(RequestState()),
        count: signal<number>(0),
    }

    const onRoute = Route()
    state._setRoute = onRoute.setRoute.bind(onRoute)

    onRoute((path:string, data) => {
        state.route.value = path
        if (data.popstate) {
            return window.scrollTo(
                data.scrollX,
                data.scrollY
            )
        }
        window.scrollTo(0, 0)
    })

    return state
}

State.restoreSession = async function (state:AppState) {
    start(state.user)

    try {
        const user = await ky.get('/api/session').json<SessionResponse>()
        set(state.user, user)
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
    }
}

State.logout = async function (state:AppState) {
    start(state.user)

    try {
        const user = await ky.post('/api/logout').json<SessionResponse>()
        set(state.user, user)
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
    }
}

State.loginWithPasskey = async function (
    state:AppState,
    values:PasskeyLoginValues,
) {
    start(state.user)

    try {
        const startResponse = await ky.post('/api/auth/login/start', {
            json: values,
        }).json<{
            challengeReference:string;
            options:PublicKeyCredentialRequestOptionsJSON;
        }>()

        const credential = await beginBrowserAuthentication({
            optionsJSON: startResponse.options,
        })

        const user = await ky.post('/api/auth/login/finish', {
            json: {
                challengeReference: startResponse.challengeReference,
                credential,
            },
        }).json<SessionResponse>()

        set(state.user, user)
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
        throw err
    }
}

State.login = async function (state:AppState, credentials:LoginCredentials) {
    start(state.user)

    try {
        if (credentials.method === 'passkey') {
            const user = await ky.post('/api/auth/login/finish', {
                json: {
                    challengeReference: credentials.context.challengeReference,
                    credential: {
                        id: credentials.assertion.credentialId,
                        rawId: credentials.assertion.credentialId,
                        response: {
                            authenticatorData: credentials.assertion.authenticatorData,
                            clientDataJSON: credentials.assertion.clientDataJSON,
                            signature: credentials.assertion.signature,
                            ...(credentials.assertion.userHandle ?
                                { userHandle: credentials.assertion.userHandle } :
                                {}),
                        },
                        type: 'public-key',
                        clientExtensionResults: {},
                    } satisfies AuthenticationResponseJSON,
                },
            }).json<SessionResponse>()

            set(state.user, user)
            return user
        }

        throw new Error('Password login is not implemented.')
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
    }
}

State.fetch = Object.assign(
    async function (state:AppState) {
        try {
            start(state.response)
            const res = await ky.get('/api/foobar').json<{ message:string }>()
            await sleep(3000)
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

export function buildLoginRequestBody (credentials:LoginCredentials):LoginRequestBody {
    if (credentials.method === 'password') {
        return {
            method: 'password',
            identifier: credentials.identifier,
            password: credentials.password,
        }
    }

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
