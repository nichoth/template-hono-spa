#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$repo_root"

echo "[scan] .tsx files in src/:"
rg --files -g '*.tsx' src || true

echo "[scan] JSX return patterns in src/server:"
rg -n "return\\s*\\(\\s*<|return\\s*<|<>|</>" src/server || true
