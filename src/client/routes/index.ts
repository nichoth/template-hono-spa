import Router from '@substrate-system/routes'
import { HomeRoute } from './home.js'
import { AboutRoute } from './about.js'
import { LoginRoute } from './login.js'
import { ProfileRoute } from './profile.js'
import { SignupRoute } from './signup.js'
import { type AppState } from '../state.js'

export type AppRoute = {
    href:string;
    text:string;
}

export const routes:ReadonlyArray<AppRoute> = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/login', text: 'Login' },
    { href: '/signup', text: 'Create Account' },
]

const knownClientRoutes = new Set([
    ...routes.map(route => route.href),
    '/profile',
    '/signup',
])

export function createRouter (_state:AppState):InstanceType<typeof Router> {
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

    return router
}

export function isKnownClientRoute (path:string):boolean {
    return knownClientRoutes.has(path)
}
