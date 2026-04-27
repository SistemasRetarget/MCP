# Setup Local — Pueblo La Dehesa Rediseño

## Estado actual

✅ **Repositorio Git inicializado** en `/Users/spam11/Desktop/puebloladehesa-rediseno`  
✅ **Estructura de carpetas creada** (Next.js + Payload CMS)  
✅ **Archivos de configuración listos** (package.json, Dockerfile, railway.json)  
✅ **Primer commit realizado** (Initial commit: Next.js + Payload CMS structure)

---

## Próximos pasos

### 1. Instalar dependencias (5 min)

```bash
cd /Users/spam11/Desktop/puebloladehesa-rediseno
npm install
```

Esto instalará:
- Next.js 15
- Payload CMS 3
- PostgreSQL adapter
- Tailwind CSS
- TypeScript

### 2. Configurar base de datos PostgreSQL (10 min)

**Opción A: PostgreSQL local (recomendado para desarrollo)**

```bash
# Instalar PostgreSQL (si no lo tienes)
brew install postgresql@15

# Iniciar servicio
brew services start postgresql@15

# Crear base de datos
createdb puebloladehesa

# Crear usuario (opcional)
createuser -P puebloladehesa_user
# Contraseña: (elige una)
```

**Opción B: Docker (alternativa)**

```bash
docker run --name puebloladehesa-db \
  -e POSTGRES_DB=puebloladehesa \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configurar variables de entorno (5 min)

```bash
cd /Users/spam11/Desktop/puebloladehesa-rediseno
cp .env.example .env.local
```

Editar `.env.local`:

```env
# Database (ajusta según tu setup)
DATABASE_URI=postgresql://localhost:5432/puebloladehesa

# Payload (genera un secret seguro)
PAYLOAD_SECRET=tu-secret-muy-largo-y-seguro-aqui-123456

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google Analytics (dejar vacío por ahora)
NEXT_PUBLIC_GA_ID=

# Google Tag Manager (dejar vacío por ahora)
NEXT_PUBLIC_GTM_ID=

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Ejecutar en desarrollo (5 min)

```bash
npm run dev
```

Esto inicia:
- **Frontend:** http://localhost:3000
- **CMS Admin:** http://localhost:3000/admin
- **API:** http://localhost:3000/api

### 5. Crear primer usuario en el CMS (5 min)

1. Ir a http://localhost:3000/admin
2. Crear usuario (email + contraseña)
3. Loguear
4. Comenzar a crear colecciones

---

## Estructura del repositorio

```
puebloladehesa-rediseno/
├── app/                      # Next.js App Router
│   ├── components/           # Componentes React (vacío, crear según necesites)
│   ├── lib/                  # Utilidades (vacío)
│   ├── api/                  # API routes (vacío)
│   ├── styles/
│   │   └── globals.css       # CSS global + Tailwind
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Home page
├── payload/
│   ├── collections/          # Colecciones del CMS (vacío, crear)
│   │   ├── Casa.ts           # (crear)
│   │   ├── Experiencia.ts    # (crear)
│   │   ├── Pagina.ts         # (crear)
│   │   ├── Blog.ts           # (crear)
│   │   ├── Configuracion.ts  # (crear)
│   │   └── Users.ts          # (crear)
│   ├── blocks/               # Bloques de contenido (vacío, crear)
│   └── config.ts             # Configuración de Payload
├── public/
│   ├── images/               # Imágenes estáticas
│   └── fonts/                # Fuentes locales
├── .env.example              # Template de variables
├── .env.local                # Variables locales (NO commitear)
├── .gitignore                # Archivos a ignorar
├── package.json              # Dependencias
├── next.config.js            # Config de Next.js
├── payload.config.ts         # Config de Payload
├── Dockerfile                # Para Railway
├── railway.json              # Config de Railway
└── README.md                 # Documentación
```

---

## Crear colecciones del CMS

Las colecciones están vacías. Necesitas crear:

### Casa.ts

```typescript
import { CollectionConfig } from 'payload/types';

export const Casa: CollectionConfig = {
  slug: 'casas',
  admin: {
    useAsTitle: 'nombre',
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'descripcion_corta',
      type: 'textarea',
    },
    {
      name: 'descripcion_larga',
      type: 'richText',
    },
    {
      name: 'precio_base',
      type: 'number',
    },
    {
      name: 'capacidad',
      type: 'number',
    },
    {
      name: 'galeria',
      type: 'array',
      fields: [
        {
          name: 'imagen',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [
        {
          name: 'nombre',
          type: 'text',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'meta_title',
          type: 'text',
        },
        {
          name: 'meta_description',
          type: 'textarea',
        },
      ],
    },
  ],
};
```

(Crear archivos similares para Experiencia, Pagina, Blog, Configuracion)

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Crear colecciones de Payload
npm run payload

# Build de Payload
npm run payload:build
```

---

## Flujo de trabajo con Git

### Crear rama de feature

```bash
git checkout -b feature/crear-colecciones develop
```

### Hacer cambios y commit

```bash
git add .
git commit -m "feat: crear colecciones Casa y Experiencia"
```

### Push a GitHub

```bash
git push origin feature/crear-colecciones
```

### Crear Pull Request en GitHub y mergear a `develop`

---

## Despliegue en Railway

### 1. Conectar repositorio a Railway

1. Ir a [railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Conectar repositorio de GitHub
4. Railway detectará automáticamente el Dockerfile

### 2. Agregar servicio PostgreSQL

1. Railway → Add Service → PostgreSQL
2. Las credenciales se inyectarán automáticamente

### 3. Configurar variables de entorno

En Railway → Project Settings → Variables:

```
DATABASE_URI=postgresql://...
PAYLOAD_SECRET=tu-secret-aqui
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678
NODE_ENV=production
```

### 4. Deploy automático

Cada push a `main` dispara un deploy automático.

---

## Troubleshooting

### Error: "Cannot find module 'next'"

```bash
npm install
```

### Error: "Database connection failed"

Verificar que PostgreSQL está corriendo:

```bash
# macOS
brew services list | grep postgresql

# Si no está corriendo:
brew services start postgresql@15
```

### Error: "Port 3000 already in use"

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
PORT=3001 npm run dev
```

### Error: "PAYLOAD_SECRET not set"

Asegurarse de que `.env.local` existe y tiene `PAYLOAD_SECRET` definido.

---

## Contacto

Para dudas o problemas:
- Revisar [documentación de Next.js](https://nextjs.org/docs)
- Revisar [documentación de Payload](https://payloadcms.com/docs)
- Crear issue en el repositorio

---

**Última actualización:** Abril 2026  
**Responsable:** Luis Alberto Maldonado — Sistemas
