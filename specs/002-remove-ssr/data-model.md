# Data Model: Client-Only Rendering

## Entity: ClientRenderShell

- **Description**: HTML shell returned by page routes before browser-side app rendering.
- **Fields**:
  - `documentTitle`: string
  - `mountNodeId`: string
  - `scriptReferences`: list of strings
  - `styleReferences`: list of strings
  - `initialStatePayload`: object
- **Validation Rules**:
  - `mountNodeId` must map to an existing container element in response HTML.
  - `scriptReferences` must include the client app entry script.
  - `initialStatePayload` must be serializable.
- **State Transitions**:
  - `served -> hydrated` (client takes ownership and renders UI)

## Entity: StartupDiagnosticMessage

- **Description**: User-visible startup error/help output when prerequisites fail.
- **Fields**:
  - `cause`: string
  - `remediation`: string
  - `severity`: enum (`warning`, `error`)
- **Validation Rules**:
  - `cause` must explicitly name the failure condition.
  - `remediation` must include at least one concrete next step.
- **State Transitions**:
  - `emitted -> acknowledged`

## Entity: RouteResponseMode

- **Description**: Rendering mode indicator for primary page route responses.
- **Fields**:
  - `path`: string
  - `mode`: enum (`client_shell_only`)
  - `containsServerRenderedUI`: boolean
- **Validation Rules**:
  - `mode` must be `client_shell_only` for targeted routes.
  - `containsServerRenderedUI` must be `false` for targeted routes.

## Alignment Notes

- `RouteResponseMode` remains `client_shell_only` for targeted routes after verification.
- `StartupDiagnosticMessage` contract remains active for prerequisite failures.
