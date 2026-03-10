export function unauthorizedBasicAuthResponse (realmRaw:string|undefined):Response {
    const realm = formatRealm(realmRaw)

    return new Response('Authentication required.', {
        status: 401,
        headers: {
            'www-authenticate': `Basic realm="${realm}"`,
            'cache-control': 'no-store',
        },
    })
}

function formatRealm (value:string|undefined):string {
    const trimmed = value?.trim()
    if (!trimmed) return 'Restricted'
    return trimmed.replace(/"/g, '')
}
