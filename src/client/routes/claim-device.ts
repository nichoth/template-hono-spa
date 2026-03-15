import { type FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import { SubstrateButton } from '@substrate-system/button'
import { type AppState, State } from '../state.js'
import './claim-device.css'
import { ELLIPSIS } from '../constants.js'

function parseClaimPath (path:string):{
    handle:string;
    code:string;
} | null {
    const normalized = path.replace(/\/+$/, '')
    const match = normalized.match(
        /^\/([^/]+)\/add\/([^/]+)$/,
    )
    if (!match) return null
    try {
        return {
            handle: decodeURIComponent(match[1]),
            code: decodeURIComponent(match[2]),
        }
    } catch {
        return null
    }
}

export const ClaimDeviceRoute:FunctionComponent<{
    state:AppState;
}> = function ({ state }) {
    const params = parseClaimPath(state.route.value)
    const pending = useSignal(false)
    const errorMsg = useSignal<string | null>(null)
    const success = useSignal(false)
    const deviceName = useSignal<string | null>(null)

    if (!params) {
        return html`<div class="route claim-device">
            <h2>Invalid Link</h2>
            <p>This invitation link is not valid.</p>
        </div>`
    }

    const onClaim = useCallback(async () => {
        if (!params) return
        pending.value = true
        errorMsg.value = null

        try {
            const result = await State.claimInvite(
                params.code,
            )
            success.value = true
            deviceName.value = (
                result.device.credentialName || null
            )
        } catch (_err) {
            const err = _err as Error
            const msg = err.message || ''
            if (msg.includes('expired')) {
                errorMsg.value =
                    'This invitation has expired.'
            } else if (msg.includes('consumed')
                || msg.includes('already')) {
                errorMsg.value =
                    'This invitation has already been used.'
            } else if (msg.includes('cancelled')
                || msg.includes('canceled')) {
                errorMsg.value =
                    'This invitation is no longer valid.'
            } else if (msg.includes('not found')
                || msg.includes('Not Found')) {
                errorMsg.value =
                    'This invitation was not found.'
            } else {
                errorMsg.value = (
                    msg || 'Failed to register device.'
                )
            }
        } finally {
            pending.value = false
        }
    }, [params?.code])

    if (success.value) {
        return html`<div class="route claim-device">
            <div class="claim-success">
                <h2>Device Added</h2>
                <p>
                    ${deviceName.value ?
                        html`Your device
                            "<strong>${deviceName.value}</strong>"
                            has been registered.` :
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
        <p>
            Register a passkey on this device for
            <strong>${params.handle}</strong>.
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
