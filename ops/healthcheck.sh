#!/bin/sh
# Verificação de saúde de todos os serviços do HUB Institucional
# Usado em scripts de operação; o healthcheck dos containers usa mecanismos próprios.
set -eu

BACKEND_URL="${BACKEND_URL:-http://backend:3000}"
EXIT_CODE=0

check() {
  name="$1"; url="$2"
  if wget -qO- --timeout=5 "$url" > /dev/null 2>&1; then
    printf '[ok]   %s (%s)\n' "$name" "$url"
  else
    printf '[FAIL] %s (%s)\n' "$name" "$url"
    EXIT_CODE=1
  fi
}

check "backend liveness"  "$BACKEND_URL/health"
check "backend readiness" "$BACKEND_URL/health/ready"

exit "$EXIT_CODE"
