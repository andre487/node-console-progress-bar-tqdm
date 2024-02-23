#!/usr/bin/env bash
set -eufo pipefail

source "$(dirname "$0")/_common.sh"
cd "$(dirname "$0")/.."
were_errors=0

log "==> Running type check"
npm run type-check || were_errors=1

log "==> Running linters"
npm run lint || were_errors=1

if [[ "$were_errors" != 0 ]]; then
    log "FAILED: There were errors in tests"
    exit 1
fi
log "OK"
