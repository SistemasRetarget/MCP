FROM node:20-alpine

WORKDIR /app

# Argumentos para build (recibidos de Railway)
ARG PAYLOAD_SECRET
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL

# Variables de entorno para el build
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET:-dev-only-secret-change-me}
ENV DATABASE_URL=${DATABASE_URL:-file:./data/cms.db}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}

# Instalar dependencias del sistema para SQLite
RUN apk add --no-cache python3 make g++

# Copiar package.json
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios para datos persistentes
RUN mkdir -p /app/data
RUN mkdir -p /app/public/media

# Build (con NODE_ENV=production para optimización)
ENV NODE_ENV=production
RUN npm run build

# Exponer puerto (Railway usa PORT env variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start con PORT dinámico
CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]
