# GAP ANÁLISIS — Pueblo La Dehesa (Dev vs Original)

**Fecha:** 2026-04-22
**Original:** https://puebloladehesa.cl/
**Dev:** https://puebloladehesa-web-production.up.railway.app/
**Código local:** `PROJECTS/puebloladehesa/puebloladehesa-rediseno/`

---

## Resumen

El dev actual es una versión **reducida al 30%** del original. Tiene hero + grid de casas + teaser de experiencias. El original tiene 10+ secciones con narrativa, pilares, galerías, formulario, footer completo.

**Estado general:** 🟡 Scaffolding listo, contenido y diseño faltan.

---

## 1. Estructura: secciones del HOME (original vs dev)

| # | Sección original                                     | Presente en dev | Notas                                    |
|---|------------------------------------------------------|-----------------|------------------------------------------|
| 1 | Header con nav + selector idioma + "Cotizar estadía" | ❌ No           | Nav completo + ES/EN + CTA persistente   |
| 2 | Hero: "Tu refugio en la ciudad" + bajada             | ✅ Parcial      | Texto OK, falta bajada correcta          |
| 3 | Bloque narrativo "Pueblo nace de la idea…"           | ❌ No           | Párrafo inspiracional, pre-pilares       |
| 4 | **5 pilares** (naturaleza, locación, seguridad, arriendo flexible, comunidad) | ❌ No | Core del mensaje — cada uno con imagen y headline |
| 5 | Sección intermedia "Un lugar para quedarte…"         | ❌ No           |                                          |
| 6 | "Espacios para quedarse" + 4 casas con specs         | ⚠️ Básico       | Dev tiene grid, falta specs (hab/baños)  |
| 7 | "Estadías flexibles" + CTA reserva                   | ❌ No           |                                          |
| 8 | "Experiencias que le dan vida a Pueblo" + 3 mundos   | ⚠️ Link vacío   | Dev tiene solo el link                   |
| 9 | Formulario de contacto + datos                       | ❌ No           | Endpoint `/api/contact` existe, no expuesto |
| 10| Footer: dirección, contacto, redes, newsletter, legal| ❌ No           |                                          |

**Páginas extraídas disponibles pero no conectadas al front:** `tu-lugar`, `nosotros`, `experiencias`, `la-casita`, `ubicacion`, `espacio-panoramica`, `arriendo-*`, `pueblito`, `guia-huespedes`, `terminos`, `politicas`.

---

## 2. Diseño visual

### Tipografía
- **Original:** familia serif para titulares (`ff-heading`), sans para cuerpo (`ff-body`). Sistema escalado (`fs-heading-5-base`, `fs-body-75`).
- **Dev:** `font-serif` (Tailwind default = Georgia/similar) + system-ui. Falta cargar la fuente real del original.
- **Gap:** identificar la fuente exacta (probablemente una Neue/Tenon/Canela o similar) y cargarla vía `public/fonts/` o Google Fonts.

### Paleta
- **Original:** fondo crema/off-white, texto negro/gris cálido, acentos terracota/verde suave (hay que capturar de DevTools).
- **Dev:** `--brand-bg:#faf8f5` y `--brand-ink:#1a1a1a`. Las clases Tailwind referencian `brand-soft`, `brand-muted`, `brand-accent` pero **no están definidas en `globals.css`** — hay que chequear `tailwind.config.ts`.

### Espaciado y ritmo
- **Original:** secciones amplias, padding vertical generoso (~120-160px), tipografía con line-height relajado.
- **Dev:** `py-20` (80px) en todas — demasiado apretado vs original.

### Imágenes
- **Original:** grandes, casi full-width, formato AVIF/WebP multi-resolución.
- **Dev:** Uso de Next/Image con Shopify CDN está bien, pero faltan los tamaños responsivos del original.

---

## 3. Interacciones

| Interacción             | Original         | Dev             |
|-------------------------|------------------|-----------------|
| Gallery carousel (Swiper)| ✅ Swiper       | ❌              |
| Slideshow               | ✅               | ❌              |
| Scroll suave            | ✅               | ✅              |
| Nav sticky              | ✅               | ❌              |
| Menú móvil hamburguesa  | ✅               | ❌              |
| Selector idioma disclosure | ✅            | ❌              |
| Hover en cards de casa  | ✅ scale         | ✅ scale-105    |

---

## 4. Assets faltantes detectados

Iconos de los 5 pilares (existen en `content-extracted/images/`):
- `cdn_shop_files_iconos-01.svg` a `iconos-17.svg` — ya descargados.

Logos:
- `cdn_shop_files_logo-pueblo-01.svg` ✅
- `cdn_shop_files_logo-pueblo-02.svg` ✅

Imágenes pilares:
- `cdn_shop_files_vida_en_comunidad_07A0078_1*.webp` ✅
- `cdn_shop_files_seguridad_y_confianza_07A9597_1*.webp` ✅
- `cdn_shop_files_amplios_horizontes_1*.webp` ✅

**Todos ya están en `public/media/` o `content-extracted/images/`**. Hay que usarlos.

---

## 5. Plan por bloques (priorizado)

### Bloque A — Fundaciones visuales (2-3 horas)
1. Definir tipografías correctas (identificar vía inspección del original) y cargarlas.
2. Expandir paleta en `tailwind.config.ts` (brand-bg, brand-ink, brand-soft, brand-muted, brand-accent con valores reales).
3. Ajustar escala de espaciado vertical entre secciones.
4. Crear `<Header />` y `<Footer />` como layout compartido.

### Bloque B — Secciones core del home (3-4 horas)
5. Bloque narrativo "Pueblo nace de la idea…"
6. Sección de 5 pilares con iconos + imágenes.
7. Mejorar grid de casas con specs (habitaciones/baños/descripción corta).
8. Sección "Estadías flexibles" con CTA reserva.
9. Teaser "Experiencias" con 3 mundos.

### Bloque C — Interacciones y detalles (2-3 horas)
10. Carrusel de imágenes (Swiper o Embla).
11. Nav sticky + menú móvil.
12. Selector idioma ES/EN funcional.
13. Form de contacto wired a `/api/contact`.

### Bloque D — Resto del sitio (iteraciones siguientes)
14. Página de cada casa (4 plantillas o 1 parametrizada).
15. Página de experiencias.
16. Páginas legales y la casita.

---

## 6. Decisiones pendientes (bloqueantes)

1. **¿Pixel-perfect o match funcional?** — sugiero funcional: copiamos estructura y feel, pero no pixeles exactos (ahorra ~40% del tiempo).
2. **¿Reserva/cotización va a un form propio o redirige a book2dream?** — el original usa book2dream.
3. **¿El CMS Payload queda para que el cliente edite después o sólo es almacén interno?** — define cuánto refactor va en modelar bien las colecciones.

---

## 7. Próximo paso concreto

Arrancar por **Bloque A** — sin fundaciones visuales (fuente, paleta, layout) cualquier sección que agreguemos va a verse desalineada del original. Una vez aprobado este doc, empiezo por el header + footer y la config de Tailwind, commiteo y deployeo para que veas el cambio en Railway.
