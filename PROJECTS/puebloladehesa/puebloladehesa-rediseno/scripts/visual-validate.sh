#!/usr/bin/env bash
# =============================================================================
# visual-validate.sh
# -----------------------------------------------------------------------------
# Workflow recurrente de validación visual contra producción.
#
# Uso:
#   ./scripts/visual-validate.sh [section]
#
# Ejemplo:
#   ./scripts/visual-validate.sh hero-banner
#   ./scripts/visual-validate.sh full-page
#
# Lo que hace:
#   1. Captura screenshot del deploy actual de Railway
#   2. Captura screenshot de la referencia (puebloladehesa.cl)
#   3. Genera visual-diff y muestra el % de diferencia
#   4. Abre las imágenes para inspección manual
#   5. Reporta status (PASS si < tolerance, BLOCK si >=)
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuración
# -----------------------------------------------------------------------------
PROJECT_NAME="puebloladehesa-rediseno"
PRODUCTION_URL="https://puebloladehesa.cl"
DEPLOY_URL="https://puebloladehesa-web-production.up.railway.app"
EVIDENCE_DIR="$HOME/Documents/workspace-mcp-global/evidence/$PROJECT_NAME"
TOLERANCE_PERCENT="${TOLERANCE:-5}"
VIEWPORT_WIDTH="${VIEWPORT_WIDTH:-1280}"
VIEWPORT_HEIGHT="${VIEWPORT_HEIGHT:-900}"
WAIT_MS="${WAIT_MS:-3000}"

SECTION="${1:-hero-banner}"

# -----------------------------------------------------------------------------
# Colors
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()     { echo -e "${GREEN}✓${NC} $1"; }
warn()   { echo -e "${YELLOW}⚠${NC} $1"; }
err()    { echo -e "${RED}✗${NC} $1"; }
hr()     { echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

# -----------------------------------------------------------------------------
# Banner
# -----------------------------------------------------------------------------
hr
echo "🎯 VISUAL VALIDATION — $PROJECT_NAME::$SECTION"
hr
log "Producción:  $PRODUCTION_URL"
log "Deploy:      $DEPLOY_URL"
log "Viewport:    ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}"
log "Tolerancia:  ${TOLERANCE_PERCENT}%"
hr

# -----------------------------------------------------------------------------
# 1. Verificar herramientas requeridas
# -----------------------------------------------------------------------------
command -v npx >/dev/null 2>&1 || { err "npx requerido (instalar Node.js)"; exit 1; }
command -v curl >/dev/null 2>&1 || { err "curl requerido"; exit 1; }

# -----------------------------------------------------------------------------
# 2. Capturar screenshot con Playwright
# -----------------------------------------------------------------------------
mkdir -p "$EVIDENCE_DIR/$SECTION"
ACTUAL_PATH="$EVIDENCE_DIR/$SECTION/actual.png"
REFERENCE_PATH="$EVIDENCE_DIR/$SECTION/reference.png"
DIFF_PATH="$EVIDENCE_DIR/$SECTION/diff.png"

capture_screenshot() {
  local url="$1"
  local out="$2"
  local label="$3"

  log "Capturando $label..."
  npx -y playwright@latest screenshot \
    --viewport-size="${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}" \
    --wait-for-timeout="$WAIT_MS" \
    "$url" "$out" 2>/dev/null \
    && ok "Guardado: $out" \
    || { err "Falló screenshot de $url"; return 1; }
}

# -----------------------------------------------------------------------------
# 3. Verificar deploy disponible
# -----------------------------------------------------------------------------
log "Verificando deploy..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [ "$HTTP_CODE" != "200" ]; then
  err "Deploy no disponible (HTTP $HTTP_CODE). ¿Railway terminó de buildear?"
  exit 1
fi
ok "Deploy live (HTTP 200)"

# -----------------------------------------------------------------------------
# 4. Capturar ambas imágenes
# -----------------------------------------------------------------------------
capture_screenshot "$DEPLOY_URL/" "$ACTUAL_PATH" "deploy actual"
capture_screenshot "$PRODUCTION_URL/" "$REFERENCE_PATH" "referencia (producción)"

# -----------------------------------------------------------------------------
# 5. Calcular diff con ImageMagick (si disponible) o reportar tamaños
# -----------------------------------------------------------------------------
hr
if command -v compare >/dev/null 2>&1; then
  log "Calculando visual-diff con ImageMagick..."
  DIFF_PIXELS=$(compare -metric AE -fuzz 5% "$REFERENCE_PATH" "$ACTUAL_PATH" "$DIFF_PATH" 2>&1 || true)
  TOTAL_PIXELS=$((VIEWPORT_WIDTH * VIEWPORT_HEIGHT))
  DIFF_PERCENT=$(awk "BEGIN { printf \"%.2f\", ($DIFF_PIXELS / $TOTAL_PIXELS) * 100 }")
  ok "Diff: ${DIFF_PERCENT}% (${DIFF_PIXELS} pixels diferentes)"

  if (( $(echo "$DIFF_PERCENT < $TOLERANCE_PERCENT" | bc -l) )); then
    ok "STATUS: PASS — bajo tolerancia"
    STATUS="PASS"
  else
    warn "STATUS: BLOCK — excede tolerancia (${TOLERANCE_PERCENT}%)"
    STATUS="BLOCK"
  fi
else
  warn "ImageMagick (compare) no instalado. Comparación pixel-by-pixel deshabilitada."
  warn "Instalar con: brew install imagemagick"
  STATUS="MANUAL"
fi

# -----------------------------------------------------------------------------
# 6. Abrir imágenes para inspección
# -----------------------------------------------------------------------------
hr
log "Imágenes generadas:"
echo "  📸 Reference: $REFERENCE_PATH"
echo "  📸 Actual:    $ACTUAL_PATH"
[ -f "$DIFF_PATH" ] && echo "  📸 Diff:      $DIFF_PATH"

if [ "${OPEN_IMAGES:-1}" = "1" ]; then
  open "$REFERENCE_PATH" "$ACTUAL_PATH" 2>/dev/null || true
  [ -f "$DIFF_PATH" ] && open "$DIFF_PATH" 2>/dev/null || true
fi

# -----------------------------------------------------------------------------
# 7. Resumen final
# -----------------------------------------------------------------------------
hr
echo "📊 RESUMEN"
hr
echo "  Sección:    $SECTION"
echo "  Status:     $STATUS"
[ -n "${DIFF_PERCENT:-}" ] && echo "  Diff %:     $DIFF_PERCENT%"
echo "  Tolerancia: ${TOLERANCE_PERCENT}%"
echo "  Commit:     $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
hr

[ "$STATUS" = "BLOCK" ] && exit 1
exit 0
