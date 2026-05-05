# Flujo de Tickets + Monitor de Campañas

**Última actualización:** 4 de mayo 2026
**Estado:** 🟡 Documentación inicial — pendiente confirmación de detalles

---

## 1. Visión general

El MCP recibe **requerimientos por correo** dirigidos a Leig y Mauricio (Sistemas Retarget), los procesa, los valida internamente, ejecuta los cambios y responde con un **PDF de reporte de ejecución** + un **ID interno** que respalda nuestra primera respuesta.

Adicionalmente, vigila **campañas activas** (prioridad Puyehue.cl) tres veces al día para detectar caídas, cambios visuales o degradación de performance.

**Principios de diseño:**
- 🪶 **Liviano** — no agresivo en producción, sobre todo Puyehue.cl
- 🛡️ **Respaldado** — toda respuesta queda documentada con ID interno
- 🤖 **Asistido, no autónomo** — el MCP propone, humano confirma antes de enviar

---

## 2. Flujo de tickets (entrada → respuesta)

### 2.1 Intake — Gmail API

- **Fuente:** bandeja de Leig + Mauricio (Sistemas)
- **Trigger:** correo nuevo recibido cuyo asunto NO empieza con `Re:` (correo entrante, no respuesta)
- **Acción del MCP:**
  1. Lee el correo (asunto, cuerpo, remitente, adjuntos, fecha)
  2. Crea un `ticket` interno en el MCP
  3. Le asigna nuestro **ID de tracking** (ver §2.2)
  4. Marca el correo en Gmail con label `MCP/En análisis`

### 2.2 Tracking dual (asunto + ID interno)

**Decisión:** mantener el lenguaje del solicitante + agregar nuestro ID Retarget.

- **Asunto original** → se usa como referencia visible en la conversación (lo que ellos escribieron, ej. *"Cambio en hero de Puyehue"*)
- **ID Retarget interno** → formato sugerido: `RT-{PROYECTO}-{YYYY}{NN}` (ej. `RT-PYH-202611`)
- En la respuesta aparecen **ambos**:
  - Subject del email mantiene el asunto original (mismo hilo)
  - Cuerpo del correo y PDF llevan el ID Retarget como respaldo

**Razón:** si más adelante preguntan por el ticket, podemos buscar por su asunto original O por nuestro ID, y queda probado qué fue lo primero que respondimos.

### 2.3 Validación interna (Leig + Mauricio)

Fase humana antes de actuar. El MCP:
1. Resume el correo con LLM (Claude) en bullet points
2. Identifica el proyecto afectado (Puyehue, Pueblo La Dehesa, etc.) por keywords
3. Detecta si es **cambio en producción** (alerta naranja) o **QA** (verde)
4. Lo deja en `pending_validation` esperando que Leig/Mauricio lo aprueben en la UI

### 2.4 Ejecución

Una vez validado:
- Se asigna ejecutor
- Se ejecutan los cambios en el repo correspondiente
- Se hace deploy a QA primero, luego prod (si aplica)
- Cada paso se registra en el ticket

### 2.5 Respuesta — PDF de ejecución/cambios realizados

**Saludo estándar:**
> Hola don Mauricio y Leig, espero que se encuentren muy bien.
> Adjunto el reporte de ejecución del requerimiento *"{asunto original}"* (Ref. Retarget: **{ID}**).

**Cuerpo:** intro corta (2-3 líneas) explicando qué se hizo en lenguaje simple.

**PDF adjunto incluye:**
- ID Retarget + asunto original + fecha
- Resumen del requerimiento (lo que entendimos)
- Cambios realizados (lista con archivos/secciones afectadas)
- Antes / después (screenshots)
- Links de verificación (QA + prod)
- Métricas relevantes (PageSpeed, etc. si aplica)
- Firma: equipo Sistemas Retarget

**Importante:** el correo se prepara como **draft en Gmail**, NO se envía automáticamente. Leig o Mauricio lo revisan y aprietan "Enviar" desde Gmail. Esto previene errores en producción.

---

## 3. Monitor de campañas

### 3.1 Cobertura

- **Prioridad 1:** puyehue.cl (sitio delicado, monitorear con cariño)
- **Prioridad 2:** otras webs activas con campañas

### 3.2 Schedule

3 checks/día — programado para coincidir con momentos clave del negocio:
- **07:00** — al despertar el equipo
- **12:00** — chequeo intermedio (post-update si hubo)
- **18:00** — cierre del día

Implementación: Cloud Scheduler → invoca endpoint del MCP → ejecuta los checks.

### 3.3 Qué se vigila

1. **Disponibilidad** — HTTP 200, tiempo respuesta < 3s
2. **Integridad visual** — screenshot vs baseline (pixel diff con tolerancia)
3. **Performance/SEO** — Core Web Vitals (Lighthouse) — solo en el check de las 12:00 para no saturar
4. **CTA y formularios** — verificar que los selectores de los CTA principales existen en el DOM

### 3.4 Identificación de URLs de campaña

**Decisión:** conectar **Meta Ads + Google Ads API** y leer URLs activas de campañas.

- Cada check matutino (07:00) refresca la lista desde las plataformas de ads
- Filtra solo campañas activas y trackea sus URLs de destino
- Si una URL nueva aparece, se monitorea desde el siguiente check

**Pendiente confirmar:** acceso/credenciales de Meta Ads y Google Ads (ver §5).

### 3.5 Alertas

- **Cambio crítico** (404, 5xx, diff visual >10%) → notificación inmediata + alerta en MCP UI
- **Cambio menor** (perf bajó, diff visual <10%) → log + visible en dashboard, sin spam
- **Todo OK** → solo registro silencioso (heartbeat)

---

## 4. Arquitectura propuesta (módulos a construir en MCP)

```
mcp/
├── tickets/
│   ├── gmail-ingestor.mjs       # Lee Gmail, crea tickets
│   ├── ticket-store.mjs         # Persistencia (JSON en /mcp-tickets/)
│   ├── ticket-id.mjs            # Generador RT-{PROY}-{YYYY}{NN}
│   ├── analyzer.mjs             # LLM: resume + detecta proyecto + flag prod
│   ├── pdf-generator.mjs        # Genera PDF de ejecución
│   └── gmail-responder.mjs      # Crea draft con PDF adjunto
├── monitor/
│   ├── ads-fetcher.mjs          # Meta + Google Ads → lista URLs campaña
│   ├── checker.mjs              # Disponibilidad + visual + perf
│   ├── baseline-store.mjs       # Screenshots de referencia
│   └── alerter.mjs              # Notifica si hay diff crítico
└── routes/
    ├── tickets.mjs              # CRUD tickets + UI
    └── monitor.mjs              # Estado del monitor + historial
```

UI dentro del dashboard MCP existente:
- `/tickets` — bandeja con estados (entrada → análisis → validación → ejecución → respondido)
- `/monitor` — estado live de todas las campañas vigiladas

---

## 5. Pendientes de confirmar

- [ ] **Cuenta Gmail a leer**: ¿una compartida `sistemas@retarget.cl`? ¿o las dos personales?
- [ ] **Permisos Gmail API**: necesitamos OAuth 2.0 con scope `gmail.modify`
- [ ] **Credenciales Meta Ads API**: app ID, token de acceso, business account
- [ ] **Credenciales Google Ads API**: developer token, customer ID, refresh token
- [ ] **Ejecutor**: ¿quién hace los cambios reales? ¿Cascade/Claude/humano? ¿Y con qué guardrails para prod?
- [ ] **Dónde se almacenan los PDFs?**: ¿GCS bucket? ¿adjuntos en Gmail directamente?
- [ ] **Notificaciones de alerta**: ¿Slack? ¿Email? ¿WhatsApp? ¿solo UI del MCP?

---

## 6. Próximos pasos

1. ✅ Documentar flujo (este archivo)
2. ⏳ Confirmar pendientes §5 con el usuario
3. ⏳ Implementar módulo `tickets/` (intake Gmail + ID + UI)
4. ⏳ Implementar `pdf-generator.mjs` con template HTML → PDF (puppeteer)
5. ⏳ Implementar `monitor/` con scheduler y conexión Ads APIs
6. ⏳ Pilotar con un solo ticket real antes de abrir el flujo completo
