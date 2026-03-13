import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    isoBase64URL,
    type AuthenticationResponseJSON,
    type PublicKeyCredentialCreationOptionsJSON,
    type PublicKeyCredentialRequestOptionsJSON,
    type RegistrationResponseJSON,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server'
import {
    createAuthEvent,
    createChallenge,
    createCredential,
    createSession,
    createUser,
    ensureAuthSchema,
    expireSession,
    findChallengeById,
    findCredentialByCredentialId,
    findSessionByToken,
    findUserById,
    findUserByIdentifier,
    markChallengeExpired,
    markChallengeUsed,
    parseChallengeMetadata,
    revokeSession,
    touchSession,
    updateCredentialCounter,
    listActiveCredentialsByUserId,
} from '../db/index.js'

const REGISTRATION_TIMEOUT_MS = 5 * 60 * 1000
const AUTHENTICATION_TIMEOUT_MS = 5 * 60 * 1000

export const AUTH_SESSION_COOKIE = 'auth_session'
export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30
export const AUTH_RP_NAME = 'Template Hono SPA'

export type AuthUser = {
    id:string;
    identifier:string;
    displayName:string | null;
}

export type SessionSummary = {
    expiresAt:string;
}

export type SessionResponse = {
    authenticated:false;
} | {
    authenticated:true;
    user:AuthUser;
    session:SessionSummary;
}

export type RegistrationStartRequest = {
    identifier:string;
    displayName?:string;
}

export type RegistrationStartResponse = {
    challengeReference:string;
    options:PublicKeyCredentialCreationOptionsJSON;
}

export type RegistrationFinishRequest = {
    challengeReference:string;
    credential:RegistrationResponseJSON;
}

export type AuthenticationStartRequest = {
    identifier:string;
}

export type AuthenticationStartResponse = {
    challengeReference:string;
    options:PublicKeyCredentialRequestOptionsJSON;
}

export type AuthenticationFinishRequest = {
    challengeReference:string;
    credential:AuthenticationResponseJSON;
}

export class AuthError extends Error {
    status:number
    code:string

    constructor (status:number, code:string, message:string) {
        super(message)
        this.status = status
        this.code = code
    }
}

type AuthDeps = {
    generateRegistrationOptions:typeof generateRegistrationOptions;
    verifyRegistrationResponse:typeof verifyRegistrationResponse;
    generateAuthenticationOptions:typeof generateAuthenticationOptions;
    verifyAuthenticationResponse:typeof verifyAuthenticationResponse;
    now:() => number;
    createID:() => string;
}

const defaultDeps:AuthDeps = {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    now: () => Date.now(),
    createID: () => crypto.randomUUID(),
}

export function createAuthService (deps:AuthDeps = defaultDeps) {
    async function startRegistration (
        db:D1Database,
        requestUrl:string,
        request:RegistrationStartRequest,
    ):Promise<RegistrationStartResponse> {
        await ensureAuthSchema(db)

        const identifier = request.identifier.trim().toLowerCase()
        const displayName = request.displayName?.trim() || identifier

        if (!identifier) {
            throw new AuthError(400, 'invalid_identifier', 'Enter a valid account identifier.')
        }

        const existingUser = await findUserByIdentifier(db, identifier)
        if (existingUser?.status === 'active') {
            throw new AuthError(409, 'identifier_in_use', 'An account with that identifier already exists.')
        }

        const userID = deps.createID()
        const rpID = deriveRpID(requestUrl)
        const now = deps.now()
        const options = await deps.generateRegistrationOptions({
            rpName: AUTH_RP_NAME,
            rpID,
            userName: identifier,
            userID: new TextEncoder().encode(userID),
            userDisplayName: displayName,
            timeout: REGISTRATION_TIMEOUT_MS,
        })

        const challengeReference = deps.createID()
        await createChallenge(db, {
            id: challengeReference,
            identifier,
            purpose: 'registration',
            challengeValue: options.challenge,
            expiresAt: now + REGISTRATION_TIMEOUT_MS,
            now,
            metadata: {
                userID,
                displayName,
            },
        })

        return {
            challengeReference,
            options,
        }
    }

    async function finishRegistration (
        db:D1Database,
        requestUrl:string,
        request:RegistrationFinishRequest,
    ):Promise<{ sessionToken:string; response:SessionResponse }> {
        await ensureAuthSchema(db)

        const challenge = await findChallengeById(db, request.challengeReference)
        if (!challenge || challenge.purpose !== 'registration') {
            throw new AuthError(400, 'invalid_challenge', 'Registration challenge was not found.')
        }
        if (challenge.status !== 'pending') {
            throw new AuthError(400, 'invalid_challenge_state', 'Registration challenge can no longer be used.')
        }
        if (challenge.expires_at <= deps.now()) {
            await markChallengeExpired(db, challenge.id)
            throw new AuthError(400, 'expired_challenge', 'Registration challenge has expired.')
        }

        const metadata = parseChallengeMetadata(challenge)
        const userID = metadata.userID || deps.createID()
        const displayName = metadata.displayName ?? challenge.identifier ?? ''
        const identifier = challenge.identifier

        if (!identifier) {
            throw new AuthError(500, 'challenge_missing_identifier', 'Registration challenge is missing account data.')
        }

        const verification = await deps.verifyRegistrationResponse({
            response: request.credential,
            expectedChallenge: challenge.challenge_value,
            expectedOrigin: deriveExpectedOrigin(requestUrl),
            expectedRPID: deriveRpID(requestUrl),
        })

        if (!verification.verified) {
            await createAuthEvent(db, {
                id: deps.createID(),
                challengeID: challenge.id,
                eventType: 'registration_finish',
                result: 'failure',
                occurredAt: deps.now(),
                detail: 'verification_failed',
            })
            throw new AuthError(400, 'registration_failed', 'Passkey registration could not be verified.')
        }

        const existingUser = await findUserByIdentifier(db, identifier)
        if (existingUser?.status === 'active') {
            throw new AuthError(409, 'identifier_in_use', 'An account with that identifier already exists.')
        }

        const now = deps.now()
        const user = await createUser(db, {
            id: userID,
            identifier,
            displayName,
            now,
        })

        await createCredential(db, {
            id: deps.createID(),
            userID: user.id,
            credentialID: verification.registrationInfo.credential.id,
            publicKey: isoBase64URL.fromBuffer(
                verification.registrationInfo.credential.publicKey
            ),
            counter: verification.registrationInfo.credential.counter,
            transports: verification.registrationInfo.credential.transports,
            deviceType: verification.registrationInfo.credentialDeviceType,
            backedUp: verification.registrationInfo.credentialBackedUp,
            now,
        })

        await markChallengeUsed(db, challenge.id, now)

        const session = await createSession(db, {
            id: deps.createID(),
            userID: user.id,
            sessionToken: buildSessionToken(),
            expiresAt: now + DEFAULT_SESSION_TTL_MS,
            now,
        })

        await createAuthEvent(db, {
            id: deps.createID(),
            userID: user.id,
            sessionID: session.id,
            challengeID: challenge.id,
            eventType: 'registration_finish',
            result: 'success',
            occurredAt: now,
        })

        return {
            sessionToken: session.session_token,
            response: makeAuthenticatedSessionResponse(user, session.expires_at),
        }
    }

    async function startAuthentication (
        db:D1Database,
        requestUrl:string,
        request:AuthenticationStartRequest,
    ):Promise<AuthenticationStartResponse> {
        await ensureAuthSchema(db)

        const identifier = request.identifier.trim().toLowerCase()
        if (!identifier) {
            throw new AuthError(400, 'invalid_identifier', 'Enter a valid account identifier.')
        }

        const user = await findUserByIdentifier(db, identifier)
        if (!user || user.status !== 'active') {
            throw new AuthError(404, 'unknown_account', 'No passkey account was found for that identifier.')
        }

        const credentials = await listActiveCredentialsByUserId(db, user.id)
        if (credentials.length === 0) {
            throw new AuthError(400, 'no_passkey_credentials', 'No active passkeys are available for this account.')
        }

        const now = deps.now()
        const options = await deps.generateAuthenticationOptions({
            rpID: deriveRpID(requestUrl),
            timeout: AUTHENTICATION_TIMEOUT_MS,
            allowCredentials: credentials.map(credential => ({
                id: credential.credential_id,
                transports: parseTransports(credential.transports_json),
            })),
        })

        const challengeReference = deps.createID()
        await createChallenge(db, {
            id: challengeReference,
            userID: user.id,
            identifier,
            purpose: 'authentication',
            challengeValue: options.challenge,
            expiresAt: now + AUTHENTICATION_TIMEOUT_MS,
            now,
        })

        return {
            challengeReference,
            options,
        }
    }

    async function finishAuthentication (
        db:D1Database,
        requestUrl:string,
        request:AuthenticationFinishRequest,
    ):Promise<{ sessionToken:string; response:SessionResponse }> {
        await ensureAuthSchema(db)

        const challenge = await findChallengeById(db, request.challengeReference)
        if (!challenge || challenge.purpose !== 'authentication') {
            throw new AuthError(400, 'invalid_challenge', 'Login challenge was not found.')
        }
        if (challenge.status !== 'pending') {
            throw new AuthError(400, 'invalid_challenge_state', 'Login challenge can no longer be used.')
        }
        if (challenge.expires_at <= deps.now()) {
            await markChallengeExpired(db, challenge.id)
            throw new AuthError(400, 'expired_challenge', 'Login challenge has expired.')
        }

        const credential = await findCredentialByCredentialId(db, request.credential.id)
        if (!credential || credential.status !== 'active') {
            throw new AuthError(404, 'unknown_credential', 'The passkey credential is not recognized.')
        }

        const verification = await deps.verifyAuthenticationResponse({
            response: request.credential,
            expectedChallenge: challenge.challenge_value,
            expectedOrigin: deriveExpectedOrigin(requestUrl),
            expectedRPID: deriveRpID(requestUrl),
            credential: {
                id: credential.credential_id,
                publicKey: isoBase64URL.toBuffer(credential.public_key),
                counter: credential.counter,
                transports: parseTransports(credential.transports_json),
            },
        })

        if (!verification.verified) {
            throw new AuthError(400, 'authentication_failed', 'Passkey sign-in could not be verified.')
        }

        await updateCredentialCounter(db, {
            credentialID: credential.credential_id,
            counter: verification.authenticationInfo.newCounter,
            now: deps.now(),
        })
        await markChallengeUsed(db, challenge.id, deps.now())

        const user = await findUserById(db, credential.user_id)
        if (!user || user.status !== 'active') {
            throw new AuthError(404, 'unknown_account', 'The passkey account is no longer available.')
        }

        const now = deps.now()
        const session = await createSession(db, {
            id: deps.createID(),
            userID: user.id,
            sessionToken: buildSessionToken(),
            expiresAt: now + DEFAULT_SESSION_TTL_MS,
            now,
        })

        await createAuthEvent(db, {
            id: deps.createID(),
            userID: user.id,
            sessionID: session.id,
            challengeID: challenge.id,
            eventType: 'login_finish',
            result: 'success',
            occurredAt: now,
        })

        return {
            sessionToken: session.session_token,
            response: makeAuthenticatedSessionResponse(user, session.expires_at),
        }
    }

    async function getCurrentSession (
        db:D1Database,
        sessionToken?:string,
    ):Promise<SessionResponse> {
        await ensureAuthSchema(db)

        if (!sessionToken) {
            return { authenticated: false }
        }

        const session = await findSessionByToken(db, sessionToken)
        if (!session) {
            return { authenticated: false }
        }
        if (session.status !== 'active') {
            return { authenticated: false }
        }
        if (session.user_status !== 'active') {
            await revokeSession(db, sessionToken, deps.now())
            return { authenticated: false }
        }
        if (session.expires_at <= deps.now()) {
            await expireSession(db, sessionToken)
            return { authenticated: false }
        }

        await touchSession(db, sessionToken, deps.now())

        return {
            authenticated: true,
            user: {
                id: session.user_id,
                identifier: session.identifier,
                displayName: session.display_name,
            },
            session: {
                expiresAt: new Date(session.expires_at).toISOString(),
            },
        }
    }

    async function logout (
        db:D1Database,
        sessionToken?:string,
    ):Promise<SessionResponse> {
        await ensureAuthSchema(db)

        if (sessionToken) {
            await revokeSession(db, sessionToken, deps.now())
        }

        return { authenticated: false }
    }

    return {
        startRegistration,
        finishRegistration,
        startAuthentication,
        finishAuthentication,
        getCurrentSession,
        logout,
    }
}

function deriveExpectedOrigin (requestUrl:string):string {
    return new URL(requestUrl).origin
}

function deriveRpID (requestUrl:string):string {
    return new URL(requestUrl).hostname
}

function buildSessionToken ():string {
    return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll('-', '')}`
}

function parseTransports (value:string | null):string[] | undefined {
    if (!value) return undefined

    try {
        return JSON.parse(value) as string[]
    } catch {
        return undefined
    }
}

function makeAuthenticatedSessionResponse (
    user:{ id:string; identifier:string; display_name:string | null },
    expiresAt:number,
):SessionResponse {
    return {
        authenticated: true,
        user: {
            id: user.id,
            identifier: user.identifier,
            displayName: user.display_name,
        },
        session: {
            expiresAt: new Date(expiresAt).toISOString(),
        },
    }
}
