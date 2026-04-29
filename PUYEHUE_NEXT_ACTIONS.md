# Puyehue — Acciones Inmediatas para Replicación Completa

**Fecha:** 29 Abril 2026, 04:25 UTC  
**Status Actual:** Contenido actualizado (40%), estructura visual incompleta (0%)  
**Prioridad:** ALTA

---

## 🚨 Problema Identificado

La QA app tiene contenido actualizado pero:
- ❌ **Navbar:** No existe (8 items + logo + idiomas)
- ❌ **Hero Slider:** No existe (solo imagen estática)
- ❌ **Booking Form:** No existe (superpuesto en hero)
- ❌ **Galería:** No existe (4 columnas con overlay)
- ❌ **Colores:** No coinciden (naranja, verde, gris)
- ❌ **Tipografía:** No coincide (Serif + Sans-serif)
- ❌ **Imágenes:** Placeholders de Unsplash (no reales)

**Resultado:** La app parece completamente diferente a puyehue.cl

---

## 📋 Plan de Acción (7 Fases)

### Fase 3: Navigation & Header (INMEDIATA)
**Estimado:** 2-3 horas  
**Tareas:**
1. Crear componente `Header.tsx`
2. Agregar logo (SVG)
3. Replicar menú (8 items):
   - Promociones
   - Destino
   - Hotel
   - Qué Hacer
   - Programas
   - Eventos
   - Sostenibilidad
   - Ven por el Día
4. Agregar selector de idiomas (ES, EN, ARG)
5. Botón "RESERVAR" (naranja, sticky)
6. Sticky behavior en scroll

**Archivos a crear/modificar:**
- `src/components/Header.tsx` (nuevo)
- `src/app/(frontend)/layout.tsx` (agregar Header)
- `src/styles/header.css` (estilos)

---

### Fase 4: Hero & Booking Form (SIGUIENTE)
**Estimado:** 3-4 horas  
**Tareas:**
1. Mejorar hero section
2. Agregar slider (flechas + dots)
   - Librería: Swiper.js o React Slick
3. Crear booking form superpuesto
   - Inputs: Fecha, noches, adultos, niños, infantes
   - Botón: "RESERVAR" (verde/sage)
4. Validar responsive

**Archivos a crear/modificar:**
- `src/components/HeroSlider.tsx` (nuevo)
- `src/components/BookingForm.tsx` (nuevo)
- `src/app/(frontend)/(es)/page.tsx` (actualizar)

---

### Fase 5: Secciones Principales (DESPUÉS)
**Estimado:** 4-5 horas  
**Tareas:**
1. Promociones (grid 3 columnas)
2. Destino (2 columnas: texto + imagen)
3. Hotel (galería 4 columnas)
4. Qué Hacer (galería 4 columnas)
5. Programas (grid 3 columnas)
6. Eventos (timeline)
7. Sostenibilidad (alternado)
8. Ven por el Día (hero pequeño)

**Archivos a crear/modificar:**
- `src/components/sections/Promotions.tsx` (nuevo)
- `src/components/sections/Destination.tsx` (nuevo)
- `src/components/sections/Hotel.tsx` (nuevo)
- `src/components/sections/Activities.tsx` (nuevo)
- `src/components/sections/Programs.tsx` (nuevo)
- `src/components/sections/Events.tsx` (nuevo)
- `src/components/sections/Sustainability.tsx` (nuevo)
- `src/components/sections/DayVisit.tsx` (nuevo)

---

### Fase 6: Estilos & Colores (PARALELO)
**Estimado:** 2-3 horas  
**Tareas:**
1. Aplicar paleta de colores:
   - Naranja: #FF6B35 (botones CTA)
   - Verde/Sage: #8B9E7F (botones secundarios)
   - Gris: #333333 (texto)
   - Blanco: #FFFFFF (fondos)
2. Tipografía:
   - H1/H2: Serif (Playfair Display o Georgia)
   - Body: Sans-serif (Roboto o Open Sans)
3. Espaciado consistente
4. Hover states
5. Transiciones suaves

**Archivos a crear/modificar:**
- `src/styles/colors.css` (nuevo)
- `src/styles/typography.css` (nuevo)
- `tailwind.config.js` (actualizar colores)

---

### Fase 7: QA & Optimización (FINAL)
**Estimado:** 2-3 horas  
**Tareas:**
1. Visual diff vs original (Playwright)
2. Core Web Vitals (Lighthouse)
3. SEO audit
4. Responsive (mobile, tablet, desktop)
5. Accesibilidad (WCAG 2.1)
6. Performance (imágenes optimizadas)

**Archivos a crear/modificar:**
- `tests/visual.test.ts` (nuevo)
- `tests/performance.test.ts` (nuevo)

---

## 🎯 Prioridad Inmediata

### Hoy (Fase 3: Navigation)
```
1. Crear Header.tsx
2. Replicar menú (8 items)
3. Agregar logo + idiomas
4. Botón "RESERVAR" sticky
5. Test responsive
```

**Estimado:** 2-3 horas  
**Resultado:** App con navegación funcional

---

## 📊 Checklist de Implementación

### Fase 3: Navigation
- [ ] Componente Header creado
- [ ] Logo SVG integrado
- [ ] Menú con 8 items
- [ ] Selector de idiomas
- [ ] Botón "RESERVAR" (naranja)
- [ ] Sticky en scroll
- [ ] Responsive (hamburger en mobile)
- [ ] Test en QA

### Fase 4: Hero & Booking
- [ ] Slider con flechas + dots
- [ ] Booking form superpuesto
- [ ] Validación de inputs
- [ ] Responsive
- [ ] Test en QA

### Fase 5: Secciones
- [ ] 8 secciones replicadas
- [ ] Galerías 4 columnas
- [ ] Overlays de texto
- [ ] Responsive
- [ ] Test en QA

### Fase 6: Estilos
- [ ] Colores exactos aplicados
- [ ] Tipografía correcta
- [ ] Espaciado consistente
- [ ] Hover states
- [ ] Transiciones

### Fase 7: QA
- [ ] Visual diff < 2% diferencia
- [ ] Core Web Vitals: Good
- [ ] SEO: 90+ score
- [ ] Responsive: Todas las resoluciones
- [ ] Accesibilidad: WCAG 2.1 AA

---

## 🔗 Recursos

- **Análisis Visual:** `VISUAL_STRUCTURE_ANALYSIS.md`
- **Especificaciones:** `RECONNAISSANCE_PUYEHUE.md`
- **Estado Actual:** `REPLICATION_STATUS.md`
- **Sitio Original:** https://puyehue.cl
- **QA App:** https://puyehue-web-rf3w6ybqeq-ew.a.run.app

---

## 💡 Recomendaciones

1. **Usar Swiper.js** para el hero slider (fácil de integrar en Next.js)
2. **Tailwind CSS** para estilos (ya está en el proyecto)
3. **Google Fonts** para tipografía (Playfair Display + Roboto)
4. **Playwright** para visual testing
5. **Lighthouse** para Core Web Vitals

---

## 📝 Notas Importantes

- **No cambiar contenido:** Solo estructura y estilos
- **Mantener responsive:** Mobile first
- **Optimizar imágenes:** WebP + lazy loading
- **Accesibilidad:** WCAG 2.1 AA mínimo
- **Performance:** Core Web Vitals Good

---

**Desarrollado por Sistemas - Retarget ❤️**  
**Próximo paso:** Implementar Fase 3 (Navigation & Header)  
**Estimado total:** 15-20 horas para replicación completa
