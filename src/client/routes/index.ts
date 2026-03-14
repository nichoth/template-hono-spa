import Router from '@substrate-system/routes'
import { HomeRoute } from './home.js'
import { AboutRoute } from './about.js'
import { LoginRoute } from './login.js'
import { ProfileRoute } from './profile.js'
import { SignupRoute } from './signup.js'
import { ConfirmRoute } from './confirm.js'
import { type AppState } from '../state.js'

export type AppRoute = {
    href:string;
    text:string;
    isAuthLink?:boolean;
}

export const routes:ReadonlyArray<AppRoute> = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/login', text: 'Login', isAuthLink: true },
    { href: '/signup', text: 'Create Account', isAuthLink: true },
]

const knownClientRoutes = new Set([
    ...routes.map(route => route.href),
    '/profile',
    '/signup',
    '/confirm',
])

export function createRouter (_state?:AppState):InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/about', () => {
        return AboutRoute
    })

    router.addRoute('/login', () => {
        return LoginRoute
    })

    router.addRoute('/signup', () => {
        return SignupRoute
    })

    router.addRoute('/profile', () => {
        return ProfileRoute
    })

    router.addRoute('/confirm', () => {
        return ConfirmRoute
    })

    router.addRoute('/confirm/:code', () => {
        return ConfirmRoute
    })

    return router
}

export function getNavRoutes (authenticated:boolean):AppRoute[] {
    if (!authenticated) return [...routes]

    return routes.filter(route => !route.isAuthLink)
}

export function isKnownClientRoute (path:string):boolean {
    if (knownClientRoutes.has(path)) return true
    if (path === '/confirm' || path === '/confirm/') return true
    if (path.startsWith('/confirm/')) return true
    return false
}
