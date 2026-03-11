# Data Model

## Test File

- **Description**: A TypeScript module under `test/` that must type-check and continue to verify existing behavior.
- **Key fields**:
  - `path`: repository-relative file path
  - `imports`: external and internal modules referenced by the test
  - `typeIssues`: current compiler diagnostics attributed to the file
  - `runtimeCoverage`: behavior area exercised by the file
- **Relationships**:
  - Depends on one or more `Typed Test Utility` entries
  - Is evaluated by the `Validation Workflow`

## Typed Test Utility

- **Description**: A test-only helper, worker runtime binding, or imported source API whose type surface affects test compilation.
- **Key fields**:
  - `moduleName`: imported module or file path
  - `exportName`: helper or symbol used by tests
  - `expectedSignature`: call or value shape the tests rely on
  - `actualSignature`: current type definition exposed by source or dependency
- **Relationships**:
  - Can be used by multiple `Test File` entries
  - Must align with the `Validation Workflow` compiler context

## Validation Workflow

- **Description**: The repeatable command path used to prove that test files have no TypeScript diagnostics and still execute.
- **Key fields**:
  - `typecheckCommand`: command used to validate test-file typing
  - `testCommand`: command used to execute the suite
  - `scope`: which files are considered in-scope for pass/fail
  - `documentedExceptions`: unrelated diagnostics explicitly left out of scope
- **Relationships**:
  - Evaluates all `Test File` entries
  - Depends on `Typed Test Utility` configuration being correct
