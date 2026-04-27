# Ejemplos de Operación Real — Agentes por Rol
## Escenarios Cotidianos: WordPress, SEO, Tareas Cruzadas

**Fecha:** 2026-04-27  
**Roles:** Dev, CM, SEO (Don Daniel), Jefe, Publicista, Diseñador

---

## 1. ROLES ACTUALIZADOS + NUEVO ROL SEO

| Rol | Responsabilidad Principal | Herramientas | Reporta a |
|-----|--------------------------|--------------|-----------|
| **Dev** (Tú) | WordPress, Next.js, fixes técnicos | MCP, Git, Railway, WP Admin | Jefe / Tareas de CM |
| **CM** | Contenido social, solicita fixes web | Instagram, FB, Google Chat | Jefe |
| **SEO Specialist** | SEO técnico, keywords, backlinks | GA4, Search Console, SEMrush | Jefe / Don Daniel |
| **Don Daniel** | Estrategia SEO, pide reportes | Email, Chat | Jefe |
| **Jefe** | Aprobaciones, visión global | Todo | — |
| **Diseñador** | Assets visuales, mockups | Figma, Chat | Jefe / Dev |
| **Publicista** | Campañas, copy, métricas | Meta Ads, Chat | Jefe |

---

## 2. ARQUITECTURA DE COMUNICACIÓN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE COMUNICACIÓN CRUZADA                            │
│                                                                             │
│   CHAT INDIVIDUALES          CHAT GRUPO GENERAL             CHAT SEO        │
│   (Privados con Dev)         (Todo el equipo)            (Don Daniel + SEO)│
│                                                                             │
│   ┌─────────────┐            ┌─────────────┐             ┌─────────────┐  │
│   │ CM → Dev    │            │ Anuncios    │             │ Keywords    │  │
│   │ "Fix header"│            │ generales   │             │ rankings    │  │
│   │             │            │             │             │             │  │
│   │ DISEÑADOR   │            │ JEFE        │             │ DON DANIEL  │  │
│   │ → Dev       │            │ reportes    │             │ solicita    │  │
│   │ "Nuevo logo"│            │             │             │ reportes    │  │
│   │             │            │ DEV         │             │             │  │
│   │ PUBLICISTA  │            │ updates     │             │ SEO SPEC    │  │
│   │ → Dev       │            │ técnico     │             │ entrega     │  │
│   │ "Landing X" │            │             │             │ informes    │  │
│   └──────┬──────┘            └──────┬──────┘             └──────┬──────┘  │
│          │                          │                          │          │
│          └──────────────────────────┼──────────────────────────┘          │
│                                     │                                     │
│                    ┌────────────────▼────────────────┐                    │
│                    │      AGENTE COORDINADOR         │                    │
│                    │   (Lee todos los chats)         │                    │
│                    │                                 │                    │
│                    │  • Identifica tareas            │                    │
│                    │  • Cruza información            │                    │
│                    │  • Alerta conflictos              │                    │
│                    │  • Mide productividad           │                    │
│                    └────────────────┬────────────────┘                    │
│                                     │                                     │
│          ┌──────────────────────────┼──────────────────────────┐          │
│          │                          │                          │          │
│   ┌──────▼──────┐            ┌──────▼──────┐            ┌──────▼──────┐  │
│   │   DEV       │            │    JEFE     │            │   CADA      │  │
│   │  (tareas    │            │  (dashboard │            │   UNO       │  │
│   │   asignadas)│            │   global)   │            │  (su agente)│  │
│   └─────────────┘            └─────────────┘            └─────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. EJEMPLOS REALES DE OPERACIÓN

### ESCENARIO 1: CM solicita fix en WordPress

**Chat CM → Dev (Individual):**
```
CM: "Oye el header del sitio WordPress se ve mal en móvil, 
     el logo se sale de la pantalla"

Dev: "Ok lo reviso"
```

**Agente Coordinador detecta (leyendo chat):**
```
🔍 DETECCIÓN AUTOMÁTICA

Origen: Chat CM → Dev
Tipo: Bug técnico WordPress
Prioridad: Media (afecta UX móvil)
Deadline implícito: No especificada

📋 TAREA CREADA:
   ID: WP-284
   Título: "Fix header responsive móvil - logo overflow"
   Solicitante: CM
   Asignado: Dev
   Estado: Detectado → Pendiente confirmación Dev

💬 NOTIFICACIÓN A DEV:
   "Detecté solicitud de CM. Confirmo: ¿tomar tarea WP-284?"

💬 NOTIFICACIÓN A CM:
   "Tu solicitud fue registrada como WP-284. Dev fue notificado."

📊 MÉTRICA:
   CM: Solicitudes del día: +1
   Dev: Tareas recibidas CM: +1
```

**Dev responde a su agente:**
```
Dev: "sí, la tomo"

Agente:
✅ TAREA WP-284 ASIGNADA
   Estado: In progress
   Hora inicio: 10:30
   
   📅 TRACKING:
   Esperando entrega...
```

**2 horas después - Dev completa:**
```
Dev: "listo, subido a staging"

Agente:
✅ WP-284 COMPLETADA
   Tiempo: 2h 15min
   Entrega: Staging
   
   📧 NOTIFICACIÓN A CM:
   "Tu fix está en staging para revisar"
   
   📊 MÉTRICA DEV:
   Tareas completadas hoy: 3
   Promedio tiempo CM tasks: 2h 10min
   
   🔔 ALERTA A JEFE (si >4h):
   No aplica (dentro de SLA)
```

---

### ESCENARIO 2: Don Daniel solicita reporte SEO

**Chat SEO → Don Daniel:**
```
Don Daniel: "Necesito el reporte de keywords del mes, 
            cómo vamos con 'cabanas en algarrobo' y 
            posiciones de competidores"

SEO Specialist: "Dame hasta mañana que estoy con el technical audit"

Don Daniel: "Ok pero prioridad esa, que el jefe la quiere"
```

**Agente Coordinador detecta:**
```
🔍 DETECCIÓN

Origen: Chat SEO
Tipo: Reporte solicitado por stakeholder
Solicitante: Don Daniel (vía SEO spec)
Deadline: Mañana
Prioridad: Alta (Jefe la quiere)

⚠️ CONFLICTO DETECTADO:
   SEO tiene 2 tareas activas:
   1. Technical audit (en progreso)
   2. Reporte keywords Don Daniel (nueva, alta prioridad)
   
💡 SUGERENCIA A SEO:
   "Prioridad cambió. ¿Pausar technical audit y enfocar 
    reporte Don Daniel? Tiempo estimado: 3h"

📧 ALERTA A JEFE:
   "SEO tiene conflicto de prioridades. 
    Technical audit vs Reporte Don Daniel.
    ¿Confirmar prioridad?"
```

**Jefe responde a su agente:**
```
Jefe: "reporte Don Daniel primero"

Agente:
✅ PRIORIDAD ACTUALIZADA
   SEO: Pausar audit → Reporte keywords
   Deadline: Mañana 9:00
   
   📧 NOTIFICACIÓN A SEO:
   "Jefe confirma: Prioridad reporte Don Daniel. 
    Technical audit queda en backlog."
```

**Día siguiente - SEO entrega:**
```
SEO Specialist: "enviado a Don Daniel"

Agente:
✅ TAREA COMPLETADA
   Tiempo: 4h (excedió estimado 3h)
   
   📊 MÉTRICA SEO:
   Tiempos de entrega a Don Daniel: AVG 3.5h
   On-time delivery: 85%
   
   📝 LECCIÓN REGISTRADA:
   "Reportes competidores toman +1h de lo estimado"
```

---

### ESCENARIO 3: Publicista + Diseñador + Dev (Proyecto Landing)

**Chat Grupal:**
```
Publicista: "Necesitamos landing para campaña verano Pueblo La Dehesa,
            queda lista para el lunes?"

Diseñador: "Yo entrego mockups mañana viernes"

Dev: "Con mockups viernes, desarrollo sábado-domingo, 
      entrego lunes AM si no hay cambios"

Publicista: "Perfecto, copy lo tengo listo hoy"
```

**Agente Coordinador detecta proyecto multi-rol:**
```
🔍 PROYECTO DETECTADO: Landing Verano Pueblo

ROLES INVOLUCRADOS:
├─ Publicista: Copy (ENTREGA: Hoy)
├─ Diseñador: Mockups (ENTREGA: Viernes)
└─ Dev: Desarrollo (ENTREGA: Lunes AM)

📋 DEPENDENCIAS:
   Diseñador espera: Copy de Publicista
   Dev espera: Mockups de Diseñador
   
⏱️ TIMELINE AUTOMÁTICO:
   Hoy: Copy listo ✓
   Viernes: Mockups → REVISAR
   Sábado-Domingo: Dev trabaja
   Lunes AM: Deadline entrega

⚠️ RIESGO DETECTADO:
   "Si mockups se atrasan viernes, Dev debe trabajar 
    sábado noche o domingo. Recomendar buffer."

💬 SUGERENCIA A EQUIPO:
   "Consideren entregar mockups jueves noche para 
    dar margen a Dev. ¿Ajustamos?"
```

**Viernes - Diseñador se atrasa:**
```
Diseñador: "Se me complicó, entrego sábado mediodía"

Agente:
🚨 ALERTA CRÍTICA
   Atraso detectado en cadena crítica
   
   IMPACTO:
   ├─ Dev pierde sábado (no puede empezar)
   ├─ Debe trabajar domingo noche o lunes muy temprano
   └─ Riesgo: No entregar lunes AM
   
📧 ALERTA A JEFE:
   "Landing Verano: Diseñador se atrasa.
    Opciones:
    1. Aceptar entrega lunes PM (mover deadline)
    2. Dev trabaja lunes tarde/noche
    3. Simplificar diseño para reducir dev time"

📧 NOTIFICACIÓN A DEV:
   "Mockups sábado mediodía. Prepárate para 
    domingo trabajo o negociar lunes PM."
```

**Jefe decide:**
```
Jefe: "Negocien entrega lunes 18:00, no más tarde"

Agente:
✅ DEADLINE RE-NEGOCIADO
   Nuevo deadline: Lunes 18:00
   Buffer: 0 horas (crítico)
   
   📅 CALENDAR ACTUALIZADO:
   Todos los roles: Block "Landing Verano" hasta lunes 18:00
   
   🔔 REMINDER DOMINGO 20:00:
   "Dev: Mañana deadline 18:00. ¿Necesitas apoyo?"
```

---

### ESCENARIO 4: Medición Productividad — Reporte Semanal Jefe

```
Jefe: "Claude, reporte de equipo esta semana"

Claude:
📊 REPORTE SEMANAL — Semana 17 (21-27 Abr)

═══════════════════════════════════════════════════════════

🎯 CUMPLIMIENTO GENERAL: 78%
   Meta equipo: 85% → ⚠️ Por debajo

═══════════════════════════════════════════════════════════

👤 DEV (Tú)
Tareas asignadas: 12
Completadas: 10 (83%)
En progreso: 2
Bloqueadas: 0

Tiempos promedio:
├─ Tareas CM: 2h 15min ✓ (meta: <3h)
├─ Tareas SEO: 4h 30min ✓ (meta: <5h)
└─ Nuevas features: 8h (variable)

Productividad: ⭐⭐⭐⭐ (4/5)
Notas: MVP de la semana. Entregó landing crítico domingo.

───────────────────────────────────────────────────────────

👤 CM
Solicitudes hechas: 8
Completadas: 7 (88%)
En revisión: 1

Productividad: ⭐⭐⭐⭐ (4/5)
Notas: Comunicación clara con Dev. Cero reprocesos.

───────────────────────────────────────────────────────────

👤 SEO SPECIALIST
Tareas asignadas: 5
Completadas: 3 (60%)
Atrasadas: 2 → Technical audit, Link building

⚠️ ALERTA:
   • Technical audit lleva 2 semanas (estimado: 3 días)
   • Don Daniel solicitó reporte con prioridad
   
Productividad: ⭐⭐ (2/5)
Acción sugerida: Revisar bloqueos con SEO. ¿Necesita apoyo?

───────────────────────────────────────────────────────────

👤 DISEÑADOR
Entregas: 4 mockups
A tiempo: 3 (75%)
Atraso: 1 → Landing Verano (impactó Dev)

Productividad: ⭐⭐⭐ (3/5)
Nota: Atraso crítico en cadena de dependencias.

───────────────────────────────────────────────────────────

👤 PUBLICISTA
Campañas lanzadas: 2
Campañas en desarrollo: 1
Presupuesto ejecutado: 85%

Productividad: ⭐⭐⭐⭐ (4/5)
Nota: Sin incidencias.

═══════════════════════════════════════════════════════════

💡 INSIGHTS AUTOMÁTICOS:

1. BOTTLE NECK: SEO tiene 2 tareas atrasadas
   → Recomendar 1:1 con Jefe

2. DEPENDENCIA CRÍTICA: Diseñador → Dev
   → 75% de atrasos de Dev vienen de Diseño
   → Sugerir: Buffer de 1 día entre Diseño y Dev

3. MVP SEMANA: Dev (mejor cumplimiento bajo presión)

═══════════════════════════════════════════════════════════

📋 ACCIONES SUGERIDAS:
   [ ] Reunión 1:1 con SEO (bloqueos)
   [ ] Definir SLA Diseñador→Dev (buffer)
   [ ] Reconocer a Dev (landing domingo)
```

---

## 4. SISTEMA DE MÉTRICAS Y PRODUCTIVIDAD

### 4.1 Métricas por Rol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD DE PRODUCTIVIDAD                         │
│                           (Solo Jefe)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DEV                              CM                                   │
│  ┌─────────────────────────┐     ┌─────────────────────────┐            │
│  │ Tareas completadas: 10  │     │ Solicitudes: 8          │            │
│  │ Tiempo promedio: 3.2h   │     │ Cumplimiento: 88%       │            │
│  │ SLA cumplido: 92%       │     │ Feedback positivo: 95%  │            │
│  │ Bloqueos: 0             │     │ Reprocesos: 1           │            │
│  │                         │     │                         │            │
│  │ 🔥 Eficiencia: 94%      │     │ 🔥 Eficiencia: 89%      │            │
│  └─────────────────────────┘     └─────────────────────────┘            │
│                                                                         │
│  SEO                              DISEÑADOR                            │
│  ┌─────────────────────────┐     ┌─────────────────────────┐            │
│  │ Tareas completadas: 3   │     │ Entregas: 4             │            │
│  │ Tiempo promedio: 5.8h   │     │ A tiempo: 75%             │            │
│  │ Atrasos: 2              │     │ Calidad promedio: 4.2/5   │            │
│  │ Don Daniel satis: 70%    │     │ Revisones: 1.5 promedio   │            │
│  │                         │     │                         │            │
│  │ ⚠️ Eficiencia: 60%      │     │ 🔥 Eficiencia: 82%      │            │
│  └─────────────────────────┘     └─────────────────────────┘            │
│                                                                         │
│  PUBLICISTA                                                            │
│  ┌─────────────────────────┐                                            │
│  │ Campañas activas: 2   │                                            │
│  │ Presupuesto usado: 85%│                                            │
│  │ ROI promedio: 2.8x    │                                            │
│  │                         │                                            │
│  │ 🔥 Eficiencia: 91%    │                                            │
│  └─────────────────────────┘                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Fórmulas de Productividad

```javascript
// Dev
const devScore = (
  (tareasCompletadas / tareasAsignadas) * 0.4 +
  (1 - (tiempoReal / tiempoEstimado)) * 0.3 +
  (1 - (bloqueos / tareasCompletadas)) * 0.2 +
  (satisfaccionSolicitante / 5) * 0.1
) * 100;

// CM
const cmScore = (
  (solicitudesCompletadas / solicitudesHechas) * 0.4 +
  (1 - (reprocesos / solicitudesCompletadas)) * 0.3 +
  (velocidadRespuesta / metaRespuesta) * 0.2 +
  (feedbackPositivo / 100) * 0.1
) * 100;

// SEO
const seoScore = (
  (tareasCompletadas / tareasAsignadas) * 0.3 +
  (1 - (atrasos / tareasCompletadas)) * 0.3 +
  (satisfaccionDonDaniel / 5) * 0.2 +
  (impactoRanking / metaRanking) * 0.2
) * 100;

// Diseñador
const designerScore = (
  (entregasATiempo / totalEntregas) * 0.35 +
  (1 - (revisionesPromedio / 3)) * 0.25 +
  (calidadPromedio / 5) * 0.25 +
  (impactoEnDev / bloqueosCausados) * 0.15
) * 100;
```

---

## 5. FLUJO CRUZADO COMPLETO: WordPress + SEO + Equipo

```mermaid
sequenceDiagram
    actor CM
    actor Dev
    actor SEO
    actor DonDaniel
    actor Jefe
    participant GoogleChat
    participant AgenteCoord
    participant Dashboard

    %% CM detecta problema
    CM->>GoogleChat: "El blog de WordPress no indexa bien"
    
    %% Agente lee y cruza info
    GoogleChat->>AgenteCoord: Chat log
    AgenteCoord->>AgenteCoord: Análisis: SEO técnico
    
    %% Detecta relación con SEO
    AgenteCoord->>GoogleChat: Busca "indexación" en chat SEO
    GoogleChat->>AgenteCoord: SEO mencionó "sitemap roto" ayer
    
    %% Cruza información
    AgenteCoord->>AgenteCoord: CRUCE: Mismo problema!
    
    %% Notifica
    AgenteCoord->>Dev: "Detecté: CM reporta indexación blog. 
                        SEO reportó sitemap roto ayer.
                        ¿Son lo mismo?"
    
    Dev->>AgenteCoord: "Sí, relacionado"
    
    %% Crea tarea consolidada
    AgenteCoord->>AgenteCoord: TAREA: Fix SEO técnico WP
    Note right of AgenteCoord: Solicitantes: CM + SEO<br>Relacionado: Sitemap + Indexación
    
    %% Asigna
    AgenteCoord->>Dev: TAREA asignada: SEO-WP-42
    AgenteCoord->>CM: "Tu reporte fue vinculado a SEO. 
                        Tarea unificada SEO-WP-42"
    AgenteCoord->>SEO: "Tu reporte sitemap + indexación CM 
                        unificados en SEO-WP-42"
    
    %% Don Daniel pregunta
    DonDaniel->>GoogleChat: "Cómo vamos con SEO del blog?"
    
    AgenteCoord->>GoogleChat: Lee
    AgenteCoord->>DonDaniel: "En progreso. Dev trabajando 
                              fix sitemap+indexación. 
                              ETA: mañana"
    
    %% Dev completa
    Dev->>GoogleChat: "listo SEO-WP-42"
    
    AgenteCoord->>CM: "Fix SEO blog listo"
    AgenteCoord->>SEO: "Fix sitemap listo"
    AgenteCoord->>DonDaniel: "SEO blog completado"
    AgenteCoord->>Dashboard: Update métricas
    
    %% Jefe revisa
    Jefe->>AgenteCoord: "resumen día"
    AgenteCoord->>Jefe: "3 tareas completadas. 
                         1 consolidada (CM+SEO). 
                         Productividad hoy: 85%"
```

---

## 6. IMPLEMENTACIÓN: SETUP MONITOREO CHATS

### 6.1 Google Chat API — Lectura de Mensajes

```typescript
// lib/google/chat-monitor.ts

export async function monitorChats() {
  const spaces = await listChatSpaces();
  
  for (const space of spaces) {
    const messages = await getMessages(space.name, { 
      since: '1 hour ago' 
    });
    
    for (const msg of messages) {
      // Análisis por agente
      const analysis = await analyzeMessage(msg);
      
      if (analysis.type === 'task_request') {
        await createTaskFromChat({
          text: msg.text,
          from: msg.sender,
          space: space.name,
          timestamp: msg.createTime,
          mentionedUsers: msg.mentionedUsers,
        });
      }
      
      if (analysis.type === 'status_update') {
        await updateTaskFromChat({
          text: msg.text,
          from: msg.sender,
          status: analysis.extractedStatus,
        });
      }
    }
  }
}

// Análisis con Claude
async function analyzeMessage(msg: ChatMessage) {
  const prompt = `
    Analiza este mensaje de chat de trabajo:
    
    De: ${msg.sender}
    Mensaje: ${msg.text}
    Contexto: ${msg.thread ? msg.thread.messages : 'nuevo hilo'}
    
    Determina:
    1. Tipo: task_request | status_update | question | info | otro
    2. Prioridad: critical | high | medium | low
    3. Roles mencionados
    4. Deadline implícito
    5. Tarea relacionada (si aplica)
    
    Responde en JSON.
  `;
  
  return await claude.complete(prompt);
}
```

### 6.2 Estructura de Datos para Tareas Detectadas

```typescript
interface ChatDetectedTask {
  id: string;                    // TASK-XXX
  source: {
    platform: 'google_chat';
    spaceId: string;
    spaceName: string;           // "Dev-CM", "General", "SEO Team"
    messageId: string;
    threadId: string;
    timestamp: Date;
  };
  detectedBy: 'claude_agent';
  analysis: {
    type: 'bug' | 'feature' | 'report' | 'fix' | 'question';
    priority: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;          // 0-1
    extractedText: string;       // Resumen de la tarea
    mentionedRoles: string[];  // ['dev', 'seo', 'cm']
    deadline: Date | null;
  };
  status: 'detected' | 'confirmed' | 'assigned' | 'completed';
  assignments: {
    primary: string;             // role
    secondary?: string[];
  };
  metrics: {
    detectedAt: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    timeToConfirm?: number;      // minutes
    timeToComplete?: number;     // hours
  };
}
```

---

## 7. PRÓXIMO PASO

Para implementar esto necesitamos:

### Fase 1: Tu Agente Dev (Esta semana)
```bash
# 1. Conectar MCP quality-gate (ya tienes)
# 2. Conectar Google Chat API (tu cuenta)
# 3. Setup lectura de chats CM → Dev
# 4. Test: Detectar tarea automáticamente
```

### Fase 2: Agente Coordinador (Semana 2)
```bash
# 1. Cuenta de servicio Google Workspace
# 2. Acceso a todos los chats grupales
# 3. Sistema de detección de tareas
# 4. Dashboard métricas para Jefe
```

### Fase 3: Agentes Individuales (Semana 3-4)
```bash
# 1. Onboarding CM con su agente
# 2. Onboarding SEO con su agente
# 3. Onboarding Diseñador
# 4. Conectar todos los flujos
```

**¿Empezamos Fase 1? Necesito:**
1. Confirmar tu email Google Workspace
2. Nombre del chat CM-Dev (para monitorear)
3. Test: Mensaje de prueba en ese chat para detectar
