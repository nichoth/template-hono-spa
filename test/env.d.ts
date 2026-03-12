declare module 'cloudflare:test' {
    interface ProvidedEnv {
        ASSETS?:Fetcher
        NODE_ENV?:string
        DEPLOY_BRANCH?:string
        MAIN_BRANCH?:string
        STAGING_BASIC_AUTH_USERNAME?:string
        STAGING_PW?:string
        BASIC_AUTH_REALM?:string
    }
}
