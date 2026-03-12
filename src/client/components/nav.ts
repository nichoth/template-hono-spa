import type { ComponentChildren, FunctionComponent } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { HamburgerTwo } from '@substrate-system/hamburger-two'
import { html } from 'htm/preact'
import { routes } from '../routes/index.js'
import type { AppState } from '../state.js'
import './nav.css'

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const currentPath = state.route.value
    const hamburgerRef = useRef<HamburgerTwo | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuClasses = [
        'mobile-nav-menu',
        isMenuOpen ? 'open' : '',
    ].filter(Boolean).join(' ')

    useEffect(() => {
        const hamburger = hamburgerRef.current
        if (!hamburger) return

        const handleOpen = () => {
            setIsMenuOpen(true)
        }
        const handleClose = () => {
            setIsMenuOpen(false)
        }

        hamburger.addEventListener(HamburgerTwo.event('open'), handleOpen)
        hamburger.addEventListener(HamburgerTwo.event('close'), handleClose)

        return () => {
            hamburger.removeEventListener(HamburgerTwo.event('open'), handleOpen)
            hamburger.removeEventListener(HamburgerTwo.event('close'), handleClose)
        }
    }, [])

    useEffect(() => {
        setIsMenuOpen(false)
        if (hamburgerRef.current) {
            hamburgerRef.current.isOpen = false
        }
    }, [currentPath])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(width >= 680px)')
        const handleViewportChange = (event:MediaQueryListEvent) => {
            if (!event.matches) return
            setIsMenuOpen(false)
            if (hamburgerRef.current) {
                hamburgerRef.current.isOpen = false
            }
        }

        mediaQuery.addEventListener('change', handleViewportChange)

        return () => {
            mediaQuery.removeEventListener('change', handleViewportChange)
        }
    }, [])

    return html`<nav class="app-nav" aria-label="Main navigation">
        <div class="desktop-nav">
            <ul class="nav-links nav-links-inline">
                ${renderNavItems(currentPath)}
            </ul>
        </div>
        <div class="mobile-nav-shell">
            <${HamburgerTwo.TAG}
                ref=${hamburgerRef}
                class="mobile-nav-trigger"
            ></${HamburgerTwo.TAG}>
            <div class=${menuClasses} hidden=${!isMenuOpen}>
                <ul class="nav-links nav-links-mobile">
                    ${renderNavItems(currentPath)}
                </ul>
            </div>
        </div>
    </nav>`
}

function renderNavItems (currentPath:string) {
    return routes.map(route => html`<li key=${route.href}>
        <${NavLink}
            href=${route.href}
            currentPath=${currentPath}
        >
            ${route.text}
        </${NavLink}>
    </li>`)
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
