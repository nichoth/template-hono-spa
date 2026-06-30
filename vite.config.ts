import { defineConfig, type Plugin } from 'vite'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import { cloudflare } from '@cloudflare/vite-plugin'

const UNSUPPORTED_MODULE_TYPES = new Set([
    'copy',
    'css',
    'default',
    'file',
    'local-css',
])

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        define: {
            global: 'globalThis'
        },
        resolve: {
            alias: {
                '@substrate-system/debug': mode === 'production' ?
                    '@substrate-system/debug/noop' :
                    '@substrate-system/debug'
            }
        },
        ssr: {
            noExternal: [
                '@simplewebauthn/browser',
                '@simplewebauthn/server',
                '@peculiar/x509',
                'tsyringe',
                'tslib',
            ],
        },
        plugins: [
            // Vite 8 still works with the Cloudflare plugin here, but disabling
            // the inspector avoids environment-specific startup failures.
            // The installed Cloudflare plugin still emits deprecated
            // optimizeDeps.esbuildOptions, so sanitize its config for Vite 8.
            ...wrapCloudflarePluginsForVite8(
                cloudflare({
                    inspectorPort: false,
                    config: (workerConfig) => {
                        if (process.env.LOCAL_BILLING_LIVE === '1') {
                            workerConfig.vars = {
                                ...(workerConfig.vars ?? {}),
                                LOCAL_BILLING_LIVE: '1',
                            }
                        }
                    },
                })
            ),
        ],
        // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' }
        },
        publicDir: '_public',
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                drafts: {
                    customMedia: true  // see ./src/_variables.css
                },
                targets: browserslistToTargets(browserslist('>= 0.25%')),
            },
        },
        server: {
            port: 9999,
            host: true,
            open: true,
            headers: CROSS_ORIGIN_ISOLATION_HEADERS,
        },
        build: {
            cssMinify: 'lightningcss',
            target: 'esnext',
            minify: mode === 'production',
            outDir: './public',
            emptyOutDir: true,
            sourcemap: true,
            manifest: 'vite-manifest.json',
        }
    }
})

function migrateOptimizeDepsConfig (
    config:Record<string, any>
):Record<string, any> {
    if (!config || typeof config !== 'object') return config

    const nextConfig = { ...config }

    if (config.ssr?.optimizeDeps) {
        nextConfig.ssr = {
            ...config.ssr,
            optimizeDeps: migrateOptimizeDepsOptions(config.ssr.optimizeDeps),
        }
    }

    if (config.optimizeDeps) {
        nextConfig.optimizeDeps = migrateOptimizeDepsOptions(config.optimizeDeps)
    }

    if (config.environments) {
        nextConfig.environments = Object.fromEntries(
            Object.entries(config.environments).map(([name, environment]) => [
                name,
                migrateOptimizeDepsConfig(environment as Record<string, any>),
            ])
        )
    }

    return nextConfig
}

function migrateOptimizeDepsOptions (
    optimizeDeps:Record<string, any>
):Record<string, any> {
    if (!optimizeDeps?.esbuildOptions) return optimizeDeps

    const {
        esbuildOptions,
        ...remainingOptimizeDeps
    } = optimizeDeps
    const rolldownOptions:Record<string, any> = {
        ...optimizeDeps.rolldownOptions,
        resolve: { ...optimizeDeps.rolldownOptions?.resolve },
        output: { ...optimizeDeps.rolldownOptions?.output },
        transform: { ...optimizeDeps.rolldownOptions?.transform },
    }

    if (esbuildOptions.minify !== undefined &&
        rolldownOptions.output.minify === undefined) {
        rolldownOptions.output.minify = esbuildOptions.minify
    }

    if (esbuildOptions.treeShaking !== undefined &&
        rolldownOptions.treeshake === undefined) {
        rolldownOptions.treeshake = esbuildOptions.treeShaking
    }

    if (esbuildOptions.define !== undefined &&
        rolldownOptions.transform.define === undefined) {
        rolldownOptions.transform.define = esbuildOptions.define
    }

    if (esbuildOptions.loader !== undefined) {
        rolldownOptions.moduleTypes ??= {}

        for (const [key, value] of Object.entries(esbuildOptions.loader)) {
            if (rolldownOptions.moduleTypes[key] === undefined &&
                !UNSUPPORTED_MODULE_TYPES.has(value as string)) {
                rolldownOptions.moduleTypes[key] = value
            }
        }
    }

    if (esbuildOptions.preserveSymlinks !== undefined &&
        rolldownOptions.resolve.symlinks === undefined) {
        rolldownOptions.resolve.symlinks = !esbuildOptions.preserveSymlinks
    }

    if (esbuildOptions.resolveExtensions !== undefined &&
        rolldownOptions.resolve.extensions === undefined) {
        rolldownOptions.resolve.extensions = esbuildOptions.resolveExtensions
    }

    if (esbuildOptions.mainFields !== undefined &&
        rolldownOptions.resolve.mainFields === undefined) {
        rolldownOptions.resolve.mainFields = esbuildOptions.mainFields
    }

    if (esbuildOptions.conditions !== undefined &&
        rolldownOptions.resolve.conditionNames === undefined) {
        rolldownOptions.resolve.conditionNames = esbuildOptions.conditions
    }

    if (esbuildOptions.keepNames !== undefined &&
        rolldownOptions.output.keepNames === undefined) {
        rolldownOptions.output.keepNames = esbuildOptions.keepNames
    }

    if (esbuildOptions.platform !== undefined &&
        rolldownOptions.platform === undefined) {
        rolldownOptions.platform = esbuildOptions.platform
    }

    if (esbuildOptions.target !== undefined &&
        rolldownOptions.target === undefined) {
        rolldownOptions.target = esbuildOptions.target
    }

    return {
        ...remainingOptimizeDeps,
        rolldownOptions,
    }
}

function wrapConfigHook (
    hook:((...args:any[]) => any)|undefined|null
) {
    if (!hook) return hook

    return function wrappedConfigHook (this:unknown, ...args:any[]) {
        return Promise.resolve(hook.apply(this, args))
            .then(result => migrateOptimizeDepsConfig(result))
    }
}

function wrapCloudflarePluginsForVite8 (plugins:Plugin[]):Plugin[] {
    return plugins.map(plugin => ({
        ...plugin,
        config: wrapConfigHook(
            (plugin as Record<string, any>).config
        ),
        configEnvironment: wrapConfigHook(
            (plugin as Record<string, any>).configEnvironment
        ),
        // configEnvironment: wrapConfigHook(plugin.configEnvironment)
    })) as Plugin[]
}

const CROSS_ORIGIN_ISOLATION_HEADERS = {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
}
