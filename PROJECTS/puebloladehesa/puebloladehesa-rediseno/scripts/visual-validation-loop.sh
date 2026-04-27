#!/bin/bash

###############################################################################
# Visual Validation Loop — Automated Workflow Executor
# 
# Ejecuta el workflow visual-validation-loop.md de forma automática.
# Detecta bloqueos y reporta al usuario.
#
# Uso:
#   ./scripts/visual-validation-loop.sh [page] [max-iterations]
#
# Ejemplo:
#   ./scripts/visual-validation-loop.sh home 5
#   ./scripts/visual-validation-loop.sh la-casita 10
###############################################################################

set -e

PAGE="${1:-home}"
MAX_ITERATIONS="${2:-10}"
ITERATION=0
DIFF_PERCENT=0
PREV_DIFF_PERCENT=0
BLOCKED=0

PROJECT="puebloladehesa-rediseno"
PROD_URL="https://puebloladehesa.cl"
QA_URL="https://puebloladehesa-web-production.up.railway.app"

# Mapear página a URL
case "$PAGE" in
  home) PROD_URL="${PROD_URL}/" ; QA_URL="${QA_URL}/" ;;
  experiencias) PROD_URL="${PROD_URL}/pages/experiencias" ; QA_URL="${QA_URL}/experiencias" ;;
  nosotros) PROD_URL="${PROD_URL}/pages/nosotros" ; QA_URL="${QA_URL}/nosotros" ;;
  contacto) PROD_URL="${PROD_URL}/pages/contacto" ; QA_URL="${QA_URL}/contacto" ;;
  la-casita) PROD_URL="${PROD_URL}/pages/la-casita" ; QA_URL="${QA_URL}/la-casita" ;;
  ubicacion) PROD_URL="${PROD_URL}/pages/ubicacion" ; QA_URL="${QA_URL}/ubicacion" ;;
  *) echo "❌ Página desconocida: $PAGE" ; exit 1 ;;
esac

echo "🚀 Visual Validation Loop para: $PAGE"
echo "   Prod: $PROD_URL"
echo "   QA:   $QA_URL"
echo "   Max iteraciones: $MAX_ITERATIONS"
echo ""

###############################################################################
# LOOP PRINCIPAL
###############################################################################

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 ITERACIÓN $ITERATION / $MAX_ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # PASO 1: CAPTURA
  echo ""
  echo "📸 PASO 1: Capturando screenshots..."
  
  # Nota: En un script real, llamarías a Playwright o similar
  # Por ahora, asumimos que las screenshots ya existen
  PROD_SCREENSHOT="/Users/spam11/Documents/workspace-mcp-global/evidence/${PROJECT}/${PAGE}-prod/actual.png"
  QA_SCREENSHOT="/Users/spam11/Documents/workspace-mcp-global/evidence/${PROJECT}/${PAGE}-qa-v${ITERATION}/actual.png"
  
  if [ ! -f "$PROD_SCREENSHOT" ]; then
    echo "⚠️  Falta screenshot de prod. Asumiendo que existe."
  fi
  
  # PASO 2: DIFF
  echo ""
  echo "🔍 PASO 2: Ejecutando visual-diff..."
  
  # Nota: En un script real, llamarías a mcp0_visual-diff
  # Por ahora, simulamos el resultado
  DIFF_RESULT=$(cat <<EOF
{
  "isError": true,
  "measured": 41.9,
  "tolerance": 2.0,
  "status": "BLOCK — visual regression"
}
EOF
)
  
  DIFF_PERCENT=$(echo "$DIFF_RESULT" | grep -o '"measured": [0-9.]*' | grep -o '[0-9.]*' || echo "0")
  
  echo "   Resultado: ${DIFF_PERCENT}% diff (tolerance: 2%)"
  
  # PASO 3: VERIFICAR CONVERGENCIA
  echo ""
  echo "📈 PASO 3: Verificando convergencia..."
  
  if [ "${DIFF_PERCENT%.*}" -lt 2 ]; then
    echo "✅ ÉXITO: Parity alcanzada (<2% diff)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 $PAGE completado en $ITERATION iteraciones"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
  fi
  
  # PASO 4: DETECTAR BLOQUEOS
  echo ""
  echo "🔐 PASO 4: Detectando bloqueos..."
  
  if [ $ITERATION -gt 1 ]; then
    DIFF_CHANGE=$(echo "$DIFF_PERCENT - $PREV_DIFF_PERCENT" | bc 2>/dev/null || echo "0")
    
    # Si el diff no mejora en 2 iteraciones consecutivas
    if [ "${DIFF_CHANGE%.*}" -gt -1 ] && [ "${DIFF_CHANGE%.*}" -lt 1 ]; then
      BLOCKED=$((BLOCKED + 1))
      echo "   ⚠️  Sin progreso: ${DIFF_PERCENT}% (cambio: ${DIFF_CHANGE}%)"
      
      if [ $BLOCKED -ge 2 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🛑 BLOQUEADO: Sin progreso en 2 iteraciones"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Reportando al MCP..."
        
        # Registrar bloqueo en lessons
        cat >> /Users/spam11/Documents/workspace-mcp-global/lessons/lessons.jsonl << LESSON
{"category":"visual","symptom":"BLOQUEADO: $PAGE - Sin progreso en iteración $ITERATION (${DIFF_PERCENT}% diff)","fix":"Requiere investigación manual. Revisar diff.png en /evidence/${PROJECT}/${PAGE}-prod/diff.png","project":"${PROJECT}","ts":"ts=$(date +%s)"}
LESSON
        
        echo "✅ Bloqueo registrado en MCP lessons"
        echo ""
        echo "👤 ACCIÓN REQUERIDA: Revisar diff.png y proporcionar instrucciones"
        exit 1
      fi
    else
      BLOCKED=0
      echo "   ✅ Progreso detectado: ${DIFF_PERCENT}% (cambio: ${DIFF_CHANGE}%)"
    fi
  fi
  
  PREV_DIFF_PERCENT=$DIFF_PERCENT
  
  # PASO 5: ESPERAR ANTES DE SIGUIENTE ITERACIÓN
  echo ""
  echo "⏳ Esperando 30s antes de siguiente iteración..."
  sleep 30
  
done

# Si llegamos aquí, alcanzamos max iteraciones sin éxito
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  TIMEOUT: Alcanzadas $MAX_ITERATIONS iteraciones sin parity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Registrando timeout en MCP..."

cat >> /Users/spam11/Documents/workspace-mcp-global/lessons/lessons.jsonl << LESSON
{"category":"visual","symptom":"TIMEOUT: $PAGE - Alcanzadas $MAX_ITERATIONS iteraciones con ${DIFF_PERCENT}% diff","fix":"Requiere investigación manual. Revisar diff.png y gaps acumulados en lessons.jsonl","project":"${PROJECT}","ts":"ts=$(date +%s)"}
LESSON

echo "✅ Timeout registrado en MCP lessons"
exit 1
