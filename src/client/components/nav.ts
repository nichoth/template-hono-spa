import type { ComponentChildren, FunctionComponent } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { HamburgerTwo } from '@substrate-system/hamburger-two'
import { html } from 'htm/preact'
import { routes } from '../routes/index.js'
import type { AppState } from '../state.js'
import './nav.css'
// import Debug from '@substrate-system/debug'
// const debug = Debug('template:view')

const MEDIA_QUERY = '(width >= 680px)'
HamburgerTwo.define();

(async () => {
    await Promise.race([
        // Load all custom elements
        Promise.allSettled([
            customElements.whenDefined(HamburgerTwo.TAG),  // hamburger-two
        ]),
        // Resolve after two seconds
        new Promise(resolve => setTimeout(resolve, 2000))
    ])

    // Remove the class, showing the page content
    document.body.classList.remove('reduce-fouce')
})()

export const Nav:FunctionComponent<{ state:AppState }> = function ({ state }) {
    const currentPath = state.route.value
    const hamburgerRef = useRef<HamburgerTwo>(null)
    const isMenuOpen = useSignal<boolean>(false)
    const menuClasses = [
        'mobile-nav-menu',
        isMenuOpen.value ? 'open' : '',
    ].filter(Boolean).join(' ')

    useEffect(() => {
        const hamburger = hamburgerRef.current
        if (!hamburger) return

        const handleOpen = () => {
            isMenuOpen.value = true
        }
        const handleClose = () => {
            isMenuOpen.value = false
        }

        hamburger.addEventListener(HamburgerTwo.event('open'), handleOpen)
        hamburger.addEventListener(HamburgerTwo.event('close'), handleClose)

        return () => {
            hamburger.removeEventListener(HamburgerTwo.event('open'), handleOpen)
            hamburger.removeEventListener(HamburgerTwo.event('close'), handleClose)
        }
    }, [])

    useEffect(() => {
        isMenuOpen.value = false
        if (hamburgerRef.current) hamburgerRef.current.isOpen = false
    }, [currentPath])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia(MEDIA_QUERY)
        mediaQuery.addEventListener('change', handleViewportChange)

        return () => {
            mediaQuery.removeEventListener('change', handleViewportChange)
        }
    }, [])

    function handleViewportChange (event:MediaQueryListEvent) {
        if (!event.matches) return
        isMenuOpen.value = false
        if (hamburgerRef.current) {
            hamburgerRef.current.isOpen = false
        }
    }

    return html`<nav class="app-nav" aria-label="Main navigation">
        <div class="desktop-nav">
            <ul class="nav-links nav-links-inline">
                ${renderNavItems(currentPath)}
            </ul>
        </div>
        <${HamburgerTwo.TAG}
            ref=${hamburgerRef}
            class="mobile-nav-trigger"
        ></${HamburgerTwo.TAG}>
        <div class=${menuClasses} hidden=${!isMenuOpen}>
            <ul class="nav-links nav-links-mobile">
                ${renderNavItems(currentPath)}
            </ul>
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
