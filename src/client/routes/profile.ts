import { type FunctionComponent } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'
import { useComputed, useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import { SubstrateInput } from '@substrate-system/input'
import { CopyButton } from '@substrate-system/copy-button'
import {
    type AppState,
    type DeviceInfo,
    type DeviceInvitation,
    type PendingInvitation,
    State,
} from '../state.js'
import {
    formatSessionExpiration,
    type SessionExpirationResult,
} from '../utils/session-expiration.js'
import './profile.css'
import { ELLIPSIS } from '../constants.js'
import Debug from '@substrate-system/debug'
const debug = Debug('template:view')

export const ProfileRoute:FunctionComponent<{
    state:AppState;
}> = function ({ state }) {
    const isAuthenticated = useComputed(() => {
        return state.user.value.data?.authenticated === true
    })

    const isPasskeyUser = useComputed(() => {
        const session = state.user.value.data
        if (session?.authenticated !== true) return false
        const method = session.loginMethod ?? session.user?.login_method ?? null
        return method === 'passkey'
    })

    const profileView = useComputed(() => {
        const session = state.user.value.data
        if (session?.authenticated !== true) return null

        const user = session.user
        const expires = session.session?.expiresAt
        const sessionExpires:SessionExpirationResult = formatSessionExpiration(expires)

        const rawLoginMethod = session.loginMethod ?? user?.login_method ?? null
        const loginMethodLabel =
            formatLoginMethodLabel(rawLoginMethod)
        const loginMethodHint =
            loginMethodLabel === 'Unknown method' ?
                'Login method is not recorded for this account.' :
                null

        return {
            identifier:
                user?.identifier ?? '(unknown)',
            displayName:
                user?.displayName ?? '(not set)',
            loginMethodLabel,
            loginMethodHint,
            sessionExpires,
        }
    })

    const logoutPending = useComputed(
        () => state.logoutInProgress.value,
    )
    const logoutError = useComputed(
        () => state.logoutError.value,
    )

    const onLogout = useCallback(async () => {
        await State.logout(state)
    }, [state])

    // -- device management state --
    const devices = useComputed(() => {
        return state.devices.value.data ?? []
    })

    const devicesLoading = useComputed(() => {
        return state.devices.value.pending ?? false
    })

    const addDeviceName = useSignal('')
    const addDevicePending = useSignal(false)
    const addDeviceError = useSignal<string | null>(null)
    const lastInvite = useSignal<DeviceInvitation | null>(null)
    const revokePending = useSignal<string | null>(null)
    const revokeError = useSignal<string | null>(null)
    const cancelPending = useSignal<string | null>(null)

    const pendingInvitations = useComputed(() => {
        return state.invitations.value.data ?? []
    })

    useEffect(() => {
        if (isPasskeyUser.value) {
            State.listDevices(state)
            State.listInvites(state)
        }
    }, [isPasskeyUser.value])

    const onAddDevice = useCallback(async () => {
        addDevicePending.value = true
        addDeviceError.value = null
        lastInvite.value = null
        debug('creating device invitation...')

        try {
            const result = await State.createInvite(
                state,
                addDeviceName.value.trim() || undefined,
            )
            addDeviceName.value = ''
            if (result) {
                lastInvite.value = result
            }
        } catch (_err) {
            const err = _err as Error
            addDeviceError.value = (
                err.message || 'Failed to create invitation.'
            )
        } finally {
            addDevicePending.value = false
        }
    }, [state])

    const onCancelInvite = useCallback(
        async (inviteCode:string) => {
            cancelPending.value = inviteCode
            try {
                await State.cancelInvite(state, inviteCode)
                if (lastInvite.value?.inviteCode === inviteCode) {
                    lastInvite.value = null
                }
            } catch (_err) {
                const err = _err as Error
                revokeError.value = (
                    err.message || 'Failed to cancel invitation.'
                )
            } finally {
                cancelPending.value = null
            }
        },
        [state],
    )

    const onRevokeDevice = useCallback(
        async (deviceId:string) => {
            revokePending.value = deviceId
            revokeError.value = null

            try {
                await State.revokeDevice(state, deviceId)
            } catch (_err) {
                const err = _err as Error
                revokeError.value = err.message || 'Failed to revoke device.'
            } finally {
                revokePending.value = null
            }
        },
        [state],
    )

    const activeDevices = useComputed(() => {
        return devices.value.filter((d:DeviceInfo) => !d.isRevoked)
    })
    const canRevoke = useComputed(
        () => activeDevices.value.length > 1
    )

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
                            aria-live=${profileView.value.loginMethodHint ?
                                'polite' :
                                undefined
                            }
                        >
                            ${profileView.value.loginMethodLabel}
                            ${profileView.value.loginMethodHint ?
                                html`
                                <span class="profile-sr-only">
                                    ${profileView.value.loginMethodHint}
                                </span>` : null}
                        </dd>
                    </div>
                    <div>
                        <dt>Session expires</dt>
                        <dd
                            class="profile-field-value"
                            aria-live=${profileView.value.sessionExpires.hint ?
                                'polite' :
                                undefined
                            }
                        >
                            ${profileView.value.sessionExpires.label}
                            ${profileView.value.sessionExpires.hint ?
                                html`<span class="profile-sr-only">
                                    ${profileView.value
                                        .sessionExpires
                                        .hint}
                                </span>` :
                                null
                            }
                        </dd>
                    </div>
                </dl>
            </section>` : html`
            <p>
                Profile data goes here.
            </p>`}

        ${isPasskeyUser.value ? html`
            <section
                class="device-management"
                aria-label="Registered devices"
            >
                <h3>Devices</h3>

                ${devicesLoading.value ? html`
                    <p class="devices-loading">
                        Loading devices...
                    </p>
                ` : null}

                ${activeDevices.value.length > 0 ? html`
                    <ul class="device-list" role="list">
                        ${activeDevices.value.map(
                            (device:DeviceInfo) => html`
                            <li class="device-item card" key=${device.deviceId}>
                                <div class="device-info">
                                    <span class="device-name">
                                        ${device.credentialName || 'Unnamed'}
                                    </span>
                                    <span
                                        class="device-dates"
                                    >
                                        Added ${formatDate(device.createdAt)}${
                                            device.lastUsedAt ?
                                                (' \u00B7 Last used ' +
                                                    formatDate(device.lastUsedAt)) :
                                                ''
                                        }
                                    </span>
                                </div>
                                <${SubstrateButton.TAG}
                                    class="device-revoke-btn"
                                    type="button"
                                    onClick=${() =>
                                        onRevokeDevice(device.deviceId)
                                    }
                                    disabled=${!canRevoke.value ||
                                        revokePending.value === device.deviceId}
                                    spinning=${revokePending.value === device.deviceId}
                                    title=${canRevoke.value ?
                                        'Revoke this device' :
                                        'Cannot revoke your only device'}
                                >
                                    Revoke
                                <//>
                            </li>`,
                        )}
                    </ul>
                ` : null}

                ${revokeError.value ? html`
                    <p class="device-error" role="status">
                        ${revokeError.value}
                    </p>
                ` : null}

                ${pendingInvitations.value.length > 0 ? html`
                    <h3>Pending Invitations</h3>
                    <ul class="invitation-list" role="list">
                        ${pendingInvitations.value.map(
                            (inv:PendingInvitation) => html`
                            <li
                                class="invitation-item card"
                                key=${inv.inviteCode}
                            >
                                <div class="invitation-info">
                                    <span class="invitation-name">
                                        ${inv.deviceName || 'Unnamed'}
                                    </span>
                                    <span class="invitation-expires">
                                        Expires ${formatDate(inv.expiresAt)}
                                    </span>
                                </div>
                                <${SubstrateButton.TAG}
                                    class="invitation-cancel-btn"
                                    type="button"
                                    onClick=${() =>
                                        onCancelInvite(inv.inviteCode)
                                    }
                                    disabled=${cancelPending.value ===
                                        inv.inviteCode}
                                    spinning=${cancelPending.value ===
                                        inv.inviteCode}
                                >
                                    Cancel
                                <//>
                            </li>`,
                        )}
                    </ul>
                ` : null}

                <h3>Add Device</h3>
                <div class="add-device-section" aria-live="polite">
                    <label class="add-device-label">
                        <span>Device name (optional)</span>
                        <${SubstrateInput.TAG}
                            name="device-name"
                            id="device-name"
                            placeholder="My work laptop"
                            value=${addDeviceName.value}
                        ><//>
                    </label>
                    <${SubstrateButton.TAG}
                        class="add-device-btn"
                        type="button"
                        onClick=${onAddDevice}
                        spinning=${addDevicePending.value}
                        disabled=${addDevicePending.value}
                    >
                        ${addDevicePending.value ?
                            `Creating${ELLIPSIS}` :
                            'Add device'}
                    <//>
                    ${addDeviceError.value ? html`
                        <p class="device-error" role="status">
                            ${addDeviceError.value}
                        </p>
                    ` : null}
                    ${lastInvite.value ? html`
                        <div class="invite-result" role="status">
                            <p class="invite-url-label">
                                Share this link with your
                                new device:
                            </p>
                            <div class="invite-url-row">
                                <code class="invite-url card">
                                    ${lastInvite.value.inviteUrl}
                                </code>
                                <${CopyButton.TAG}
                                    payload=${lastInvite.value.inviteUrl}
                                ><//>
                            </div>
                            <p class="invite-expires">
                                Expires ${formatDate(
                                    lastInvite.value.expiresAt
                                )}
                            </p>
                        </div>
                    ` : null}
                </div>
            </section>
        ` : null}

        ${isAuthenticated.value ? html`
            <hr />
            <div class="controls" aria-live="polite">
                <${SubstrateButton.TAG}
                    class="profile-logout-button"
                    type="button"
                    onClick=${onLogout}
                    spinning=${logoutPending.value}
                    disabled=${logoutPending.value}
                >
                    ${logoutPending.value ? `Logging out${ELLIPSIS}` : 'Logout'}
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

function formatDate (iso:string):string {
    try {
        return new Date(iso).toLocaleDateString(
            undefined,
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            },
        )
    } catch {
        return iso
    }
}
