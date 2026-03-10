export type EnvironmentType = 'main' | 'staging' | 'preview' | 'unknown'

export type DeploymentContext = {
    branchName:string
    environmentType:EnvironmentType
    requiresAuth:boolean
}

export function resolveDeploymentContext (
    branchNameRaw:string|undefined,
    mainBranchRaw:string|undefined,
):DeploymentContext {
    const mainBranch = normalizeBranch(mainBranchRaw || 'main')
    const branchName = normalizeBranch(branchNameRaw)

    if (branchName === mainBranch) {
        return {
            branchName,
            environmentType: 'main',
            requiresAuth: false,
        }
    }

    const environmentType = classifyNonMainBranch(branchName)

    return {
        branchName,
        environmentType,
        requiresAuth: true,
    }
}

function classifyNonMainBranch (branchName:string):EnvironmentType {
    if (branchName.includes('preview')) return 'preview'
    if (branchName === 'unknown') return 'unknown'
    return 'staging'
}

function normalizeBranch (value:string|undefined):string {
    const trimmed = value?.trim().toLowerCase()
    if (!trimmed) return 'unknown'
    return trimmed
}
