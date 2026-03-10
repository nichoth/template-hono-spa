export type BasicAuthCredential = {
    username:string|null
    password:string|null
    isMalformed:boolean
}

export function parseBasicAuthHeader (
    authorizationHeader:string|undefined,
):BasicAuthCredential {
    if (!authorizationHeader) {
        return { username: null, password: null, isMalformed: false }
    }

    const [scheme, encoded] = authorizationHeader.split(' ', 2)

    if (!scheme || scheme.toLowerCase() !== 'basic' || !encoded) {
        return { username: null, password: null, isMalformed: true }
    }

    let decoded = ''
    try {
        decoded = atob(encoded)
    } catch {
        return { username: null, password: null, isMalformed: true }
    }

    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex < 0) {
        return { username: null, password: null, isMalformed: true }
    }

    const username = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)

    return {
        username,
        password,
        isMalformed: false,
    }
}

export function credentialsMatch (
    credential:BasicAuthCredential,
    expectedUsername:string|undefined,
    expectedPassword:string|undefined,
):boolean {
    if (credential.isMalformed) return false
    if (!expectedUsername || !expectedPassword) return false

    return credential.username === expectedUsername
        && credential.password === expectedPassword
}
