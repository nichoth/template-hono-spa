import { State, type AppState, type SessionResponse } from './state.js'

export function formatLoginStatus (session?:SessionResponse|null):string {
    if (session?.authenticated === true) {
        const user = session.user
        const identifier = user?.identifier

        if (identifier) {
            const loginMethodLabel = formatLoginMethod(
                session.loginMethod ?? user?.login_method ?? null
            )
            return `logged in via ${loginMethodLabel} as ${identifier}`
        }
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
