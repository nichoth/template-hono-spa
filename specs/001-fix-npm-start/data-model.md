# Data Model: Reliable Local Dev Startup

## Entity: StartupAttempt

- **Description**: One execution of the local development start command.
- **Fields**:
  - `command`: string (`npm start`)
  - `startedAt`: timestamp
  - `result`: enum (`success`, `failure`)
  - `startupDurationMs`: number
  - `developerMessage`: string (human-readable output surfaced to developer)
- **Validation Rules**:
  - `command` must match documented local start command.
  - `result` is required and must be one of the allowed enum values.
  - `developerMessage` must be non-empty when `result = failure`.
- **State Transitions**:
  - `initiated -> success`
  - `initiated -> failure`

## Entity: StartupPrerequisiteArtifact

- **Description**: A local file/resource that may be needed by startup flow.
- **Fields**:
  - `name`: string (artifact label)
  - `requiredInDev`: boolean
  - `requiredInProduction`: boolean
  - `presenceStatus`: enum (`present`, `missing`)
  - `recoveryAction`: string (command or step shown when missing)
- **Validation Rules**:
  - `name` must be unique for each artifact type.
  - `recoveryAction` must be provided for artifacts that can block startup.
  - `requiredInDev` and `requiredInProduction` must be explicit booleans.
- **State Transitions**:
  - `present -> missing` (artifact removed or stale)
  - `missing -> present` (artifact regenerated or bypassed by dev-safe flow)

## Entity: StartupOutcomeContract

- **Description**: User-visible contract for startup command behavior.
- **Fields**:
  - `exitBehavior`: enum (`serving`, `terminated_with_actionable_error`)
  - `localServerReachable`: boolean
  - `actionableRemediationIncluded`: boolean
- **Validation Rules**:
  - If `exitBehavior = terminated_with_actionable_error`, remediation must be included.
  - If `exitBehavior = serving`, `localServerReachable` must be true.
