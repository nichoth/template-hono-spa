# Data Model: Login Route

## Entity: LoginFormState

- **Purpose**: Represents the current interactive state of the `/login` form while the visitor is on the route.
- **Fields**:
  - `identifier`: text entered into the username-or-email field
  - `password`: text entered into the password field
  - `fieldErrors`: validation messages keyed by field name
  - `submitMessage`: the visible outcome shown after a submit attempt
  - `hasSubmitted`: whether the visitor has attempted to submit the form
- **Validation rules**:
  - `identifier` is required before submit can succeed
  - `password` is required before submit can succeed
  - Missing-field feedback must be visible after submit is attempted
  - Entered values that are already valid remain intact after a failed submit

## Entity: LoginFieldError

- **Purpose**: Captures user-visible guidance for a specific required field.
- **Fields**:
  - `field`: the field the guidance applies to (`identifier` or `password`)
  - `message`: concise corrective text shown to the visitor
- **Relationships**:
  - Many `LoginFieldError` records can belong to one `LoginFormState`

## Entity: LoginSubmitMessage

- **Purpose**: Describes the overall status shown after the visitor submits the form.
- **Fields**:
  - `kind`: validation or informational outcome
  - `message`: visible text shown on the page
- **Relationships**:
  - One `LoginSubmitMessage` may be present on a `LoginFormState`

## State Transitions

1. **Initial**: Fields are empty, no validation errors, no submit message.
2. **Editing**: The visitor updates one or both fields.
3. **Invalid Submit**: The visitor submits with one or more required fields missing; relevant field errors appear and valid field values remain.
4. **Valid UI-Only Submit**: The visitor submits with both fields completed; field errors clear and an informational message confirms that no real authentication has occurred.
