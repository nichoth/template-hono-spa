import { type Signal, signal } from '@preact/signals'
import ky, { type HTTPError } from 'ky'
import Route from 'route-event'
import { type RequestFor, RequestState } from '@substrate-system/state'
import Debug from '@substrate-system/debug'
import {
    startAuthentication as beginBrowserAuthentication,
    startRegistration as beginBrowserRegistration,
} from '@simplewebauthn/browser'
import type {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser'

const debug = Debug('template:state')

export type AuthUser = {
    id:string;
    identifier:string;
    displayName:string | null;
    login_method:'passkey'|'password' | null;
}

export type SessionResponse = {
    authenticated:false;
} | {
    authenticated:true;
    user:AuthUser;
    session:{
        expiresAt:string;
    };
    loginMethod:'passkey'|'password' | null;
    currentDeviceId?:string | null;
}

export type SignupConfirmationResponse = {
    status:'confirmation_pending';
    identifier:string;
    message:string;
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

export type PasskeyRegistrationValues = {
    identifier:string;
    displayName?:string;
}

export type DeviceInfo = {
    deviceId:string;
    credentialId:string;
    credentialName:string | null;
    aaguid:string | null;
    transports:string[];
    createdAt:string;
    lastUsedAt:string | null;
    isRevoked:boolean;
}

export type DeviceAddedResponse = {
    status:'device_added';
    device:{
        deviceId:string;
        credentialName:string;
        createdAt:string;
    };
}

export type DeviceInvitation = {
    inviteCode:string;
    inviteUrl:string;
    deviceName:string|null;
    expiresAt:string;
}

export type PendingInvitation = {
    inviteCode:string;
    deviceName:string|null;
    status:string;
    expiresAt:string;
    createdAt:string;
}

export type AppState = {
    route:Signal<string>;
    count:Signal<number>;
    user:Signal<RequestFor<SessionResponse, HTTPError|Error>>;
    response:Signal<RequestFor<{ message:string }, HTTPError|Error>>;
    devices:Signal<RequestFor<DeviceInfo[], HTTPError|Error>>;
    invitations:Signal<RequestFor<PendingInvitation[], HTTPError|Error>>;
    logoutInProgress:Signal<boolean>;
    logoutError:Signal<string|null>;
    _setRoute?:(path:string)=>void;
}

const { start, set, error } = RequestState

export function State ():AppState {
    const state:AppState = {
        route: signal<string>(location.pathname),
        user: signal<RequestFor<SessionResponse, HTTPError|Error>>(RequestState()),
        // just for demo
        response: signal<RequestFor<{ message:string }, HTTPError|Error>>(RequestState()),
        devices: signal<RequestFor<DeviceInfo[], HTTPError|Error>>(RequestState()),
        invitations: signal<RequestFor<PendingInvitation[], HTTPError|Error>>(
            RequestState()
        ),
        count: signal<number>(0),
        logoutInProgress: signal<boolean>(false),
        logoutError: signal<string|null>(null),
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
        await syncDeviceManagementState(state, user)
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
    }
}

State.logout = async function (state:AppState) {
    state.logoutInProgress.value = true
    state.logoutError.value = null
    start(state.user)

    try {
        const user = await ky.post('/api/logout').json<SessionResponse>()
        set(state.user, user)
        clearDeviceManagementState(state)
        state.logoutInProgress.value = false
        state.logoutError.value = null
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        state.logoutInProgress.value = false
        state.logoutError.value = err.message ?? 'Logout failed'
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
        await syncDeviceManagementState(state, user)
        return user
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
        throw err
    }
}

State.registerWithPasskey = async function (
    _state:AppState,
    values:PasskeyRegistrationValues,
) {
    try {
        const startResponse = await ky.post('/api/auth/register/start', {
            json: values,
        }).json<{
            challengeReference:string;
            options:PublicKeyCredentialCreationOptionsJSON;
        }>()

        const credential = await beginBrowserRegistration({
            optionsJSON: startResponse.options,
        })

        const result = await ky.post('/api/auth/register/finish', {
            json: {
                challengeReference: startResponse.challengeReference,
                credential,
            },
        }).json<SignupConfirmationResponse>()

        return result
    } catch (_err) {
        const err = _err as HTTPError|Error
        throw err
    }
}

State.confirmAccount = async function (
    values:{ code:string; identifier?:string },
) {
    try {
        const result = await ky.post('/api/confirm', {
            json: values,
        }).json<{
            status:'confirmed';
            identifier:string;
            message?:string;
        }>()

        return result
    } catch (_err) {
        const err = _err as HTTPError|Error
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
            await syncDeviceManagementState(state, user)
            return user
        }

        throw new Error('Password login is not implemented.')
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.user, err)
    }
}

const DEVICE_POLL_INTERVAL_MS = 5_000
let devicePollInterval:ReturnType<typeof setInterval> | null = null

State.listDevices = async function (state:AppState) {
    start(state.devices)

    try {
        const devices = await ky.get(
            '/api/auth/passkey/devices',
        ).json<DeviceInfo[]>()
        set(state.devices, devices)
        return devices
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.devices, err)
    }
}

State.revokeDevice = async function (
    state:AppState,
    deviceId:string,
) {
    try {
        await ky.patch(
            `/api/auth/passkey/devices/${deviceId}/revoke`,
        )
        await State.listDevices(state)
    } catch (_err) {
        const err = _err as HTTPError|Error
        throw err
    }
}

State.createInvite = async function (
    state:AppState,
    deviceName:string,
):Promise<DeviceInvitation | undefined> {
    try {
        const result = await ky.post(
            '/api/auth/passkey/devices/invite',
            { json: { deviceName } },
        ).json<DeviceInvitation & { status:string }>()

        await State.listInvites(state)

        // Capture current device IDs as the baseline.
        // If state.devices has not been loaded yet, baselineIds will
        // be empty — the first tick will then see all returned devices
        // as "new" and clear the interval after one refresh, which is
        // acceptable.
        const baselineIds = new Set(
            (state.devices.value.data ?? []).map(
                (d:DeviceInfo) => d.deviceId
            )
        )

        // Replace any prior interval (e.g. user created a second invite)
        if (devicePollInterval !== null) {
            clearInterval(devicePollInterval)
        }

        devicePollInterval = setInterval(async () => {
            // Skip tick if a devices request is already in flight
            if (state.devices.value.pending) return

            await State.listDevices(state)
            await State.listInvites(state)

            const newDevice = (state.devices.value.data ?? [])
                .some((d:DeviceInfo) => !baselineIds.has(d.deviceId))
            const noInvites = (
                state.invitations.value.data ?? []
            ).length === 0

            if (newDevice || noInvites) {
                clearInterval(devicePollInterval!)
                devicePollInterval = null
            }
        }, DEVICE_POLL_INTERVAL_MS)

        return result
    } catch (_err) {
        const err = _err as HTTPError|Error
        throw err
    }
}

State.listInvites = async function (state:AppState) {
    start(state.invitations)

    try {
        const invites = await ky.get(
            '/api/auth/passkey/devices/invites',
        ).json<PendingInvitation[]>()
        set(state.invitations, invites)
        return invites
    } catch (_err) {
        const err = _err as HTTPError|Error
        error(state.invitations, err)
    }
}

State.cancelInvite = async function (
    state:AppState,
    inviteCode:string,
) {
    try {
        await ky.delete(
            `/api/auth/passkey/devices/invite/${inviteCode}`,
        )
        await State.listInvites(state)
    } catch (_err) {
        const err = _err as HTTPError|Error
        throw err
    }
}

State.claimInvite = async function (code:string):Promise<DeviceAddedResponse> {
    const startResponse = await ky.post(
        `/api/auth/passkey/devices/invite/${code}/claim/start`,
    ).json<{
        challengeReference:string;
        options:PublicKeyCredentialCreationOptionsJSON;
        deviceName:string | null;
        handle:string;
    }>()

    const credential = await beginBrowserRegistration({
        optionsJSON: startResponse.options,
    })

    const result = await ky.post(
        `/api/auth/passkey/devices/invite/${code}/claim/finish`,
        {
            json: {
                challengeReference: startResponse.challengeReference,
                credential,
            },
        },
    ).json<DeviceAddedResponse>()

    return result
}

/**
 * This is just for demonstration purposes in the template.
 */
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

async function syncDeviceManagementState (
    state:AppState,
    user:SessionResponse,
) {
    if (user.authenticated !== true) {
        clearDeviceManagementState(state)
        return
    }

    await State.listDevices(state)
}

function clearDeviceManagementState (state:AppState) {
    state.devices.value = RequestState()
    state.invitations.value = RequestState()
}
