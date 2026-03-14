import { State, type AppState, type SessionResponse } from './state.js'

export function formatLoginStatus (session?: SessionResponse | null): string {
    const identifier = session?.user?.identifier
    const isAuthenticated = session?.authenticated === true && Boolean(identifier)

    if (isAuthenticated && identifier) {
        const loginMethodLabel = formatLoginMethod(
            session?.loginMethod ?? session?.user?.login_method ?? null
        )
        return `logged in via ${loginMethodLabel} as ${identifier}`
    }

    return 'anonymous'
}

function formatLoginMethod (method:'passkey'|'password'|null|undefined): string {
    if (method === 'passkey') return 'Passkey'
    if (method === 'password') return 'Password'
    return 'unknown method'
}

export async function handleLogout (state: AppState): Promise<void> {
    await State.logout(state)
}
