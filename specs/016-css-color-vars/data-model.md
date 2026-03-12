# Data Model: Shared Color Variables

## Entity: ColorToken

- **Purpose**: Represents a named shared color value used across maintained application styles.
- **Fields**:
  - `name`: semantic token name used by style rules
  - `purpose`: the interface meaning the token represents, such as base text, surface, border, primary action, success, warning, or error
  - `value`: the approved color assigned to that semantic purpose
  - `scope`: whether the token is intended for global, inverse, status, or interaction usage
- **Validation rules**:
  - `name` must describe semantic intent rather than a page-specific selector
  - Each maintained color usage must map to one token name
  - Duplicate tokens for the same semantic purpose should be consolidated unless distinct states are required

## Entity: ColorUsage

- **Purpose**: Represents a maintained style rule that applies color to the interface.
- **Fields**:
  - `file`: stylesheet where the usage appears
  - `selector`: UI surface receiving the color
  - `property`: the styled attribute, such as text color, background, border, outline, fill, or shadow
  - `tokenName`: the shared color token referenced by the rule
  - `semanticRole`: the meaning of the color in context
- **Validation rules**:
  - `tokenName` must reference an existing `ColorToken`
  - `property` must not use a direct literal color in maintained styles
  - `semanticRole` should remain consistent when the same token is reused across files
- **Relationships**:
  - Many `ColorUsage` records can reference one `ColorToken`

## Entity: ColorComplianceRule

- **Purpose**: Captures the repository rule that maintained styles must use shared tokens for color values.
- **Fields**:
  - `appliesTo`: set of maintained stylesheet paths covered by the rule
  - `allowedPatterns`: token-reference patterns or explicit exceptions
  - `blockedPatterns`: direct literal formats or raw named colors that are not allowed
  - `verificationMethod`: automated or manual validation used to enforce the rule
- **Relationships**:
  - One `ColorComplianceRule` governs many `ColorUsage` records

## State Transitions

1. **Literal Usage Found**: A maintained stylesheet contains a direct literal or raw named color.
2. **Token Mapping Chosen**: The usage is assigned to an existing semantic token or drives creation of a new shared token.
3. **Usage Converted**: The stylesheet references the shared token instead of a literal color.
4. **Compliance Verified**: Automated and manual checks confirm maintained styles no longer contain blocked direct color usage.
