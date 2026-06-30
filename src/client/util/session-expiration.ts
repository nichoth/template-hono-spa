export type SessionExpirationResult = {
    label:string
    hint:string|null
    isFallback:boolean
}

function formatFriendlyDate (date:Date):string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const rawHour = date.getUTCHours()
    const hour = rawHour % 12 === 0 ? 12 : rawHour % 12
    const minute = String(date.getUTCMinutes()).padStart(2, '0')
    const period = rawHour >= 12 ? 'pm' : 'am'

    return `${year}-${month}-${day}, ${hour}:${minute}${period}`
}

function fallback (hint:string):SessionExpirationResult {
    return {
        label: 'Session Expires not available',
        hint,
        isFallback: true,
    }
}

export function formatSessionExpiration (
    expiresAt:string|null|undefined,
):SessionExpirationResult {
    if (!expiresAt) {
        return fallback('Session expiration timestamp is unavailable.')
    }

    const parsed = new Date(expiresAt)
    if (Number.isNaN(parsed.getTime())) {
        return fallback('Session expiration timestamp is malformed.')
    }

    return {
        label: formatFriendlyDate(parsed),
        hint: null,
        isFallback: false,
    }
}
