# Gemini AI Local - macOS App

Herramienta local de IA con **Google Gemini API Pro** para Arquitectura de Sistemas.
Aplicación instalable para macOS (Intel y Apple Silicon).

## Características

- **Tres modelos Gemini**: Flash 8B (ultra-rápido), Flash (balance), Pro (máxima calidad)
- **Activación por API Key**: Cada modelo se activa individualmente con su API key. Sin key = desactivado
- **Cambio de modelo en tiempo real**: Usa solo los modelos que tienes activos
- **Tracking de créditos y monetización**: Visualiza gasto en tiempo real, límites diarios/mensuales, alertas
- **Ejecución de comandos del sistema**: Desde el chat usa `!comando` o `/cmd comando` para ejecutar en tu Mac
- **Acceso total al sistema**: File system, ejecución de comandos, variables de entorno (vía Electron)
- **Historial de conversaciones**: Persistencia en SQLite local
- **Templates de prompts**: 9 templates pre-configurados para arquitectura de sistemas
- **UI moderna**: Tailwind CSS + modo oscuro nativo
- **App nativa macOS**: Instalable como .app con menú nativo

## Stack Tecnológico

- **Framework**: Astro 4.x (SSR) + React
- **Desktop**: Electron 29 (para app instalable macOS)
- **Runtime**: Node.js 20+
- **Styling**: Tailwind CSS 3.4
- **Database**: SQLite local (better-sqlite3)
- **API**: Google Generative AI SDK (@google/generative-ai)

## Instalación Rápida (macOS)

```bash
# 1. Clonar o entrar al proyecto
cd gemini-local-app

# 2. Instalar dependencias
npm install

# 3. Configurar tu API Key de Google
cp .env.example .env
# Editar .env y agregar: GEMINI_API_KEY=your-key-here

# 4. Crear directorio de datos
mkdir -p data

# 5. Ejecutar en modo desarrollo
npm run electron:dev

# O build para producción:
# npm run electron:build:mac
```

## Construir App Instalable para macOS

### Requisitos
- macOS 11+ (Big Sur o superior)
- Node.js 20+
- Tu API Key de Google Gemini Pro

### Pasos

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
echo "GEMINI_API_KEY=tu-api-key-aqui" > .env

# Construir la app (genera .dmg y .app)
npm run electron:build:mac

# Resultado estará en:
# dist-electron/Gemini AI Local-1.0.0.dmg
# dist-electron/mac/Gemini AI Local.app
```

### Distribución

La app construida se puede distribuir como:
- **.dmg**: Instalador estándar para macOS
- **.app**: Aplicación directamente ejecutable
- **.zip**: Para distribución simple

**Nota sobre notarización**: Si planeas distribuir fuera de tu equipo, necesitarás:
- Apple Developer ID
- Notarizar la app con `electron-builder` + credentials de Apple

## Configuración

### Variables de entorno (.env)

```env
# Requerido - Obtén tu API key en https://ai.google.dev/
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx

# Opcional - alias alternativo
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx
```

### Modelos disponibles

| Modelo | Costo Input | Costo Output | Uso recomendado | Velocidad |
|--------|-------------|--------------|-----------------|-----------|
| Flash 8B | $0.0375/1M | $0.15/1M | Refactoring, docs simples | Ultra-rápida |
| Flash | $0.075/1M | $0.30/1M | Código, debugging, chat | Rápida |
| Pro | $1.25/1M | $5.00/1M | Arquitectura compleja, razonamiento | Máxima calidad |

**Nota**: Gemini es significativamente más económico que Claude/ChatGPT para la mayoría de casos de uso.

## Uso

### Configuración inicial

1. **Configurar API Keys**: Abre Settings (⚙️) y configura tu API key de Gemini para cada modelo que quieras usar
   - Flash 8B: Para tareas simples (más económico)
   - Flash: Balance general
   - Pro: Máxima calidad para arquitectura compleja

2. **Activar acceso al sistema** (opcional): En Settings > System Access, habilita para permitir comandos del sistema

3. **Configurar límites de gasto**: En el panel de Créditos ($) configura tus límites diarios/mensuales y alertas

### Ejecutar comandos del sistema

Desde el chat, puedes ejecutar comandos en tu Mac:

```
!ls -la
!pwd
!mkdir nueva_carpeta
!/cmd ls -la
```

Los comandos disponibles están en una whitelist configurable en Settings. Por defecto incluye: `ls`, `pwd`, `cd`, `cat`, `mkdir`, `rm`, `cp`, `mv`, `git`, `npm`, etc.

### Monetización y Créditos

- **Spending en tiempo real**: Se actualiza con cada mensaje enviado
- **Límites configurables**: Define cuánto quieres gastar por día/mes
- **Alertas**: Recibe notificaciones cuando alcances ciertos porcentajes
- **Costos estimados**: Basados en tokens (aproximado, puede variar con facturación real)

## Scripts disponibles

```bash
# Desarrollo
npm run dev                 # Solo Astro (http://localhost:3000)
npm run electron:dev       # Astro + Electron juntos

# Build
npm run build              # Build Astro para producción
npm run electron:build     # Build completo (todos los platforms)
npm run electron:build:mac # Build solo macOS (.dmg + .app)
npm run electron:build:dmg # Build solo .dmg
```

## Templates incluidos

### Arquitectura
1. **Revisión de Arquitectura** - Análisis completo con recomendaciones (usa Pro)
2. **Diseño de Microservicios** - DDD, bounded contexts, comunicación (usa Pro)
3. **Diseño de Base de Datos** - Modelado relacional/NoSQL (usa Flash)

### Código
4. **Generación de Código** - Código limpio con tests (usa Flash)
5. **Refactoring** - Mejorar código manteniendo comportamiento (usa Flash 8B)

### Review & Debugging
6. **Review de PR** - Análisis de cambios de código (usa Flash)
7. **Documentación de API** - Docs técnicas completas (usa Flash)
8. **Análisis de Bug** - Diagnóstico sistemático (usa Flash)
9. **Optimización de Performance** - Identificar cuellos de botella (usa Flash)

## Estructura del proyecto

```
gemini-local-app/
├── electron/            # Configuración Electron
│   └── main.js          # Entry point de la app nativa
├── src/
│   ├── components/       # Componentes React
│   ├── data/            # Templates de prompts
│   ├── pages/           # Páginas Astro + API routes
│   ├── stores/          # Zustand stores
│   ├── styles/          # Estilos globales
│   ├── types/           # TypeScript types
│   └── utils/           # Utilidades
│       ├── gemini.ts    # SDK de Google Gemini
│       ├── database.ts  # SQLite
│       └── date.ts      # Formateo de fechas
├── data/                # SQLite database (runtime)
├── build/               # Iconos para la app
│   └── icon.icns        # Icono macOS (reemplazar)
├── package.json
├── tsconfig.json
└── .env.example
```

## API Routes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/chat` | POST | Enviar mensaje a Gemini |
| `/api/conversations` | GET/DELETE/PATCH | Gestión de conversaciones |
| `/api/stats` | GET | Estadísticas de uso y costos |
| `/api/templates` | GET/POST | Templates y fill de variables |

## Personalización

### Icono de la app

Reemplaza `build/icon.icns` con tu propio icono macOS:
```bash
# Convertir PNG a ICNS
sips -s format icns icon.png --out build/icon.icns
```

### Nombre de la app

Edita en `package.json`:
```json
{
  "name": "gemini-local-app",
  "build": {
    "productName": "Gemini AI Local"
  }
}
```

### Atajos de teclado

La app incluye menú nativo de macOS con atajos estándar:
- `Cmd + N`: Nueva conversación
- `Cmd + W`: Cerrar ventana
- `Cmd + Q`: Salir
- `Cmd + +`: Zoom in
- `Cmd + -`: Zoom out

## Troubleshooting

### La app no inicia
```bash
# Verificar API key
cat .env

# Verificar que data/ existe
mkdir -p data

# Limpiar caché y rebuild
rm -rf dist dist-electron node_modules
npm install
npm run electron:build:mac
```

### Error de better-sqlite3 en Electron
```bash
# Recompilar native modules para Electron
npm rebuild better-sqlite3
```

### App bloqueada por Gatekeeper
```bash
# Permitir app no notarizada (solo desarrollo)
sudo xattr -rd com.apple.quarantine dist-electron/mac/Gemini\ AI\ Local.app
```

## Licencia

MIT - Uso personal y profesional permitido.

---

Desarrollado por Retarget Architecture Team
Powered by Google Gemini Pro API
