export interface StartupFailureInput {
    cause:string
    remediation:string
}

export function formatStartupFailure (
    input:StartupFailureInput
):string {
    return (
        'Startup prerequisite error: '
        + input.cause
        + ' Next step: '
        + input.remediation
    )
}

