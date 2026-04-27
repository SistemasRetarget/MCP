#!/usr/bin/env bash
# Monitor de deploy Railway con signal file.
# Uso:   scripts/wait-deploy.sh [marker_url] [expected_sha] [max_seconds]
# Salida: escribe estado a .qa/deploy-status.json cada 10s y al terminar.
#
# Estados posibles en deploy-status.json:
#   {"state":"waiting", "elapsed":N, "last_check":"..."}
#   {"state":"ready",   "elapsed":N, "sha":"...", "ts":"..."}
#   {"state":"timeout", "elapsed":N}
#
# Cascade puede leer este archivo en cualquier momento sin bloquear.

set -e
MARKER="${1:-https://puebloladehesa-web-production.up.railway.app/}"
# CONTENT_MATCH: si se pasa, el deploy se considera 'ready' solo si el HTML lo contiene.
CONTENT_MATCH="${2:-}"
EXPECTED_SHA="${3:-$(git rev-parse --short HEAD 2>/dev/null || echo '')}"
MAX="${4:-300}"
OUT="$(dirname "$0")/../.qa/deploy-status.json"
mkdir -p "$(dirname "$OUT")"

START=$(date +%s)
while true; do
  NOW=$(date +%s)
  ELAPSED=$((NOW - START))

  if [ "$ELAPSED" -ge "$MAX" ]; then
    echo "{\"state\":\"timeout\",\"elapsed\":$ELAPSED,\"marker\":\"$MARKER\"}" > "$OUT"
    exit 1
  fi

  RESP=$(/usr/bin/curl -sS -m 10 "$MARKER?v=$NOW" 2>/dev/null || echo "")
  CODE=$(/usr/bin/curl -sS -o /dev/null -w "%{http_code}" -m 8 "$MARKER?v=$NOW" || echo "000")

  if [ "$CODE" = "200" ]; then
    if [ -z "$CONTENT_MATCH" ] || echo "$RESP" | grep -qF "$CONTENT_MATCH"; then
      echo "{\"state\":\"ready\",\"elapsed\":$ELAPSED,\"sha\":\"$EXPECTED_SHA\",\"marker\":\"$MARKER\",\"match\":\"$CONTENT_MATCH\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$OUT"
      exit 0
    fi
  fi

  echo "{\"state\":\"waiting\",\"elapsed\":$ELAPSED,\"http\":$CODE,\"marker\":\"$MARKER\"}" > "$OUT"
  sleep 10
done
