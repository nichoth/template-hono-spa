import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import { State } from '../state.js'
import type { AppState } from '../state.js'
import { HTTPError } from 'ky'

type SubmissionState = 'idle'|'loading'|'success'|'error'|'missing-code'

function normalizeCodeFromPath (path:string):string | null {
    const normalized = path.replace(/\/+$/, '')
    const match = normalized.match(/^\/confirm\/([^/]+)$/)
    if (!match) return null

    try {
        return decodeURIComponent(match[1])
    } catch {
        return match[1]
    }
}

function extractIdentifierFromSearch (search:string):string | null {
    if (!search) return null
    const params = new URLSearchParams(search)
    return params.get('identifier')
}

export const ConfirmRoute = function ({ state }: { state:AppState }) {
    const submissionState = useSignal<SubmissionState>('idle')
    const message = useSignal('Preparing your confirmation flow…')
    const identifier = useSignal<string | null>(null)
    const errorCode = useSignal<string | null>(null)
    const bannerRef = useRef<HTMLDivElement | null>(null)

    // Banner focus ensures keyboard/screen reader users are notified when the panel updates.
    useEffect(() => {
        if (
            submissionState.value === 'success'
            || submissionState.value === 'error'
            || submissionState.value === 'missing-code'
        ) {
            bannerRef.current?.focus()
        }
    }, [submissionState.value])

    useEffect(() => {
        let cancelled = false
        const path = typeof window !== 'undefined' ?
            window.location.pathname :
            state.route.value
        const search = typeof window !== 'undefined' ?
            window.location.search :
            ''

        const code = normalizeCodeFromPath(path)
        const searchIdentifier = extractIdentifierFromSearch(search)
        identifier.value = searchIdentifier ?? null

        if (!code) {
            submissionState.value = 'missing-code'
            message.value = 'This route requires a confirmation link. Check your email for the most recent link or request a new one.'
            errorCode.value = null
            return
        }

        submissionState.value = 'loading'
        errorCode.value = null
        message.value = 'Verifying your confirmation code…'

        void (async () => {
            try {
                const confirmation = await State.confirmAccount({
                    code,
                    identifier: searchIdentifier ?? undefined,
                })

                if (cancelled) return
                submissionState.value = 'success'
                identifier.value = confirmation.identifier
                message.value = confirmation.message ?? 'Email confirmed. You can now sign in.'
            } catch (_err) {
                if (cancelled) return
                const err = _err as HTTPError|Error
                submissionState.value = 'error'
                if (err instanceof HTTPError) {
                    try {
                        const payload = await err.response.json() as {
                            error?:string;
                            message?:string;
                        }
                        errorCode.value = payload.error ?? null
                        message.value = payload.message ?? 'We could not confirm your account.'
                    } catch {
                        message.value = 'We could not confirm your account.'
                    }
                } else {
                    message.value = err.message
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [state.route.value])

    const showSuccess = submissionState.value === 'success'
    const showError = submissionState.value === 'error'
    const showMissing = submissionState.value === 'missing-code'
    const showLoading = submissionState.value === 'loading'

    return html`
        <div class="route confirm-route">
            <h2>Confirm Account</h2>
            <div class="confirm-panel" ref=${bannerRef} tabindex="-1">
                ${showLoading ?
                    html`<p class="confirm-message" role="status" aria-live="polite">
                        ${message.value}
                    </p>` :
                    showSuccess ?
                        html`<div class="confirm-success" role="status" aria-live="polite">
                            <p>${message.value}</p>
                            ${identifier.value ?
                                html`<p class="confirm-identifier">
                                    Signed up as ${identifier.value}
                                </p>` :
                                null}
                            <p>
                                <a class="confirm-cta" href="/login">
                                    Go to Login
                                </a>
                            </p>
                        </div>` :
                        showError ?
                            html`<div class="confirm-error" role="status" aria-live="polite">
                                <p>${message.value}</p>
                                ${errorCode.value ?
                                    html`<p class="confirm-error-code">${errorCode.value}</p>` :
                                    null}
                                <div class="confirm-actions">
                                    <a class="confirm-link" href="/signup">
                                        Request a new link
                                    </a>
                                    <a class="confirm-link" href="/login">
                                        Back to login
                                    </a>
                                </div>
                            </div>` :
                            showMissing ?
                                html`<div class="confirm-missing" role="status" aria-live="polite">
                                    <p>${message.value}</p>
                                    <div class="confirm-actions">
                                        <a class="confirm-link" href="/signup">
                                            Get a new confirmation email
                                        </a>
                                        <a class="confirm-link" href="/login">
                                            Return to login
                                        </a>
                                    </div>
                                </div>` :
                                html`<p class="confirm-message">${message.value}</p>`}
            </div>
        </div>`
}
