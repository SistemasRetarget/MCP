# Propuesta: condominios.cl - Directorio de Administradores y Proveedores

## 📋 Resumen Ejecutivo

Hola,

Me interesa desarrollar **condominios.cl** como un directorio robusto y escalable en Webflow. He trabajado con proyectos similares de directorios con CMS complejos, importación masiva de datos y sistemas de filtros avanzados.

---

## ✅ Cumplimiento de Requisitos Excluyentes

| Requisito | Experiencia |
|-----------|-------------|
| **Webflow CMS** | ✅ Sí - Proyectos con colecciones complejas y relaciones |
| **Importación masiva CSV** | ✅ Sí - Experiencia migrando bases de datos grandes a Webflow CMS |
| **Finsweet Attributes** | ✅ Sí - Implementación de filtros multinivel y búsquedas |
| **Portafolio directorios** | ✅ Sí - Directorios con jerarquía de perfiles y niveles de suscripción |

---

## 🎯 Desglose de Trabajo y Entregables

### Fase 1: Setup y Arquitectura (Semana 1)
- [ ] Configuración del proyecto en Webflow (plan Business)
- [ ] Estructura CMS: 2 colecciones principales + 2 colecciones de soporte
  - **Administradores** (7,900 registros importados)
  - **Proveedores** (carga manual inicial)
  - **Categorías de proveedores** (6 registros)
  - **Subcategorías** (92 registros)
  - **Comunas/Regiones** (para filtros geográficos)
- [ ] Mapeo de campos CSV → Campos CMS
- [ ] Preparación de plantillas de perfil

### Fase 2: Importación Masiva (Semana 1-2)
- [ ] Limpieza y normalización de datos CSV
- [ ] Importación de 7,900 administradores vía CSV
- [ ] Validación de campos: id, rut, nombres, apellidos, estado, tipo, email, teléfono
- [ ] Configuración de campo "nivel" (1-Gratuito / 2-Contacto / 3-Destacado)
- [ ] Verificación de integridad de datos importados

### Fase 3: Jerarquía y Filtros - Administradores (Semana 2)
- [ ] Implementación de lógica de jerarquía visual:
  - Nivel 3: Primera página, badge diferenciador, máx 6 por comuna
  - Nivel 2: Sobre perfiles gratuitos, datos de contacto visibles
  - Nivel 1: Página 2+, datos básicos solo
- [ ] Finsweet Attributes: Filtros por región, comuna, tipo
- [ ] Paginación con priorización por nivel

### Fase 4: Directorio de Proveedores (Semana 2-3)
- [ ] Estructura de 6 categorías + 92 subcategorías
- [ ] Página intermedia de categorías (6 cards/navegación)
- [ ] 6 páginas de categoría con listados filtrables
- [ ] Jerarquía: Destacados primero (máx 6 por subcategoría)
- [ ] Filtros: subcategoría, región/zona, emergencias 24/7 (boolean)

### Fase 5: Páginas de Contenido (Semana 3)
- [ ] **Home**: Hero + accesos directos + proveedores destacados + banner conversión
- [ ] **Publica tu empresa**: Landing de planes con formulario
- [ ] **Quiénes somos**: Página institucional
- [ ] **Contacto**: Formulario simple

### Fase 6: Diseño y Responsive (Semana 3-4)
- [ ] Aplicación de paleta de colores (3 azules + verde acento)
- [ ] Adaptación de referencia Wix con mejoras UX
- [ ] Mobile-first: optimización para comités de administración en terreno
- [ ] Refinamiento visual y microinteracciones

### Fase 7: SEO y Documentación (Semana 4)
- [ ] Meta títulos y descripciones en todas las páginas
- [ ] Estructura de URLs optimizada para directorios
- [ ] Video/documentación de gestión CMS autónoma
- [ ] Configuración de dominio condominios.cl

---

## 💰 Inversión Propuesta

| Concepto | Valor |
|----------|-------|
| **Desarrollo completo en Webflow** | $X,XXX USD |
| **Importación masiva 7,900 registros** | Incluido |
| **Configuración CMS + documentación** | Incluido |
| **SEO básico + conexión de dominio** | Incluido |
| **Total** | **$X,XXX USD** |

*Ajustar según tu tarifa real*

---

## ⏱️ Timeline

**Duración: 3-4 semanas** desde recepción del CSV y briefing detallado.

```
Semana 1: Setup + Importación
Semana 2: Jerarquía administradores + Filtros
Semana 3: Proveedores + Páginas de contenido
Semana 4: Refinamiento + SEO + Documentación
```

---

## 🛡️ Garantías

- **Revisión de importación**: Verificación cruzada de muestra del CSV antes de importación total
- **Documentación video**: Guía de autogestión del CMS para independencia futura
- **Soporte post-lanzamiento**: 15 días de ajustes menores sin costo

---

## 📎 Experiencia Relevante

- **Directorios con jerarquía**: Proyectos con perfiles gratuitos/destacados y lógica de priorización
- **Importación masiva Webflow**: Migración de bases de datos >5,000 registros vía CSV
- **Finsweet Attributes**: Filtros multinivel con combinación de campos (región + comuna + tipo)
- **Marketplaces B2B**: Directorios de proveedores con categorización compleja

---

## ❓ Próximos Pasos

1. Revisar referencia Wix para entender expectativas visuales
2. Recibir muestra del CSV (100-200 registros) para validar estructura
3. Definir listado exacto de 92 subcategorías de proveedores
4. Briefing detallado para alineación de diseño y funcionalidades

---

**¿Agendamos una llamada de 20 minutos para revisar la referencia y resolver dudas técnicas?**

Saludos cordiales,  
[Tu nombre]
