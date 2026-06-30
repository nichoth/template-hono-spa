import { type FunctionComponent } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks'
import { useComputed, useSignal, useSignalEffect, batch } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import { SubstrateInput } from '@substrate-system/input'
import { CopyButton } from '@substrate-system/copy-button'
import { ModalWindow } from '@substrate-system/dialog'
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
} from '../util/session-expiration.js'
import './profile.css'
import { BULLET, ELLIPSIS } from '../constants.js'
import Debug from '@substrate-system/debug'

const debug = Debug('template:view')

export const ProfileRoute:FunctionComponent<{
    state:AppState;
}> = function ({ state }) {
    const isAuthenticated = useComputed(() => {
        return state.user.value.data?.authenticated === true
    })

    const isPasskeyUser = useComputed<boolean>(() => {
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
    const devicesLoading = useComputed(() => {
        return state.devices.value.pending ?? false
    })
    const devicesError = useComputed(() => {
        const err = state.devices.value.error
        if (!err) return null
        return err.message || 'Failed to load devices.'
    })

    const addDeviceName = useSignal('')
    const addDevicePending = useSignal(false)
    const addDeviceError = useSignal<string|null>(null)
    const lastInvite = useSignal<DeviceInvitation|null>(null)
    const revokePending = useSignal<string|null>(null)
    const revokeError = useSignal<string|null>(null)
    const revokeTarget = useSignal<DeviceInfo|null>(null)
    const revokeDialogOpen = useSignal(false)
    const revokeDialogError = useSignal<string|null>(null)
    const cancelPending = useSignal<string|null>(null)
    const currentDeviceId = useComputed(() => {
        const data = state.user.value.data
        if (!data || data.authenticated !== true) return null
        return data.currentDeviceId ?? null
    })

    const revokeDialogRef = useRef<ModalWindow|null>(null)

    const pendingInvitations = useComputed(() => {
        return state.invitations.value.data ?? []
    })

    // listen for signal changes,
    // update the web-component state
    useSignalEffect(() => {
        const isOpen = revokeDialogOpen.value
        const modal = revokeDialogRef.current
        if (!modal) return
        if (isOpen) modal.open()
        else modal.close()
    })

    // dialog state
    useEffect(() => {
        if (!revokeDialogRef.current) return
        revokeDialogRef.current.addEventListener('open', () => {
            revokeDialogOpen.value = true
        })
        revokeDialogRef.current.addEventListener('close', () => {
            revokeDialogOpen.value = false
        })
    }, [revokeDialogRef.current])

    const onAddDevice = useCallback(async () => {
        addDevicePending.value = true
        addDeviceError.value = null
        lastInvite.value = null
        debug('creating device invitation...')

        try {
            const result = await State.createInvite(
                state,
                addDeviceName.value.trim(),
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

    const onConfirmRevoke = useCallback(async () => {
        const device = revokeTarget.value
        if (!device) return
        revokePending.value = device.deviceId
        revokeDialogError.value = null

        try {
            await State.revokeDevice(state, device.deviceId)
            batch(() => {
                revokeTarget.value = null
                revokeDialogOpen.value = false
            })
        } catch (_err) {
            const err = _err as Error
            revokeDialogError.value = (
                err.message || 'Failed to revoke device.'
            )
        } finally {
            revokePending.value = null
        }
    }, [state])

    const deviceList = useComputed(() => {
        return state.devices.value.data ?? []
    })
    const showEmptyDevices = useComputed(() => {
        return (
            !devicesLoading.value &&
            devicesError.value === null &&
            deviceList.value.length === 0
        )
    })
    const canRevoke = useComputed(() => {
        if (deviceList.value.length === 0) return false
        return deviceList.value.filter(
            (d:DeviceInfo) => !d.isRevoked
        ).length > 1
    })

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
            </section>` :
            null}

        ${isPasskeyUser.value ? html`
            <section class="device-management" aria-label="Registered devices">
                <h3>Devices</h3>

                ${devicesLoading.value ? html`
                    <p class="devices-loading">
                        Loading devices...
                    </p>
                ` : null}

                ${deviceList.value.length > 0 ? html`
                    <ul class="device-list" role="list">
                        ${deviceList.value.map(
                            (device:DeviceInfo) => html`
                            <li
                                class=${device.isRevoked ?
                                    'device-item card revoked' :
                                    'device-item card'
                                }
                                key=${device.deviceId}
                            >
                                <div class="device-info">
                                    <span class="device-name">
                                        ${device.credentialName || 'Unnamed'}
                                        ${device.isRevoked ? html`
                                            <span class="device-revoked-label small-caps">
                                                Revoked
                                            </span>` : null}
                                        ${device.deviceId ===
                                            currentDeviceId.value ?
                                            html`<span
                                                class="device-current"
                                            >(current device)</span>` :
                                            null
                                        }
                                    </span>
                                    <span class="device-dates">
                                        Added ${formatDate(device.createdAt)}${
                                            device.lastUsedAt ?
                                                (` ${BULLET} Last used ` +
                                                    formatDate(device.lastUsedAt)) :
                                                ''
                                        }
                                    </span>
                                </div>
                                ${!device.isRevoked ? html`
                                <${SubstrateButton.TAG}
                                    class="device-revoke-btn"
                                    type="button"
                                    onClick=${() => {
                                        batch(() => {
                                            revokeTarget.value = device
                                            revokeDialogOpen.value = true
                                        })
                                    }}
                                    disabled=${!canRevoke.value ||
                                        device.deviceId === currentDeviceId.value}
                                    title=${
                                        device.deviceId === currentDeviceId.value ?
                                            'Cannot revoke the device'
                                                + ' you are using' :
                                            canRevoke.value ?
                                                'Revoke this device' :
                                                'Cannot revoke your'
                                                    + ' only device'
                                    }
                                    ref=${(el:Element|null) => {
                                        // this is b/c passing `disabled` via
                                        // preact/htm doesn't work
                                        if (!el) return
                                        const d = (
                                            !canRevoke.value ||
                                            device.deviceId === currentDeviceId.value
                                        )
                                        if (d) {
                                            el.setAttribute('disabled', '')
                                        } else {
                                            el.removeAttribute('disabled')
                                        }
                                    }}
                                >
                                    Revoke
                                <//>` : null}
                            </li>`,
                        )}
                    </ul>
                ` : null}

                ${showEmptyDevices.value ? html`
                    <p class="devices-empty" role="status">
                        No registered devices yet.
                    </p>
                ` : null}

                ${devicesError.value ? html`
                    <p class="device-error" role="status">
                        ${devicesError.value}
                    </p>
                ` : null}

                ${revokeError.value ? html`
                    <p class="device-error" role="status">
                        ${revokeError.value}
                    </p>
                ` : null}

                <${ModalWindow.TAG}
                    ref=${(el:ModalWindow|null) => {
                        revokeDialogRef.current = el
                    }}
                    active="${revokeDialogOpen.value}"
                >
                    <h2>
                        Remove device <code>${
                            revokeTarget.value?.credentialName || 'Unnamed'
                        }</code>?
                    </h2>
                    <div class="dialog-actions">
                        <${SubstrateButton.TAG}
                            type="button"
                            onClick=${() => {
                                batch(() => {
                                    revokeTarget.value = null
                                    revokeDialogOpen.value = false
                                })
                            }}
                        >
                            Cancel
                        <//>

                        <${SubstrateButton.TAG}
                            class="dialog-revoke-btn btn-danger"
                            type="button"
                            onClick=${onConfirmRevoke}
                            spinning=${revokePending.value !== null}
                            disabled=${revokePending.value !== null}
                            ref=${(el:Element|null) => {
                                if (!el) return
                                if (revokePending.value !== null) {
                                    el.setAttribute('disabled', '')
                                } else {
                                    el.removeAttribute('disabled')
                                }
                            }}
                        >
                            Revoke this device
                        <//>
                    </div>
                    ${revokeDialogError.value ? html`
                        <p class="device-error">
                            ${revokeDialogError.value}
                        </p>
                    ` : null}
                <//>

                ${pendingInvitations.value.length > 0 ? html`
                    <h3>Pending Invitations</h3>
                    <ul class="invitation-list" role="list">
                        ${pendingInvitations.value.map(
                            (inv:PendingInvitation) => html`
                            <li
                                class="invitation-item card"
                                key=${inv.inviteCode}
                            >
                                <div class="invitation-header">
                                    <div class="invitation-info">
                                        <span class="invitation-name">
                                            ${inv.deviceName || 'Unnamed'}
                                        </span>
                                        <span class="invitation-expires">
                                            Expires ${formatExpiration(inv.expiresAt)}
                                        </span>
                                    </div>
                                    <${SubstrateButton.TAG}
                                        class="invitation-cancel-btn"
                                        type="button"
                                        onClick=${() =>
                                            onCancelInvite(inv.inviteCode)
                                        }
                                        disabled=${cancelPending.value === inv.inviteCode}
                                        spinning=${cancelPending.value === inv.inviteCode}
                                    >
                                        Cancel
                                    <//>
                                </div>
                                <div class="invite-url-row">
                                    <code class="invite-url">
                                        ${location.origin}/add/${inv.inviteCode}
                                    </code>
                                    <${CopyButton.TAG}
                                        payload=${`${location.origin}/add/${inv.inviteCode}`}
                                    ><//>
                                </div>
                            </li>`,
                        )}
                    </ul>
                ` : null}

                <h3>Add Device</h3>
                <div class="add-device-section" aria-live="polite">
                    <label class="add-device-label">
                        <span>Device name</span>
                        <${SubstrateInput.TAG}
                            name="device-name"
                            id="device-name"
                            placeholder="My work laptop"
                            value=${addDeviceName.value}
                            onInput=${(event:InputEvent) => {
                                addDeviceName.value =
                                    (event.target as
                                        HTMLInputElement).value
                            }}
                        ><//>
                    </label>
                    <${SubstrateButton.TAG}
                        class="add-device-btn"
                        type="button"
                        onClick=${onAddDevice}
                        spinning=${addDevicePending.value}
                        disabled=${addDevicePending.value ||
                            addDeviceName.value.trim() === ''}
                        ref=${(el:Element|null) => {
                            if (!el) return
                            const d = addDevicePending.value ||
                                addDeviceName.value.trim() === ''
                            if (d) {
                                el.setAttribute('disabled', '')
                            } else {
                                el.removeAttribute('disabled')
                            }
                        }}
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
                                Expires ${formatExpiration(
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
        return new Date(iso).toLocaleString(
            undefined,
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            },
        )
    } catch {
        return iso
    }
}

function formatExpiration (iso:string):string {
    try {
        const date = new Date(iso)
        const now = new Date()
        const isToday = (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        )
        const time = date.toLocaleTimeString(
            undefined,
            { hour: 'numeric', minute: '2-digit' },
        )
        return isToday ?
            `today, ${time}` :
            formatDate(iso)
    } catch {
        return iso
    }
}
