import type { ComponentChildren, FunctionComponent } from 'preact'
import htm from 'htm'
import { h, Fragment } from 'preact'
import { routes } from '../client/routes/index.js'
import type { AppState } from '../client/state.js'
import './nav.css'

const html = htm.bind(h)

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const currentPath = state.route.value

    return html`<nav class="app-nav" aria-label="Main navigation">
            <h1><a href="/">Hono + Preact</a></h1>
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
        <${Fragment}>${props.children}</${Fragment}>
    </a>`
}
