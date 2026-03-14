import { type FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { useComputed } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import type { AppState } from '../state.js'
import { handleLogout } from '../login-status.js'
import './profile.css'

export const ProfileRoute:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const isAuthenticated = useComputed(() => {
        return state.user.value.data?.authenticated === true
    })

    const logoutPending = useComputed(() => state.logoutInProgress.value)
    const logoutError = useComputed(() => state.logoutError.value)

    const onLogout = useCallback(async () => {
        await handleLogout(state)
    }, [state])

    return html`<div class="route profile">
        <h2>Profile</h2>
        <p>
            Profile data goes here.
        </p>
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
