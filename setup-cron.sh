#!/bin/bash
# setup-cron.sh — Cloud Scheduler para mantener vivo el MCP y monitorearlo.
#
# QUE HACE:
#   1. Crea (o actualiza) un Cloud Scheduler job que pega a /heartbeat
#      del MCP cada 5 minutos. Esto:
#        - Mantiene la instancia caliente (evita cold-starts en Cloud Run)
#        - Detecta tempranamente si el MCP esta caido
#   2. Crea un segundo job que cada 15 min consulta /health y manda alerta
#      si overall != "healthy" (TODO: enganchar a notificacion de Slack/email).
#
# REQUISITOS:
#   - gcloud CLI instalada y autenticada (gcloud auth login)
#   - APIs habilitadas: cloudscheduler.googleapis.com
#
# USO:
#   bash setup-cron.sh                 # crea/actualiza los jobs
#   bash setup-cron.sh --remove        # los borra
#   bash setup-cron.sh --status        # muestra estado actual

set -euo pipefail

PROJECT="retarget-mcp"
REGION="europe-west1"
MCP_URL="https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app"
HEARTBEAT_JOB="mcp-heartbeat"
HEALTH_JOB="mcp-health-check"

case "${1:-create}" in
  --remove)
    echo "🗑  Borrando jobs..."
    gcloud scheduler jobs delete "$HEARTBEAT_JOB" --location="$REGION" --project="$PROJECT" --quiet 2>/dev/null || true
    gcloud scheduler jobs delete "$HEALTH_JOB" --location="$REGION" --project="$PROJECT" --quiet 2>/dev/null || true
    echo "✅ Listo."
    exit 0
    ;;
  --status)
    echo "📋 Estado de jobs:"
    gcloud scheduler jobs list --location="$REGION" --project="$PROJECT" --filter="name~mcp-" --format="table(name.basename(),schedule,state,lastAttemptTime)"
    echo ""
    echo "📡 Probando MCP en vivo..."
    curl -s --max-time 5 "$MCP_URL/heartbeat" | head -c 300
    echo ""
    exit 0
    ;;
esac

echo "🔧 Configurando Cloud Scheduler para el MCP..."
echo "   Project: $PROJECT"
echo "   Region:  $REGION"
echo "   Target:  $MCP_URL"
echo ""

# 1. Habilitar APIs si hace falta
echo "[1/3] Habilitando APIs..."
gcloud services enable cloudscheduler.googleapis.com --project="$PROJECT" --quiet

# 2. Job principal: heartbeat cada 5 min
echo "[2/3] Creando job heartbeat (cada 5 min)..."
if gcloud scheduler jobs describe "$HEARTBEAT_JOB" --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$HEARTBEAT_JOB" \
    --location="$REGION" \
    --project="$PROJECT" \
    --schedule="*/5 * * * *" \
    --uri="$MCP_URL/heartbeat" \
    --http-method=GET \
    --attempt-deadline=30s \
    --time-zone="America/Santiago" \
    --description="Mantiene vivo el MCP + detecta cold-starts" \
    --quiet
else
  gcloud scheduler jobs create http "$HEARTBEAT_JOB" \
    --location="$REGION" \
    --project="$PROJECT" \
    --schedule="*/5 * * * *" \
    --uri="$MCP_URL/heartbeat" \
    --http-method=GET \
    --attempt-deadline=30s \
    --time-zone="America/Santiago" \
    --description="Mantiene vivo el MCP + detecta cold-starts"
fi

# 3. Job secundario: health-check cada 15 min (consume <1 token solo si force=1)
echo "[3/3] Creando job health (cada 15 min, sin gastar creditos)..."
if gcloud scheduler jobs describe "$HEALTH_JOB" --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$HEALTH_JOB" \
    --location="$REGION" \
    --project="$PROJECT" \
    --schedule="*/15 * * * *" \
    --uri="$MCP_URL/health" \
    --http-method=GET \
    --attempt-deadline=30s \
    --time-zone="America/Santiago" \
    --description="Lee /health (cache, NO consume creditos)" \
    --quiet
else
  gcloud scheduler jobs create http "$HEALTH_JOB" \
    --location="$REGION" \
    --project="$PROJECT" \
    --schedule="*/15 * * * *" \
    --uri="$MCP_URL/health" \
    --http-method=GET \
    --attempt-deadline=30s \
    --time-zone="America/Santiago" \
    --description="Lee /health (cache, NO consume creditos)"
fi

echo ""
echo "✅ Cron configurado."
echo ""
echo "📋 Resumen:"
echo "   - $HEARTBEAT_JOB cada 5 min  → $MCP_URL/heartbeat"
echo "   - $HEALTH_JOB    cada 15 min → $MCP_URL/health"
echo ""
echo "🔍 Verificar:    bash setup-cron.sh --status"
echo "🗑  Quitar:       bash setup-cron.sh --remove"
echo "📊 Ver historial: https://console.cloud.google.com/cloudscheduler?project=$PROJECT"
