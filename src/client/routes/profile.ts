import { type FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { useComputed } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import { type AppState, State } from '../state.js'
import './profile.css'

export const ProfileRoute:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const isAuthenticated = useComputed(() => {
        return state.user.value.data?.authenticated === true
    })

    const profileView = useComputed(() => {
        const session = state.user.value.data
        if (session?.authenticated !== true) return null

        const user = session.user
        const expires = session.session?.expiresAt
        let expiresLabel = 'Expires: Unknown'
        let expiresHint: string | null = null

        if (expires) {
            const parsed = new Date(expires)
            if (Number.isNaN(parsed.getTime())) {
                console.warn('Profile route: session.expiresAt is malformed', expires)
                expiresHint = 'Session expiration timestamp is malformed.'
            } else {
                expiresLabel = parsed.toISOString()
            }
        } else {
            expiresHint = 'Session expiration timestamp is unavailable.'
        }

        const rawLoginMethod = session.loginMethod ?? user?.login_method ?? null
        const loginMethodLabel = formatLoginMethodLabel(rawLoginMethod)
        const loginMethodHint = loginMethodLabel === 'Unknown method' ?
            'Login method is not recorded for this account.' :
            null

        return {
            identifier: user?.identifier ?? '(unknown)',
            displayName: user?.displayName ?? '(not set)',
            loginMethodLabel,
            loginMethodHint,
            expiresLabel,
            expiresHint,
        }
    })

    const logoutPending = useComputed(() => state.logoutInProgress.value)
    const logoutError = useComputed(() => state.logoutError.value)

    const onLogout = useCallback(async () => {
        await State.logout(state)
    }, [state])

    return html`<div class="route profile">
        <h2>Profile</h2>
        ${profileView.value ? html`
            <section class="profile-card">
                <dl class="profile-fields">
                    <div>
                        <dt>Identifier</dt>
                        <dd class="profile-field-value">
                            ${profileView.value.identifier}
                        </dd>
                    </div>
                    <div>
                        <dt>Display name</dt>
                        <dd class="profile-field-value">
                            ${profileView.value.displayName}
                        </dd>
                    </div>
                    <div>
                        <dt>Login method</dt>
                        <dd
                            class="profile-field-value"
                            aria-live=${profileView.value.loginMethodHint ? 'polite' : undefined}
                        >
                            ${profileView.value.loginMethodLabel}
                            ${profileView.value.loginMethodHint ? html`
                                <span class="profile-sr-only">
                                    ${profileView.value.loginMethodHint}
                                </span>` : null}
                        </dd>
                    </div>
                    <div>
                        <dt>Session expires</dt>
                        <dd
                            class="profile-field-value"
                            aria-live=${profileView.value.expiresHint ? 'polite' : undefined}
                        >
                            ${profileView.value.expiresLabel}
                            ${profileView.value.expiresHint ? html`
                                <span class="profile-sr-only">
                                    ${profileView.value.expiresHint}
                                </span>` : null}
                        </dd>
                    </div>
                </dl>
            </section>` : html`
            <p>
                Profile data goes here.
            </p>`}
        ${isAuthenticated.value ? html`
            <div class="controls" aria-live="polite">
                <${SubstrateButton.TAG}
                    class="profile-logout-button"
                    type="button"
                    onClick=${onLogout}
                    spinning=${logoutPending.value}
                    disabled=${logoutPending.value}
                >
                    ${logoutPending.value ? 'Logging out…' : 'Logout'}
                <//>
                ${logoutError.value ? html`
                    <p class="profile-logout-error" role="status">
                        ${logoutError.value}
                    </p>` : null}
            </div>` : null}
    </div>`
}

function formatLoginMethodLabel (
    method:'passkey'|'password'|null,
):string {
    if (method === 'passkey') return 'Passkey'
    if (method === 'password') return 'Password'
    return 'Unknown method'
}
