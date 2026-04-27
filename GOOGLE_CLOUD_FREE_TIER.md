# Google Cloud Free Tier — Plan de Prueba para MCP
## Cómo Levantar el MCP sin Costo

**Fecha:** 2026-04-27  
**Créditos Iniciales:** $300 USD (válidos 90 días)  
**Objetivo:** Levantar y testear MCP completo sin pagar

---

## 1. GOOGLE CLOUD FREE TIER: DETALLES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD FREE TIER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OPCIÓN A: CRÉDITOS INICIALES (Recomendado para MCP)                  │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ✅ $300 USD de créditos gratis                                        │
│  ✅ Válidos por 90 días                                                │
│  ✅ Sin tarjeta de crédito requerida (pero piden para verificación)   │
│  ✅ Suficiente para levantar MCP completo                              │
│                                                                         │
│  COSTO ESTIMADO MCP EN 90 DÍAS:                                        │
│  ├─ Cloud Run: $25 × 3 meses = $75                                    │
│  ├─ Cloud SQL: $32 × 3 meses = $96                                    │
│  ├─ Cloud Tasks: $0.40 × 3 = $1.20                                    │
│  ├─ Logging: $0.50 × 3 = $1.50                                        │
│  └─ TOTAL: ~$174 (dentro de $300 de crédito)                          │
│                                                                         │
│  RESULTADO: 90 días de MCP GRATIS + sobra crédito                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OPCIÓN B: ALWAYS FREE (Permanente, muy limitado)                     │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ✅ Cloud Run: 2M requests/mes gratis                                  │
│  ✅ Cloud SQL: 1 instancia db-f1-micro gratis                         │
│  ✅ Cloud Storage: 5GB gratis                                          │
│  ✅ BigQuery: 1TB queries/mes gratis                                   │
│  ✅ Firestore: 50K reads/día gratis                                    │
│  ✅ Cloud Tasks: 100K tasks/mes gratis                                │
│                                                                         │
│  LIMITACIÓN: Muy poco para producción, pero OK para desarrollo         │
│                                                                         │
│  RECOMENDACIÓN: Usar $300 créditos primero (90 días)                  │
│                 Luego evaluar si pasa a pago o usa Always Free         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SETUP GOOGLE CLOUD FREE TIER: PASO A PASO

### 2.1 Crear Cuenta Google Cloud

```bash
# 1. Ir a https://cloud.google.com/free
# 2. Click en "Get started for free"
# 3. Ingresar Google Account (o crear una nueva)
# 4. Aceptar términos
# 5. Ingresar país y zona horaria
# 6. Ingresar tarjeta de crédito (para verificación, no se cobra)
# 7. Verificar teléfono
# 8. Confirmar

RESULTADO:
✅ $300 USD de créditos
✅ Válidos 90 días
✅ Acceso a todas las APIs
```

### 2.2 Crear Proyecto GCP

```bash
# Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Crear proyecto
gcloud projects create retarget-mcp-free \
  --name="Retarget MCP Free Tier"

# Establecer proyecto activo
gcloud config set project retarget-mcp-free

# Verificar
gcloud projects describe retarget-mcp-free
```

### 2.3 Habilitar APIs Necesarias

```bash
# Habilitar APIs para MCP
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  firestore.googleapis.com \
  cloudtasks.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  secretmanager.googleapis.com \
  gmail.googleapis.com \
  calendar-json.googleapis.com \
  chat.googleapis.com \
  drive.googleapis.com \
  container.googleapis.com

# Verificar
gcloud services list --enabled
```

---

## 3. CREAR INFRAESTRUCTURA GRATUITA

### 3.1 Cloud SQL (PostgreSQL Gratuito)

```bash
# Crear instancia db-f1-micro (gratis en Always Free)
gcloud sql instances create retarget-mcp-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --backup \
  --availability-type=ZONAL \
  --storage-size=10GB

# Crear base de datos
gcloud sql databases create retarget_mcp \
  --instance=retarget-mcp-db

# Crear usuario
gcloud sql users create rails \
  --instance=retarget-mcp-db \
  --password=GENERAR_PASSWORD_SEGURO

# Obtener IP pública (para conexión local)
gcloud sql instances describe retarget-mcp-db \
  --format='value(ipAddresses[0].ipAddress)'
```

### 3.2 Cloud Run (Gratis hasta 2M requests/mes)

```bash
# Crear servicio Cloud Run (sin deploy aún)
# Haremos esto después de preparar Rails

# Nota: Los primeros 2M requests/mes son GRATIS
# Después: $0.40 por 1M requests
# En 90 días con $300: Puedes hacer ~750M requests
```

### 3.3 Cloud Storage (Gratis 5GB)

```bash
# Crear bucket para assets (opcional)
gsutil mb -p retarget-mcp-free gs://retarget-mcp-assets

# Configurar CORS para acceso desde Cloud Run
gsutil cors set - gs://retarget-mcp-assets << 'EOF'
[
  {
    "origin": ["https://retarget-mcp-*.run.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

### 3.4 Secret Manager (Gratis)

```bash
# Guardar secrets
echo "postgresql://rails:PASSWORD@CLOUD_SQL_IP:5432/retarget_mcp" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo "YOUR_GOOGLE_CLIENT_ID" | \
  gcloud secrets create GOOGLE_CLIENT_ID --data-file=-

echo "YOUR_GOOGLE_CLIENT_SECRET" | \
  gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
```

---

## 4. PREPARAR RAILS PARA FREE TIER

### 4.1 Dockerfile Optimizado (Bajo Costo)

```dockerfile
# Dockerfile
FROM ruby:3.2-slim

WORKDIR /app

# Instalar solo dependencias necesarias
RUN apt-get update && apt-get install -y \
  build-essential \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Copiar Gemfile
COPY Gemfile Gemfile.lock ./

# Instalar gemas (sin dev/test)
RUN bundle install --deployment --without development test

# Copiar código
COPY . .

# Precompilar assets (mínimo)
RUN bundle exec rake assets:precompile

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "8080"]
```

### 4.2 config/database.yml (Cloud SQL)

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: 5
  timeout: 5000

production:
  <<: *default
  # Usar Cloud SQL Proxy (recomendado)
  host: /cloudsql/retarget-mcp-free:us-central1:retarget-mcp-db
  username: rails
  password: <%= ENV['DB_PASSWORD'] %>
  database: retarget_mcp
```

### 4.3 Gemfile Minimalista

```ruby
source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.0"

gem "rails", "~> 7.0.0"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"
gem "jbuilder", "~> 2.7"

# Google Cloud
gem "google-api-client"
gem "google-auth-library-ruby"
gem "google-cloud-secret-manager"
gem "google-cloud-tasks"

# API
gem "rack-cors"

# Background jobs (Cloud Tasks, no Sidekiq)
gem "google-cloud-tasks"

# Monitoring
gem "google-cloud-logging"

group :development, :test do
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "rspec-rails"
end

group :development do
  gem "web-console", ">= 4.1.0"
end
```

---

## 5. DEPLOY A CLOUD RUN (GRATIS)

### 5.1 Build y Deploy

```bash
# 1. Crear archivo .gcloudignore
cat > .gcloudignore << 'EOF'
.git
.gitignore
node_modules
.env
.env.local
spec/
test/
log/
tmp/
EOF

# 2. Deploy directo a Cloud Run
gcloud run deploy retarget-mcp \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1 \
  --timeout 3600 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "RAILS_ENV=production" \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest \
  --set-secrets GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest \
  --allow-unauthenticated

# 3. Obtener URL
gcloud run services describe retarget-mcp --region us-central1 --format='value(status.url)'
```

### 5.2 Resultado

```
✅ MCP deployado en Google Cloud
✅ URL: https://retarget-mcp-XXXX.run.app
✅ Costo: $0 (dentro de free tier)
✅ Escalabilidad: Automática
```

---

## 6. MONITOREO GRATUITO

### 6.1 Cloud Logging (Gratis)

```bash
# Ver logs en tiempo real
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format json

# Filtrar errores
gcloud logging read "severity=ERROR" \
  --limit 20 \
  --format json
```

### 6.2 Cloud Monitoring (Gratis)

```bash
# Ver métricas
gcloud monitoring metrics-descriptors list

# Crear dashboard
gcloud monitoring dashboards create --config-from-file=dashboard.json
```

---

## 7. TESTING DEL MCP EN FREE TIER

### 7.1 Crear Usuario de Prueba

```bash
# Conectarse a Cloud SQL
gcloud sql connect retarget-mcp-db --user=rails

# En psql:
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),
  ai_tool VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, role, ai_tool) VALUES
  ('luis@retarget.cl', 'dev', 'claude'),
  ('barbana@retarget.cl', 'coo', 'gemini'),
  ('mauricio@retarget.cl', 'ceo', 'chatgpt'),
  ('daniel@retarget.cl', 'seo', 'gemini'),
  ('alejandra@retarget.cl', 'designer', 'claude');
```

### 7.2 Test Endpoint

```bash
# Obtener contexto de Luis
curl -X GET \
  "https://retarget-mcp-XXXX.run.app/api/v1/context/1" \
  -H "Content-Type: application/json"

# Enviar feedback
curl -X POST \
  "https://retarget-mcp-XXXX.run.app/api/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "type": "suggestion",
    "content": "Sería útil incluir GitHub commits"
  }'
```

---

## 8. COSTO REAL EN 90 DÍAS (FREE TIER)

```
DESGLOSE ESTIMADO
═══════════════════════════════════════════════════════════════

Cloud Run:
├─ 100K requests/día × 90 días = 9M requests
├─ Primeros 2M gratis
├─ Restantes 7M @ $0.40/1M = $2.80
└─ Subtotal: $2.80

Cloud SQL (db-f1-micro):
├─ Always Free: 1 instancia gratis
├─ Storage 10GB: Gratis
└─ Subtotal: $0

Cloud Tasks:
├─ Always Free: 100K tasks/mes
├─ Estimado: 10K tasks/mes
└─ Subtotal: $0

Logging:
├─ Always Free: 50GB/mes
├─ Estimado: 5GB/mes
└─ Subtotal: $0

Secret Manager:
├─ Always Free: 6 secrets
├─ Estimado: 4 secrets
└─ Subtotal: $0

═══════════════════════════════════════════════════════════════
TOTAL REAL: ~$2.80 en 90 días

CRÉDITOS DISPONIBLES: $300
CRÉDITOS USADOS: $2.80
CRÉDITOS RESTANTES: $297.20

✅ COMPLETAMENTE GRATIS
```

---

## 9. DESPUÉS DE 90 DÍAS: OPCIONES

```
OPCIÓN A: PASAR A PAGO
═══════════════════════════════════════════════════════════════

Costo mensual estimado: $58.56
├─ Cloud Run: $25
├─ Cloud SQL: $32
├─ Cloud Tasks: $0.40
├─ Logging: $0.50
└─ Secret Manager: $0.06

DECISIÓN: ¿Vale la pena? Depende de:
├─ Adopción del MCP (¿lo usan realmente?)
├─ ROI (¿mejora productividad?)
└─ Alternativas (¿Railway sigue siendo opción?)


OPCIÓN B: USAR ALWAYS FREE (Permanente)
═══════════════════════════════════════════════════════════════

Limitaciones:
├─ Cloud Run: 2M requests/mes (bajo)
├─ Cloud SQL: db-f1-micro (muy limitado)
├─ Cloud Tasks: 100K tasks/mes (OK)
└─ Costo: $0 para siempre

DECISIÓN: Solo si MCP tiene bajo uso
├─ Si es piloto interno: OK
├─ Si escala a producción: Necesita pago


OPCIÓN C: HÍBRIDO
═══════════════════════════════════════════════════════════════

├─ Desarrollo/Testing: Always Free
├─ Producción: Pago ($58/mes)
└─ Costo: Flexible según necesidad
```

---

## 10. CHECKLIST: LEVANTAR MCP EN FREE TIER

```
SETUP INICIAL (Día 1)
═══════════════════════════════════════════════════════════════

□ Crear cuenta Google Cloud
□ Ingresar tarjeta de crédito (verificación)
□ Crear proyecto GCP
□ Habilitar APIs necesarias
□ Crear Cloud SQL (PostgreSQL)
□ Crear Secret Manager secrets

PREPARAR RAILS (Día 2)
═══════════════════════════════════════════════════════════════

□ Crear Dockerfile optimizado
□ Configurar database.yml
□ Crear Gemfile minimalista
□ Crear .gcloudignore
□ Testear localmente

DEPLOY (Día 3)
═══════════════════════════════════════════════════════════════

□ Deploy a Cloud Run
□ Obtener URL pública
□ Crear tablas en Cloud SQL
□ Testear endpoints
□ Configurar logging

TESTING (Día 4-5)
═══════════════════════════════════════════════════════════════

□ Crear usuarios de prueba
□ Test GET /api/v1/context/:user_id
□ Test POST /api/v1/feedback
□ Verificar logs en Cloud Logging
□ Medir performance

DOCUMENTACIÓN (Día 5)
═══════════════════════════════════════════════════════════════

□ Documentar URLs de endpoints
□ Documentar credenciales
□ Documentar cómo escalar
□ Documentar costo estimado
□ Preparar para reunión equipo
```

---

## 11. PRÓXIMOS PASOS INMEDIATOS

### Esta semana:

```
LUNES:
├─ Crear cuenta Google Cloud Free Tier
├─ Crear proyecto GCP
└─ Habilitar APIs

MARTES:
├─ Crear Cloud SQL
├─ Preparar Rails
└─ Crear Dockerfile

MIÉRCOLES:
├─ Deploy a Cloud Run
├─ Testear endpoints
└─ Configurar logging

JUEVES:
├─ Testing completo
├─ Documentar
└─ Preparar para reunión

VIERNES:
├─ Reunión Necesidades con equipo
├─ Demo MCP en Google Cloud
└─ Feedback inicial
```

---

## 12. COMANDOS RÁPIDOS (Copiar y Pegar)

```bash
# Setup completo en 5 minutos
gcloud projects create retarget-mcp-free --name="Retarget MCP"
gcloud config set project retarget-mcp-free

gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  firestore.googleapis.com cloudtasks.googleapis.com logging.googleapis.com \
  monitoring.googleapis.com secretmanager.googleapis.com gmail.googleapis.com \
  calendar-json.googleapis.com chat.googleapis.com drive.googleapis.com

gcloud sql instances create retarget-mcp-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create retarget_mcp --instance=retarget-mcp-db

gcloud sql users create rails --instance=retarget-mcp-db \
  --password=GENERAR_PASSWORD

# Obtener IP
gcloud sql instances describe retarget-mcp-db \
  --format='value(ipAddresses[0].ipAddress)'
```

---

**¿Empezamos esta semana a levantar el MCP en Google Cloud Free Tier?**

Con $300 de créditos gratis, tenemos 90 días para testear, iterar y validar si el MCP funciona para Retarget.
