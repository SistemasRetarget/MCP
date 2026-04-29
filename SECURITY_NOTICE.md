# ⚠️ Aviso de Seguridad — API Key Comprometida

**Fecha:** 29 Abril 2026, 04:35 UTC  
**Severidad:** CRÍTICA  
**Acción Requerida:** INMEDIATA

---

## 🚨 Lo que Pasó

Tu API key de Anthropic fue compartida en el chat (no se muestra aquí por seguridad).

**Riesgo:** Alguien podría usar esta key para:
- Hacer llamadas a Claude (consumir tu cuota)
- Incurrir en costos no autorizados
- Acceder a tus datos si la key está vinculada a un proyecto

---

## ✅ Lo que Hicimos

1. ✅ Creamos el secret `ANTHROPIC_API_KEY` en Google Cloud Secret Manager
2. ✅ Dimos permisos al servicio de Cloud Run
3. ✅ Iniciamos redeploy del MCP (en progreso)

---

## 🔐 Lo que DEBES Hacer AHORA

### Paso 1: Revocar la API Key (URGENTE)
1. Ve a https://console.anthropic.com/account/keys
2. Busca la key que compartiste
3. Click en "Delete" o "Revoke"
4. Confirma

**Tiempo:** 1 minuto

### Paso 2: Crear Nueva API Key
1. Ve a https://console.anthropic.com/account/keys
2. Click "Create Key"
3. Copia la nueva key
4. Guárdala en lugar seguro (1Password, LastPass, etc.)

**Tiempo:** 1 minuto

### Paso 3: Actualizar Secret en Google Cloud
```bash
# Reemplaza NEW_API_KEY con tu nueva key
echo -n "sk-ant-..." | gcloud secrets versions add ANTHROPIC_API_KEY \
  --data-file=- \
  --project=retarget-mcp
```

**Tiempo:** 1 minuto

### Paso 4: Redeploy del MCP
```bash
gcloud builds submit --config=cloudbuild.yaml /Users/spam11/github/MCP
```

**Tiempo:** 5-7 minutos

---

## 📋 Checklist de Seguridad

- [ ] Revocar API key antigua en https://console.anthropic.com/account/keys
- [ ] Crear nueva API key
- [ ] Actualizar secret en Google Cloud
- [ ] Redeploy del MCP
- [ ] Verificar que `/chat` funciona
- [ ] Documentar en notas internas

---

## 🛡️ Mejores Prácticas Futuras

1. **NUNCA compartas API keys en chat, email o Slack**
2. **Usa Secret Manager** para almacenar credenciales
3. **Rota keys regularmente** (cada 3-6 meses)
4. **Monitorea uso** en Anthropic Console
5. **Usa keys con scopes limitados** si es posible

---

## 📞 Soporte

Si tienes dudas:
- **Anthropic Docs:** https://docs.anthropic.com
- **Google Cloud Secrets:** https://cloud.google.com/secret-manager/docs
- **MCP Setup:** Ver `SETUP_SECRETS.md`

---

**Desarrollado por Sistemas - Retarget ❤️**  
**Acción requerida:** INMEDIATA
