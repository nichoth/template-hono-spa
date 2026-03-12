# Data Model: Staging Password Docs

## Entity: Staging Deployment Credential

**Purpose**: Represents the credential values maintainers must configure to protect the staging deployment.

**Fields**:
- `username_secret_name`: Exact name for the staging username secret
- `password_secret_name`: Exact name for the staging password secret
- `rotation_action`: Maintainer action for replacing credential values
- `applies_to_environment`: Deployment environment where the credential is enforced

**Validation Rules**:
- Secret names must match the current repository configuration exactly
- Documentation must treat the password value as generated or rotated, not committed
- Rotation guidance must clearly indicate which credential can be regenerated

## Entity: Cloudflare Staging Environment

**Purpose**: Represents the deployment context where staging password protection is configured.

**Fields**:
- `environment_name`: Cloudflare environment used for staging deployment
- `deploy_command`: Command maintainers use to deploy the staging environment
- `secret_application_scope`: Statement describing that secrets apply to staging

**Relationships**:
- A `Cloudflare Staging Environment` uses one `Staging Deployment Credential` set

## State Transition: Credential Rotation

1. Maintainer identifies the staging password secret used for protected access
2. Maintainer generates a new random password value from the CLI
3. Maintainer updates the staging password secret in the staging environment
4. Maintainer keeps the username secret unchanged unless a username rotation is also needed
