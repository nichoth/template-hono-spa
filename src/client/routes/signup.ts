import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { RadioInput } from '@substrate-system/radio-input'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import { State } from '../state.js'
import {
    getRadioCheckedAttr,
    resolveSelectedMethod,
} from './login.js'
import './login.css'
import './signup.css'

RadioInput.define()

type SignupMethod = 'passkey'|'password'

type SignupFormValues = {
    identifier:string;
    displayName:string;
    password:string;
}

type SignupValidationErrors = Partial<Record<keyof SignupFormValues, string>>

const PASSWORD_SIGNUP_MESSAGE =
    'Password account creation is not implemented yet. Choose passkey to continue.'

export const SignupRoute:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const activeMethod = useSignal<SignupMethod>('passkey')
    const identifier = useSignal('')
    const displayName = useSignal('')
    const password = useSignal('')
    const fieldErrors = useSignal<SignupValidationErrors>({})
    const submitMessage = useSignal('')
    const passkeyStatus = useSignal<'idle'|'working'>('idle')

    const setActiveMethod = (method:SignupMethod) => {
        activeMethod.value = method
        submitMessage.value = ''
        fieldErrors.value = {}
    }

    const setFieldValue = (
        field:keyof SignupFormValues,
        value:string,
    ) => {
        if (field === 'identifier') identifier.value = value
        else if (field === 'displayName') displayName.value = value
        else password.value = value

        if (fieldErrors.value[field]) {
            fieldErrors.value = {
                ...fieldErrors.value,
                [field]: undefined,
            }
        }
    }

    const handleMethodChange = (event:Event) => {
        const method = resolveSelectedMethod(event)
        if (!method) return
        setActiveMethod(method)
        passkeyStatus.value = 'idle'
    }

    const handlePasswordSubmit = (event:Event) => {
        event.preventDefault()

        const result = validatePasswordSignup({
            identifier: identifier.value,
            displayName: displayName.value,
            password: password.value,
        })

        fieldErrors.value = result
        submitMessage.value = Object.keys(result).length === 0 ?
            PASSWORD_SIGNUP_MESSAGE :
            ''
    }

    const handlePasskeySignup = async () => {
        const identifierValue = identifier.value.trim()
        if (!identifierValue) {
            fieldErrors.value = {
                ...fieldErrors.value,
                identifier: 'Enter your email or username.',
            }
            submitMessage.value = ''
            return
        }

        passkeyStatus.value = 'working'
        submitMessage.value = ''

        try {
            const result = await State.registerWithPasskey(state, {
                identifier: identifierValue,
                displayName: displayName.value.trim() || undefined,
            })
            submitMessage.value = result.message
        } catch (err) {
            submitMessage.value = err instanceof Error ?
                err.message :
                'Passkey account creation failed.'
        } finally {
            passkeyStatus.value = 'idle'
        }
    }

    return html`<div class="route signup-route">
        <h2>Create Account</h2>
        <div>
            <p>Choose how you want to create your account.</p>
            <div
                class="login-methods"
                aria-label="Create-account method"
                onChange=${handleMethodChange}
            >
                <div class=${`login-method-option ${activeMethod.value === 'passkey' ? 'active' : ''}`}>
                    <${RadioInput.TAG}
                        name="sign-in-method"
                        value="passkey"
                        label="Passkey"
                        checked=${getRadioCheckedAttr(activeMethod.value, 'passkey')}
                    ><//>
                </div>
                <div class=${`login-method-option ${activeMethod.value === 'password' ? 'active' : ''}`}>
                    <${RadioInput.TAG}
                        name="sign-in-method"
                        value="password"
                        label="Password"
                        checked=${getRadioCheckedAttr(activeMethod.value, 'password')}
                    ><//>
                </div>
            </div>
        </div>

        ${activeMethod.value === 'password' ?
            html`<form class="login-form" onSubmit=${handlePasswordSubmit} novalidate>
                <p class="login-method-description">
                    Create an account with your email, display name, and password.
                </p>
                <substrate-input
                    label="Email"
                    name="identifier"
                    autocomplete="username"
                    value=${identifier.value}
                    required
                    aria-invalid=${fieldErrors.value.identifier ? 'true' : 'false'}
                    onInput=${(event:InputEvent) => {
                        const target = event.target as HTMLInputElement
                        setFieldValue('identifier', target.value)
                    }}
                ></substrate-input>
                ${fieldErrors.value.identifier ?
                    html`<p class="login-field-error">${fieldErrors.value.identifier}</p>` :
                    null}
                <substrate-input
                    label="Display Name"
                    name="display-name"
                    autocomplete="nickname"
                    value=${displayName.value}
                    onInput=${(event:InputEvent) => {
                        const target = event.target as HTMLInputElement
                        setFieldValue('displayName', target.value)
                    }}
                ></substrate-input>
                <password-input
                    label="Password"
                    name="password"
                    autocomplete="new-password"
                    value=${password.value}
                    required
                    aria-invalid=${fieldErrors.value.password ? 'true' : 'false'}
                    onInput=${(event:InputEvent) => {
                        const target = event.target as HTMLInputElement
                        setFieldValue('password', target.value)
                    }}
                ></password-input>
                ${fieldErrors.value.password ?
                    html`<p class="login-field-error">${fieldErrors.value.password}</p>` :
                    null}
                <substrate-button type="submit">
                    Create account
                </substrate-button>
                <p class="login-route-link">
                    <a href="/login">Back to sign in</a>
                </p>
                ${submitMessage.value ?
                    html`<p class="login-submit-message">${submitMessage.value}</p>` :
                    null}
            </form>` :
            html`<div class="login-form login-form-passkey">
                <p class="login-method-description">
                    Create an account using your device (Face ID, fingerprint, or Windows Hello).
                </p>
                <substrate-input
                    label="Email"
                    name="identifier"
                    autocomplete="username webauthn"
                    value=${identifier.value}
                    required
                    aria-invalid=${fieldErrors.value.identifier ? 'true' : 'false'}
                    onInput=${(event:InputEvent) => {
                        const target = event.target as HTMLInputElement
                        setFieldValue('identifier', target.value)
                    }}
                ></substrate-input>
                ${fieldErrors.value.identifier ?
                    html`<p class="login-field-error">${fieldErrors.value.identifier}</p>` :
                    null}
                <substrate-input
                    label="Display Name"
                    name="display-name"
                    autocomplete="nickname"
                    value=${displayName.value}
                    onInput=${(event:InputEvent) => {
                        const target = event.target as HTMLInputElement
                        setFieldValue('displayName', target.value)
                    }}
                ></substrate-input>
                <div class="signup-support-copy">
                    The display name is used only for visual display in the app. Confirm your email address after account creation to finish setup.
                </div>
                <div class="login-passkey-actions">
                    <substrate-button
                        type="button"
                        onClick=${handlePasskeySignup}
                        spinning=${passkeyStatus.value === 'working'}
                    >
                        Create account
                    </substrate-button>
                    <p class="login-route-link">
                        <a href="/login">Back to sign in</a>
                    </p>
                </div>
                ${submitMessage.value ?
                    html`<p class="login-submit-message">${submitMessage.value}</p>` :
                    null}
            </div>`}
    </div>`
}

function validatePasswordSignup (
    values:SignupFormValues,
):SignupValidationErrors {
    const errors:SignupValidationErrors = {}

    if (!values.identifier.trim()) {
        errors.identifier = 'Enter your email or username.'
    }

    if (!values.password.trim()) {
        errors.password = 'Enter your password.'
    }

    return errors
}
