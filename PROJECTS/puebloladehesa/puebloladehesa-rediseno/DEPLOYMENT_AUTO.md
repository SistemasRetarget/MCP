# 🤖 Sistema Automático de Deployment para Pueblo La Dehesa

## Objetivo
Que **cada push a `main`** automáticamente:
1. ✅ Trigger build en Railway
2. ✅ Valide que los cambios estén presentes
3. ✅ Alerta si algo falla

## Sistema en 3 Capas

```
┌─────────────────────────────────────┐
│ CAPA 1: Webhook de GitHub           │
│ (Recomendado: automático)           │
└──────────────────┬──────────────────┘
                   │
            (Si no funciona ↓)
┌──────────────────▼──────────────────┐
│ CAPA 2: GitHub Actions Workflow      │
│ (Fallback: CI/CD automático)        │
└──────────────────┬──────────────────┘
                   │
            (Si no funciona ↓)
┌──────────────────▼──────────────────┐
│ CAPA 3: Script Manual                │
│ ./scripts/auto-validate-and-redeploy │
│ (Fallback: manual si todo falla)     │
└─────────────────────────────────────┘
```

---

## 🔧 CAPA 1: Configurar Webhook de GitHub (RECOMENDADO)

**Pasos:**

1. **Ir a GitHub:**
   ```
   https://github.com/SistemasRetarget/puebloladehesa-web
   Settings → Webhooks → Add webhook
   ```

2. **Llenar formulario:**
   - **Payload URL:** `https://api.railway.app/webhooks/github`
   - **Content type:** `application/json`
   - **Events:** Selecciona "Push events"
   - **Active:** ✅ Activado

3. **Guardar**

Listo. Ahora cada push → automáticamente trigger en Railway.

---

## 🔄 CAPA 2: GitHub Actions (Fallback automático)

Ya está configurado en `.github/workflows/auto-deploy.yml`

**Necesitas crear un secret en GitHub:**

1. **En GitHub → Settings → Secrets and variables → Actions**
2. **New repository secret:**
   - Name: `RAILWAY_TOKEN`
   - Value: (obtén tu token de Railway dashboard)

Después de esto, cada push ejecutará el workflow que:
- ✅ Valida que el código está en GitHub
- ✅ Notifica a Railway para rebuildar
- ✅ Espera 5 minutos

---

## 🛠️ CAPA 3: Script Manual (Fallback si todo falla)

Ejecuta después de hacer push:

```bash
chmod +x scripts/auto-validate-and-redeploy.sh
./scripts/auto-validate-and-redeploy.sh
```

**Qué hace:**
1. Verifica que commit está en GitHub
2. Ejecuta validador de 3 niveles
3. Espera hasta 5 minutos a que Railway compile
4. Si los cambios aparecen en QA → ✅ Éxito
5. Si no → ❌ Alerta con instrucciones

---

## 📊 Qué Valida Automáticamente

Todos los niveles validan:

```bash
✅ "bg-black/40"      → Header dark on scroll
✅ "shopify-orange"   → Variable CSS
✅ "FF6B35"           → Color naranja
✅ "00A86B"           → Color verde
```

En:
- Archivos fuente locales
- GitHub main
- URL de QA (cuándo está live)

---

## 🚀 Flujo de Uso

### Opción A: Sin hacer nada (si Webhook funciona)
```bash
git push origin main
# ← Automáticamente Railway buildea
# ← Ya está
```

### Opción B: Validar manualmente (si quieres estar seguro)
```bash
git push origin main
./scripts/auto-validate-and-redeploy.sh
# ← Te dice si funciona o no
```

### Opción C: Solo validar sin esperar
```bash
./scripts/validate-sync.sh
# ← Rápido check de 3 niveles (no espera)
```

---

## ⚠️ Si Algo Falla

### "Railway está desincronizado"
```bash
# Ve a Railway dashboard:
# 1. Settings → Clear Build Cache
# 2. Deployments → Manual Redeploy
# 3. Vuelve a ejecutar:
./scripts/auto-validate-and-redeploy.sh
```

### "GitHub no está actualizado"
```bash
# Asegúrate de pushear:
git push origin main
# Luego valida:
./scripts/validate-sync.sh
```

### "QA URL no responde"
```bash
# Espera a que Railway compile (2-3 min)
# O revisa los logs de Railway
```

---

## 📋 Checklist para Futuros Cambios

Cada vez que hagas cambios importantes:

- [ ] ¿Código está en local?
- [ ] ¿Pusheaste a GitHub?
- [ ] ¿Railway está buildiendo? (revisar dashboard)
- [ ] ¿Ejecutaste validador?
  ```bash
  ./scripts/validate-sync.sh
  ```
- [ ] ¿QA muestra los cambios?

Si algo falla → Script te dice exactamente qué hacer.

---

## 🎯 Resumen

**Antes (Manual):**
1. Haces cambios
2. Pusheas a GitHub
3. Esperas y rezas que Railway detecte
4. Tomas screenshot para verificar
5. Si falló → Investigas qué pasó (5+ horas)

**Ahora (Automático):**
1. Haces cambios
2. Pusheas a GitHub (webhook automático)
3. ✅ Railway builds automáticamente
4. ✅ Validador verifica que funciona
5. ❌ Si falla → Script te dice exactamente por qué

