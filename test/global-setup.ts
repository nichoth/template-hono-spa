import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

export async function setup ():Promise<void> {
    const built = resolve(repoRoot, 'public/client/index.html')
    const fixture = resolve(repoRoot, '_public/index.html')

    await mkdir(dirname(fixture), { recursive: true })
    await copyFile(built, fixture)
}

export async function teardown ():Promise<void> {}
