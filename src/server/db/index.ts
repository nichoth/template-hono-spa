import { AUTH_SCHEMA_STATEMENTS } from './schema.js'

export type UserRecord = {
    id:string;
    handle:string;
    identifier:string;
    display_name:string|null;
    login_method:'passkey'|'password'|null;
    status:string;
    created_at:number;
    updated_at:number;
}

export type DeviceRecord = {
    id:string;
    user_id:string;
    credential_id:string;
    public_key:string;
    counter:number;
    transports_json:string|null;
    aaguid:string|null;
    credential_name:string|null;
    created_at:number;
    last_used_at:number|null;
    is_revoked:number;
}

export type AuthChallengeRecord = {
    id:string;
    user_id:string|null;
    identifier:string|null;
    purpose:'registration'|'authentication'|'device_addition'|'device_invitation';
    challenge_value:string;
    status:string;
    expires_at:number;
    created_at:number;
    used_at:number|null;
    metadata_json:string|null;
}

export type SessionRecord = {
    id:string;
    user_id:string;
    session_token:string;
    status:string;
    created_at:number;
    expires_at:number;
    revoked_at:number|null;
    last_seen_at:number;
    device_id:string|null;
}

export type SessionWithUserRecord = SessionRecord&{
    identifier:string;
    display_name:string|null;
    user_status:string;
    login_method:'passkey'|'password'|null;
}

export type ConfirmationCodeRecord = {
    code:string;
    identifier:string;
    status:'pending'|'used'|'expired';
    expires_at:number;
    created_at:number;
    updated_at:number;
    used_at:number|null;
}

export type DeviceInvitationRecord = {
    id:string;
    user_id:string;
    invite_code:string;
    device_name:string|null;
    status:'pending'|'consumed'|'cancelled'|'expired';
    expires_at:number;
    created_at:number;
    consumed_at:number|null;
}

type ChallengeMetadata = {
    userID?:string;
    displayName?:string;
    credentialName?:string;
}

const initializedDbs = new WeakSet<D1Database>()

export async function ensureAuthSchema (db:D1Database):Promise<void> {
    if (!db || typeof db.exec !== 'function') {
        throw new Error('AUTH_DB binding is unavailable.')
    }

    if (initializedDbs.has(db)) return
    await db.batch(
        AUTH_SCHEMA_STATEMENTS.map(statement => db.prepare(statement))
    )
    try {
        await db.prepare(
            'ALTER TABLE sessions ADD COLUMN device_id TEXT'
        ).run()
    } catch {
        // column already exists — ignore
    }
    initializedDbs.add(db)
}

export async function createConfirmationCode (
    db:D1Database,
    params:{
        code:string;
        identifier:string;
        expiresAt:number;
        now:number;
    },
):Promise<void> {
    await db.prepare(`
        INSERT INTO email_confirmation_codes (
            code, identifier, expires_at, status,
            created_at, updated_at
        ) VALUES (?, ?, ?, 'pending', ?, ?)
    `).bind(
        params.code,
        params.identifier,
        params.expiresAt,
        params.now,
        params.now,
    ).run()
}

export async function findConfirmationCode (
    db:D1Database,
    code:string,
):Promise<ConfirmationCodeRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM email_confirmation_codes
        WHERE code = ?
        LIMIT 1
    `).bind(code).first<ConfirmationCodeRecord>()

    return result ?? null
}

export async function markConfirmationCodeUsed (
    db:D1Database,
    code:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE email_confirmation_codes
        SET status = 'used',
            used_at = ?,
            updated_at = ?
        WHERE code = ?
    `).bind(
        now,
        now,
        code,
    ).run()
}

export async function markConfirmationCodeExpired (
    db:D1Database,
    code:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE email_confirmation_codes
        SET status = 'expired',
            updated_at = ?
        WHERE code = ?
    `).bind(
        now,
        code,
    ).run()
}

export async function findUserByIdentifier (
    db:D1Database,
    identifier:string,
):Promise<UserRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM users
        WHERE identifier = ?
        LIMIT 1
    `).bind(identifier).first<UserRecord>()

    return result ?? null
}

export async function findUserById (
    db:D1Database,
    id:string,
):Promise<UserRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM users
        WHERE id = ?
        LIMIT 1
    `).bind(id).first<UserRecord>()

    return result ?? null
}

export async function createUser (
    db:D1Database,
    params:{
        id:string;
        identifier:string;
        handle:string;
        displayName?:string;
        loginMethod:'passkey'|'password';
        now:number;
    }
):Promise<UserRecord> {
    await db.prepare(`
        INSERT INTO users (id, handle, identifier, display_name, login_method, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
        params.id,
        params.handle,
        params.identifier,
        params.displayName ?? null,
        params.loginMethod,
        params.now,
        params.now,
    ).run()

    return {
        id: params.id,
        handle: params.handle,
        identifier: params.identifier,
        display_name: params.displayName ?? null,
        status: 'pending',
        login_method: params.loginMethod,
        created_at: params.now,
        updated_at: params.now,
    }
}

export async function activateUser (
    db:D1Database,
    identifier:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE users
        SET status = 'active', updated_at = ?
        WHERE identifier = ?
    `).bind(now, identifier).run()
}

export async function countActiveDevicesByUserId (
    db:D1Database,
    userId:string,
):Promise<number> {
    const row = await db.prepare(
        'SELECT COUNT(*) as count FROM devices ' +
        'WHERE user_id = ? AND is_revoked = 0'
    ).bind(userId).first<{ count:number }>()
    return row?.count ?? 0
}

export async function listActiveDevicesByUserId (
    db:D1Database,
    userID:string,
):Promise<DeviceRecord[]> {
    const result = await db.prepare(`
        SELECT * FROM devices
        WHERE user_id = ? AND is_revoked = 0
        ORDER BY created_at ASC
    `).bind(userID).all<DeviceRecord>()

    return result.results ?? []
}

export async function listDevicesByUserId (
    db:D1Database,
    userID:string,
):Promise<DeviceRecord[]> {
    const result = await db.prepare(`
        SELECT * FROM devices
        WHERE user_id = ?
        ORDER BY CASE WHEN last_used_at IS NULL THEN 0 ELSE 1 END DESC,
                 last_used_at DESC, created_at ASC
    `).bind(userID).all<DeviceRecord>()

    return result.results ?? []
}

export async function findDeviceById (
    db:D1Database,
    deviceId:string,
):Promise<DeviceRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM devices
        WHERE id = ?
        LIMIT 1
    `).bind(deviceId).first<DeviceRecord>()

    return result ?? null
}

export async function findDeviceByCredentialId (
    db:D1Database,
    credentialID:string,
):Promise<DeviceRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM devices
        WHERE credential_id = ?
        LIMIT 1
    `).bind(credentialID).first<DeviceRecord>()

    return result ?? null
}

export async function createDevice (
    db:D1Database,
    params:{
        id:string;
        userID:string;
        credentialID:string;
        publicKey:string;
        counter:number;
        transports:string[]|undefined;
        aaguid:string|undefined;
        credentialName:string|undefined;
        now:number;
    }
):Promise<void> {
    await db.prepare(`
        INSERT INTO devices (
            id, user_id, credential_id, public_key, counter,
            transports_json, aaguid, credential_name, created_at, last_used_at, is_revoked
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).bind(
        params.id,
        params.userID,
        params.credentialID,
        params.publicKey,
        params.counter,
        params.transports ? JSON.stringify(params.transports) : null,
        params.aaguid ?? null,
        params.credentialName ?? null,
        params.now,
        params.now,
    ).run()
}

export async function updateDeviceUsage (
    db:D1Database,
    params:{
        credentialID:string;
        counter:number;
        now:number;
    }
):Promise<void> {
    await db.prepare(`
        UPDATE devices
        SET counter = ?, last_used_at = ?
        WHERE credential_id = ?
    `).bind(
        params.counter,
        params.now,
        params.credentialID,
    ).run()
}

export async function revokeDevice (
    db:D1Database,
    deviceID:string,
):Promise<void> {
    await db.prepare(`
        UPDATE devices
        SET is_revoked = 1
        WHERE id = ?
    `).bind(deviceID).run()
}

export async function revokeSessionsByDeviceId (
    db:D1Database,
    deviceId:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE sessions
        SET status = 'revoked', revoked_at = ?
        WHERE device_id = ? AND status = 'active'
    `).bind(now, deviceId).run()
}

export async function createChallenge (
    db:D1Database,
    params:{
        id:string;
        userID?:string;
        identifier?:string;
        purpose:'registration'|'authentication'|'device_addition'|'device_invitation';
        challengeValue:string;
        expiresAt:number;
        now:number;
        metadata?:ChallengeMetadata;
    }
):Promise<void> {
    await db.prepare(`
        INSERT INTO auth_challenges (
            id, user_id, identifier, purpose, challenge_value,
            status, expires_at, created_at, metadata_json
        )
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).bind(
        params.id,
        params.userID ?? null,
        params.identifier ?? null,
        params.purpose,
        params.challengeValue,
        params.expiresAt,
        params.now,
        params.metadata ? JSON.stringify(params.metadata) : null,
    ).run()
}

export async function findChallengeById (
    db:D1Database,
    challengeID:string,
):Promise<AuthChallengeRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM auth_challenges
        WHERE id = ?
        LIMIT 1
    `).bind(challengeID).first<AuthChallengeRecord>()

    return result ?? null
}

export function parseChallengeMetadata (
    challenge:AuthChallengeRecord
):ChallengeMetadata {
    if (!challenge.metadata_json) return {}

    try {
        return JSON.parse(challenge.metadata_json) as ChallengeMetadata
    } catch {
        return {}
    }
}

export async function markChallengeUsed (
    db:D1Database,
    challengeID:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE auth_challenges
        SET status = 'used', used_at = ?
        WHERE id = ?
    `).bind(now, challengeID).run()
}

export async function markChallengeExpired (
    db:D1Database,
    challengeID:string,
):Promise<void> {
    await db.prepare(`
        UPDATE auth_challenges
        SET status = 'expired'
        WHERE id = ?
    `).bind(challengeID).run()
}

export async function createSession (
    db:D1Database,
    params:{
        id:string;
        userID:string;
        sessionToken:string;
        expiresAt:number;
        now:number;
        deviceId?:string;
    }
):Promise<SessionRecord> {
    await db.prepare(`
        INSERT INTO sessions (
            id, user_id, session_token, status,
            created_at, expires_at, last_seen_at, device_id
        )
        VALUES (?, ?, ?, 'active', ?, ?, ?, ?)
    `).bind(
        params.id,
        params.userID,
        params.sessionToken,
        params.now,
        params.expiresAt,
        params.now,
        params.deviceId ?? null,
    ).run()

    return {
        id: params.id,
        user_id: params.userID,
        session_token: params.sessionToken,
        status: 'active',
        created_at: params.now,
        expires_at: params.expiresAt,
        revoked_at: null,
        last_seen_at: params.now,
        device_id: params.deviceId ?? null,
    }
}

export async function findSessionByToken (
    db:D1Database,
    sessionToken:string,
):Promise<SessionWithUserRecord|null> {
    const result = await db.prepare(`
        SELECT
            sessions.*,
            users.identifier AS identifier,
            users.display_name AS display_name,
            users.login_method AS login_method,
            users.status AS user_status
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.session_token = ?
        LIMIT 1
    `).bind(sessionToken).first<SessionWithUserRecord>()

    return result ?? null
}

export async function touchSession (
    db:D1Database,
    sessionToken:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE sessions
        SET last_seen_at = ?
        WHERE session_token = ?
    `).bind(now, sessionToken).run()
}

export async function revokeSession (
    db:D1Database,
    sessionToken:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE sessions
        SET status = 'revoked', revoked_at = ?
        WHERE session_token = ?
    `).bind(now, sessionToken).run()
}

export async function expireSession (
    db:D1Database,
    sessionToken:string,
):Promise<void> {
    await db.prepare(`
        UPDATE sessions
        SET status = 'expired'
        WHERE session_token = ?
    `).bind(sessionToken).run()
}

export async function createAuthEvent (
    db:D1Database,
    params:{
        id:string;
        userID?:string;
        sessionID?:string;
        challengeID?:string;
        eventType:string;
        result:'success'|'failure';
        occurredAt:number;
        detail?:string;
    }
):Promise<void> {
    await db.prepare(`
        INSERT INTO auth_events (
            id, user_id, session_id, challenge_id,
            event_type, result, occurred_at, detail
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        params.id,
        params.userID ?? null,
        params.sessionID ?? null,
        params.challengeID ?? null,
        params.eventType,
        params.result,
        params.occurredAt,
        params.detail ?? null,
    ).run()
}

export async function createInvitation (
    db:D1Database,
    params:{
        id:string;
        userID:string;
        inviteCode:string;
        deviceName?:string;
        expiresAt:number;
        now:number;
    },
):Promise<void> {
    await db.prepare(`
        INSERT INTO device_invitations (
            id, user_id, invite_code, device_name,
            status, expires_at, created_at
        )
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
        params.id,
        params.userID,
        params.inviteCode,
        params.deviceName ?? null,
        params.expiresAt,
        params.now,
    ).run()
}

export async function findInvitationByCode (
    db:D1Database,
    inviteCode:string,
):Promise<DeviceInvitationRecord|null> {
    const result = await db.prepare(`
        SELECT * FROM device_invitations
        WHERE invite_code = ?
        LIMIT 1
    `).bind(
        inviteCode,
    ).first<DeviceInvitationRecord>()

    return result ?? null
}

export async function markInvitationConsumed (
    db:D1Database,
    inviteCode:string,
    now:number,
):Promise<void> {
    await db.prepare(`
        UPDATE device_invitations
        SET status = 'consumed', consumed_at = ?
        WHERE invite_code = ?
    `).bind(now, inviteCode).run()
}

export async function markInvitationCancelled (
    db:D1Database,
    inviteCode:string,
):Promise<void> {
    await db.prepare(`
        UPDATE device_invitations
        SET status = 'cancelled'
        WHERE invite_code = ?
    `).bind(inviteCode).run()
}

export async function countPendingInvitationsByUserId (
    db:D1Database,
    userId:string,
    now:number,
):Promise<number> {
    const row = await db.prepare(
        'SELECT COUNT(*) as count '
        + 'FROM device_invitations '
        + 'WHERE user_id = ? '
        + 'AND status = \'pending\' '
        + 'AND expires_at > ?'
    ).bind(userId, now).first<{ count:number }>()
    return row?.count ?? 0
}

export async function listPendingInvitationsByUserId (
    db:D1Database,
    userId:string,
    now:number,
):Promise<DeviceInvitationRecord[]> {
    const result = await db.prepare(`
        SELECT * FROM device_invitations
        WHERE user_id = ?
        AND status = 'pending'
        AND expires_at > ?
        ORDER BY created_at DESC
    `).bind(userId, now).all<DeviceInvitationRecord>()

    return result.results ?? []
}
