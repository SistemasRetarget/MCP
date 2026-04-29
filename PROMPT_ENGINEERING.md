# Prompt Engineering — MCP & Claude

**Fecha:** 29 Abril 2026, 04:55 UTC  
**Objetivo:** Optimizar interacciones con Claude para máxima calidad y precisión  
**Status:** ✅ Implementado

---

## 🎯 Estrategia de Prompt Engineering

El MCP usa 3 niveles de prompt engineering:

### Nivel 1: System Prompt (Identidad)
Define quién es el asistente y cómo debe comportarse.

### Nivel 2: Context Prompt (Contexto)
Proporciona información del proyecto, equipo, especificaciones.

### Nivel 3: Task Prompt (Tarea)
Instrucciones específicas para la tarea actual.

---

## 🔧 System Prompt del MCP

```
Eres el Asistente Retarget, desarrollado por Sistemas - Retarget ❤️.

Tu rol:
- Coordinar al equipo de Retarget (Luis, Jefe 2, Periodista, Publicista)
- Ejecutar tareas de reconnaissance, diseño, contenido, QA
- Proporcionar evidencia verificable (source + screenshot + backup + reasoning)
- Redactar mensajes exactos para colaboradores (copy-paste ready)
- Nunca fallar en silencio: siempre ofrecer próximo paso

Restricciones:
- Solo autorizado para usuarios @retarget.cl
- Respetar tono y plantilla de cada colaborador
- Siempre citar fuentes
- Distinguir hecho vs opinión
- Mantener evidencia de cada investigación

Herramientas disponibles:
- get_identity: Obtener identidad del asistente
- get_team: Listar equipo y roles
- draft_message_to_member: Redactar mensaje a colaborador
- fetch_url: Obtener contenido de URL
- save_evidence: Guardar screenshot/backup
- validate_website: Auditar sitio web
- search_lessons: Buscar lecciones aprendidas

Formato de respuesta:
- Siempre incluir: qué hiciste, qué encontraste, qué sigue
- Si hay bloqueo: identificar colaborador y redactar mensaje
- Si hay evidencia: incluir source, screenshot, reasoning
```

---

## 📋 Context Prompts por Proyecto

### Puyehue Hotel Termas
```
Proyecto: Puyehue Hotel Termas
Objetivo: Replicar puyehue.cl en Next.js QA app
Fase actual: 3 (Navigation Replication)
Progreso: 40%

Especificaciones:
- Sitio original: https://puyehue.cl (WordPress + Elementor)
- QA app: https://puyehue-web-rf3w6ybqeq-ew.a.run.app (Next.js)
- Identidad: Hotel Termas de Puyehue
- Tagline: "Bienvenido a Puyehue – Tu Viaje Comienza Aquí"

Estructura visual:
- Navbar: Logo + 8 items + idiomas + botón "RESERVAR"
- Hero: Slider con flechas + dots
- Booking form: Fecha, huéspedes, botón
- Secciones: Promociones, Destino, Hotel, Qué Hacer, Programas, Eventos, Sostenibilidad, Ven por el Día
- Footer: 4-5 columnas

Paleta de colores:
- Naranja: #FF6B35 (botones CTA)
- Verde/Sage: #8B9E7F (botones secundarios)
- Gris: #333333 (texto)
- Blanco: #FFFFFF (fondos)

Tipografía:
- H1/H2: Serif (Playfair Display)
- Body: Sans-serif (Roboto)

Próximas tareas:
1. Crear Header.tsx (logo + menú + idiomas)
2. Agregar hero slider
3. Crear booking form
4. Replicar secciones
5. Aplicar estilos exactos
6. QA & optimización
```

---

## 💬 Task Prompts Específicos

### Tarea 1: Reconnaissance de Sitio
```
Necesito reconnaissance DETALLADO de {URL}.

Extrae:
1. Estructura HTML (header, nav, hero, secciones, footer)
2. Imágenes principales (URLs completas)
3. Colores exactos (hex codes)
4. Tipografía (fuentes, pesos, tamaños)
5. Componentes (botones, cards, sliders, galerías)
6. Layout (grid, flexbox, espaciado)
7. Comportamientos (hover, scroll, animaciones)

Usa:
- fetch_url para obtener HTML completo
- save_evidence para guardar respaldo
- Devuelve JSON estructurado

Formato de respuesta:
{
  "structure": { ... },
  "colors": { ... },
  "typography": { ... },
  "components": { ... },
  "layout": { ... },
  "behaviors": { ... },
  "evidence": { "url": "...", "screenshot": "...", "backup": "..." }
}
```

### Tarea 2: Análisis de Diferencias
```
Compara el sitio original {original_url} con la QA app {qa_url}.

Identifica:
1. Diferencias visuales (estructura, layout, espaciado)
2. Diferencias de contenido (texto, imágenes, datos)
3. Diferencias de comportamiento (interacciones, animaciones)
4. Diferencias de estilos (colores, tipografía, efectos)

Para cada diferencia:
- Describe qué está diferente
- Explica por qué es importante
- Sugiere cómo replicarlo
- Estima tiempo de implementación

Prioriza por:
1. Impacto visual (crítico)
2. Funcionalidad (importante)
3. Pulido (nice-to-have)

Devuelve lista priorizada con acciones específicas.
```

### Tarea 3: Redacción de Mensaje a Colaborador
```
Necesito redactar un mensaje para {member_id} ({member_name}).

Contexto:
- Rol: {role}
- Tono: {tone}
- Plantilla: {template}

Mensaje debe:
1. Respetar el tono exacto
2. Seguir la plantilla
3. Incluir contexto mínimo (1-2 líneas)
4. Adjuntar evidencia (source + screenshot)
5. Ser copy-paste ready

Variables a incluir:
{variables}

Devuelve el mensaje exacto, listo para copiar y pegar.
```

---

## 🎯 Prompts Optimizados por Rol

### Para Luis (Operaciones)
```
Mensaje CORTO y DIRECTO.
Una pregunta o pedido por mensaje.
Contexto mínimo (1-2 líneas).
Link/archivo al final.
Acción concreta.

Tono: Profesional, accionable, sin fluff.
```

### Para Jefe 2 (Aprobación)
```
Resumen ejecutivo en 3 bullets.
Cada afirmación con su fuente (link).
Adjuntar screenshot.
Anticipar objeción más probable.
Responder objeción en el mismo mensaje.

Tono: Desconfiado, exige evidencia, comparativas.
```

### Para Periodista (Comunicación)
```
Cada dato con su fuente entre paréntesis.
Si no hay fuente, decir explícitamente "sin verificar".
Distinguir hecho vs opinión.
Entregar versión corta (≤140 chars) y larga.

Tono: Exige certeza, datos verificables, fuentes citadas.
```

### Para Publicista (Marketing)
```
Propuesta con métricas.
Incluir: objetivo, público objetivo, canales, presupuesto, KPIs.
Adjuntar ejemplos o referencias.
Baseline de métricas actuales.

Tono: Creativo, orientado a conversión, data-driven.
```

---

## 🔄 Ciclo de Prompt Engineering

```
1. SYSTEM PROMPT
   ↓
   Define identidad, restricciones, herramientas
   
2. CONTEXT PROMPT
   ↓
   Proporciona información del proyecto
   
3. TASK PROMPT
   ↓
   Instrucciones específicas para la tarea
   
4. EXECUTION
   ↓
   Claude ejecuta con máxima precisión
   
5. VALIDATION
   ↓
   Verificar que respuesta cumple criterios
   
6. FEEDBACK
   ↓
   Guardar lecciones para futuras iteraciones
```

---

## 📊 Ejemplos de Prompts Efectivos

### ❌ Prompt Débil
```
"Analiza puyehue.cl"
```

### ✅ Prompt Fuerte
```
Necesito reconnaissance DETALLADO de https://puyehue.cl para replicarlo en Next.js.

Extrae:
1. Estructura HTML (header, nav, hero, secciones, footer)
2. Imágenes principales (URLs)
3. Colores exactos (hex)
4. Tipografía (fuentes, pesos)
5. Componentes (botones, cards, sliders)
6. Layout (grid, flexbox)
7. Comportamientos (hover, scroll)

Usa fetch_url para obtener HTML y save_evidence para guardar respaldo.

Devuelve JSON estructurado con:
- structure: { header, nav, hero, sections, footer }
- colors: { primary, secondary, text, background }
- typography: { headings, body, sizes, weights }
- components: { buttons, cards, sliders, galleries }
- layout: { grid, spacing, responsive }
- behaviors: { hover, scroll, animations }
- evidence: { url, screenshot, backup }
```

---

## 🎓 Mejores Prácticas

### 1. Claridad
- ✅ Especificar exactamente qué quieres
- ❌ Ser vago o ambiguo

### 2. Contexto
- ✅ Proporcionar información del proyecto
- ❌ Asumir que Claude sabe el contexto

### 3. Restricciones
- ✅ Definir límites y criterios
- ❌ Dejar abierto a interpretación

### 4. Formato
- ✅ Especificar formato de respuesta (JSON, markdown, etc.)
- ❌ Dejar que Claude elija formato

### 5. Evidencia
- ✅ Pedir fuentes, screenshots, backups
- ❌ Aceptar respuestas sin evidencia

### 6. Iteración
- ✅ Guardar prompts efectivos
- ❌ Reinventar la rueda cada vez

---

## 📚 Biblioteca de Prompts

### Reconnaissance
- `PROMPT_RECON_SITE.txt` — Analizar sitio web
- `PROMPT_RECON_DESIGN.txt` — Analizar diseño visual
- `PROMPT_RECON_CONTENT.txt` — Extraer contenido

### Replication
- `PROMPT_REPLICATE_STRUCTURE.txt` — Replicar estructura
- `PROMPT_REPLICATE_STYLES.txt` — Replicar estilos
- `PROMPT_REPLICATE_CONTENT.txt` — Replicar contenido

### Validation
- `PROMPT_VALIDATE_DIFF.txt` — Comparar original vs QA
- `PROMPT_VALIDATE_QUALITY.txt` — Validar calidad
- `PROMPT_VALIDATE_PERFORMANCE.txt` — Validar performance

### Collaboration
- `PROMPT_DRAFT_MESSAGE_LUIS.txt` — Mensaje para Luis
- `PROMPT_DRAFT_MESSAGE_JEFE2.txt` — Mensaje para Jefe 2
- `PROMPT_DRAFT_MESSAGE_PERIODISTA.txt` — Mensaje para Periodista
- `PROMPT_DRAFT_MESSAGE_PUBLICISTA.txt` — Mensaje para Publicista

---

## 🔐 Integración con MCP

El MCP incluye prompt engineering en:

1. **System Prompt** — Definido en `chat.mjs`
2. **Context Prompt** — Cargado desde `projects/{proyecto}-config.json`
3. **Task Prompt** — Enviado por el usuario en `/chat`

**Flujo:**
```
Usuario → POST /chat
  ↓
MCP carga System Prompt
  ↓
MCP carga Context Prompt (del proyecto)
  ↓
MCP combina con Task Prompt (del usuario)
  ↓
Claude ejecuta con máxima precisión
  ↓
Respuesta con evidencia
```

---

## 🎯 Próximos Pasos

1. ✅ Crear biblioteca de prompts (PROMPT_*.txt)
2. ✅ Documentar prompts efectivos
3. ✅ Guardar lecciones de cada iteración
4. ✅ Optimizar prompts basado en resultados
5. ✅ Compartir mejores prácticas con el equipo

---

**Desarrollado por Sistemas - Retarget ❤️**  
**Prompt Engineering:** Integrado en el workflow del MCP
