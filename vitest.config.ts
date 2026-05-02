import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [cloudflareTest({
        main: './src/server/index.ts',
        wrangler: { configPath: './wrangler.test.jsonc' },
        miniflare: {
            d1Databases: ['AUTH_DB'],
        },
    })],
    test: {
        globalSetup: ['./test/global-setup.ts'],
    },
})
