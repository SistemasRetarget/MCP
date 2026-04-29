# Arquitectura de Proyectos en el MCP

**Fecha:** 29 Abril 2026, 04:00 UTC  
**Objetivo:** Separación y gestión de múltiples proyectos en el MCP  
**Status:** ✅ Implementado

---

## 🎯 Problema Identificado

El MCP no estaba separado por proyectos. Cuando se replica un sitio (como puyehue.cl), el MCP no sabía:
- Cuál es el proyecto actual
- Qué especificaciones tiene
- Cuál es el estado de replicación
- Dónde guardar la evidencia

**Solución:** Crear una arquitectura de proyectos con configuración separada.

---

## 📁 Estructura de Carpetas

```
/Users/spam11/github/MCP/
├── projects/
│   ├── puyehue-config.json      ← Configuración del proyecto Puyehue
│   ├── retarget-config.json     ← Configuración del proyecto Retarget (futuro)
│   └── [proyecto]-config.json   ← Patrón para nuevos proyectos
├── contracts/
│   ├── team.json                ← Equipo Retarget (Luis, Jefe 2, Periodista)
│   └── roles/                   ← Perfiles de usuarios por proyecto
├── evidence/
│   ├── puyehue/
│   │   ├── reconnaissance/
│   │   ├── replication/
│   │   └── validation/
│   └── [proyecto]/
└── http-wrapper.mjs             ← Servidor HTTP con endpoints de proyectos
```

---

## 📋 Configuración de Proyecto

Cada proyecto tiene un archivo `{proyecto}-config.json`:

```json
{
  "project_id": "puyehue-cl",
  "project_name": "Puyehue Hotel Termas",
  "status": "active",
  "repositories": {
    "source": { "url": "https://puyehue.cl", "type": "wordpress" },
    "qa": { "url": "https://puyehue-web-...", "type": "nextjs" },
    "production": { "url": "https://puyehue.cl", "type": "wordpress" }
  },
  "reconnaissance": { ... },
  "replication": { ... },
  "workflow": { ... },
  "deployment": { ... }
}
```

---

## 🔌 Endpoints de Proyectos

### 1. Listar Proyectos Activos
```bash
GET /api/projects
```

**Respuesta:**
```json
{
  "projects": [
    {
      "project_id": "puyehue-cl",
      "project_name": "Puyehue Hotel Termas",
      "status": "active",
      "replication": { "status": "in_progress", "phase": "content_mapping" }
    }
  ],
  "count": 1
}
```

### 2. Obtener Estado de Proyecto
```bash
GET /api/projects/{project_id}
```

**Ejemplo:**
```bash
curl https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/api/projects/puyehue-cl
```

**Respuesta:**
```json
{
  "project_id": "puyehue-cl",
  "project_name": "Puyehue Hotel Termas",
  "status": "active",
  "repositories": { ... },
  "reconnaissance": { "status": "completed", "findings": { ... } },
  "replication": { "status": "in_progress", "completed_sections": [...], "pending_sections": [...] },
  "workflow": { "current_step": "content_replication", "steps": [...] },
  "deployment": { "status": "deployed", "url": "https://puyehue-web-..." }
}
```

---

## 🔄 Workflow de Proyecto

Cada proyecto sigue este workflow:

```
1. Reconnaissance (Completado)
   ├─ Analizar sitio original
   ├─ Extraer especificaciones
   └─ Guardar en projects/{proyecto}-config.json

2. Content Mapping (En Progreso)
   ├─ Mapear secciones
   ├─ Extraer contenido
   └─ Documentar en RECONNAISSANCE_{proyecto}.md

3. Navigation Replication (Pendiente)
   ├─ Replicar menú
   ├─ Crear estructura de rutas
   └─ Actualizar componentes

4. Features & Sections (Pendiente)
   ├─ Replicar secciones principales
   ├─ Actualizar imágenes
   └─ Ajustar estilos

5. QA & Validation (Pendiente)
   ├─ Validar contra original
   ├─ Core Web Vitals
   └─ SEO audit

6. Production Deploy (Pendiente)
   ├─ Merge a main
   ├─ Deploy a producción
   └─ Monitoreo
```

---

## 📊 Puyehue Project Status

**Proyecto:** Puyehue Hotel Termas  
**Repositorio:** https://github.com/SistemasRetarget/puyehue-cl  
**QA URL:** https://puyehue-web-rf3w6ybqeq-ew.a.run.app  
**Original:** https://puyehue.cl

### Reconnaissance ✅
- ✅ Sitio analizado
- ✅ Especificaciones extraídas
- ✅ Documento: `RECONNAISSANCE_PUYEHUE.md`

### Replication 🔄
- ✅ Metadata actualizada
- ✅ Hero section actualizado
- ✅ Narrativa actualizada
- ✅ Features actualizadas (Termas, Parque, Bienestar)
- ✅ Servicios actualizados
- ⏳ Navegación (pendiente)
- ⏳ Promociones (pendiente)
- ⏳ Actividades (pendiente)
- ⏳ Galería (pendiente)
- ⏳ Formulario de reserva (pendiente)

### Commits
- `333e4484` — feat: Replicar puyehue.cl
- `c05aea52` — docs: Estado de replicación
- `de90beb` — feat: Agregar gestión de proyectos al MCP

---

## 🎯 Próximos Pasos

### Fase 3: Navigation Replication
```
Sitio Original (puyehue.cl):
├─ Promociones
├─ Destino
├─ Hotel
├─ Qué Hacer
├─ Programas
├─ Eventos
├─ Sostenibilidad
└─ Ven por el Día

Necesario en QA:
├─ Crear componente Navigation
├─ Mapear rutas
├─ Actualizar layout
└─ Validar responsive
```

### Fase 4: Features & Sections
```
Secciones a replicar:
├─ Promociones (hero con slider)
├─ Actividades (galería 4 columnas)
├─ Vida en Puyehue (galería 4 columnas)
├─ Booking form (fecha, huéspedes, botón reservar)
└─ Footer (links, contacto, redes)
```

### Fase 5: QA & Validation
```
Validaciones:
├─ Visual diff vs original
├─ Core Web Vitals
├─ SEO audit
├─ Responsive (mobile, tablet, desktop)
└─ Accesibilidad (WCAG 2.1)
```

---

## 🔐 Integración con MCP

El MCP ahora puede:

1. **Listar proyectos activos**
   ```bash
   curl https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/api/projects
   ```

2. **Obtener estado de proyecto**
   ```bash
   curl https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/api/projects/puyehue-cl
   ```

3. **Usar en chat con Claude**
   ```
   "¿Cuál es el estado del proyecto puyehue-cl?"
   → MCP obtiene config y responde con estado actual
   ```

4. **Routing automático**
   - Cada comando sabe a qué proyecto aplica
   - Evidencia se guarda en `evidence/{proyecto}/`
   - Documentación se organiza por proyecto

---

## 📝 Crear Nuevo Proyecto

Para agregar un nuevo proyecto:

1. **Crear archivo de configuración:**
   ```bash
   cp projects/puyehue-config.json projects/nuevo-proyecto-config.json
   ```

2. **Actualizar valores:**
   ```json
   {
     "project_id": "nuevo-proyecto",
     "project_name": "Nombre del Proyecto",
     "repositories": { ... }
   }
   ```

3. **Hacer reconnaissance:**
   ```bash
   curl -X POST https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/chat \
     -d '{"message": "Haz reconnaissance de https://nuevo-sitio.com"}'
   ```

4. **Documentar:**
   - `RECONNAISSANCE_nuevo-proyecto.md`
   - `projects/nuevo-proyecto-config.json`

---

## ✨ Beneficios

- ✅ **Separación clara** de proyectos
- ✅ **Tracking automático** de estado
- ✅ **Evidencia organizada** por proyecto
- ✅ **Escalable** para múltiples proyectos
- ✅ **Integrado con MCP** para automatización
- ✅ **Documentación centralizada**

---

**Desarrollado por Sistemas - Retarget ❤️**
