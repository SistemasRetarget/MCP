# Anti-patrones — Problemas del sitio actual a NO repetir

Lista maestra de problemas detectados en `puebloladehesa.cl` (Shopify). Toda característica del nuevo sitio debe garantizar que **ninguno** de estos problemas vuelva a aparecer. Este documento sirve como base de auditoría continua.

---

## 🔴 Performance

### PERF-001 · LCP excesivo (16.2s en móvil)
**Problema actual:** La imagen hero tarda 16 segundos en pintarse.
**Solución obligatoria:**
- Imagen hero con `priority` y `fetchpriority="high"`
- Formato AVIF con fallback WebP
- Dimensiones fijas (width/height) para evitar CLS
- Preload del recurso crítico en `<head>`
**Test:** Lighthouse móvil LCP < 2.5s en home, Casa, Experiencia.

### PERF-002 · JavaScript sin usar (604 KB)
**Problema actual:** GTM x2, Pixel, fbevents cargan scripts que no se ejecutan.
**Solución obligatoria:**
- Un solo contenedor GTM (no duplicar)
- Carga diferida (`strategy="afterInteractive"` o `lazyOnload`)
- Consent Mode v2: scripts solo después del consentimiento
- Tree-shaking automático (Next.js lo hace)
**Test:** Bundle analyzer sin chunks duplicados; JS inicial < 100 KB gzipped.

### PERF-003 · Redirects en cadena (860 ms perdidos)
**Problema actual:** `http://` → `https://` → `puebloladehesa.cl` (2 saltos).
**Solución obligatoria:**
- Redirect directo en un solo paso (HSTS preload)
- Canónica absoluta siempre en HTTPS con www o sin www, elegir y mantener
**Test:** `curl -IL https://puebloladehesa.cl` debe mostrar 1 solo 301.

### PERF-004 · YouTube iframe sin lazy-load
**Problema actual:** `iframe_api` bloquea 500ms el hilo principal.
**Solución obligatoria:**
- Componente `lite-youtube-embed` que carga el reproductor solo al clic
- Poster image optimizada en lugar del iframe
**Test:** Lighthouse TBT < 200ms con video en pantalla.

### PERF-005 · Imágenes sin optimizar
**Problema actual:** JPG/PNG sin compresión moderna, peso 3.3 MB por página.
**Solución obligatoria:**
- `next/image` para toda imagen
- AVIF + WebP automático según navegador
- Responsive srcset con múltiples tamaños
- `loading="lazy"` para below-the-fold
- Blur placeholder (`placeholder="blur"`)
**Test:** Peso total página home < 1.2 MB; todas las imágenes con srcset y lazy.

### PERF-006 · CSS bloqueante
**Problema actual:** 5 archivos CSS cargados en serie antes del primer render.
**Solución obligatoria:**
- Critical CSS inline (Next.js lo hace nativo)
- Tailwind JIT purga clases no usadas
- Sin `@import` en CSS
**Test:** CSS crítico inline < 14 KB; CSS diferido con `media="print" onload`.

---

## 🔴 SEO

### SEO-001 · Meta tags genéricos
**Problema actual:** Title y description iguales en varias páginas.
**Solución obligatoria:**
- Metadata API de Next.js por cada página
- Title template: `%s | Pueblo La Dehesa`
- Description única, 150-160 caracteres
**Test:** Script que valide que no hay duplicados entre páginas.

### SEO-002 · Sin datos estructurados (Schema.org)
**Problema actual:** Google no entiende que son alojamientos.
**Solución obligatoria:**
- JSON-LD automático según tipo de página
  - `LodgingBusiness` o `Accommodation` para casas
  - `Event` para experiencias
  - `BlogPosting` para blog
  - `Organization` + `LocalBusiness` global
  - `BreadcrumbList` en todas las páginas
**Test:** [Rich Results Test](https://search.google.com/test/rich-results) sin errores.

### SEO-003 · Sitemap incompleto
**Problema actual:** Shopify genera sitemap básico.
**Solución obligatoria:**
- `sitemap.xml` dinámico con todas las colecciones
- `robots.txt` personalizado
- Multi-idioma con hreflang en sitemap
**Test:** Sitemap contiene todas las URLs públicas; Google Search Console sin errores.

### SEO-004 · Multi-idioma mal implementado
**Problema actual:** `hreflang` a veces ausente; URLs mezcladas.
**Solución obligatoria:**
- Rutas `/es/...` y `/en/...` (o subdominio)
- `hreflang` en `<head>` y en sitemap
- Meta `og:locale` correcto por idioma
**Test:** Google Search Console → "International Targeting" sin errores.

---

## 🔴 Recursos externos y tracking

### EXT-001 · Scripts de terceros descontrolados
**Problema actual:** 6+ scripts externos cargan sin control.
**Solución obligatoria:**
- Todo script externo pasa por GTM (único contenedor)
- Whitelist de dominios permitidos
- CSP (Content Security Policy) estricta
**Test:** Auditoría semanal: `curl` y grep de dominios externos nuevos.

### EXT-002 · GTM duplicado
**Problema actual:** `GTM-WJHDSTT2` + `GT-MK98MHQH` cargados simultáneamente.
**Solución obligatoria:**
- UN solo contenedor GTM
- Todos los tags consolidados
**Test:** `document.querySelectorAll('script[src*="gtm"]').length === 1`.

### EXT-003 · Sin Consent Mode
**Problema actual:** GA4, Pixel disparan antes del consentimiento del usuario.
**Solución obligatoria:**
- Consent Mode v2 implementado
- Banner de cookies GDPR/LGPD compatible
- Default: `denied` hasta aceptación
**Test:** Network tab muestra GA4 solo después de click "Aceptar".

### EXT-004 · Medición de WhatsApp incompleta
**Problema actual:** Solo se mide el clic del botón, no si envía mensaje.
**Solución obligatoria (desde el inicio):**
- Tracking de clic en GA4
- Tracking de retorno (Opción A: proxy por tiempo)
- Token único en URL (Opción B)
- Preparado para Cloud API (Opción C futura)
**Test:** Eventos `click_whatsapp`, `whatsapp_retorno` visibles en GA4 en tiempo real.

---

## 🔴 Accesibilidad

### A11Y-001 · Contraste insuficiente
**Problema actual:** Textos sobre imágenes sin overlay.
**Solución obligatoria:**
- Ratio mínimo 4.5:1 (WCAG AA)
- Overlay oscuro en imágenes con texto encima
- Tests automáticos con `axe-core`
**Test:** Lighthouse Accessibility ≥ 95.

### A11Y-002 · Navegación por teclado rota
**Problema actual:** Focus invisible en varios elementos.
**Solución obligatoria:**
- `:focus-visible` estilos claros en todo interactivo
- `skip-to-content` link al inicio
- Orden de tabulación lógico
**Test:** Navegar toda la home con Tab; cada elemento debe tener foco visible.

### A11Y-003 · Imágenes sin alt
**Problema actual:** 30% de imágenes con `alt=""` vacío.
**Solución obligatoria:**
- Campo `alt` requerido en el CMS para toda imagen
- Validación en backend: no permitir alt vacío en imágenes de contenido
**Test:** Script que recorre todas las páginas y verifica alt no vacío.

---

## 🔴 Seguridad

### SEC-001 · Sin headers de seguridad
**Problema actual:** No hay CSP, HSTS, X-Frame-Options.
**Solución obligatoria:**
- `Content-Security-Policy` restrictiva
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictiva
**Test:** [securityheaders.com](https://securityheaders.com) grado A o A+.

### SEC-002 · Variables de entorno expuestas
**Problema actual:** Shopify expone algunas configuraciones en HTML.
**Solución obligatoria:**
- Solo `NEXT_PUBLIC_*` van al cliente
- Secrets siempre server-side
- `.env` nunca commiteado
**Test:** Grep de `PAYLOAD_SECRET` o `DATABASE_URI` en build output debe dar vacío.

---

## 🔴 Contenido y CMS

### CMS-001 · Dependencia del desarrollador para cambios
**Problema actual:** Textos y fotos requieren tocar el tema Shopify.
**Solución obligatoria:**
- 100% del contenido en Payload
- Live preview funcional
- Historial de versiones
**Test:** El equipo edita cualquier texto sin tocar código.

### CMS-002 · Sin validación de contenido
**Problema actual:** Se pueden publicar páginas sin meta tags.
**Solución obligatoria:**
- Campos requeridos: título, slug, meta_title, meta_description, og_image
- Validación en el admin antes de publicar
- Schema de campos definido
**Test:** Intentar publicar sin meta → debe bloquear.

### CMS-003 · Sin backups automáticos
**Problema actual:** Si Shopify cae, el contenido está ahí pero inaccesible.
**Solución obligatoria:**
- Backup diario automático de PostgreSQL
- Backup semanal offsite (S3 o similar)
- Retención 30 días
**Test:** Simular restore mensual en staging.

---

## 🔴 DevOps y mantenimiento

### OPS-001 · Sin CI/CD
**Problema actual:** Cambios directos al tema en producción.
**Solución obligatoria:**
- GitHub Actions (o similar) en cada PR
- Tests automáticos (unit + Lighthouse CI)
- Deploy automático a staging en `develop`
- Deploy a prod solo desde `main` con approval
**Test:** PR que rompa tests → merge bloqueado.

### OPS-002 · Sin monitoreo
**Problema actual:** Nadie sabe si el sitio está caído hasta que alguien llama.
**Solución obligatoria:**
- Uptime monitoring (UptimeRobot, BetterStack o Railway health checks)
- Sentry para errores en producción
- Alertas a Slack/email en caídas
**Test:** Simular caída → recibir alerta en < 5 min.

### OPS-003 · Logs perdidos
**Problema actual:** Shopify no da acceso completo a logs.
**Solución obligatoria:**
- Logs estructurados (JSON) con nivel, timestamp, contexto
- Retención mínima 30 días
- Búsqueda por request_id
**Test:** Buscar request específico por ID y obtener trace completo.

### OPS-004 · Sin ambiente de staging
**Problema actual:** No hay copia del sitio para pruebas.
**Solución obligatoria:**
- Railway: 2 ambientes (staging + production)
- Staging con datos de producción anonimizados
- QA manual antes de merge a `main`
**Test:** staging.puebloladehesa.cl accesible con auth básica.

---

## 🔴 Reservas y formularios

### FORM-001 · Formularios sin validación robusta
**Problema actual:** App HulkApps inyecta JS que no controlamos.
**Solución obligatoria:**
- Formularios nativos en Next.js con Server Actions
- Validación client + server con Zod
- Rate limiting anti-spam
- reCAPTCHA v3 invisible
**Test:** Enviar 20 requests seguidas → bloqueo después de N.

### FORM-002 · Sin tracking de abandono
**Problema actual:** No sabemos cuántos empiezan el form y no lo envían.
**Solución obligatoria:**
- Evento GA4 `form_start` al primer input
- Evento `form_submit_success` al enviar
- Evento `form_abandon` al salir sin enviar
**Test:** Embudo en GA4 visible.

### FORM-003 · Reservas sin integración
**Problema actual:** Link externo a `book2dream`.
**Solución obligatoria:**
- Decidir: embed `book2dream` o motor propio
- Si embed: iframe diferido
- Si propio: calendario + pagos + confirmación email
**Test:** Flujo completo de reserva en staging.

---

## ✅ Checklist de validación antes de cada release

Cada vez que se mergea a `main`, debe pasar:

- [ ] Lighthouse móvil Performance ≥ 90
- [ ] Lighthouse desktop Performance ≥ 95
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO = 100
- [ ] Core Web Vitals en verde (CrUX o Lighthouse)
- [ ] Security headers grado A en securityheaders.com
- [ ] Rich Results Test sin errores
- [ ] Sin errores en Sentry en las últimas 24h
- [ ] Backup de DB verificado en staging
- [ ] Todos los tests unit + e2e pasan
- [ ] Bundle size dentro de presupuesto (< 100 KB JS inicial)

---

## 📋 Presupuesto de performance (hard limits)

| Métrica | Límite | Consecuencia si se excede |
|---------|--------|---------------------------|
| JS inicial (gzip) | 100 KB | Build falla |
| CSS inicial (gzip) | 20 KB | Build falla |
| Peso total home | 1.2 MB | Warning en PR |
| Requests home | 30 | Warning en PR |
| LCP móvil | 2.5 s | Release bloqueado |
| TBT | 200 ms | Release bloqueado |
| CLS | 0.1 | Release bloqueado |

---

**Última actualización:** Abril 2026  
**Responsable:** Luis Alberto Maldonado — Sistemas  
**Base para futuros proyectos:** Este documento es reutilizable en cualquier rebuild de sitio web.
