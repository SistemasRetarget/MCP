#!/usr/bin/env bash
# =============================================================================
# dev-loop.sh
# -----------------------------------------------------------------------------
# Loop completo de desarrollo: edit → push → wait Railway → validate.
#
# Uso:
#   ./scripts/dev-loop.sh "mensaje del commit" [section]
#
# Ejemplo:
#   ./scripts/dev-loop.sh "fix: ajustar header logo position" hero-banner
# =============================================================================

set -e

COMMIT_MSG="${1:?Uso: $0 \"mensaje commit\" [section]}"
SECTION="${2:-hero-banner}"
WAIT_BUILD_SECS="${WAIT_BUILD_SECS:-180}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 DEV LOOP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Verificar cambios
if [ -z "$(git status --porcelain)" ]; then
  echo "⚠️  No hay cambios para commitear. Saliendo."
  exit 1
fi

# 2. Commit + push
echo "📤 Commit + push..."
git add -A
git commit -m "$COMMIT_MSG"
git push origin main

COMMIT_SHA=$(git rev-parse --short HEAD)
echo "✓ Commit $COMMIT_SHA pusheado"

# 3. Esperar Railway build
echo "⏳ Esperando Railway build (${WAIT_BUILD_SECS}s)..."
sleep "$WAIT_BUILD_SECS"

# 4. Validar
echo "🔍 Validando..."
"$SCRIPT_DIR/visual-validate.sh" "$SECTION"
