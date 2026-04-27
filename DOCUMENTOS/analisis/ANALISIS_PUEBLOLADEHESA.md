# Análisis de puebloladehesa.cl

## Estructura actual del sitio

**Plataforma:** Shopify (tema personalizado)  
**Peso total:** 222 KB HTML  
**Páginas detectadas:** Home + Casas (4 tipos) + Experiencias + Contacto + Blog  
**Idiomas:** ES / EN (multi-idioma nativo Shopify)

### Secciones principales (por orden de aparición)

1. **Hero image** — Imagen grande con texto superpuesto, CTA principal
2. **Promotion bar** — Banner de anuncio/oferta
3. **Rich text** — Bloques de contenido narrativo
4. **Multi-column grid** — Galerías de casas (4 items con imagen, título, descripción, botón)
5. **Image with text** — Secciones alternadas imagen-texto
6. **Gallery carousel** — Carrusel de fotos (Swiper)
7. **Slideshow** — Slider de imágenes
8. **Contact form** — Formulario de contacto
9. **Social links** — Enlaces a redes sociales

### Componentes reutilizables

- `image__img` (29 instancias) — Imágenes con lazy loading
- `gallery-carousel__item` (12) — Items del carrusel
- `multi-column__grid-item` (9) — Grid de casas/experiencias
- `icon-button` (8) — Botones con iconos
- `hero-feature-pill` (8) — Badges/etiquetas

### Tipografía y espaciado

- Sistema de clases: `fs-heading-5-base`, `fs-body-75`, `ff-heading`, `ff-body`
- Usa variables CSS para tamaños y colores
- Responsive: clases con sufijos `-mobile` para versiones móviles

---

## Descripción funcional del sitio (según briefing)

**Pueblo La Dehesa** es un proyecto de hospitalidad boutique en La Dehesa (Santiago, Chile). Ofrece:

- **Casas amobladas** para estadías flexibles (no hotel tradicional)
- **Experiencias de bienestar y outdoor** (yoga, senderismo, meditación)
- **Ambiente minimalista y calmado** — diseño espacioso, fotografía grande, tipografía amable
- **Reservas** vía `book2dream` (integración externa)
- **Contacto directo** vía WhatsApp + formulario

### Propuesta de valor

> "Tu refugio en la ciudad" — Casas rodeadas de naturaleza, diseño y calma, con experiencias de bienestar, cerca de todo y envuelto en silencio.

---

## Problemas técnicos actuales

1. **Performance móvil crítica** (LCP 16.2s, TBT 770ms)
2. **Scripts duplicados** (GTM x2, GA4, Pixel)
3. **Imágenes sin optimizar** (AVIF/WebP, lazy load deficiente)
4. **Recursos externos bloqueantes** (YouTube iframe, apps Shopify)
5. **Dependencia de Shopify** para cambios menores
6. **SEO limitado** por arquitectura del tema

---

## Estructura de contenido para el rediseño

### Colecciones del CMS (Payload)

```
Casa
├── nombre (string)
├── slug (string)
├── descripcion_corta (text)
├── descripcion_larga (richtext)
├── precio_base (number)
├── capacidad (number)
├── galeria (array de imágenes)
├── amenities (array: wifi, cocina, chimenea, etc)
├── disponibilidad (date range)
└── seo (meta, og_image, keywords)

Experiencia
├── nombre (string)
├── slug (string)
├── descripcion (richtext)
├── imagen_hero (image)
├── duracion (string)
├── precio (number)
├── capacidad_maxima (number)
├── horarios (array)
└── seo

Pagina
├── slug (string)
├── titulo (string)
├── contenido (richtext con bloques)
├── seo
└── publicada (boolean)

Blog
├── titulo (string)
├── slug (string)
├── contenido (richtext)
├── autor (string)
├── fecha_publicacion (date)
├── imagen_destacada (image)
└── seo

Configuracion
├── nombre_sitio (string)
├── email_contacto (string)
├── telefono_whatsapp (string)
├── redes_sociales (object)
├── google_analytics_id (string)
└── gtm_id (string)
```

---

## Próximos pasos

1. Inicializar repositorio Git local
2. Crear estructura Next.js + Payload
3. Configurar variables de entorno
4. Preparar Dockerfile para Railway
5. Crear rama `develop` y `main` (producción)
