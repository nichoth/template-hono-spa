import { type FunctionComponent } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import { type AppState, State } from '../state.js'
import './claim-device.css'
import { ELLIPSIS, NBSP } from '../constants.js'
import { type HTTPError } from 'ky'

function parseClaimPath (path:string):string | null {
    const normalized = path.replace(/\/+$/, '')
    const match = normalized.match(/^\/add\/([^/]+)$/)
    if (!match) return null
    try {
        return decodeURIComponent(match[1])
    } catch {
        return match[1]
    }
}

export const ClaimDeviceRoute:FunctionComponent<{
    state:AppState;
}> = function ({ state }) {
    const code = parseClaimPath(state.route.value)
    const pending = useSignal(false)
    const errorMsg = useSignal<string | null>(null)
    const success = useSignal(false)
    const successDeviceName = useSignal<string | null>(null)
    const deviceName = useSignal<string | null>(null)
    const userIdentifier = useSignal<string | null>(null)
    const infoLoading = useSignal(true)
    const infoError = useSignal<string | null>(null)

    useEffect(() => {
        if (!code) {
            infoLoading.value = false
            return
        }

        const controller = new AbortController()
        fetch(
            `/api/auth/passkey/devices/invite/${code}`,
            { signal: controller.signal },
        ).then(async res => {
            if (!res.ok) {
                const data = await res.json().catch(
                    () => ({}),
                ) as { message?:string }
                if (res.status === 410) {
                    infoError.value =
                        'This invitation has expired '
                        + 'or is no longer valid.'
                } else if (res.status === 409) {
                    infoError.value =
                        'This invitation has already '
                        + 'been used.'
                } else if (res.status === 404) {
                    infoError.value =
                        'This invitation was not found.'
                } else {
                    infoError.value = (
                        data.message || res.statusText
                    )
                }
                infoLoading.value = false
                return
            }
            const data = await res.json() as {
                deviceName:string | null;
                userIdentifier:string;
            }
            deviceName.value = data.deviceName
            userIdentifier.value = data.userIdentifier
            infoLoading.value = false
        }).catch(err => {
            if ((err as Error).name === 'AbortError') return
            infoError.value = (
                (err as Error).message
                || 'Failed to load invitation.'
            )
            infoLoading.value = false
        })

        return () => controller.abort()
    }, [code])

    const onClaim = useCallback(async () => {
        if (!code) return
        pending.value = true
        errorMsg.value = null

        try {
            const result = await State.claimInvite(code)
            success.value = true
            successDeviceName.value = (
                result.device.credentialName || null
            )
        } catch (_err) {
            const err = _err as HTTPError
            const msg = err.message || ''
            errorMsg.value = 'This invitation does not exist.'
            // if (msg.includes('expired')) {
            //     errorMsg.value = 'This invitation has expired.'
            // } else if (
            //     msg.includes('consumed') ||
            //     msg.includes('already')
            // ) {
            //     errorMsg.value = 'This invitation has already been used.'
            // } else if (
            //     msg.includes('cancelled') ||
            //     msg.includes('canceled') ||
            //     msg.includes('no longer')
            // ) {
            //     errorMsg.value = 'This invitation is no longer valid.'
            // } else if (
            //     msg.includes('not found') ||
            //     msg.includes('Not Found')
            // ) {
            //     errorMsg.value = 'This invitation was not found.'
            // } else {
            //     errorMsg.value = (msg || 'Failed to register device.')
            // }
        } finally {
            pending.value = false
        }
    }, [code])

    if (!code) {
        return html`<div class="route claim-device">
            <h2>Invalid Link</h2>
            <p>This invitation link is not valid.</p>
        </div>`
    }

    if (infoLoading.value) {
        return html`<div class="route claim-device">
            <p class="claim-loading">
                Loading${ELLIPSIS}
            </p>
        </div>`
    }

    if (infoError.value) {
        return html`<div class="route claim-device">
            <h2>Invitation Unavailable</h2>
            <p class="claim-error" role="status">
                ${infoError.value}
            </p>
        </div>`
    }

    if (success.value) {
        return html`<div class="route claim-device">
            <div class="claim-success">
                <h2>Device Added</h2>
                <p>
                    ${successDeviceName.value ?
                        html`"<strong>
                            ${successDeviceName.value}
                        </strong>" has been registered.` :
                        'Your device has been registered.'
                    }
                </p>
                <p>You can now log in with this device.</p>
                <${SubstrateButton.TAG}
                    type="button"
                    onClick=${() => {
                        state._setRoute?.('/login')
                    }}
                >
                    Go to Login
                <//>
            </div>
        </div>`
    }

    return html`<div class="route claim-device">
        <h2>Add Device</h2>
        <div class="claim-info">
            ${userIdentifier.value ? html`
                <p class="claim-account">
                    Account:${NBSP}
                    <strong>${userIdentifier.value}</strong>
                </p>
            ` : null}
            ${deviceName.value ? html`
                <p class="claim-device-name">
                    Device name:${NBSP}
                    <strong>${deviceName.value}</strong>
                </p>
            ` : null}
        </div>

        <p class="claim-confirm">
            Register a passkey on this device to connect
            to the account above.
        </p>

        <${SubstrateButton.TAG}
            class="claim-btn"
            type="button"
            onClick=${onClaim}
            spinning=${pending.value}
            disabled=${pending.value}
        >
            ${pending.value ?
                `Registering${ELLIPSIS}` :
                'Register Passkey'}
        <//>

        ${errorMsg.value ? html`
            <p class="claim-error" role="status">
                ${errorMsg.value}
            </p>
        ` : null}
    </div>`
}
