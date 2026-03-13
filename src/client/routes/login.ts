import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { RadioInput } from '@substrate-system/radio-input'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import './login.css'

RadioInput.define()

type SignInMethod = 'passkey'|'password'

type LoginFormValues = {
    identifier:string;
    password:string;
}

type LoginValidationErrors = Partial<Record<keyof LoginFormValues, string>>

type LoginSubmitResult = {
    values:LoginFormValues;
    errors:LoginValidationErrors;
    message:string;
}

type PasskeyLoginResult = {
    method:SignInMethod;
    message:string;
}

type SignInMethodTarget = Pick<HTMLInputElement, 'name'|'value'> | {
    getAttribute:(name:string) => string | null;
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

export function getRadioCheckedAttr (
    activeMethod:SignInMethod,
    method:SignInMethod
):'checked' | null {
    return activeMethod === method ? 'checked' : null
}

function isMethodTarget (value:unknown):value is SignInMethodTarget {
    if (!value || typeof value !== 'object') return false

    if ('name' in value && 'value' in value) {
        return true
    }

    return 'getAttribute' in value && typeof value.getAttribute === 'function'
}

function readMethodTarget (target:SignInMethodTarget):{
    name:string | null;
    value:string | null;
} {
    if ('getAttribute' in target) {
        return {
            name: target.getAttribute('name'),
            value: target.getAttribute('value'),
        }
    }

    return {
        name: target.name,
        value: target.value,
    }
}

export function resolveSelectedMethod (
    event:Event
):SignInMethod | null {
    const candidates = [
        event.target,
        ...(typeof event.composedPath === 'function' ? event.composedPath() : []),
    ]

    for (const candidate of candidates) {
        if (!isMethodTarget(candidate)) continue
        const { name, value } = readMethodTarget(candidate)
        if (name !== 'sign-in-method') continue
        if (value === 'passkey' || value === 'password') {
            return value
        }
    }

    return null
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
        const method = resolveSelectedMethod(event)
        if (!method) return
        setActiveMethod(method)
        passkeyStatus.value = 'idle'
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
        <div>
            <p>Choose how you want to sign in.</p>
            <div
                class="login-methods"
                aria-label="Sign-in method"
                onChange=${handleMethodChange}
            >
                <div class=${`login-method-option ${activeMethod.value === 'passkey' ? 'active' : ''}`}>
                    <${RadioInput.TAG}
                        name="sign-in-method"
                        value="passkey"
                        label="Passkey"
                        checked=${activeMethod.value === 'passkey'}
                    ><//>
                </div>
                <div class=${`login-method-option ${activeMethod.value === 'password' ?
                        'active' : ''}`}>
                    <${RadioInput.TAG}
                        name="sign-in-method"
                        value="password"
                        label="Password"
                        checked=${activeMethod.value === 'password'}
                    ><//>
                </div>
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
                <substrate-button type="submit">
                    Login with password
                </substrate-button>

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

function validateLoginValues (values:LoginFormValues):LoginValidationErrors {
    const errors:LoginValidationErrors = {}

    if (!values.identifier.trim()) {
        errors.identifier = 'Enter your username or email.'
    }

    if (!values.password.trim()) {
        errors.password = 'Enter your password.'
    }

    return errors
}

function submitLoginValues (
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
