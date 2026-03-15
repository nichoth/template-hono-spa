import { describe, expect, it } from 'vitest'
import { formatSessionExpiration } from '../src/client/utils/session-expiration.js'

describe('formatSessionExpiration', () => {
    it('formats a valid ISO timestamp as YYYY-MM-DD, h:mmam/pm', () => {
        const result = formatSessionExpiration('2026-04-02T15:21:00.000Z')

        expect(result).toEqual({
            label: '2026-04-02, 3:21pm',
            hint: null,
            isFallback: false,
        })
    })

    it('returns the fallback label and hint when the timestamp is missing or invalid', () => {
        const missingResult = formatSessionExpiration(undefined)
        const invalidResult = formatSessionExpiration('not-a-date')

        expect(missingResult).toEqual({
            label: 'Session Expires not available',
            hint: 'Session expiration timestamp is unavailable.',
            isFallback: true,
        })

        expect(invalidResult).toEqual({
            label: 'Session Expires not available',
            hint: 'Session expiration timestamp is malformed.',
            isFallback: true,
        })
    })
})
