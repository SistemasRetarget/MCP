# Backlog de Requerimientos — Luis

> Requerimientos formales solicitados por Luis (Sistemas Retarget).
> **Estado:** documentados, no implementados aún.
> Este archivo es la fuente de verdad para próximas iteraciones.

---

## REQ-001 · Panel de indicaciones accesible para todos los roles

### 🎯 Objetivo
Cada miembro del equipo (diseñador, periodista, jefe, QA, etc.) debe poder **ver indicaciones del proyecto sin entrar al código**, con un panel visual claro y siempre accesible desde el dashboard.

### 📋 Criterios de aceptación
- [ ] Tab "Indicaciones" en `detail.html` por proyecto, **fija y visible** en la barra de tabs
- [ ] Permite **lectura sin login** (todos los roles, incluso clientes/revisores externos)
- [ ] Soporta:
  - Texto markdown (con headings, listas, código, links)
  - Imágenes embebidas (con preview)
  - Adjuntos (PDF, docx)
  - Versionado simple (último editado por X el Y)
- [ ] Editable solo por roles con permiso (`luis@retarget.cl`, `jefe-2`)
- [ ] Cada indicación tiene **timestamp + autor + categoría** (Brief, Diseño, Contenido, QA, Otros)
- [ ] **Pinned items**: indicaciones marcadas como críticas aparecen al inicio
- [ ] Notificación al equipo cuando se agrega una indicación nueva (slack/email opcional)

### 🏗️ Implementación sugerida
- Storage: `mcp-projects/<id>/indications/` con archivos `.md`
- Endpoint: `GET /api/projects/:id/indications` (lista) y `POST /api/projects/:id/indications` (agregar, requiere auth)
- UI: tab en detail.html con render de markdown (usar marked.js o similar)
- Tiempo estimado: **3–4 horas**

### 🔗 Dependencias
- Sistema de auth ya existe (`@retarget.cl`)
- Markdown rendering: lib estática (no AI, no consume créditos)

---

## REQ-002 · Carpeta Drive pública por proyecto para alimentar al MCP

### 🎯 Objetivo
Cada proyecto debe tener una **carpeta de Google Drive pública** (o de acceso compartido al equipo) donde cualquier miembro pueda **subir archivos que el MCP debe considerar**: briefs, guías de marca, contenido, screenshots de referencia, archivos del cliente, etc.

El MCP debe poder **listar, leer y procesar** esos archivos automáticamente cuando trabaje en el proyecto.

### 📋 Criterios de aceptación
- [ ] Cada `<project>-config.json` tiene un campo `drive_folder` con URL de la carpeta
- [ ] Botón **"📁 Subir archivos"** muy visible en el detail.html de cada proyecto
- [ ] Al click, abre la carpeta Drive en nueva pestaña (no requiere implementar uploader propio inicialmente)
- [ ] El dashboard muestra:
  - Cantidad de archivos en la carpeta
  - Último archivo subido (nombre + autor + fecha)
  - Tipo de archivos (imagen / pdf / docx / otro)
- [ ] El MCP, al iniciar trabajo en un proyecto, **lista los archivos** de la carpeta y los considera contexto
- [ ] Categorización opcional dentro de Drive: subcarpetas `01-brief`, `02-marca`, `03-contenido`, `04-referencias`, `05-feedback`

### 🏗️ Implementación sugerida
**Fase 1 (MVP, 1 hora):**
- Solo agregar el campo `drive_folder` y el botón "Abrir carpeta Drive" en UI
- Sin sincronización automática

**Fase 2 (semana siguiente, 4–6 horas):**
- Integrar Google Drive API con service account
- Endpoint `GET /api/projects/:id/drive-files` que lista archivos
- Cache local con TTL 5 min
- En el dashboard mostrar tabla de archivos con preview/download

**Fase 3 (futuro):**
- El MCP consume archivos como contexto en `/chat`
- Imágenes → enviar como vision input a Claude
- PDFs/docx → extraer texto y meterlo al system prompt

### 🔗 Dependencias
- **Cuenta Google con acceso a Drive API** (service account de Retarget)
- Variable de entorno `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY` (secret)
- Lib: `googleapis` (npm)
- **NO consume créditos Anthropic en fase 1 ni 2**

### 💡 Consideración Luis
> *"Para alimentar al MCP. Con info a considerar."*
>
> Esto es el camino para que el AI no opere a ciegas — recibe el contexto del cliente real (briefs, marca, referencias) y produce trabajo alineado con la realidad del proyecto, no solo lo que infiere desde la web pública.

---

## REQ-003 · Web Vitals y PageSpeed visibles por proyecto

### 🎯 Objetivo
Cada proyecto con deploy QA/Producción debe mostrar de forma **muy visible** las métricas de performance:
- **PageSpeed Insights** (score 0–100 mobile + desktop)
- **Core Web Vitals**: LCP, FID/INP, CLS, FCP, TTFB
- Histórico de mediciones (gráfica en el tiempo)
- Comparativa QA vs Producción
- Comparativa contra el sitio original (cuando aplica, ej. puyehue.cl)

### 📋 Criterios de aceptación
- [ ] Card prominente en `detail.html` con **score PageSpeed mobile + desktop** (semáforo verde/ámbar/rojo)
- [ ] Tab "Performance" con detalle:
  - LCP (Largest Contentful Paint) — meta ≤ 2.5s
  - INP (Interaction to Next Paint) — meta ≤ 200ms
  - CLS (Cumulative Layout Shift) — meta ≤ 0.1
  - FCP (First Contentful Paint) — meta ≤ 1.8s
  - TTFB (Time to First Byte) — meta ≤ 800ms
- [ ] **Botón "Re-medir ahora"** que dispara una medición fresh
- [ ] **Cron diario** que mide automáticamente cada proyecto y guarda histórico
- [ ] Gráfica de evolución últimos 30 días por métrica
- [ ] Comparativa con el sitio fuente: si puyehue.cl tiene LCP=1.8s y nuestra réplica tiene 2.4s, mostrarlo claramente
- [ ] **Alerta** si una métrica empeora >20% entre dos mediciones consecutivas (visible en dashboard + notificación)

### 🏗️ Implementación sugerida
**Tooling:**
- **PageSpeed Insights API** (gratis, 25.000 queries/día con API key)
  - Endpoint: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=X&strategy=mobile`
  - Devuelve scores + Core Web Vitals + Lighthouse audits
- Variable: `GOOGLE_PAGESPEED_API_KEY`

**Backend:**
- Endpoint `GET /api/projects/:id/performance` → cache + último resultado
- Endpoint `POST /api/projects/:id/performance/measure` → fuerza nueva medición
- Cron job en Cloud Scheduler diario 6 AM Chile → mide todos los proyectos activos
- Storage: `mcp-projects/<id>/performance-history.json` con array de snapshots

**UI:**
- Card en overview: score mobile + desktop con color según rango
- Tab "Performance" con gauge charts (recharts o vanilla SVG)
- Tabla histórica con filtro por métrica

**Tiempo estimado:** 5–7 horas (sin AI, no consume créditos Anthropic)

### 🔗 Dependencias
- API key de Google PageSpeed (gratis, 1 minuto)
- `setup-cron.sh` — agregar job para `/api/cron/measure-performance`
- Validators ya existentes (`validators/core-web-vitals.mjs`) — extender para guardar histórico

### 💡 Consideración Luis
> *"Que tengan visibilidad del web vitals y performance (nota de page speed)"*
>
> El equipo debe **ver el score sin tener que correr Lighthouse manual**. Puyehue tiene una réplica QA — necesitan saber al instante si la réplica es más lenta que el original o no, sin abrir herramientas externas.

---

## 📊 Resumen de prioridades

| Req | Descripción | Esfuerzo | Consume créditos AI | Prioridad |
|---|---|---|---|---|
| **REQ-001** | Panel de indicaciones | 3–4h | ❌ No | 🔴 Alta |
| **REQ-002** F1 | Drive folder + botón visible | 1h | ❌ No | 🔴 Alta |
| **REQ-002** F2 | Drive API + listado | 4–6h | ❌ No | 🟡 Media |
| **REQ-002** F3 | MCP consume Drive como contexto | 6h | ✅ Sí | 🟢 Baja |
| **REQ-003** | PageSpeed + Web Vitals + histórico | 5–7h | ❌ No | 🔴 Alta |

**Total esfuerzo (todo excepto REQ-002 F3):** ~14–18 horas, **sin** consumir créditos Claude.

---

## 📅 Sugerencia de orden de implementación

1. **REQ-002 Fase 1** (1h) — agregar campo + botón en UI. Desbloquea al equipo para empezar a subir archivos hoy mismo.
2. **REQ-001** (3–4h) — panel de indicaciones. Centraliza comunicación del proyecto.
3. **REQ-003** (5–7h) — PageSpeed + Web Vitals. Fundamental para validar que las réplicas no degradan performance.
4. **REQ-002 Fase 2** (4–6h) — Drive API completo, cuando ya estén usando la carpeta.
5. **REQ-002 Fase 3** — cuando haya créditos AI estables.

---

**Documentado por:** Cascade (Sistema MCP)
**Solicitado por:** Luis · Sistemas Retarget · 29-04-2026 23:38
**Estado:** ⏳ Pendiente — esperando créditos Anthropic + autorización para iniciar
