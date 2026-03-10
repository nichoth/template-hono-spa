import type { ComponentChildren, FunctionComponent } from 'preact'
import { html } from 'htm/preact'
import { routes } from '../routes/index.js'
import type { AppState } from '../state.js'
import './nav.css'

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const currentPath = state.route.value

    return html`<nav class="app-nav" aria-label="Main navigation">
        <ul class="nav-links">
            ${routes.map(route => html`<li key=${route.href}>
                <${NavLink}
                    href=${route.href}
                    currentPath=${currentPath}
                >
                    ${route.text}
                </${NavLink}>
            </li>`)}
        </ul>
    </nav>`
}

function NavLink (props:{
    href:string,
    currentPath:string,
    class?:string,
    children?:ComponentChildren
}) {
    const classes = ([
        'nav-link',
        props.class,
        props.currentPath === props.href ? 'active' : ''
    ]).filter(Boolean).join(' ')

    return html`<a class=${classes} href=${props.href}>
        ${props.children}
    </a>`
}
