#!/usr/bin/env bash
# =============================================================================
# auto-iterate.sh
# -----------------------------------------------------------------------------
# Loop automatizado con contador máximo de iteraciones.
# Tras cada push, espera Railway, valida con MCP, y reporta status.
# Si tras MAX_ITERATIONS sigue BLOCK, escala al usuario.
#
# Uso:
#   ./scripts/auto-iterate.sh [section] [max_iterations]
#
# Ejemplo:
#   ./scripts/auto-iterate.sh hero-banner 4
#   ./scripts/auto-iterate.sh full-page 4
# =============================================================================

set -e

SECTION="${1:-hero-banner}"
MAX_ITERATIONS="${2:-4}"
WAIT_BUILD_SECS="${WAIT_BUILD_SECS:-180}"
TOLERANCE="${TOLERANCE:-5}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$HOME/Documents/workspace-mcp-global/evidence/puebloladehesa-rediseno/.iteration-counter-$SECTION"

# Inicializar contador si no existe
if [ ! -f "$STATE_FILE" ]; then
  echo "0" > "$STATE_FILE"
fi

ITER=$(cat "$STATE_FILE")
ITER=$((ITER + 1))
echo "$ITER" > "$STATE_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 ITERACIÓN $ITER / $MAX_ITERATIONS — $SECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ITER" -gt "$MAX_ITERATIONS" ]; then
  echo "🛑 LÍMITE EXCEDIDO ($MAX_ITERATIONS iteraciones)."
  echo "🆘 Escalar al usuario para revisión manual."
  echo "💡 Reset contador: rm $STATE_FILE"
  exit 2
fi

# Ejecutar validación
TOLERANCE="$TOLERANCE" "$SCRIPT_DIR/visual-validate.sh" "$SECTION" || {
  STATUS=$?
  echo ""
  echo "📊 Iteración $ITER terminada con BLOCK."
  if [ "$ITER" -eq "$MAX_ITERATIONS" ]; then
    echo "⚠️  Última iteración permitida. Próxima ejecución requerirá reset."
  fi
  exit $STATUS
}

# PASS — resetear contador
echo "✅ PASS — Resetando contador."
rm -f "$STATE_FILE"
exit 0
