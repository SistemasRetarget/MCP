# Arquitectura: Drive Público + Framework de Supervisión de Proyectos
## Retarget — Sistema Integrado de Conocimiento y Avance

**Fecha:** 2026-04-27  
**Versión:** 1.0  
**Depende de:** MCP_RAILS_ARCHITECTURE.md

---

## 1. VISIÓN GENERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ECOSISTEMA RETARGET                                     │
│                                                                             │
│   CAPA 1: DRIVE PÚBLICO (Conocimiento Global)                              │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  retarget-drive/ (Shared Drive Público)                     │          │
│   │  ├── 00_EMPRESA/         Identidad, valores, presentaciones │          │
│   │  ├── 01_CLIENTES/        Carpeta por cliente (acceso rol)   │          │
│   │  ├── 02_PROYECTOS/       Framework de supervisión           │          │
│   │  ├── 03_PLANTILLAS/      Templates por rol y tipo           │          │
│   │  ├── 04_REPORTES/        Generados por MCP automáticamente  │          │
│   │  └── 05_FORMACION/       Guías, prompts, onboarding         │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
│   CAPA 2: FRAMEWORK SUPERVISIÓN (Por Proyecto)                             │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  02_PROYECTOS/[nombre-proyecto]/                            │          │
│   │  ├── BRIEF.md            Requerimientos originales          │          │
│   │  ├── REGISTRO.md         Log Claude/AI requests + decisiones│          │
│   │  ├── AVANCE.md           Estado actual por sprint           │          │
│   │  ├── CORREOS/            Emails workspace relevantes        │          │
│   │  └── REUNIONES/          Actas + grabaciones + calendarios  │          │
│   └─────────────────────────────────────────────────────────────┘          │
│                                                                             │
│   CAPA 3: MCP RAILS (Conectores en Tiempo Real)                           │
│   ┌─────────────────────────────────────────────────────────────┐          │
│   │  Google Workspace APIs  →  Gmail, Calendar, Meet, Drive     │          │
│   │  GitHub Webhooks        →  Commits, PRs, deploys            │          │
│   │  MCP Context Server     →  Contexto por usuario y rol       │          │
│   └─────────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUCTURA GOOGLE DRIVE PÚBLICO

### 2.1 Árbol Completo

```
📁 RETARGET (Shared Drive Principal)
│
├── 📁 00_EMPRESA
│   ├── 📄 Manual_Marca.pdf
│   ├── 📄 Propuesta_Valor.md
│   ├── 📄 Organigrama_Roles.pdf
│   ├── 📄 Contratos_Tipo/
│   └── 📄 Presentaciones_Cliente/
│
├── 📁 01_CLIENTES
│   ├── 📁 [nombre-cliente]/
│   │   ├── 📄 BRIEF_INICIAL.md
│   │   ├── 📄 CONTRATO.pdf
│   │   ├── 📁 ACTIVOS/          logos, fonts, fotos
│   │   ├── 📁 ENTREGAS/         versiones entregadas
│   │   └── 📁 COMUNICACION/     emails relevantes
│   └── (cada cliente = 1 carpeta)
│
├── 📁 02_PROYECTOS                ← FRAMEWORK SUPERVISIÓN
│   ├── 📁 [nombre-proyecto]/
│   │   ├── 📄 00_BRIEF.md
│   │   ├── 📄 01_REQUERIMIENTOS.md
│   │   ├── 📄 02_REGISTRO_AI.md  ← Claude/AI requests log
│   │   ├── 📄 03_AVANCE.md
│   │   ├── 📄 04_DECISIONES.md
│   │   ├── 📁 CORREOS/
│   │   ├── 📁 REUNIONES/
│   │   └── 📁 ENTREGABLES/
│   └── (cada proyecto = 1 carpeta)
│
├── 📁 03_PLANTILLAS
│   ├── 📄 BRIEF_TEMPLATE.md
│   ├── 📄 REPORTE_SEMANAL_TEMPLATE.md
│   ├── 📄 ACTA_REUNION_TEMPLATE.md
│   ├── 📄 REGISTRO_AI_TEMPLATE.md
│   └── 📁 por_rol/
│       ├── 📄 plantilla_cm.md
│       ├── 📄 plantilla_dev.md
│       ├── 📄 plantilla_seo.md
│       └── 📄 plantilla_diseño.md
│
├── 📁 04_REPORTES                 ← AUTO-GENERADOS POR MCP
│   ├── 📁 [YYYY-MM]/
│   │   ├── 📄 reporte_semanal_[fecha].md
│   │   ├── 📄 avance_proyectos_[fecha].md
│   │   └── 📄 metricas_equipo_[fecha].md
│   └── (auto-creados cada semana)
│
└── 📁 05_FORMACION
    ├── 📄 ONBOARDING.md
    ├── 📄 GUIA_USO_CLAUDE.md
    ├── 📄 GUIA_USO_GEMINI.md
    ├── 📄 PROMPTS_POR_ROL.md
    └── 📁 grabaciones_sesiones/
```

---

## 3. FRAMEWORK DE SUPERVISIÓN DE PROYECTOS

### 3.1 Estructura Por Proyecto

Cada proyecto nuevo en `02_PROYECTOS/[nombre]/` sigue este esquema:

#### `00_BRIEF.md` — Requerimiento inicial
```markdown
# Brief: [Nombre Proyecto]
**Cliente:** ...
**Fecha inicio:** ...
**Responsable:** ...
**Equipo:** [roles asignados]

## Objetivo
...

## Alcance
...

## Entregables esperados
- [ ] ...
- [ ] ...

## Restricciones
...

## Presupuesto / Tiempo estimado
...
```

#### `01_REQUERIMIENTOS.md` — Especificaciones técnicas
```markdown
# Requerimientos: [Nombre Proyecto]
**Versión:** 1.0
**Última actualización:** ...

## Funcionales
- RF-001: ...
- RF-002: ...

## No Funcionales
- RNF-001: ...

## Cambios solicitados (historial)
| Fecha | Quién | Requerimiento | Estado |
|-------|-------|---------------|--------|
| ...   | ...   | ...           | ...    |
```

#### `02_REGISTRO_AI.md` — Log de interacciones Claude/AI
```markdown
# Registro AI: [Nombre Proyecto]

## Propósito
Registro auditado de todos los requerimientos hechos a Claude u otras IA,
decisiones tomadas en base a sus respuestas, y prompts clave usados.

---

## Log de Interacciones

### [YYYY-MM-DD HH:MM] — [Usuario] via [Claude/Gemini/GPT]
**Contexto:** qué se estaba haciendo
**Prompt usado:**
> "..."

**Resultado/Decisión:**
- ...

**Archivos afectados:**
- ...

---
(repetir por cada interacción relevante)
```

#### `03_AVANCE.md` — Estado del proyecto
```markdown
# Avance: [Nombre Proyecto]

## Estado General
🟢 En curso | 🟡 Bloqueado | 🔴 Crítico | ✅ Completado

## Sprint Actual: [N] — [fecha inicio] al [fecha fin]

### En progreso
- [ ] Tarea 1 — Luis — 60%
- [ ] Tarea 2 — Alejandra — 30%

### Completadas este sprint
- [x] ...

### Bloqueadas
- ⚠️ Tarea X — Esperando: [qué/quién]

## Histórico de Sprints
| Sprint | Fechas | Completado | Notas |
|--------|--------|------------|-------|
| 1      | ...    | ...        | ...   |
```

#### `04_DECISIONES.md` — Registro de decisiones
```markdown
# Decisiones: [Nombre Proyecto]

| ID    | Fecha | Decisión | Tomada por | Alternativas descartadas | Resultado |
|-------|-------|----------|------------|--------------------------|-----------|
| D-001 | ...   | ...      | ...        | ...                      | ...       |
```

---

## 4. CONECTORES POR ROL Y HERRAMIENTA

### 4.1 Matriz de Conectores

```
ROL             HERRAMIENTA AI    GOOGLE WORKSPACE        FLUJO MCP
──────────────────────────────────────────────────────────────────────
Mauricio (CEO)  ChatGPT          Gmail + Calendar + Meet  Reportes estratégicos
                                                          Métricas globales
                                                          Decisiones pendientes

Barbana (COO)   Gemini           Gmail + Calendar + Chat  Coordinación equipo
                                                          Estado proyectos
                                                          Alerts urgentes

Leig (CM)       Claude/Gemini    Gmail + Chat + Calendar  Tareas clientes
                                                          Calendarios publicación
                                                          Respuestas aprobadas

Alejandra (Dis) Claude           Drive + Chat + Gmail     Activos por proyecto
                                                          Feedback visual
                                                          Versiones entregables

Andrea (Media)  Gemini           Drive + Chat + Calendar  Campañas activas
                                                          Calendarios ads
                                                          Presupuestos

Cota (Editor)   Claude           Drive + Gmail + Chat     Publicaciones blog
                                                          SEO brief
                                                          Calendarios contenido

Daniel (SEO)    Gemini           Drive + Analytics + Chat Reportes tráfico
                                                          Keywords activas
                                                          Auditorías técnicas

Luis (Dev)      Claude           GitHub + Drive + Chat    Tareas dev activas
                                                          Deploy status
                                                          Code reviews
```

### 4.2 Flujo de Datos Por Rol

#### CEO — Mauricio
```
Google Workspace
└── Gmail (emails VIP, contratos)
└── Calendar (reuniones estratégicas)
└── Meet (grabaciones automáticas)
        ↓
   MCP Rails
   └── Agrega: decisiones pendientes, métricas KPI, estado proyectos
        ↓
   ChatGPT (contexto completo)
   └── "¿Cómo va el equipo esta semana?"
   └── "¿Qué proyectos están en riesgo?"
   └── "Prepara resumen para reunión cliente X"
        ↓
   Drive 04_REPORTES/
   └── Reporte semanal auto-generado
```

#### COO — Barbana
```
Google Workspace
└── Gmail (comunicación equipo, clientes)
└── Chat (coordinación diaria)
└── Calendar (reuniones, deadlines)
        ↓
   MCP Rails
   └── Agrega: estado de cada persona, tareas bloqueadas, urgencias
        ↓
   Gemini (contexto completo)
   └── "¿Quién está bloqueado hoy?"
   └── "¿Qué deadlines vencen esta semana?"
   └── "Redacta follow-up para cliente X"
        ↓
   Drive 02_PROYECTOS/[proyecto]/03_AVANCE.md
   └── Actualizado automáticamente
```

#### DEV — Luis
```
GitHub (commits, PRs, issues)
└── Google Chat (tareas asignadas)
└── Google Drive (briefs, specs)
        ↓
   MCP Rails
   └── Agrega: tareas activas, contexto técnico, historial decisiones
        ↓
   Claude (contexto completo)
   └── "¿Qué tengo pendiente?"
   └── "Qué decidimos sobre X feature?"
   └── "Genera documentación para este PR"
        ↓
   Drive 02_PROYECTOS/[proyecto]/02_REGISTRO_AI.md
   └── Cada interacción Claude queda registrada
```

---

## 5. REGISTRO AUTOMÁTICO DE REQUERIMIENTOS AI

### 5.1 Cómo funciona

Cuando cualquier miembro del equipo usa su IA con el MCP, el sistema automáticamente:

1. **Detecta** el requerimiento (via API Key del MCP)
2. **Clasifica** si es relevante para un proyecto activo
3. **Registra** en `02_REGISTRO_AI.md` del proyecto correspondiente
4. **Actualiza** `03_AVANCE.md` si hay cambio de estado

```ruby
# MCP Rails: Auto-registro en Drive
class ProjectAiLogger
  def log_interaction(user:, project:, prompt:, decision:, files_affected:)
    entry = build_log_entry(user, prompt, decision, files_affected)
    
    # Actualiza archivo en Drive
    DriveService.append_to_file(
      path: "02_PROYECTOS/#{project.slug}/02_REGISTRO_AI.md",
      content: entry
    )
    
    # Si hay cambio de avance, actualiza AVANCE.md
    if decision[:affects_progress]
      ProgressService.update(project, decision[:progress_update])
    end
  end
  
  private
  
  def build_log_entry(user, prompt, decision, files)
    <<~ENTRY
      ### #{Time.current.strftime('%Y-%m-%d %H:%M')} — #{user.name} via #{user.ai_tool}
      **Contexto:** #{decision[:context]}
      **Prompt usado:**
      > "#{prompt}"
      
      **Resultado/Decisión:**
      #{decision[:summary]}
      
      **Archivos afectados:**
      #{files.map { |f| "- #{f}" }.join("\n")}
      
      ---
    ENTRY
  end
end
```

---

## 6. CONECTORES GOOGLE WORKSPACE: DETALLE TÉCNICO

### 6.1 Permisos Requeridos por Servicio

```
GMAIL
├── gmail.readonly          → Leer emails
├── gmail.send              → Enviar (solo si aprobado por usuario)
└── gmail.labels            → Clasificar por proyecto

CALENDAR
├── calendar.readonly       → Ver eventos, reuniones, Meet links
└── calendar.events         → Crear eventos (reuniones de proyecto)

MEET
└── meet.recordings         → Acceder grabaciones de reuniones

CHAT
├── chat.messages.readonly  → Leer mensajes del equipo
└── chat.spaces.readonly    → Listar espacios/canales

DRIVE
├── drive.readonly          → Leer archivos
├── drive.file              → Crear/editar archivos del MCP
└── drive.metadata.readonly → Listar carpetas y permisos
```

### 6.2 Flujo OAuth por Rol

```
Primer uso:
1. Usuario abre su IA con el MCP
2. MCP redirige a Google OAuth
3. Usuario aprueba permisos de su rol (mínimos necesarios)
4. Token guardado encriptado en DB
5. MCP sincroniza datos iniciales

Uso cotidiano:
1. Token se refresca automáticamente
2. Webhooks detectan cambios en tiempo real
3. Contexto siempre actualizado
```

### 6.3 Sincronización de Correos Workspace

```
REGISTRO AUTOMÁTICO DE CORREOS POR PROYECTO

Reglas de clasificación automática:
├── Email menciona nombre del proyecto → CORREOS/ del proyecto
├── Email del cliente del proyecto     → CORREOS/ del proyecto
├── Email tiene asunto con [PROYECTO]  → CORREOS/ del proyecto
└── Email manual marcado por usuario   → CORREOS/ del proyecto

Formato guardado en Drive:
02_PROYECTOS/[proyecto]/CORREOS/
├── YYYY-MM-DD_[asunto-sanitizado].md
│   ├── De: ...
│   ├── Para: ...
│   ├── Fecha: ...
│   ├── Asunto: ...
│   └── Cuerpo: ...
```

### 6.4 Sincronización de Reuniones

```
REGISTRO AUTOMÁTICO DE REUNIONES

Cuando hay reunión de Google Meet:
1. Calendar detecta evento con videollamada
2. MCP crea: 02_PROYECTOS/[proyecto]/REUNIONES/[fecha]/
3. Al terminar, agrega:
   ├── ACTA_[fecha].md        (auto-generada por AI)
   ├── DECISIONES_[fecha].md  (extraídas del acta)
   └── GRABACION_link.md      (link a Meet recording)
4. Actualiza AVANCE.md con decisiones relevantes
```

---

## 7. IMPLEMENTACIÓN: FASES

### Fase 1 — Setup Drive (1 día)
```
□ Crear Shared Drive "RETARGET" en Google Workspace Admin
□ Definir permisos por rol (quién puede ver qué)
□ Crear estructura de carpetas base
□ Subir plantillas (03_PLANTILLAS/)
□ Migrar documentos existentes a estructura nueva
```

### Fase 2 — Framework Proyectos Activos (2 días)
```
□ Crear carpeta en 02_PROYECTOS/ por cada proyecto activo
□ Completar BRIEF.md + REQUERIMIENTOS.md con info existente
□ Inicializar AVANCE.md con estado actual
□ Crear REGISTRO_AI.md vacío (listo para recibir logs)
```

### Fase 3 — Conectores MCP (Semana 1-2, ver MCP_RAILS_ARCHITECTURE.md)
```
□ Gmail API → clasificación automática por proyecto
□ Calendar API → sincronización reuniones
□ Drive API → escritura automática de logs AI
□ Meet → acceso grabaciones
□ GitHub webhooks → estado deploys en AVANCE.md
```

### Fase 4 — Automatización Reportes (Semana 2-3)
```
□ Job semanal → genera reporte en 04_REPORTES/
□ Job diario  → actualiza AVANCE.md por proyecto
□ Webhook AI  → registra cada interacción en REGISTRO_AI.md
```

---

## 8. PERMISOS POR ROL EN DRIVE

```
CARPETA                  | CEO | COO | Dev | CM | Dis | Media | Editor | SEO
─────────────────────────────────────────────────────────────────────────────
00_EMPRESA               | ✏️  | ✏️  | 👁️  | 👁️ | 👁️  | 👁️    | 👁️     | 👁️
01_CLIENTES/[su cliente] | ✏️  | ✏️  | 👁️  | ✏️ | ✏️  | ✏️    | ✏️     | ✏️
01_CLIENTES/[otro]       | ✏️  | ✏️  | 🚫  | 🚫 | 🚫  | 🚫    | 🚫     | 🚫
02_PROYECTOS/[su proyecto]| ✏️ | ✏️  | ✏️  | ✏️ | ✏️  | ✏️    | ✏️     | ✏️
02_PROYECTOS/[otro]      | ✏️  | ✏️  | 👁️  | 👁️ | 👁️  | 👁️    | 👁️     | 👁️
03_PLANTILLAS            | ✏️  | ✏️  | 👁️  | 👁️ | 👁️  | 👁️    | 👁️     | 👁️
04_REPORTES              | ✏️  | ✏️  | 👁️  | 👁️ | 👁️  | 👁️    | 👁️     | 👁️
05_FORMACION             | ✏️  | ✏️  | 👁️  | 👁️ | 👁️  | 👁️    | 👁️     | 👁️

✏️ = Editar  |  👁️ = Solo leer  |  🚫 = Sin acceso
```

---

## 9. CHECKLIST DE IMPLEMENTACIÓN

```
DRIVE PÚBLICO
─────────────────────────────────────────────────────────────
□ Shared Drive creado en Google Workspace Admin
□ Estructura de carpetas creada (00_ a 05_)
□ Permisos configurados por rol
□ Plantillas subidas a 03_PLANTILLAS/
□ Proyectos activos migrados a 02_PROYECTOS/

FRAMEWORK SUPERVISIÓN
─────────────────────────────────────────────────────────────
□ BRIEF.md creado por cada proyecto activo
□ REQUERIMIENTOS.md con historial de cambios
□ REGISTRO_AI.md inicializado (vacío, listo)
□ AVANCE.md con estado actual
□ CORREOS/ y REUNIONES/ creadas por proyecto

CONECTORES WORKSPACE
─────────────────────────────────────────────────────────────
□ OAuth configurado por usuario (ver MCP_RAILS_ARCHITECTURE.md)
□ Gmail → clasificación automática por proyecto
□ Calendar → sincronización reuniones → Drive
□ Meet → link grabaciones en carpeta REUNIONES/
□ Chat → mensajes relevantes por proyecto
□ Drive API → escritura logs AI desde MCP Rails

AUTOMATIZACIONES
─────────────────────────────────────────────────────────────
□ Job semanal: genera reporte en 04_REPORTES/
□ Webhook AI: registra interacciones en REGISTRO_AI.md
□ Webhook Gmail: mueve correos a carpeta proyecto
□ Webhook Calendar: crea acta en REUNIONES/ post-reunión
```

---

## 10. PRÓXIMOS PASOS

**Esta semana:**
1. Crear el Shared Drive en Google Workspace Admin
2. Crear estructura de carpetas (`00_` a `05_`)
3. Crear carpeta por cada proyecto activo en `02_PROYECTOS/`
4. Inicializar plantillas en `03_PLANTILLAS/`

**Semana siguiente:**
5. Conectar Drive API al MCP Rails (ver `MCP_RAILS_ARCHITECTURE.md`)
6. Configurar OAuth por usuario (mínimo Barbana + Luis para piloto)
7. Probar registro automático de interacciones AI en `REGISTRO_AI.md`

**¿Empezamos por el Shared Drive o por los conectores MCP?**
