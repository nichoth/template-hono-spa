import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import './login.css'

export type SignInMethod = 'passkey' | 'password'

export type LoginFormValues = {
    identifier:string;
    password:string;
}

export type LoginValidationErrors = Partial<Record<keyof LoginFormValues, string>>

export type LoginSubmitResult = {
    values:LoginFormValues;
    errors:LoginValidationErrors;
    message:string;
}

export type PasskeyLoginResult = {
    method:SignInMethod;
    message:string;
}

export function validateLoginValues (
    values:LoginFormValues
):LoginValidationErrors {
    const errors:LoginValidationErrors = {}

    if (!values.identifier.trim()) {
        errors.identifier = 'Enter your username or email.'
    }

    if (!values.password.trim()) {
        errors.password = 'Enter your password.'
    }

    return errors
}

export const UI_ONLY_LOGIN_MESSAGE =
    'Login is not connected yet. No sign-in was performed.'

export const PASSKEY_UI_ONLY_LOGIN_MESSAGE =
    'Passkey sign-in is not connected yet. No sign-in was performed.'

export function startPasskeyLogin ():PasskeyLoginResult {
    return {
        method: 'passkey',
        message: PASSKEY_UI_ONLY_LOGIN_MESSAGE,
    }
}

export function submitLoginValues (
    values:LoginFormValues
):LoginSubmitResult {
    const errors = validateLoginValues(values)

    return {
        values,
        errors,
        message: Object.keys(errors).length === 0 ?
            UI_ONLY_LOGIN_MESSAGE :
            '',
    }
}

export const LoginRoute:FunctionComponent<{ state:AppState }> = function () {
    const activeMethod = useSignal<SignInMethod>('passkey')
    const identifier = useSignal('')
    const password = useSignal('')
    const fieldErrors = useSignal<LoginValidationErrors>({})
    const submitMessage = useSignal('')
    const passkeyStatus = useSignal<'idle' | 'started'>('idle')

    const setActiveMethod = (method:SignInMethod) => {
        activeMethod.value = method
        submitMessage.value = ''
        fieldErrors.value = {}
    }

    const setFieldValue = (field:keyof LoginFormValues, value:string) => {
        if (field === 'identifier') {
            identifier.value = value
        } else {
            password.value = value
        }

        if (fieldErrors.value[field]) {
            fieldErrors.value = {
                ...fieldErrors.value,
                [field]: undefined,
            }
        }
    }

    const handleInput = (event:Event) => {
        const target = event.target as HTMLInputElement | null
        if (!target?.name) return

        if (target.name === 'identifier' || target.name === 'password') {
            setFieldValue(target.name, target.value)
        }
    }

    const handleMethodChange = (event:Event) => {
        const target = event.target as HTMLInputElement | null
        if (!target || target.name !== 'sign-in-method') return
        if (target.value === 'passkey' || target.value === 'password') {
            setActiveMethod(target.value)
            passkeyStatus.value = 'idle'
        }
    }

    const handleSubmit = (event:Event) => {
        event.preventDefault()

        const result = submitLoginValues({
            identifier: identifier.value,
            password: password.value,
        })

        fieldErrors.value = result.errors
        submitMessage.value = result.message
        passkeyStatus.value = 'idle'
    }

    const handlePasskeyStart = () => {
        const result = startPasskeyLogin()
        activeMethod.value = result.method
        submitMessage.value = result.message
        fieldErrors.value = {}
        passkeyStatus.value = 'started'
    }

    return html`<div class="route login-route">
        <h2>Login</h2>
        <p>Choose how you want to sign in.</p>
        <div
            class="login-methods"
            aria-label="Sign-in method"
            onChange=${handleMethodChange}
        >
            <div class=${`login-method-option ${activeMethod.value === 'passkey' ? 'active' : ''}`}>
                <radio-input
                    name="sign-in-method"
                    value="passkey"
                    label="Passkey"
                    checked=${activeMethod.value === 'passkey'}
                ></radio-input>
            </div>
            <div class=${`login-method-option ${activeMethod.value === 'password' ? 'active' : ''}`}>
                <radio-input
                    name="sign-in-method"
                    value="password"
                    label="Password"
                    checked=${activeMethod.value === 'password'}
                ></radio-input>
            </div>
        </div>
        ${activeMethod.value === 'password' ?
            html`<form class="login-form" onSubmit=${handleSubmit} novalidate>
                <p class="login-method-description">
                    Use your username or email and password.
                </p>
                <substrate-input
                    label="Username or Email"
                    name="identifier"
                    autocomplete="username"
                    value=${identifier.value}
                    required
                    aria-invalid=${fieldErrors.value.identifier ? 'true' : 'false'}
                    onInput=${handleInput}
                ></substrate-input>
                ${fieldErrors.value.identifier ?
                    html`<p class="login-field-error">${fieldErrors.value.identifier}</p>` :
                    null}
                <password-input
                    label="Password"
                    name="password"
                    autocomplete="current-password"
                    value=${password.value}
                    required
                    aria-invalid=${fieldErrors.value.password ? 'true' : 'false'}
                    onInput=${handleInput}
                ></password-input>
                ${fieldErrors.value.password ?
                    html`<p class="login-field-error">${fieldErrors.value.password}</p>` :
                    null}
                <substrate-button type="submit">Log in with password</substrate-button>
                ${submitMessage.value ?
                    html`<p class="login-submit-message">${submitMessage.value}</p>` :
                    null}
            </form>` :
            html`<div class="login-form login-form-passkey">
                <p class="login-method-description">
                    Sign in using your device (Face ID, fingerprint, or Windows Hello).
                </p>
                <substrate-button type="button" onClick=${handlePasskeyStart}>
                    Continue with passkey
                </substrate-button>
                ${passkeyStatus.value === 'started' && submitMessage.value ?
                    html`<p class="login-submit-message">${submitMessage.value}</p>` :
                    null}
            </div>`}
    </div>`
}
