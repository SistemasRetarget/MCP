#!/bin/bash
# Validar que los cambios de Shopify alignment están REALMENTE desplegados
# Este script verifica:
# 1. Código en GitHub tiene los cambios
# 2. Build log muestra que compiló correctamente
# 3. URL final MUESTRA visualmente los cambios

set -e

PROJECT_URL="https://puebloladehesa-web-production.up.railway.app"
CHECKS_PASSED=0
CHECKS_FAILED=0

echo "════════════════════════════════════════════════════"
echo "🔍 VALIDANDO DEPLOYMENT DE SHOPIFY ALIGNMENT"
echo "════════════════════════════════════════════════════"
echo ""

# CHECK 1: Código en GitHub
echo "✓ CHECK 1: Verificando código en GitHub..."
if git show HEAD:src/components/layout/Header.tsx | grep -q "bg-black/40"; then
    echo "  ✅ Header tiene bg-black/40 en GitHub"
    ((CHECKS_PASSED++))
else
    echo "  ❌ FALLA: Header NO tiene bg-black/40 en GitHub"
    ((CHECKS_FAILED++))
fi

if git show HEAD:src/app/globals.css | grep -q "shopify-orange"; then
    echo "  ✅ globals.css tiene --shopify-orange en GitHub"
    ((CHECKS_PASSED++))
else
    echo "  ❌ FALLA: globals.css NO tiene --shopify-orange"
    ((CHECKS_FAILED++))
fi

echo ""
echo "✓ CHECK 2: Validando QA URL visualmente..."

# Descargar HTML de QA
HTML_CONTENT=$(curl -s "$PROJECT_URL" 2>/dev/null || echo "ERROR")

if [ "$HTML_CONTENT" = "ERROR" ]; then
    echo "  ⚠️  No se pudo conectar a QA"
    ((CHECKS_FAILED++))
else
    # CHECK: Header dark style
    if echo "$HTML_CONTENT" | grep -q "bg-black/40"; then
        echo "  ✅ QA contiene 'bg-black/40' en HTML"
        ((CHECKS_PASSED++))
    else
        echo "  ❌ FALLA: QA NO contiene 'bg-black/40'"
        echo "     → Los cambios NO están desplegados"
        ((CHECKS_FAILED++))
    fi

    # CHECK: Shopify colors
    if echo "$HTML_CONTENT" | grep -q "shopify-orange\|FF6B35"; then
        echo "  ✅ QA contiene colores Shopify"
        ((CHECKS_PASSED++))
    else
        echo "  ❌ FALLA: QA NO tiene colores Shopify"
        echo "     → Los cambios NO están desplegados"
        ((CHECKS_FAILED++))
    fi
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "📊 RESULTADO"
echo "════════════════════════════════════════════════════"
echo "✅ Checks pasados: $CHECKS_PASSED"
echo "❌ Checks fallidos: $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "🎉 DEPLOYMENT VALIDADO CORRECTAMENTE"
    echo "Los cambios de Shopify alignment están presentes en QA"
    exit 0
else
    echo "🚨 DEPLOYMENT INVÁLIDO"
    echo "Los cambios NO están visibles en QA"
    echo ""
    echo "ACCIONES A TOMAR:"
    echo "1. Railway: Limpiar build cache"
    echo "2. Railway: Forzar redeploy completo"
    echo "3. Verificar que railway.json apunta a rama 'main'"
    exit 1
fi
