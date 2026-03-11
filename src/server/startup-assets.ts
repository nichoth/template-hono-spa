export interface AssetPaths {
    css:string
    js:string
}

interface ManifestEntry {
    file?:string
    css?:string[]
}

interface ViteManifest {
    'index.html'?:ManifestEntry
}

export interface StartupAssetResult {
    assets:AssetPaths
    recovered:boolean
    warning?:string
}

const DEFAULT_ASSETS:AssetPaths = {
    css: '/client/index.css',
    js: '/client/index.js',
}
const MANIFEST_PATH = 'client/vite-manifest.json'

function parseManifest (raw:string):ViteManifest|null {
    try {
        return JSON.parse(raw) as ViteManifest
    } catch {
        return null
    }
}

function fromManifest (manifest:ViteManifest):AssetPaths|null {
    const entry = manifest['index.html']
    if (!entry?.file) return null

    return {
        js: `/${entry.file}`,
        css: entry.css?.[0] ? `/${entry.css[0]}` : '',
    }
}

export async function resolveStartupAssets (
    fetcher?:Fetcher
):Promise<StartupAssetResult> {
    if (!fetcher) {
        return {
            assets: DEFAULT_ASSETS,
            recovered: true,
            warning:
                'Static asset binding is unavailable. '
                + 'Using default asset paths.',
        }
    }

    try {
        const response = await fetcher.fetch(
            `http://assets/${MANIFEST_PATH}`
        )
        if (!response.ok) {
            return {
                assets: DEFAULT_ASSETS,
                recovered: true,
                warning:
                    `Vite manifest was not found at ${MANIFEST_PATH}. `
                    + 'Using default asset paths.',
            }
        }

        const raw = await response.text()
        const manifest = parseManifest(raw)
        if (!manifest) {
            return {
                assets: DEFAULT_ASSETS,
                recovered: true,
                warning:
                    `Vite manifest at ${MANIFEST_PATH} is invalid JSON. `
                    + 'Using default asset paths.',
            }
        }

        const assets = fromManifest(manifest)
        if (!assets) {
            return {
                assets: DEFAULT_ASSETS,
                recovered: true,
                warning:
                    `Vite manifest at ${MANIFEST_PATH} is missing index.html entry. `
                    + 'Using default asset paths.',
            }
        }

        return {
            assets,
            recovered: false,
        }
    } catch {
        return {
            assets: DEFAULT_ASSETS,
            recovered: true,
            warning:
                `Could not load Vite manifest at ${MANIFEST_PATH}. `
                + 'Using default asset paths.',
        }
    }
}
