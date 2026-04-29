# Configuración de Roles en el MCP

**Fecha:** 29 Abril 2026, 04:10 UTC  
**Objetivo:** Permitir que usuarios específicos se conecten al MCP con roles personalizados  
**Status:** ✅ Implementado

---

## 🎯 Roles Disponibles

El MCP ahora soporta 4 roles principales:

### 1. Luis — Operaciones / Implementación
- **Email:** luis@retarget.cl
- **Especialidad:** Infraestructura, credenciales, configuración, permisos
- **Tono:** Directo, accionable
- **Cuándo contactar:** Se necesita acceso, credencial, secreto o hay bloqueo de permisos

### 2. Jefe 2 — Aprobación / Validación
- **Email:** jefe2@retarget.cl (o similar)
- **Especialidad:** Aprobaciones, decisiones gerenciales, justificación de costos
- **Tono:** Desconfiado, exige evidencia
- **Cuándo contactar:** Se necesita OK para cambios en producción, justificar decisión técnica

### 3. Periodista — Comunicación Externa
- **Email:** periodista@retarget.cl (o similar)
- **Especialidad:** Comunicación pública, contenido institucional, datos verificados
- **Tono:** Exige certeza, datos con fuentes
- **Cuándo contactar:** Comunicar algo al público, redactar texto institucional

### 4. **Publicista — Marketing / Contenido Publicitario** ✨ NUEVO
- **Email:** publicista@retarget.cl (o similar)
- **Especialidad:** Estrategia de marketing, campañas, contenido publicitario, optimización de conversión
- **Tono:** Creativo, orientado a conversión, data-driven
- **Cuándo contactar:** Se necesita estrategia de marketing, crear campaña, análisis de audiencia

---

## 🔐 Cómo Agregar un Usuario Publicista

### Opción 1: Email Específico (Recomendado)

**Paso 1:** Crear el email en Google Workspace
```bash
# En Google Admin Console:
# 1. Ir a Usuarios
# 2. Crear usuario: publicista@retarget.cl
# 3. Asignar contraseña temporal
```

**Paso 2:** El usuario se conecta al MCP
```bash
# El usuario abre:
https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/

# POST /auth/check con:
{
  "email": "publicista@retarget.cl",
  "name": "Publicista"
}

# Respuesta:
{
  "authorized": true,
  "greeting": "Hola Publicista, soy el Asistente de Retarget...",
  "role": "publicista"
}
```

**Paso 3:** El MCP reconoce automáticamente el rol
- El MCP consulta `contracts/team.json`
- Identifica que `publicista@retarget.cl` es un miembro
- Carga su tono, plantilla de mensajes y triggers

---

### Opción 2: Alias de Email

Si no quieres crear un usuario separado, puedes usar un alias:

```bash
# En Google Admin Console:
# 1. Ir a Usuarios > luis@retarget.cl
# 2. Agregar alias: publicista@retarget.cl
# 3. El usuario puede usar cualquiera de los dos emails
```

---

### Opción 3: Rol Dinámico (Avanzado)

Si quieres que un usuario tenga múltiples roles:

```json
{
  "id": "luis-publicista",
  "name": "Luis",
  "email": "luis@retarget.cl",
  "roles": ["operaciones", "publicista"],
  "primary_role": "operaciones"
}
```

---

## 📋 Plantilla de Mensaje para Publicista

Cuando el MCP necesita contactar al publicista:

```
Publicista:
• Objetivo: {objetivo_campaña}
• Público objetivo: {audiencia}
• Canales: {canales}
• Presupuesto estimado: {presupuesto}
• KPIs esperados: {kpis}
• Referencia: {ejemplo_url}
Métricas actuales: {metricas_baseline}
```

**Ejemplo:**
```
Publicista:
• Objetivo: Aumentar conversiones en landing de Puyehue en 15%
• Público objetivo: Turistas 25-55 años, interés en termas y naturaleza
• Canales: Google Ads, Facebook, Instagram
• Presupuesto estimado: $2,000 USD/mes
• KPIs esperados: CTR >3%, CPC <$1.5, Conversión >2%
• Referencia: https://puyehue.cl/promociones
Métricas actuales: CTR 1.2%, CPC $2.3, Conversión 0.8%
```

---

## 🔌 Endpoints para Roles

### 1. Obtener Lista de Miembros del Equipo
```bash
GET /team
```

**Respuesta:**
```json
{
  "members": [
    {
      "id": "luis",
      "name": "Luis",
      "role": "Operaciones / Implementación",
      "tone": "directo, accionable"
    },
    {
      "id": "jefe-2",
      "name": "Jefe 2",
      "role": "Aprobación / Validación de decisiones",
      "tone": "desconfiado — exige evidencia y comparativas"
    },
    {
      "id": "periodista",
      "name": "Periodista",
      "role": "Comunicación externa / Contenido público",
      "tone": "exige certeza, datos verificables, fuentes citadas"
    },
    {
      "id": "publicista",
      "name": "Publicista",
      "role": "Estrategia de marketing / Contenido publicitario",
      "tone": "creativo, orientado a conversión, data-driven"
    }
  ]
}
```

### 2. Redactar Mensaje para Publicista
```bash
POST /notify
```

**Request:**
```json
{
  "member_id": "publicista",
  "vars": {
    "objetivo_campaña": "Aumentar tráfico a puyehue.cl",
    "audiencia": "Turistas 25-55 años",
    "canales": "Google Ads, Facebook, Instagram",
    "presupuesto": "$2,000 USD/mes",
    "kpis": "CTR >3%, CPC <$1.5, Conversión >2%",
    "ejemplo_url": "https://puyehue.cl",
    "metricas_baseline": "CTR 1.2%, CPC $2.3, Conversión 0.8%"
  }
}
```

**Respuesta:**
```json
{
  "target_member": "Publicista",
  "tone": "creativo, orientado a conversión, data-driven",
  "ready_to_send_message": "Publicista:\n• Objetivo: Aumentar tráfico a puyehue.cl\n• Público objetivo: Turistas 25-55 años\n• Canales: Google Ads, Facebook, Instagram\n• Presupuesto estimado: $2,000 USD/mes\n• KPIs esperados: CTR >3%, CPC <$1.5, Conversión >2%\n• Referencia: https://puyehue.cl\nMétricas actuales: CTR 1.2%, CPC $2.3, Conversión 0.8%"
}
```

---

## 🔄 Flujo de Trabajo con Publicista

### Escenario 1: Necesitar Estrategia de Marketing
```
Usuario: "Necesito una estrategia de marketing para Puyehue"
↓
MCP: "Voy a contactar al Publicista. Aquí está el mensaje listo para copiar/pegar:"
↓
[Mensaje redactado con plantilla]
↓
Usuario: Copia y pega el mensaje a Publicista
↓
Publicista: Responde con propuesta de campaña
```

### Escenario 2: Optimizar Conversión
```
Usuario: "La landing de Puyehue tiene conversión baja (0.8%)"
↓
MCP: "Recomiendo contactar al Publicista. Aquí está el mensaje:"
↓
[Mensaje con métricas actuales y KPIs esperados]
↓
Publicista: Propone cambios en copy, CTA, segmentación
```

### Escenario 3: Crear Campaña Publicitaria
```
Usuario: "Necesito crear una campaña para Puyehue en Google Ads"
↓
MCP: "Contactemos al Publicista. Aquí está el mensaje:"
↓
[Mensaje con objetivo, público, presupuesto, KPIs]
↓
Publicista: Crea estrategia, selecciona palabras clave, define presupuesto
```

---

## 📁 Estructura de Configuración

```
/Users/spam11/github/MCP/
├── contracts/
│   ├── team.json                    ← Define roles (incluyendo publicista)
│   └── roles/
│       ├── luis.json                ← Perfil de Luis
│       ├── jefe-2.json              ← Perfil de Jefe 2
│       ├── periodista.json          ← Perfil de Periodista
│       └── publicista.json          ← Perfil de Publicista (nuevo)
├── http-wrapper.mjs                 ← Endpoints /team, /notify
└── chat.mjs                         ← Tool-use loop con Claude
```

---

## ✅ Checklist de Implementación

- ✅ Rol "Publicista" agregado a `team.json`
- ✅ Tono y plantilla de mensaje definidos
- ✅ Triggers configurados (cuándo contactar)
- ✅ Endpoints `/team` y `/notify` soportan publicista
- ⏳ Crear usuario `publicista@retarget.cl` (acción manual)
- ⏳ Crear perfil en `contracts/roles/publicista.json` (opcional)
- ⏳ Test de conexión con publicista

---

## 🚀 Próximos Pasos

1. **Crear usuario publicista:**
   ```bash
   # En Google Admin Console
   # Crear: publicista@retarget.cl
   ```

2. **Test de conexión:**
   ```bash
   curl -X POST https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/auth/check \
     -H 'Content-Type: application/json' \
     -d '{"email":"publicista@retarget.cl","name":"Publicista"}'
   ```

3. **Obtener lista de roles:**
   ```bash
   curl https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/team | jq '.members'
   ```

4. **Redactar mensaje para publicista:**
   ```bash
   curl -X POST https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/notify \
     -H 'Content-Type: application/json' \
     -d '{"member_id":"publicista","vars":{...}}'
   ```

---

## 📚 Documentación Relacionada

- `ARCHITECTURE.html` — Diagrama del MCP con roles
- `contracts/team.json` — Definición de roles
- `http-wrapper.mjs` — Endpoints de autenticación y notificación
- `chat.mjs` — Tool-use loop con Claude

---

**Desarrollado por Sistemas - Retarget ❤️**  
**Roles soportados:** Luis, Jefe 2, Periodista, Publicista
