# Reglas operativas del MCP — Anti "pegado"

## Problema observado (2026-04-29)
- Cascade ejecutó `gcloud scheduler jobs list` con la auth expirada.
- gcloud se quedó esperando input interactivo en stdin.
- El comando bloqueó el terminal sin error visible.
- El usuario no tenía forma de saber si seguía vivo o pegado.

## Reglas para Cascade

### 1. Comandos blocking siempre deben tener timeout
- Usar `timeout 30 <cmd>` o equivalente para cualquier comando que pueda colgarse
- NUNCA invocar gcloud/aws/auth-tools sin verificar primero con `gcloud auth list --quiet 2>/dev/null`
- Si un comando puede pedir input interactivo, redirigir stdin: `< /dev/null`

### 2. Comandos largos (>10s) deben ir async
- Usar `Blocking:false` con `WaitMsBeforeAsync:5000`
- Reportar el `CommandId` al usuario
- Hacer polling con `command_status` cada 10-15s

### 3. Heartbeat visible
- Antes de un bloque de acciones largas, anunciar "voy a hacer X (estimado Yseg)"
- Después de cada paso, marcar ✅ o ❌ explícito

### 4. Comandos de gcloud sospechosos
Sustituir por endpoints HTTP si es posible:
- `gcloud builds list` → usar `https://console.cloud.google.com/cloud-build/builds` (manual)
- `gcloud run services` → usar `curl /status` del servicio
- `gcloud scheduler` → revisar manualmente en consola

### 5. Cuando dudas, preguntar
- Si un comando lleva >30s sin output, asumir que está pegado
- Pedir al usuario que mate el terminal y reintentar con un approach diferente

## Para el MCP — heartbeat propio

El MCP debe exponer:
- `GET /health` (ya existe) — estado del MCP
- `GET /heartbeat` (TODO) — devuelve `{ alive: true, ts: <now> }` ultraligero
- Dashboard `/projects` con auto-refresh visible cada 30s

Si Cascade hace un cambio y no puede confirmarlo localmente, debe:
1. Hacer push
2. Hacer polling cada 15s al endpoint `/heartbeat` esperando que el `started_at` cambie (significa que el deploy pasó)
3. Reportar al usuario cuando confirma o cuando lleva >5min esperando
