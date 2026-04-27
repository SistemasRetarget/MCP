---
description: Desplegar CRM Política en Railway
---

# Despliegue del CRM Política en Railway

## Problema anterior
El frontend (Dash) no arrancaba en Railway porque:
- Estaba hardcodeado a conectarse a `http://127.0.0.1:8000` (localhost)
- Debug mode estaba siempre en `True`
- No había forma de configurar la URL del backend en producción

## Solución implementada

### 1. Cambios en el código
Se han realizado los siguientes cambios para soportar Railway:

**backend/config.py:**
- Agregada variable `BACKEND_URL` que lee de `os.getenv("BACKEND_URL")`
- Fallback a `http://{BACKEND_HOST}:{BACKEND_PORT}` en local

**frontend/app.py:**
- Cambiar `debug=True` a `debug=config.DEBUG`
- Usar `BACKEND_URL` desde config en lugar de construirlo localmente

### 2. Archivos creados

- `Procfile.backend` — Para servicio backend en Railway
- `Procfile.frontend` — Para servicio frontend en Railway
- `RAILWAY_DEPLOYMENT.md` — Guía completa de despliegue
- `.env.production` — Template de variables para Railway

## Pasos para desplegar en Railway

### Opción A: Dos servicios separados (RECOMENDADO)

#### Backend
1. En Railway, crear nuevo proyecto desde GitHub
2. Seleccionar el repo del CRM
3. Configurar variables de entorno:
   ```
   ENV=cloud
   DEBUG=False
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=8000
   GOOGLE_API_KEY=tu_api_key
   META_APP_ID=tu_app_id
   META_APP_SECRET=tu_secret
   META_ACCESS_TOKEN=tu_token
   WHATSAPP_PHONE_NUMBER_ID=tu_id
   WHATSAPP_BUSINESS_ACCOUNT_ID=tu_id
   ```
4. Seleccionar `Procfile.backend` como Procfile
5. Deploy

**Nota:** Copiar la URL pública que genera Railway (ej: `https://crm-politics-backend.railway.app`)

#### Frontend
1. Crear otro proyecto en Railway desde el mismo repo
2. Configurar variables:
   ```
   ENV=cloud
   DEBUG=False
   FRONTEND_HOST=0.0.0.0
   FRONTEND_PORT=8050
   BACKEND_URL=https://crm-politics-backend.railway.app
   GOOGLE_API_KEY=tu_api_key
   ```
3. Seleccionar `Procfile.frontend` como Procfile
4. Deploy

### Opción B: Un solo servicio (alternativa)
Si prefieres todo en un solo dyno, usar el `Procfile` original que corre solo el backend.

## Verificación post-deploy

1. Acceder a la URL del frontend en Railway
2. Verificar que carga el dashboard
3. Probar búsqueda de personas (debe conectar al backend)
4. Revisar logs en Railway si hay errores

## Troubleshooting

**Frontend no se conecta al backend:**
- Verificar que `BACKEND_URL` apunta a la URL correcta
- Revisar logs: `railway logs`
- Confirmar CORS está habilitado en backend (está en main.py)

**Dash no arranca:**
- Verificar que `DEBUG=False` en variables
- Revisar que puerto está disponible

**Base de datos no persiste:**
- Cambiar `ENV=cloud` 
- Usar PostgreSQL: `DATABASE_URL=postgresql://...`

## Próximos pasos

1. Pushear cambios a GitHub
2. Crear proyectos en Railway
3. Configurar variables de entorno
4. Hacer deploy
5. Verificar que todo funciona
