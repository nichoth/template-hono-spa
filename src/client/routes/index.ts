import Router from '@substrate-system/routes'
import { HomeRoute } from './home.js'
import { AboutRoute } from './about.js'

export type AppRoute = {
    href:string;
    text:string;
}

export const routes:ReadonlyArray<AppRoute> = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
]

export function createRouter ():InstanceType<typeof Router> {
    const router = new Router()

    router.addRoute('/', () => {
        return HomeRoute
    })

    router.addRoute('/about', () => {
        return AboutRoute
    })

    return router
}

export function isKnownClientRoute (path:string):boolean {
    return routes.some(route => route.href === path)
}
