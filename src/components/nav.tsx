import type { ComponentChildren, FunctionComponent } from 'preact'
import { routes } from '../client/routes/index.js'
import type { AppState } from '../client/state.js'
import './nav.css'

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const currentPath = state.route.value

    return (
        <nav class="app-nav" aria-label="Main navigation">
            <h1><a href="/">Hono + Preact</a></h1>
            <ul class="nav-links">
                {routes.map(route => {
                    return (
                        <li key={route.href}>
                            <NavLink
                                href={route.href}
                                currentPath={currentPath}
                            >
                                {route.text}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
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

    return (
        <a class={classes} href={props.href}>
            {props.children}
        </a>
    )
}
