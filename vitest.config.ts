import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    ssr: {
        noExternal: [
            '@simplewebauthn/browser',
            '@simplewebauthn/server',
            '@peculiar/x509',
            'tsyringe',
            'tslib',
        ],
    },
    test: {
        poolOptions: {
            workers: {
                main: './src/server/index.ts',
                wrangler: { configPath: './wrangler.test.jsonc' },
                miniflare: {
                    d1Databases: ['AUTH_DB'],
                },
            },
        },
    },
})
