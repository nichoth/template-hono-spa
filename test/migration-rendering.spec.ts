import { describe, it, expect } from 'vitest'

const sourceFiles = import.meta.glob('/src/**/*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

const clientRenderFileKeys = [
    '/src/client/index.ts',
    '/src/client/not-found.ts',
    '/src/client/routes/about.ts',
    '/src/client/routes/home.ts',
    '/src/app.ts',
    '/src/client/components/card.ts',
    '/src/client/components/counter.ts',
    '/src/client/components/nav.ts',
]

describe('Rendering migration guards', () => {
    it('fails while JSX remains in client rendering modules', () => {
        const filesWithJsx = clientRenderFileKeys.filter((path) => {
            const contents = sourceFiles[path] || ''
            return /return\s*\(\s*</.test(contents)
                || /return\s*</.test(contents)
        })

        expect(filesWithJsx).toEqual([])
    })

    it('fails until client modules use html template literals', () => {
        const filesWithoutHtmlBinding = clientRenderFileKeys.filter((path) => {
            const contents = sourceFiles[path] || ''
            return !/html`/.test(contents)
        })

        expect(filesWithoutHtmlBinding).toEqual([])
    })

    it('fails while any migrated source file remains .tsx', () => {
        const tsxFiles = import.meta.glob('/src/**/*.tsx', { eager: true })
        expect(Object.keys(tsxFiles)).toEqual([])
    })
})
