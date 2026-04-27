# Guía de Instalación - Tema Retarget News

## OPCIÓN A: Instalación Rápida (Tema Clásico)

### Paso 1: Instalar el ZIP
```
1. Ve a tu WordPress Admin
2. Apariencia → Temas → Añadir nuevo
3. Botón "Subir tema"
4. Selecciona: retarget-news-theme.zip
5. "Instalar ahora" → "Activar"
```

### Paso 2: Configurar Homepage
```
Ajustes → Lectura
├── "Tus últimas entradas" [Seleccionar]
└── Guardar cambios
```

### Paso 3: Crear Menú de Navegación
```
Apariencia → Menús → Crear menú
├── Nombre: "Menú Principal"
├── Añadir items: Política, Economía, Deportes, etc.
└── Ubicación: "Menú Principal" [✓]
```

### Paso 4: Personalizar Colores
```
Apariencia → Personalizar → Colores
├── Color primario: #1a365d (azul corporativo)
└── Color acento: #e53e3e (rojo noticias)
```

✅ **LISTO** - El demo se muestra automáticamente

---

## OPCIÓN B: Tema Moderno con Vite (Recomendado)

### Requisitos Previos
- Node.js 18+ instalado
- Acceso SSH/FTP al servidor
- WordPress 5.8+

### Paso 1: Subir archivos
```bash
# Opción A: vía FTP
Sube la carpeta /retarget-modern-vite/ a:
/wp-content/themes/

# Opción B: vía SSH
cd /var/www/html/wp-content/themes/
unzip retarget-modern-vite.zip
```

### Paso 2: Instalar dependencias
```bash
cd retarget-modern-vite
npm install
```

### Paso 3: Build para producción
```bash
npm run build
```

Esto genera la carpeta `/dist/` con CSS/JS optimizados.

### Paso 4: Activar en WordPress
```
Apariencia → Temas
├── Buscar "Retarget Modern"
└── Activar
```

### Paso 5: Configurar igual que Opción A

---

## 🎨 VER EL DEMO

### El demo aparece automáticamente si:
```
1. No tienes el plugin News Converter activado
   O
2. No hay posts publicados en WordPress
```

### Para forzar modo demo:
```php
// Agregar en wp-config.php
define('RETARGET_DEMO_MODE', true);

// O en functions.php del tema
update_option('retarget_demo_mode', true);
```

### Contenido del demo:
- 6 noticias reales (Paz Charpentier, Reforma tributaria, etc.)
- Carrusel con 5 slides
- Categorías: Política, Economía, Deportes, Tecnología, Cultura
- Imágenes de Unsplash
- Fechas relativas ("Hace 2 horas")

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### "El tema no se ve bien / sin estilos"
```
1. Verificar que la carpeta se llame exactamente:
   retarget-news-theme (sin el .zip)
   
2. Para tema Vite, verificar que exista:
   /wp-content/themes/retarget-modern-vite/dist/
   
3. Si no existe, ejecutar:
   cd retarget-modern-vite && npm run build
```

### "404 en páginas"
```
Ajustes → Enlaces permanentes
├── Seleccionar: "Nombre de la entrada"
└── Guardar cambios (2 veces)
```

### "No aparece el carrusel"
```
Apariencia → Personalizar → Opciones Retarget
├── ✅ Mostrar carrusel en homepage
└── Cantidad de slides: 5
```

### "Imágenes no cargan"
Las imágenes del demo usan Unsplash (URLs externas).
Requiere conexión a internet para ver el demo completo.

---

## 🚀 MODO DESARROLLO (Vite)

Para desarrollar con Hot Module Replacement:

```bash
# En tu máquina local
cd retarget-modern-vite
npm run dev

# Esto inicia servidor en http://localhost:3000
# Conecta tu WordPress local a este puerto
```

Configurar `wp-config.php`:
```php
define('WP_DEBUG', true);
define('RETARGET_DEV_MODE', true);
```

---

## 📋 CHECKLIST POST-INSTALACIÓN

- [ ] Tema activado sin errores
- [ ] Homepage muestra carrusel
- [ ] Menú de navegación visible
- [ ] Imágenes cargando correctamente
- [ ] Responsive en móvil
- [ ] Colores personalizados aplicados
- [ ] Widgets en sidebar visibles
- [ ] Footer con 4 columnas
- [ ] Búsqueda funciona
- [ ] Dark mode toggle (solo tema Vite)

---

## 📞 ¿DÓNDE INSTALAR?

### Opción 1: Local (para pruebas)
```
Usar: LocalWP, MAMP, XAMPP, Docker
URL: http://localhost/retarget
```

### Opción 2: Staging (para presentación)
```
Subir a: subdominio.tudominio.cl
Ejemplo: demo.retarget.cl
```

### Opción 3: Producción
```
Hosting compartido: cPanel → File Manager → Upload
VPS: SSH + Git + Deploy automatizado
```

---

## 🎯 VERIFICACIÓN RÁPIDA

Abre tu sitio y deberías ver:

```
┌─────────────────────────────────────────┐
│  🔴 Última hora | Paz Charpentier...   │  ← Breaking bar
├─────────────────────────────────────────┤
│  [R] Retarget    [Menú]       🔍 ☀️ ☰  │  ← Header
├─────────────────────────────────────────┤
│                                         │
│  [IMAGEN GRANDE - CARRUSEL]            │
│  "Paz Charpentier: Unboxing..."         │
│  Política • Hace 2 horas               │
│                                         │
├─────────────────────────────────────────┤
│  📂 POLÍTICA        Ver todas →        │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ IMG  │ │ IMG  │ │ IMG  │           │  ← Cards
│  │Title │ │Title │ │Title │           │
│  └──────┘ └──────┘ └──────┘           │
├─────────────────────────────────────────┤
│  🔥 Últimas | 📂 Categorías            │  ← Sidebar
│  [1] [2] [3]                           │
└─────────────────────────────────────────┘
```

---

## ⏱️ TIEMPO ESTIMADO

- **Tema Clásico**: 5 minutos
- **Tema Vite**: 15 minutos (incluye npm install)
- **Configuración completa**: +10 minutos
- **Personalización avanzada**: +30 minutos

**¿En qué entorno lo vas a instalar?** (local, staging, producción)
