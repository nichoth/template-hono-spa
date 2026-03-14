import type { SessionResponse } from './state.js'

export function formatLoginStatus (session?: SessionResponse | null): string {
    const identifier = session?.user?.identifier
    const isAuthenticated = session?.authenticated === true && Boolean(identifier)

    if (isAuthenticated && identifier) {
        return `logged in as ${identifier}`
    }

    return 'logged in as anonymous'
}
