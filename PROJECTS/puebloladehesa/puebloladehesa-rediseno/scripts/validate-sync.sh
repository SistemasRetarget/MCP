#!/bin/bash
# VALIDADOR DE SINCRONIZACIÓN - 3 NIVELES
# Detecta desincronización entre: Local → GitHub → Railway
# SI ALGO NO COINCIDE → ALERTA y FRENA TODO

set -e

PROJECT_URL="https://puebloladehesa-web-production.up.railway.app"
# Phase 1 Google Compliance markers: SEO, metadata, and security improvements
REQUIRED_STRINGS=("LocalBusiness" "Accommodation" "Content-Security-Policy" "export const metadata")

echo "════════════════════════════════════════════════════"
echo "🔍 VALIDADOR DE SINCRONIZACIÓN 3-NIVELES"
echo "════════════════════════════════════════════════════"
echo ""

SYNC_OK=true

# NIVEL 1: REPOSITORIO LOCAL
echo "📍 NIVEL 1: Repositorio LOCAL"
echo "─────────────────────────────────"

MISSING_LOCAL=()
for str in "${REQUIRED_STRINGS[@]}"; do
    if ! grep -r "$str" src/lib/schema.ts middleware.ts src/app/sitemap.ts src/app/\(frontend\)/\(es\)/page.tsx 2>/dev/null | grep -q "$str"; then
        MISSING_LOCAL+=("$str")
        SYNC_OK=false
    fi
done

if [ ${#MISSING_LOCAL[@]} -eq 0 ]; then
    echo "✅ Local: Todos los cambios presentes"
else
    echo "❌ Local INCOMPLETO - Falta: ${MISSING_LOCAL[*]}"
fi

echo ""

# NIVEL 2: GITHUB MAIN
echo "📍 NIVEL 2: GitHub MAIN"
echo "─────────────────────────────────"

MISSING_GITHUB=()
for str in "${REQUIRED_STRINGS[@]}"; do
    if ! git show HEAD:src/lib/schema.ts HEAD:middleware.ts HEAD:src/app/sitemap.ts HEAD:src/app/\(frontend\)/\(es\)/page.tsx 2>/dev/null | grep -q "$str"; then
        MISSING_GITHUB+=("$str")
        SYNC_OK=false
    fi
done

if [ ${#MISSING_GITHUB[@]} -eq 0 ]; then
    echo "✅ GitHub: Todos los cambios presentes en main"
else
    echo "❌ GitHub INCOMPLETO - Falta: ${MISSING_GITHUB[*]}"
    echo "   → NECESITA: git push origin main"
fi

echo ""

# NIVEL 3: RAILWAY (QA URL)
echo "📍 NIVEL 3: Railway (QA URL)"
echo "─────────────────────────────────"

QA_HTML=$(curl -s "$PROJECT_URL" 2>/dev/null || echo "")

if [ -z "$QA_HTML" ]; then
    echo "❌ No se puede conectar a QA"
    SYNC_OK=false
else
    MISSING_RAILWAY=()
    for str in "${REQUIRED_STRINGS[@]}"; do
        if ! echo "$QA_HTML" | grep -q "$str"; then
            MISSING_RAILWAY+=("$str")
        fi
    done

    if [ ${#MISSING_RAILWAY[@]} -eq 0 ]; then
        echo "✅ Railway: Todos los cambios VISIBLES en QA"
    else
        echo "❌ Railway DESINCRONIZADO - Falta: ${MISSING_RAILWAY[*]}"
        echo "   → Railway está usando código VIEJO"
        echo "   → ACCIÓN: Limpiar build cache en Railway"
        SYNC_OK=false
    fi
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "📊 RESULTADO FINAL"
echo "════════════════════════════════════════════════════"

if [ "$SYNC_OK" = true ]; then
    echo "✅ SINCRONIZACIÓN PERFECTA"
    echo "Los cambios están en: Local ✅ → GitHub ✅ → Railway ✅"
    exit 0
else
    echo "🚨 DESINCRONIZACIÓN DETECTADA"
    echo ""
    echo "DIAGRAMA ACTUAL:"
    echo "Local    : $([ ${#MISSING_LOCAL[@]} -eq 0 ] && echo '✅' || echo '❌')"
    echo "GitHub   : $([ ${#MISSING_GITHUB[@]} -eq 0 ] && echo '✅' || echo '❌')"
    echo "Railway  : $([ ${#MISSING_RAILWAY[@]} -eq 0 ] && echo '✅' || echo '❌')"
    echo ""
    echo "⚠️  FRENA EL DEPLOYMENT HASTA SINCRONIZAR"
    exit 1
fi
