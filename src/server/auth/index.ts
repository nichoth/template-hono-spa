import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    type AuthenticationResponseJSON,
    type PublicKeyCredentialCreationOptionsJSON,
    type PublicKeyCredentialRequestOptionsJSON,
    type RegistrationResponseJSON,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import {
    createAuthEvent,
    createChallenge,
    createDevice,
    createSession,
    createUser,
    ensureAuthSchema,
    expireSession,
    findChallengeById,
    findDeviceByCredentialId,
    findSessionByToken,
    findUserById,
    findUserByIdentifier,
    listActiveDevicesByUserId,
    listDevicesByUserId,
    markChallengeExpired,
    markChallengeUsed,
    parseChallengeMetadata,
    revokeDevice,
    revokeSession,
    touchSession,
    updateDeviceUsage,
    activateUser,
    createConfirmationCode,
    findConfirmationCode,
    markConfirmationCodeExpired,
    markConfirmationCodeUsed,
} from '../db/index.js'

const REGISTRATION_TIMEOUT_MS = 5 * 60 * 1000
const AUTHENTICATION_TIMEOUT_MS = 5 * 60 * 1000

export const AUTH_SESSION_COOKIE = 'auth_session'
export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30
export const AUTH_RP_NAME = 'Template Hono SPA'
export const EMAIL_CONFIRMATION_TTL_MS = 1000 * 60 * 60 * 24

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

export type RegistrationConfirmationResponse = {
    status:'confirmation_pending';
    identifier:string;
    message:string;
}

export type EmailConfirmationRequest = {
    code:string;
    identifier?:string;
}

export type EmailConfirmationResponse = {
    status:'confirmed';
    identifier:string;
    message?:string;
}

export type RegistrationConfirmationResult = {
    response:RegistrationConfirmationResponse;
    confirmationCode:string;
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
        if (existingUser) {
            if (existingUser.status === 'pending') {
                throw new AuthError(
                    409,
                    'confirmation_pending',
                    'An account with that identifier is awaiting email confirmation.',
                )
            }
            throw new AuthError(
                409,
                'identifier_in_use',
                'An account with that identifier already exists.',
            )
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
    ):Promise<RegistrationConfirmationResult> {
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
        if (existingUser) {
            if (existingUser.status === 'pending') {
                throw new AuthError(
                    409,
                    'confirmation_pending',
                    'An account with that identifier is awaiting email confirmation.',
                )
            }
            throw new AuthError(
                409,
                'identifier_in_use',
                'An account with that identifier already exists.',
            )
        }

        const now = deps.now()
        const handle = generateUserHandle()
        const user = await createUser(db, {
            id: userID,
            handle,
            identifier,
            displayName,
            now,
        })

        const credentialId = verification.registrationInfo.credential.id
        const duplicate = await findDeviceByCredentialId(db, credentialId)
        if (duplicate) {
            throw new AuthError(409, 'credential_exists', 'That passkey is already registered.')
        }

        const authenticatorInfo = verification.registrationInfo.authenticatorInfo
        const deviceId = deps.createID()
        await createDevice(db, {
            id: deviceId,
            userID: user.id,
            credentialID: credentialId,
            publicKey: isoBase64URL.fromBuffer(
                verification.registrationInfo.credential.publicKey
            ),
            counter: verification.registrationInfo.credential.counter,
            transports: verification.registrationInfo.credential.transports,
            aaguid: authenticatorInfo?.aaguid,
            credentialName: displayName || identifier,
            now,
        })

        await markChallengeUsed(db, challenge.id, now)

        await createAuthEvent(db, {
            id: deps.createID(),
            userID: user.id,
            challengeID: challenge.id,
            eventType: 'registration_finish',
            result: 'success',
            occurredAt: now,
        })

        const confirmationCode = generateConfirmationCode()
        await createConfirmationCode(db, {
            code: confirmationCode,
            identifier,
            expiresAt: now + EMAIL_CONFIRMATION_TTL_MS,
            now,
        })

        return {
            confirmationCode,
            response: {
                status: 'confirmation_pending',
                identifier: user.identifier,
                message: 'We sent an email to confirm your email address. Check your inbox to finish creating your account.',
            },
        }
    }

    async function confirmEmail (
        db:D1Database,
        request:EmailConfirmationRequest,
    ):Promise<EmailConfirmationResponse> {
        await ensureAuthSchema(db)

        const code = request.code?.trim()
        if (!code) {
            throw new AuthError(400, 'invalid_code', 'Enter a valid confirmation code.')
        }

        const record = await findConfirmationCode(db, code)
        if (!record) {
            throw new AuthError(400, 'invalid_code', 'Confirmation code was not found.')
        }

        const now = deps.now()
        if (record.status !== 'pending') {
            if (record.status === 'expired') {
                throw new AuthError(409, 'expired_code', 'Confirmation code has expired.')
            }

            throw new AuthError(400, 'invalid_code', 'Confirmation code has already been used.')
        }

        if (record.expires_at <= now) {
            await markConfirmationCodeExpired(db, record.code, now)
            throw new AuthError(409, 'expired_code', 'Confirmation code has expired.')
        }

        const identifier = record.identifier
        const user = await findUserByIdentifier(db, identifier)
        if (!user || user.status === 'active') {
            if (!user) {
                throw new AuthError(
                    404,
                    'unknown_account',
                    'No account matches this confirmation code.',
                )
            }
            throw new AuthError(
                409,
                'already_confirmed',
                'This account has already been confirmed.',
            )
        }

        await markConfirmationCodeUsed(db, record.code, now)
        await activateUser(db, identifier, now)

        return {
            status: 'confirmed',
            identifier: user.identifier,
            message: 'Your email address is confirmed. You can now sign in.',
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

        const credentials = await listActiveDevicesByUserId(db, user.id)
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

        const device = await findDeviceByCredentialId(db, request.credential.id)
        if (!device || device.is_revoked) {
            throw new AuthError(404, 'unknown_credential', 'The passkey credential is not recognized.')
        }

        const verification = await deps.verifyAuthenticationResponse({
            response: request.credential,
            expectedChallenge: challenge.challenge_value,
            expectedOrigin: deriveExpectedOrigin(requestUrl),
            expectedRPID: deriveRpID(requestUrl),
            credential: {
                id: device.credential_id,
                publicKey: isoBase64URL.toBuffer(device.public_key),
                counter: device.counter,
                transports: parseTransports(device.transports_json),
            },
        })

        if (!verification.verified) {
            throw new AuthError(400, 'authentication_failed', 'Passkey sign-in could not be verified.')
        }

        const updateNow = deps.now()
        await updateDeviceUsage(db, {
            credentialID: device.credential_id,
            counter: verification.authenticationInfo.newCounter,
            now: updateNow,
        })
        await markChallengeUsed(db, challenge.id, updateNow)

        const user = await findUserById(db, device.user_id)
        if (!user || user.status !== 'active') {
            throw new AuthError(404, 'unknown_account', 'The passkey account is no longer available.')
        }

        const sessionNow = deps.now()
        const session = await createSession(db, {
            id: deps.createID(),
            userID: user.id,
            sessionToken: buildSessionToken(),
            expiresAt: sessionNow + DEFAULT_SESSION_TTL_MS,
            now: sessionNow,
        })

        await createAuthEvent(db, {
            id: deps.createID(),
            userID: user.id,
            sessionID: session.id,
            challengeID: challenge.id,
            eventType: 'login_finish',
            result: 'success',
            occurredAt: sessionNow,
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

    async function listRegisteredDevices (
        db:D1Database,
        userID:string,
    ) {
        await ensureAuthSchema(db)
        return listDevicesByUserId(db, userID)
    }

    async function revokeRegisteredDevice (
        db:D1Database,
        deviceID:string,
    ) {
        await ensureAuthSchema(db)
        await revokeDevice(db, deviceID)
    }

    return {
        startRegistration,
        finishRegistration,
        confirmEmail,
        startAuthentication,
        finishAuthentication,
        getCurrentSession,
        logout,
        listRegisteredDevices,
        revokeRegisteredDevice,
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

function generateUserHandle ():string {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
}

function generateConfirmationCode ():string {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
}
