# Setup de Secrets en Google Cloud

El MCP está desplegado en Google Cloud Run pero necesita 2 secrets para funcionar completamente.

## Estado Actual

✅ **Servicios activos:**
- `cmsretargetv1` (MCP) — https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app
- `puyehue-web` (Next.js) — https://puyehue-web-rf3w6ybqeq-ew.a.run.app

✅ **Endpoints funcionando:**
- `GET /` — Health check
- `GET /status` — Info del servidor
- `GET /identity` — Identidad del asistente
- `POST /auth/check` — Validar email @retarget.cl
- `GET /team` — Listar equipo
- `POST /notify` — Redactar mensajes a colaboradores

⏳ **Pendiente (requiere secrets):**
- `POST /chat` — Tool-use loop con Claude (requiere `ANTHROPIC_API_KEY`)
- `GET /chat/tools` — Listar herramientas disponibles

---

## 1. Crear Secret: ANTHROPIC_API_KEY

**Paso 1: Obtener tu API key de Anthropic**
1. Ve a https://console.anthropic.com/account/keys
2. Crea una nueva API key
3. Cópiala (no la compartas en chat, solo en terminal local)

**Paso 2: Crear el secret en Google Cloud**

```bash
# Reemplaza TU_API_KEY con tu clave real
echo -n "TU_API_KEY" | gcloud secrets create ANTHROPIC_API_KEY \
  --data-file=- \
  --project=retarget-mcp \
  --replication-policy="automatic"
```

**Paso 3: Dar permisos al servicio de Cloud Run**

```bash
gcloud secrets add-iam-policy-binding ANTHROPIC_API_KEY \
  --member="serviceAccount:201530409487-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=retarget-mcp
```

**Paso 4: Redeploy del MCP**

```bash
gcloud builds submit --config=cloudbuild.yaml /Users/spam11/github/MCP
```

El build tomará ~5 minutos. Puedes monitorear en:
https://console.cloud.google.com/cloud-build/builds?project=retarget-mcp

---

## 2. (Opcional) Crear Secret: PAGESPEED_API_KEY

Mejora la herramienta `validate_website` para auditar Core Web Vitals.

**Paso 1: Obtener API key de Google PageSpeed Insights**
1. Ve a https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com
2. Habilita la API
3. Ve a https://console.cloud.google.com/apis/credentials
4. Crea una "API key"

**Paso 2: Crear el secret**

```bash
echo -n "TU_PAGESPEED_API_KEY" | gcloud secrets create PAGESPEED_API_KEY \
  --data-file=- \
  --project=retarget-mcp \
  --replication-policy="automatic"
```

**Paso 3: Dar permisos**

```bash
gcloud secrets add-iam-policy-binding PAGESPEED_API_KEY \
  --member="serviceAccount:201530409487-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=retarget-mcp
```

**Paso 4: Actualizar cloudbuild.yaml**

Agrega `--update-secrets=PAGESPEED_API_KEY=PAGESPEED_API_KEY:latest` en el deploy step.

---

## Verificar que los Secrets Existen

```bash
gcloud secrets list --project=retarget-mcp
```

Deberías ver:
```
NAME                    CREATED              REPLICATION
ANTHROPIC_API_KEY       2026-04-29T...       automatic
PAGESPEED_API_KEY       2026-04-29T...       automatic (opcional)
```

---

## Test del /chat Endpoint (después de crear el secret)

```bash
curl -X POST https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "luis@retarget.cl",
    "name": "Luis",
    "message": "¿Quién eres?"
  }'
```

Esperado: Claude responde presentándose como "Asistente Retarget — Sistemas - Retarget ❤️"

---

## Troubleshooting

**Error: "ANTHROPIC_API_KEY no configurada"**
→ El secret no existe o no tiene permisos. Verifica pasos 1-3.

**Error: "403 Forbidden en /chat"**
→ El email no termina en @retarget.cl. Usa un correo válido.

**Error: "Tool desconocida"**
→ Claude intentó usar una herramienta que no existe. Verifica `chat.mjs` en el repo.

---

## Próximos Pasos

1. ✅ Crea el secret `ANTHROPIC_API_KEY`
2. ✅ Redeploy: `gcloud builds submit --config=cloudbuild.yaml /Users/spam11/github/MCP`
3. ✅ Test: `curl -X POST https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/chat ...`
4. ✅ (Opcional) Crea `PAGESPEED_API_KEY` para auditorías completas

---

**Desarrollado por Sistemas - Retarget ❤️**
