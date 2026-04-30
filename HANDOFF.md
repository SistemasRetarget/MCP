# Handoff - Continuar mañana

## Fecha
30 de abril de 2026

## Resumen de cambios realizados

### 1. Subida de archivos en solicitudes
- **Archivo:** `solicitudes.html`
- **Cambio:** Agregado campo `<input type="file">` para adjuntar archivos
- **Archivo:** `http-wrapper.mjs`
- **Cambio:** Endpoint POST /api/requests ahora parsea `multipart/form-data` y guarda archivos en `/uploads`
- **Archivo:** `http-wrapper.mjs`
- **Cambio:** Agregado endpoint GET /uploads/* para servir archivos estáticos

### 2. Landings del proyecto puebloladehesa-web
- **Archivo:** `mcp-projects/puebloladehesa-web-config.json`
- **Cambio:** Agregadas 7 landings con configuración completa (home, promociones, reservas, servicios, contacto, nosotros, blog)
- **Cada landing incluye:** ID, nombre, descripción, status, progreso, URLs (prod/qa/reference), header/footer status, screenshots (vacíos por ahora)

### 3. Fases del workflow
- **Archivo:** `mcp-projects/puebloladehesa-web-config.json`
- **Cambio:** Agregadas 10 fases del workflow (Reconnaissance, Assets, Content, Header, Footer, Landing Pages, Contact Form, Integrations, QA & Testing, Deploy)
- **Estado:** Las primeras 5 fases están completadas, Landing Pages está en progreso

### 4. Visual QA - Page Speed automático
- **Archivo:** `detail.html`
- **Cambio:** El botón de Page Speed ahora usa automáticamente la URL de QA del landing (o Prod si no hay QA)
- **Archivo:** `projects-store.mjs`
- **Cambio:** Función `setLandingPageSpeed` ahora ejecuta automáticamente la prueba de Page Speed usando el validador `core-web-vitals.mjs`
- **Integración:** Usa la API de Page Speed Insights de Google (API key opcional via `PAGESPEED_API_KEY`)
- **Resultado:** Genera notas automáticamente con score, status, Lighthouse Performance y issues

### 5. Múltiples observaciones
- **Archivo:** `detail.html`
- **Cambio:** El campo de observaciones ahora es un `<textarea>` en lugar de `<input>`
- **Archivo:** `detail.html`
- **Cambio:** Función `addObservation` ahora procesa múltiples líneas, cada una como una observación separada
- **Beneficio:** Puedes pegar múltiples observaciones de una vez

### 6. Copiar todas las observaciones
- **Archivo:** `detail.html`
- **Cambio:** Agregado botón "📋 Copiar todas" en la sección de observaciones
- **Función:** `copyAllObservations` copia todas las observaciones al portapapeles

### 7. Captura automática de screenshots
- **Archivo:** `detail.html`
- **Cambio:** Agregados botones para capturar automáticamente screenshots desde la URL del landing
- **Archivo:** `projects-store.mjs`
- **Cambio:** Función `captureLandingScreenshot` usa playwright para generar capturas
- **Archivo:** `http-wrapper.mjs`
- **Cambio:** Endpoint POST /api/projects/<id>/landings/<landingId>/capture
- **Ubicación:** Las capturas se guardan en `/uploads` y se sirven estáticamente

### 8. Google Workspace integration
- **Archivo:** `sitemap-detail.html`
- **Cambio:** Agregado link a Google Workspace en el navbar
- **Estado:** Funcional y desplegado

## Pendientes de testear

### 1. Subida de archivos en solicitudes
- [ ] Testear que se puedan adjuntar archivos en el formulario de solicitudes
- [ ] Verificar que los archivos se guarden correctamente en `/uploads`
- [ ] Verificar que los archivos se puedan descargar desde la UI

### 2. Page Speed automático
- [ ] Testear que el botón de Page Speed funcione correctamente
- [ ] Verificar que se muestre el score y notas automáticamente
- [ ] Verificar que funcione con y sin API key de Google

### 3. Múltiples observaciones
- [ ] Testear que se puedan pegar múltiples líneas de observaciones
- [ ] Verificar que cada línea se guarde como una observación separada
- [ ] Testear el botón de copiar todas las observaciones

### 4. Captura automática de screenshots
- [ ] Testear que playwright esté instalado en el servidor
- [ ] Verificar que las capturas se generen correctamente
- [ ] Verificar que las imágenes se muestren en Visual QA
- [ ] Testear que las imágenes se sirvan desde `/uploads`

### 5. Visual QA
- [ ] Verificar que se muestren las capturas del MCP cuando estén disponibles
- [ ] Testear que el formulario para subir URLs de screenshots funcione

### 6. Archivado
- [ ] Verificar que el archivado de proyectos persista al redeploy
- [ ] Testear que `status_override` en `projects-data/<id>.json` funcione correctamente

## Comandos útiles

### Deploy
```bash
cd /Users/spam11/github/MCP
gcloud builds submit --config=cloudbuild.yaml --project=retarget-mcp --timeout=10m --async .
```

### Verificar estado del deploy
```bash
gcloud builds describe <BUILD_ID> --project=retarget-mcp --format="value(status)"
```

### Logs del servidor
```bash
# Ver logs de Cloud Run
gcloud logs tail mcp-server --project=retarget-mcp --region=us-central1
```

### API key de Page Speed (opcional)
```bash
# Configurar API key si se quiere usar
export PAGESPEED_API_KEY="tu-api-key-aqui"
```

## Archivos modificados principales
- `projects-ui/solicitudes.html`
- `projects-ui/detail.html`
- `projects-ui/sitemap-detail.html`
- `http-wrapper.mjs`
- `projects-store.mjs`
- `mcp-projects/puebloladehesa-web-config.json`

## Próximos pasos recomendados
1. Testear todas las funcionalidades nuevas
2. Verificar que playwright esté instalado en el servidor para capturas automáticas
3. Configurar API key de Page Speed si se quiere usar
4. Documentar el uso de Visual QA y Page Speed para el equipo
