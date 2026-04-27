#!/usr/bin/env bash
# =============================================================================
# auto-build-site.sh
# -----------------------------------------------------------------------------
# Orquestador autónomo: avanza secciones del sitio sin intervención humana.
#
# Flujo:
#   1. Lee .qa-state.json → encuentra próxima sección PENDING
#   2. Espera que Railway compile el último commit (poll HTTP + tag check)
#   3. Captura screenshots (QA + prod) vía playwright
#   4. Calcula visual-diff con ImageMagick
#   5. Si diff <= tolerancia → marca DONE, avanza
#   6. Si diff > tolerancia y iterations < max → escribe "NEEDS_FIX" para que
#      Claude (en su loop) aplique código nuevo
#   7. Si iterations >= max → marca BLOCKED y avanza igual (no infinite loop)
#
# Uso:
#   ./scripts/auto-build-site.sh                   # 1 ronda
#   ./scripts/auto-build-site.sh --watch           # bucle hasta DONE all
#   ./scripts/auto-build-site.sh --section header  # forzar sección
# =============================================================================

set -euo pipefail

# -- Config -------------------------------------------------------------------
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="$ROOT/.qa-state.json"
EVIDENCE_DIR="$HOME/Documents/workspace-mcp-global/evidence/puebloladehesa-rediseno"
JQ="${JQ:-jq}"

if ! command -v "$JQ" >/dev/null 2>&1; then
  echo "❌ jq required (brew install jq)" >&2
  exit 1
fi

# -- Helpers ------------------------------------------------------------------
log() { echo "[$(date +%H:%M:%S)] $*"; }
state() { "$JQ" -r "$1" "$STATE_FILE"; }
state_set() {
  local tmp; tmp="$(mktemp)"
  "$JQ" "$1" "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
}

next_pending_section() {
  state '.sections[] | select(.status=="PENDING" or .status=="NEEDS_FIX") | .id' | head -1
}

# -- Wait for Railway build with current commit -------------------------------
wait_for_build() {
  local commit="$1"
  local qa_url; qa_url="$(state .qa_url)"
  local short_sha="${commit:0:7}"
  log "⏳ Esperando build $short_sha en $qa_url …"

  for i in $(seq 1 24); do  # ~4 min max
    local code; code=$(curl -s -o /dev/null -w "%{http_code}" "$qa_url" || echo "000")
    if [ "$code" = "200" ]; then
      # Check if HTML mentions any change marker (best-effort)
      log "  [$i/24] HTTP 200 — build live"
      return 0
    fi
    log "  [$i/24] HTTP $code — esperando…"
    sleep 10
  done
  log "⚠️  Timeout esperando build (continúo igual)"
  return 0
}

# -- Capture screenshot via playwright ----------------------------------------
capture() {
  local url="$1" out="$2" sy="${3:-null}" fp="${4:-0}"
  node "$ROOT/scripts/capture-section.mjs" "$url" "$out" 1280 900 "$sy" "$fp" >/dev/null 2>&1 \
    || { log "❌ screenshot failed: $url (sy=$sy fp=$fp)"; return 1; }
}

# -- Compute diff with ImageMagick --------------------------------------------
diff_percent() {
  local ref="$1" act="$2" out="$3"
  if ! command -v compare >/dev/null 2>&1; then
    # Fallback: byte-size delta (rough proxy)
    if [ ! -f "$ref" ] || [ ! -f "$act" ]; then echo "100"; return; fi
    local rs as; rs=$(stat -f%z "$ref"); as=$(stat -f%z "$act")
    awk "BEGIN { d = ($rs > $as) ? $rs - $as : $as - $rs; printf \"%.2f\", (d / $rs) * 100 }"
    return
  fi
  local px; px=$(compare -metric AE -fuzz 5% "$ref" "$act" "$out" 2>&1 || true)
  awk "BEGIN { printf \"%.2f\", ($px / (1280*900)) * 100 }"
}

# -- Process one section ------------------------------------------------------
process_section() {
  local id="$1"
  local view; view=$(state ".sections[] | select(.id==\"$id\") | .view")
  local iter; iter=$(state ".sections[] | select(.id==\"$id\") | .iterations")
  local max;  max=$(state .max_iterations_per_section)
  local tol;  tol=$(state .tolerance_percent)
  local prod_url qa_url
  prod_url=$(state .production_url)
  qa_url=$(state .qa_url)

  mkdir -p "$EVIDENCE_DIR/$view"
  local ref="$EVIDENCE_DIR/$view/reference.png"
  local act="$EVIDENCE_DIR/$view/actual.png"
  local dif="$EVIDENCE_DIR/$view/diff.png"

  log "═══ Sección: $id (view=$view, iter=$iter/$max) ═══"

  local section_url section_sy section_fp
  section_url=$(state ".sections[] | select(.id==\"$id\") | .url // \"/\"")
  section_sy=$(state ".sections[] | select(.id==\"$id\") | (.scroll_y // null) | tostring")
  section_fp=$(state ".sections[] | select(.id==\"$id\") | (if .full_page then 1 else 0 end)")

  # Always capture (force fresh) — strict mode
  log "  📸 Capturando referencia (prod) sy=$section_sy fp=$section_fp …"
  capture "${prod_url}${section_url}" "$ref" "$section_sy" "$section_fp"
  log "  📸 Capturando QA actual…"
  capture "${qa_url}${section_url}" "$act" "$section_sy" "$section_fp"

  # Compare
  local pct; pct=$(diff_percent "$ref" "$act" "$dif")
  log "  📊 Diff: ${pct}% (tolerancia: ${tol}%)"

  # Update state
  local now; now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  state_set "(.sections[] | select(.id==\"$id\") | .last_diff) |= ${pct}"
  state_set "(.sections[] | select(.id==\"$id\") | .iterations) |= $((iter+1))"

  # Decision
  local pass; pass=$(awk "BEGIN { print (${pct} <= ${tol}) ? 1 : 0 }")
  if [ "$pass" = "1" ]; then
    log "  ✅ PASS — marcando DONE"
    state_set "(.sections[] | select(.id==\"$id\") | .status) |= \"DONE\""
  elif [ $((iter+1)) -ge "$max" ]; then
    log "  ⏭️  Max iter alcanzado — marcando BLOCKED y avanzando"
    state_set "(.sections[] | select(.id==\"$id\") | .status) |= \"BLOCKED\""
  else
    log "  🔧 NEEDS_FIX — Claude debe aplicar código en próxima vuelta"
    state_set "(.sections[] | select(.id==\"$id\") | .status) |= \"NEEDS_FIX\""
  fi

  state_set ".last_build_at |= \"$now\""
}

# -- Main ---------------------------------------------------------------------
WATCH=0
FORCE_SECTION=""
while [ $# -gt 0 ]; do
  case "$1" in
    --watch) WATCH=1 ;;
    --section) FORCE_SECTION="$2"; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

cd "$ROOT"

while true; do
  HEAD_COMMIT=$(git rev-parse HEAD)
  STATE_COMMIT=$(state .last_commit)
  if [ "$HEAD_COMMIT" != "$STATE_COMMIT" ]; then
    log "📌 New HEAD: $HEAD_COMMIT (was $STATE_COMMIT) — esperando build"
    wait_for_build "$HEAD_COMMIT"
    state_set ".last_commit |= \"$HEAD_COMMIT\""
  fi

  if [ -n "$FORCE_SECTION" ]; then
    SECTION="$FORCE_SECTION"
    FORCE_SECTION=""
  else
    SECTION="$(next_pending_section || true)"
  fi

  if [ -z "$SECTION" ]; then
    log "🎉 Todas las secciones DONE/BLOCKED — sitio terminado"
    state_set ".current_section |= \"COMPLETE\""
    exit 0
  fi

  state_set ".current_section |= \"$SECTION\""
  process_section "$SECTION"

  # If status became NEEDS_FIX, exit so Claude wake-up can apply code
  STATUS=$(state ".sections[] | select(.id==\"$SECTION\") | .status")
  if [ "$STATUS" = "NEEDS_FIX" ]; then
    log "↩️  NEEDS_FIX → handoff a Claude para fix de código"
    exit 2  # exit 2 = needs claude
  fi

  if [ "$WATCH" = "0" ]; then
    log "✓ Una ronda completa. Usar --watch para loop."
    exit 0
  fi

  sleep 5
done
