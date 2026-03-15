import { type FunctionComponent } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useComputed } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import {
    type AppState,
    type DeviceInfo,
    State,
} from '../state.js'
import {
    formatSessionExpiration,
    type SessionExpirationResult,
} from '../utils/session-expiration.js'
import './profile.css'

export const ProfileRoute:FunctionComponent<{
    state:AppState;
}> = function ({ state }) {
    const isAuthenticated = useComputed(() => {
        return state.user.value.data
            ?.authenticated === true
    })

    const isPasskeyUser = useComputed(() => {
        const session = state.user.value.data
        if (session?.authenticated !== true) return false
        const method = session.loginMethod
            ?? session.user?.login_method
            ?? null
        return method === 'passkey'
    })

    const profileView = useComputed(() => {
        const session = state.user.value.data
        if (session?.authenticated !== true) return null

        const user = session.user
        const expires = session.session?.expiresAt
        const sessionExpires:SessionExpirationResult =
            formatSessionExpiration(expires)

        const rawLoginMethod =
            session.loginMethod
            ?? user?.login_method
            ?? null
        const loginMethodLabel =
            formatLoginMethodLabel(rawLoginMethod)
        const loginMethodHint =
            loginMethodLabel === 'Unknown method' ?
                'Login method is not recorded '
                + 'for this account.' :
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

    // -- Device management state --
    const devices = useComputed(() => {
        return state.devices.value.data ?? []
    })

    const devicesLoading = useComputed(() => {
        return state.devices.value.pending ?? false
    })

    const [addDeviceName, setAddDeviceName] =
        useState('')
    const [addDevicePending, setAddDevicePending] =
        useState(false)
    const [addDeviceError, setAddDeviceError] =
        useState<string | null>(null)
    const [addDeviceSuccess, setAddDeviceSuccess] =
        useState<string | null>(null)
    const [revokePending, setRevokePending] =
        useState<string | null>(null)
    const [revokeError, setRevokeError] =
        useState<string | null>(null)

    useEffect(() => {
        if (isPasskeyUser.value) {
            State.listDevices(state)
        }
    }, [isPasskeyUser.value])

    const onAddDevice = useCallback(async () => {
        setAddDevicePending(true)
        setAddDeviceError(null)
        setAddDeviceSuccess(null)

        try {
            const result = await State.addDevice(
                state,
                addDeviceName.trim() || undefined,
            )
            setAddDeviceName('')
            if (result) {
                setAddDeviceSuccess(
                    'Added "'
                    + result.device.credentialName
                    + '"',
                )
            }
        } catch (_err) {
            const err = _err as Error
            setAddDeviceError(
                err.message || 'Failed to add device.',
            )
        } finally {
            setAddDevicePending(false)
        }
    }, [state, addDeviceName])

    const onRevokeDevice = useCallback(
        async (deviceId:string) => {
            setRevokePending(deviceId)
            setRevokeError(null)

            try {
                await State.revokeDevice(
                    state, deviceId,
                )
            } catch (_err) {
                const err = _err as Error
                setRevokeError(
                    err.message
                    || 'Failed to revoke device.',
                )
            } finally {
                setRevokePending(null)
            }
        },
        [state],
    )

    const activeDevices = devices.value.filter(
        (d:DeviceInfo) => !d.isRevoked,
    )
    const canRevoke = activeDevices.length > 1

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
                            aria-live=${
                                profileView.value
                                    .loginMethodHint ?
                                    'polite' :
                                    undefined
                            }
                        >
                            ${profileView.value
                                .loginMethodLabel}
                            ${profileView.value
                                .loginMethodHint ?
                                html`
                                <span
                                    class="profile-sr-only"
                                >
                                    ${profileView.value
                                        .loginMethodHint}
                                </span>` : null}
                        </dd>
                    </div>
                    <div>
                        <dt>Session expires</dt>
                        <dd
                            class="profile-field-value"
                            aria-live=${
                                profileView.value
                                    .sessionExpires
                                    .hint ?
                                    'polite' :
                                    undefined
                            }
                        >
                            ${profileView.value
                                .sessionExpires.label}
                            ${profileView.value
                                .sessionExpires.hint ?
                                html`
                                <span
                                    class="profile-sr-only"
                                >
                                    ${profileView.value
                                        .sessionExpires
                                        .hint}
                                </span>` : null}
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

                ${activeDevices.length > 0 ? html`
                    <ul
                        class="device-list"
                        role="list"
                    >
                        ${activeDevices.map(
                            (device:DeviceInfo) => html`
                            <li
                                class="device-item"
                                key=${device.deviceId}
                            >
                                <div
                                    class="device-info"
                                >
                                    <span
                                        class="device-name"
                                    >
                                        ${device
                                            .credentialName
                                            || 'Unnamed'}
                                    </span>
                                    <span
                                        class="device-dates"
                                    >
                                        Added ${
                                            formatDate(
                                                device
                                                .createdAt
                                            )
                                        }${
                                            device
                                            .lastUsedAt ?
                                            (' \u00B7 '
                                            + 'Last used '
                                            + formatDate(
                                                device
                                                .lastUsedAt
                                            )) :
                                            ''
                                        }
                                    </span>
                                </div>
                                <${SubstrateButton.TAG}
                                    class="device-revoke-btn"
                                    type="button"
                                    onClick=${() =>
                                        onRevokeDevice(
                                            device.deviceId
                                        )
                                    }
                                    disabled=${
                                        !canRevoke
                                        || revokePending
                                            === device
                                            .deviceId
                                    }
                                    spinning=${
                                        revokePending
                                            === device
                                            .deviceId
                                    }
                                    title=${
                                        canRevoke ?
                                            'Revoke this'
                                            + ' device' :
                                            'Cannot revoke'
                                            + ' your only'
                                            + ' device'
                                    }
                                >
                                    Revoke
                                <//>
                            </li>`,
                        )}
                    </ul>
                ` : null}

                ${revokeError ? html`
                    <p
                        class="device-error"
                        role="status"
                    >
                        ${revokeError}
                    </p>
                ` : null}

                <div
                    class="add-device-section"
                    aria-live="polite"
                >
                    <label class="add-device-label">
                        <span>Device name (optional)</span>
                        <input
                            type="text"
                            class="add-device-input"
                            placeholder="e.g. Work Laptop"
                            value=${addDeviceName}
                            onInput=${(
                                e:Event,
                            ) => setAddDeviceName(
                                (e.target as
                                    HTMLInputElement
                                ).value,
                            )}
                            disabled=${addDevicePending}
                        />
                    </label>
                    <${SubstrateButton.TAG}
                        class="add-device-btn"
                        type="button"
                        onClick=${onAddDevice}
                        spinning=${addDevicePending}
                        disabled=${addDevicePending}
                    >
                        ${addDevicePending ?
                            'Adding...' :
                            'Add device'}
                    <//>
                    ${addDeviceError ? html`
                        <p
                            class="device-error"
                            role="status"
                        >
                            ${addDeviceError}
                        </p>
                    ` : null}
                    ${addDeviceSuccess ? html`
                        <p
                            class="device-success"
                            role="status"
                        >
                            ${addDeviceSuccess}
                        </p>
                    ` : null}
                </div>
            </section>
        ` : null}

        ${isAuthenticated.value ? html`
            <div class="controls" aria-live="polite">
                <${SubstrateButton.TAG}
                    class="profile-logout-button"
                    type="button"
                    onClick=${onLogout}
                    spinning=${logoutPending.value}
                    disabled=${logoutPending.value}
                >
                    ${logoutPending.value ?
                        'Logging out\u2026' :
                        'Logout'}
                <//>
                ${logoutError.value ? html`
                    <p
                        class="profile-logout-error"
                        role="status"
                    >
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
