export const AUTH_SCHEMA_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        handle TEXT NOT NULL,
        identifier TEXT NOT NULL UNIQUE,
        display_name TEXT,
        login_method TEXT NOT NULL DEFAULT 'password',
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        counter INTEGER NOT NULL DEFAULT 0,
        transports_json TEXT,
        aaguid TEXT,
        credential_name TEXT,
        created_at INTEGER NOT NULL,
        last_used_at INTEGER,
        is_revoked INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS auth_challenges (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        identifier TEXT,
        purpose TEXT NOT NULL,
        challenge_value TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        used_at INTEGER,
        metadata_json TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_token TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER,
        last_seen_at INTEGER NOT NULL,
        device_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS auth_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        challenge_id TEXT,
        event_type TEXT NOT NULL,
        result TEXT NOT NULL,
        occurred_at INTEGER NOT NULL,
        detail TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS email_confirmation_codes (
        code TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        used_at INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS device_invitations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        invite_code TEXT NOT NULL UNIQUE,
        device_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        consumed_at INTEGER,
        FOREIGN KEY (user_id)
            REFERENCES users(id) ON DELETE CASCADE
    )`,
] as const

export const AUTH_SCHEMA_SQL = `${AUTH_SCHEMA_STATEMENTS.join(';\n\n')};\n`
