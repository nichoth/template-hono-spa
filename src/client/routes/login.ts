import { type FunctionComponent } from 'preact'
import { useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import type { AppState } from '../state.js'
import './login.css'

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
    const identifier = useSignal('')
    const password = useSignal('')
    const fieldErrors = useSignal<LoginValidationErrors>({})
    const submitMessage = useSignal('')

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

    const handleSubmit = (event:Event) => {
        event.preventDefault()

        const result = submitLoginValues({
            identifier: identifier.value,
            password: password.value,
        })

        fieldErrors.value = result.errors
        submitMessage.value = result.message
    }

    return html`<div class="route login-route">
        <h2>Login</h2>
        <p>Enter your details to continue.</p>
        <form class="login-form" onSubmit=${handleSubmit} novalidate>
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
            <substrate-button type="submit">Log in</substrate-button>
            ${submitMessage.value ?
                html`<p class="login-submit-message">${submitMessage.value}</p>` :
                null}
        </form>
    </div>`
}
