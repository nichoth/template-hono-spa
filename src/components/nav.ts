import { html } from 'htm/preact'
import type { ComponentChildren, FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { State, type AppState } from '../state.js'
import { SubstrateButton } from '@substrate-system/button'
import { HEADER_LINKS } from './nav-links.js'
import './nav.css'

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const logout = useCallback(async (ev:MouseEvent) => {
        ev.preventDefault()
        await State.Logout(state)
    }, [])

    const isAuthed = state.authStatus.value === 'authenticated'

    return html`<nav class="app-nav">
        <h1>
            <a href="/">HVACL</a>
        </h1>
        <ul class="nav-links">
            ${HEADER_LINKS.map(link => html`<li class="nav-link">
                <${NavLink} state=${state} href=${link.href}>${link.label}<//>
            </li>`)}
        </ul>

        ${isAuthed ?
            html`<${SubstrateButton.TAG} onClick=${logout}>Logout<//>` :
            html`<a href="/login" class="btn">Sign In</a>`
        }
    </nav>`
}

function NavLink (props:{
    state:AppState,
    href:string,
    class?:string,
    children?:ComponentChildren
}) {
    const { state } = props

    const route = state.route.value.split('?')[0]

    const classes = ([
        'nav-link',
        props.class,
        route === props.href ? 'active' : ''
    ]).filter(Boolean).join(' ')

    return html`<a class="${classes}" href="${props.href}">
        ${props.children}
    </a>`
}

