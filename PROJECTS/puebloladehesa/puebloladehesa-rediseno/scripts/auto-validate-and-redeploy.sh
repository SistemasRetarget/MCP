#!/bin/bash
# AUTO VALIDATE & REDEPLOY
# Monitorea GitHub, valida cambios, y verifica que Railway se actualice
# Este script debe ejecutarse después de cada push importante

set -e

echo "════════════════════════════════════════════════════"
echo "🤖 AUTO VALIDATE & REDEPLOY"
echo "════════════════════════════════════════════════════"
echo ""

# Configuración
GITHUB_REPO="SistemasRetarget/puebloladehesa-web"
RAILWAY_URL="https://puebloladehesa-web-production.up.railway.app"
MAX_WAIT_MINUTES=5
CHECK_INTERVAL=10

echo "📡 Repositorio: $GITHUB_REPO"
echo "🚀 Railway URL: $RAILWAY_URL"
echo "⏱️  Timeout: ${MAX_WAIT_MINUTES} minutos"
echo ""

# PASO 1: Verificar que código está en GitHub
echo "PASO 1️⃣ : Verificar que código llegó a GitHub..."
git fetch origin main
LATEST_COMMIT=$(git rev-parse HEAD)
GITHUB_COMMIT=$(git rev-parse origin/main)

if [ "$LATEST_COMMIT" = "$GITHUB_COMMIT" ]; then
    echo "✅ GitHub está actualizado con commit: $LATEST_COMMIT"
else
    echo "❌ GitHub NO está actualizado"
    echo "   Local: $LATEST_COMMIT"
    echo "   GitHub: $GITHUB_COMMIT"
    echo "   → Ejecuta: git push origin main"
    exit 1
fi

echo ""

# PASO 2: Validar que codigo tiene cambios
echo "PASO 2️⃣ : Validar cambios en código..."
./scripts/validate-sync.sh && VALIDATION_OK=true || VALIDATION_OK=false

if [ "$VALIDATION_OK" = "true" ]; then
    echo "✅ Cambios están en Local → GitHub → Railway"
    exit 0
fi

echo ""
echo "⚠️  Railway está desincronizado. Esperando redeploy..."
echo ""

# PASO 3: Monitorear Railway
echo "PASO 3️⃣ : Esperando a que Railway compile..."
echo "(máximo ${MAX_WAIT_MINUTES} minutos)"
echo ""

ELAPSED=0
while [ $ELAPSED -lt $((MAX_WAIT_MINUTES * 60)) ]; do
    # Tomar screenshot de QA
    HTML_CONTENT=$(curl -s "$RAILWAY_URL" 2>/dev/null || echo "")

    if echo "$HTML_CONTENT" | grep -q "bg-black/40"; then
        echo "✅ CAMBIOS DETECTADOS EN QA!"
        echo ""
        echo "════════════════════════════════════════════════════"
        echo "🎉 DEPLOYMENT EXITOSO"
        echo "════════════════════════════════════════════════════"
        exit 0
    fi

    echo -n "."
    sleep $CHECK_INTERVAL
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
done

echo ""
echo "❌ TIMEOUT: Railway no se actualizó en ${MAX_WAIT_MINUTES} minutos"
echo ""
echo "ACCIONES:"
echo "1. Ve a Railway dashboard"
echo "2. Verifica que el build está en progreso"
echo "3. Si no está buildiendo:"
echo "   - Limpia build cache"
echo "   - Fuerza un redeploy manual"
echo "4. Vuelve a ejecutar este script"
exit 1
