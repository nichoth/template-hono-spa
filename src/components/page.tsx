import type { ComponentChildren } from 'preact'
import type { SerializedState } from '../state.js'

export interface PageProps {
    title:string
    pageProps:SerializedState
    isDev?:boolean
    assets?:{ css:string, js:string }
    children?:ComponentChildren
}

export function Page ({
    title,
    pageProps,
    isDev = false,
    assets,
    children
}:PageProps) {
    const cssPath = assets?.css ||
        (isDev ? '/src/style.css' : '/assets/index.css')
    const jsPath = assets?.js ||
        (isDev ?
            '/src/client/index.tsx' :
            '/assets/index.js')

    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content={
                        'width=device-width, '
                        + 'initial-scale=1.0'
                    }
                />
                <title>{title}</title>
                <link rel="stylesheet" href={cssPath} />
            </head>
            <body>
                <div id="root">
                    {children}
                </div>

                <script
                    dangerouslySetInnerHTML={{
                        __html:
                            'window.__INITIAL_STATE__ = '
                            + JSON.stringify(pageProps)
                    }}
                />
                <script
                    type="module"
                    src={jsPath}
                ></script>
            </body>
        </html>
    )
}
