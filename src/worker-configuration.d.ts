export {}

declare global {
    interface CloudflareEnv {
        AUTH_DB:D1Database;
    }

    namespace Cloudflare {
        interface Env {
            AUTH_DB:D1Database;
            ASSETS?:Fetcher;
            NODE_ENV?:string;
            DEPLOY_BRANCH?:string;
            MAIN_BRANCH?:string;
            STAGING_BASIC_AUTH_USERNAME?:string;
            STAGING_PW?:string;
            BASIC_AUTH_REALM?:string;
            AUTH_SESSION_TTL_SECONDS?:string;
        }
    }
}

declare module 'cloudflare:test' {
    interface ProvidedEnv {
        AUTH_DB:D1Database;
        AUTH_SESSION_TTL_SECONDS?:string;
    }
}
