# Quickstart: HTM Rendering + TS Extension Migration

## Prerequisites
- Node.js and npm installed
- Dependencies installed with `npm install`

## Implementation Sequence
1. Rename all `.tsx` modules in migration scope to `.ts`.
2. Update imports and direct path references impacted by file renames.
3. Remove JSX syntax from server modules in scope.
4. Convert client rendering modules in scope to template-literal style.
5. Verify runtime behavior parity.

## Verification Commands
1. Confirm no remaining `.tsx` files and no server JSX-return patterns:
   - `specs/006-migrate-htm-rendering/scripts/migration-scan.sh`
2. Run tests:
   - `HOME=/tmp npm test`
3. Run lint:
   - `npm run lint`
4. Validate startup in development:
   - `npm start`

## Completion Criteria
- No server JSX-return syntax remains in migration scope.
- Migrated `.tsx` files are replaced by `.ts` equivalents.
- Client rendering modules in scope follow template-literal style.
- Existing route and endpoint behavior remains intact under test verification.
