# 📊 Pueblo La Dehesa - Estado del Proyecto

> Archivo compartido entre desarrolladores (Cascade/Windsurf y Claude/Opus).
> Actualizado automáticamente tras cada ronda de cambios.

---

## 🎯 Sección en desarrollo: **Header + Hero Banner**

**Asignado:** Claude (Opus)
**Última actualización:** 2026-04-25 02:06 UTC-04
**Commit actual:** `f46e326`
**Deploy:** ✅ Live → https://puebloladehesa-web-production.up.railway.app

### Feedback del usuario (2026-04-25 02:00):
- ❌ No se veía logo ni texto del menu (filter blanco invisible en algunos casos)
- ✅ Header debe ser sticky: transparente arriba → fondo crema al scroll (NO negro)
- 📌 Pragmático: estructura+legibilidad, NO pixel-perfect
- 📌 Lección registrada en MCP (`lessons-log`)

### Iteración 8 — `f46e326`
- Header bg-transparent+white sobre hero
- bg-brand-bg (crema) + brand-ink text al scroll
- Logo filter condicional (invert blanco arriba, color natural al scroll)
- Contact button alterna border/text según scrolled
- Gradiente hero ya alineado (20/10/40)

---

## ✅ Validación por sección

| Sección | Estado | Diff % | Notas |
|---|---|---|---|
| **Header / Nav** | ✅ Estructura OK | n/a | Sticky transparent→cream, logo+nav visibles (`f46e326`) |
| **Hero Banner** | ✅ Estructura OK | 41% | Cordillera visible, título centrado, gradiente alineado |
| **Intro paragraph** | ✅ Texto alineado | n/a | Mismo texto que prod ("Arriendo de casas amobladas...") |
| **Casas (grid)** | ⚠️ URL diferente | n/a | Prod usa `/estadias`, QA usa `/casas` — decisión pendiente |
| **Testimonios** | ⏸️ Pendiente | - | - |
| **FAQ** | ⏸️ Pendiente | - | - |
| **Footer** | ⏸️ Pendiente | - | - |

---

## 🔍 Hero Banner — Progreso de iteraciones

### ✅ Completado
- [x] Imagen hero correcta: `amplios_horizontes_1.webp` (paisaje cordillerano)
- [x] Header 3-columnas: nav izquierda, logo centro, CTAs derecha
- [x] Logo visible con `filter: invert(1)` sobre fondo oscuro
- [x] Botones pill-shaped: `rounded-full` naranja/blanco
- [x] Altura banner: `h-[90vh] min-h-[600px]`
- [x] Gradiente: `from-black/30 via-black/20 to-black/50`
- [x] Texto centrado verticalmente
- [x] Subtítulo actualizado a texto de producción
- [x] Cookie banner oculto con `?screenshot=1`
- [x] Negative margin `-mt-20 lg:-mt-24` para header transparente sobre imagen

### 🔄 Última iteración (5)
- **Commit:** `63c65d4` — fix: negative margin so banner extends under transparent header
- **Cambio:** Agregado `-mt-20 lg:-mt-24` al hero section para que quede DEBAJO del header
- **Esperado:** Header transparente sobre imagen (sin bg cream)
- **Status:** Build en progreso, esperando validación MCP

### 📊 Progreso diff %
```
Ronda 1: 66.0%  → Layout básico
Ronda 2: 49.3%  → Imagen + logo + botones
Ronda 3: 76.7%  → (object-top empeoró)
Ronda 4: 42.9%  → Revertido object-top
Ronda 5: 36.9%  → Cookie banner oculto
Ronda 6: ???    → Esperando validación (header transparente)
```

**Meta:** < 20% diff (80% match con producción)

---

## 📋 Instrucciones para Claude (próxima iteración)

### 1. Validar último build
```bash
# Esperar ~3 min desde push de 63c65d4
# Capturar screenshot con MCP
mcp0_screenshot {
  url: "https://puebloladehesa-web-production.up.railway.app/?screenshot=1",
  project: "puebloladehesa-rediseno",
  view: "hero-banner",
  viewport_width: 1280,
  viewport_height: 900
}

# Comparar con referencia
mcp0_visual-diff {
  project: "puebloladehesa-rediseno",
  view: "hero-banner",
  tolerance_percent: 20
}
```

### 2. Si diff < 20%: ✅ Hero completado → siguiente sección
- Marcar hero como ✅ Aprobado
- Continuar con **Intro paragraph** o **Casas grid**

### 3. Si diff >= 20%: continuar iterando
- Analizar diff.png del MCP
- Identificar issues restantes (probablemente nav links, espaciado, tipografía)
- Editar código
- Commit + push
- Esperar 3 min
- Re-validar
- **Límite:** 4 iteraciones por sección (ya vamos en 6, escalar si persiste)

### 4. Herramientas disponibles
- `scripts/visual-validate.sh hero-banner` — validación local
- `scripts/auto-iterate.sh hero-banner 4` — loop con contador
- MCP tools: `screenshot`, `visual-diff`, `reference-set`

---

## 📜 Log completo de rondas

### Ronda 1 — 01:01
- `ad5b7fb` — Altura, gradiente, alineación básica
- Diff: 66.0% → 49.3%

### Ronda 2 — 01:15
- `5e3abda` — Imagen correcta + header reestructurado
- Diff: 49.3% → 42.9%

### Ronda 3 — 01:25
- `33e096e` — Logo path, quitar CTA, object-top
- Diff: 42.9% → 76.7% (empeoró)

### Ronda 4 — 01:30
- `2d4a85b` — Revertir object-top
- Diff: 76.7% → 42.9%

### Ronda 5 — 01:38
- `1d7688e` — Cookie banner oculto con ?screenshot=1
- Diff: 42.9% → 36.9%

### Ronda 6 — 01:46 (en progreso)
- `63c65d4` — Negative margin para header transparente
- Diff: esperando validación

---

## 🤝 Notas para coordinación

- **Handoff:** Cascade → Claude en iteración 6
- **Último commit:** `63c65d4` (esperando build)
- **Referencia:** `~/Documents/workspace-mcp-global/evidence/puebloladehesa-rediseno/hero-banner/reference.png`
- **Scripts:** Disponibles en `scripts/` para automatización
- **Railway:** Auto-deploy habilitado en `main` branch
