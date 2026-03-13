import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { RadioInput } from '@substrate-system/radio-input'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import { State } from '../state.js'
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
    'Password sign-in is not implemented. Use a passkey account instead.'

export const PASSKEY_UI_ONLY_LOGIN_MESSAGE =
    'Passkey sign-in is ready when you enter an identifier and continue.'

export const LoginRoute:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const activeMethod = useSignal<SignInMethod>('passkey')
    const identifier = useSignal('')
    const displayName = useSignal('')
    const password = useSignal('')
    const fieldErrors = useSignal<LoginValidationErrors>({})
    const submitMessage = useSignal('')
    const passkeyStatus = useSignal<'idle'|'working'>('idle')

    const authenticated = state.user.value.data?.authenticated === true ?
        state.user.value.data :
        null

    const setActiveMethod = (method:SignInMethod) => {
        activeMethod.value = method
        submitMessage.value = ''
        fieldErrors.value = {}
    }

    const setFieldValue = (field:'identifier'|'displayName'|'password', value:string) => {
        if (field === 'identifier') identifier.value = value
        else if (field === 'displayName') displayName.value = value
        else password.value = value

        if (field === 'identifier' || field === 'password') {
            if (fieldErrors.value[field]) {
                fieldErrors.value = {
                    ...fieldErrors.value,
                    [field]: undefined,
                }
            }
        }
    }

    const handleMethodChange = (event:Event) => {
        const method = resolveSelectedMethod(event)
        if (!method) return
        setActiveMethod(method)
        passkeyStatus.value = 'idle'
    }

    const handlePasswordSubmit = async (event:Event) => {
        event.preventDefault()

        const result = submitLoginValues({
            identifier: identifier.value,
            password: password.value,
        })

        fieldErrors.value = result.errors
        submitMessage.value = result.message
    }

    const handlePasskeyLogin = async () => {
        if (!identifier.value.trim()) {
            submitMessage.value = 'Enter your email or username before using a passkey.'
            return
        }

        passkeyStatus.value = 'working'
        submitMessage.value = ''

        try {
            await State.loginWithPasskey(state, {
                identifier: identifier.value.trim(),
            })
            submitMessage.value = 'Signed in with passkey.'
        } catch (err) {
            submitMessage.value = err instanceof Error ?
                err.message :
                'Passkey sign-in failed.'
        } finally {
            passkeyStatus.value = 'idle'
        }
    }

    const handlePasskeyRegistration = async () => {
        if (!identifier.value.trim()) {
            submitMessage.value = 'Enter your email or username before creating an account.'
            return
        }

        passkeyStatus.value = 'working'
        submitMessage.value = ''

        try {
            await State.registerWithPasskey(state, {
                identifier: identifier.value.trim(),
                displayName: displayName.value.trim(),
            })
            submitMessage.value = 'Passkey account created.'
        } catch (err) {
            submitMessage.value = err instanceof Error ?
                err.message :
                'Passkey registration failed.'
        } finally {
            passkeyStatus.value = 'idle'
        }
    }

    const handleLogout = async () => {
        passkeyStatus.value = 'working'
        submitMessage.value = ''

        try {
            await State.logout(state)
            submitMessage.value = 'Signed out.'
        } catch (err) {
            submitMessage.value = err instanceof Error ?
                err.message :
                'Sign-out failed.'
        } finally {
            passkeyStatus.value = 'idle'
        }
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

        ${authenticated ?
            html`<div class="login-form login-form-passkey">
                <p class="login-method-description">
                    Signed in as ${authenticated.user.identifier}.
                </p>
                <substrate-button
                    type="button"
                    onClick=${handleLogout}
                    spinning=${passkeyStatus.value === 'working'}
                >
                    Sign out
                </substrate-button>
                ${submitMessage.value ?
                    html`<p class="login-submit-message">${submitMessage.value}</p>` :
                    null}
            </div>` :
            activeMethod.value === 'password' ?
                html`<form class="login-form" onSubmit=${handlePasswordSubmit} novalidate>
                    <p class="login-method-description">
                        Use your username or email and password.
                    </p>
                    <substrate-input
                        label="Username or Email"
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
                    <password-input
                        label="Password"
                        name="password"
                        autocomplete="current-password"
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
                        Log in with password
                    </substrate-button>
                    ${submitMessage.value ?
                        html`<p class="login-submit-message">${submitMessage.value}</p>` :
                        null}
                </form>` :
                html`<div class="login-form login-form-passkey">
                    <p class="login-method-description">
                        Sign in using your device (Face ID, fingerprint, or Windows Hello).
                    </p>
                    <substrate-input
                        label="Username or Email"
                        name="identifier"
                        autocomplete="username webauthn"
                        value=${identifier.value}
                        required
                        onInput=${(event:InputEvent) => {
                            const target = event.target as HTMLInputElement
                            setFieldValue('identifier', target.value)
                        }}
                    ></substrate-input>
                    <substrate-input
                        label="Display Name"
                        name="displayName"
                        value=${displayName.value}
                        onInput=${(event:InputEvent) => {
                            const target = event.target as HTMLInputElement
                            setFieldValue('displayName', target.value)
                        }}
                    ></substrate-input>
                    <div class="login-passkey-actions">
                        <substrate-button
                            type="button"
                            onClick=${handlePasskeyLogin}
                            spinning=${passkeyStatus.value === 'working'}
                        >
                            Continue with passkey
                        </substrate-button>
                        <substrate-button
                            type="button"
                            onClick=${handlePasskeyRegistration}
                            spinning=${passkeyStatus.value === 'working'}
                        >
                            Create passkey account
                        </substrate-button>
                    </div>
                    ${submitMessage.value ?
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

export function startPasskeyLogin ():PasskeyLoginResult {
    return {
        method: 'passkey',
        message: PASSKEY_UI_ONLY_LOGIN_MESSAGE,
    }
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

export function getRadioCheckedAttr (
    activeMethod:SignInMethod,
    option:SignInMethod,
):'checked'|null {
    return activeMethod === option ?
        'checked' :
        null
}
