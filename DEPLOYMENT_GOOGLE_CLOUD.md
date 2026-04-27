# Deployment MCP Rails en Google Cloud
## Arquitectura Optimizada para Agencia de Marketing

**Fecha:** 2026-04-27  
**Plataforma:** Google Cloud Platform (GCP)  
**Servicio:** Cloud Run + Cloud SQL + Firestore  
**Ventaja:** Integración nativa con Google Workspace APIs

---

## 1. POR QUÉ GOOGLE CLOUD PARA RETARGET

```
┌─────────────────────────────────────────────────────────────────────────┐
│              COMPARATIVA: RAILWAY vs GOOGLE CLOUD                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RAILWAY (Actual)                  GOOGLE CLOUD (Recomendado)          │
│  ├─ Hosting genérico               ├─ Integración nativa Google        │
│  ├─ Bueno para startups            ├─ Escalabilidad automática         │
│  ├─ Costo predecible               ├─ Pay-as-you-go (ideal agencia)    │
│  └─ Limitado en APIs               └─ Acceso directo a APIs Google     │
│                                                                         │
│  VENTAJAS GOOGLE CLOUD PARA MARKETING:                                 │
│  ═════════════════════════════════════════════════════════════════     │
│                                                                         │
│  1. INTEGRACIÓN GOOGLE WORKSPACE                                       │
│     ├─ Gmail API: Lectura directa de emails                           │
│     ├─ Calendar API: Eventos sin latencia                             │
│     ├─ Chat API: Webhooks nativos                                     │
│     ├─ Drive API: Acceso a documentos                                 │
│     └─ Analytics API: Datos de campañas                               │
│                                                                         │
│  2. ESCALABILIDAD AUTOMÁTICA                                          │
│     ├─ Cloud Run: Escala a 0 cuando no hay uso                       │
│     ├─ Costo: Solo pagas por lo que usas                             │
│     ├─ Perfecto para agencia: Picos de trabajo                       │
│     └─ Ejemplo: Campaña masiva = escala automático                   │
│                                                                         │
│  3. SEGURIDAD + COMPLIANCE                                            │
│     ├─ Encriptación nativa                                            │
│     ├─ Cumple GDPR, CCPA, SOC 2                                      │
│     ├─ Auditoría integrada                                            │
│     └─ Ideal para datos de clientes                                   │
│                                                                         │
│  4. HERRAMIENTAS MARKETING NATIVAS                                    │
│     ├─ BigQuery: Análisis datos masivos                              │
│     ├─ Looker: Dashboards para clientes                              │
│     ├─ Vertex AI: IA para optimización                               │
│     └─ Pub/Sub: Procesamiento eventos en tiempo real                │
│                                                                         │
│  5. COSTO PARA AGENCIA                                                │
│     ├─ Cloud Run: $0.00001667 por segundo (muy barato)              │
│     ├─ Cloud SQL: $0.30/hora (MySQL/PostgreSQL)                     │
│     ├─ Firestore: $0.06 por 100K reads (flexible)                   │
│     └─ Total estimado: $50-200/mes (vs Railway $200-500)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA GOOGLE CLOUD

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RETARGET MCP EN GOOGLE CLOUD                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  USUARIOS (Barbana, Mauricio, Luis, Daniel, Alejandra)                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Google Workspace (Gmail, Chat, Calendar, Drive)                │  │
│  │ + Herramientas IA (Gemini, ChatGPT, Claude)                   │  │
│  └────────────────────┬────────────────────────────────────────────┘  │
│                       │                                               │
│                       │ HTTPS + OAuth 2.0                            │
│                       │                                               │
│  ┌────────────────────▼────────────────────────────────────────────┐  │
│  │           GOOGLE CLOUD PLATFORM                                │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Cloud Run (Rails MCP Server)                           │ │  │
│  │  │  ├─ Auto-scaling (0 a N instancias)                    │ │  │
│  │  │  ├─ Containerizado (Docker)                            │ │  │
│  │  │  ├─ Endpoints:                                         │ │  │
│  │  │  │  ├─ GET /api/v1/context/:user_id                  │ │  │
│  │  │  │  ├─ POST /api/v1/feedback                         │ │  │
│  │  │  │  └─ GET /api/v1/reports/*                         │ │  │
│  │  │  └─ Región: us-central1 (cercano a clientes)         │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Cloud SQL (PostgreSQL)                                 │ │  │
│  │  │  ├─ Base de datos relacional                           │ │  │
│  │  │  ├─ Backups automáticos                                │ │  │
│  │  │  ├─ Replicación (HA)                                   │ │  │
│  │  │  └─ Tablas:                                            │ │  │
│  │  │     ├─ users                                           │ │  │
│  │  │     ├─ context_snapshots                               │ │  │
│  │  │     ├─ feedback                                        │ │  │
│  │  │     └─ mcp_interactions                                │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Firestore (NoSQL - Opcional)                           │ │  │
│  │  │  ├─ Cache de contextos frecuentes                       │ │  │
│  │  │  ├─ Datos en tiempo real                               │ │  │
│  │  │  └─ Escalabilidad automática                           │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Cloud Tasks (Job Queue)                                │ │  │
│  │  │  ├─ Sincronización Google Workspace (async)            │ │  │
│  │  │  ├─ Generación de reportes (scheduled)                 │ │  │
│  │  │  ├─ Análisis de feedback (batch)                       │ │  │
│  │  │  └─ Retry automático                                   │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Cloud Logging + Cloud Monitoring                       │ │  │
│  │  │  ├─ Logs centralizados                                  │ │  │
│  │  │  ├─ Alertas automáticas                                │ │  │
│  │  │  ├─ Métricas de performance                            │ │  │
│  │  │  └─ Debugging en tiempo real                           │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  BigQuery (Data Warehouse - Opcional)                   │ │  │
│  │  │  ├─ Análisis histórico de feedback                      │ │  │
│  │  │  ├─ Reportes de ROI masivos                             │ │  │
│  │  │  ├─ Predicciones de mejora MCP                          │ │  │
│  │  │  └─ Integración con Looker                              │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │  Secret Manager                                         │ │  │
│  │  │  ├─ Google OAuth credentials                            │ │  │
│  │  │  ├─ API keys                                            │ │  │
│  │  │  ├─ Tokens encriptados                                  │ │  │
│  │  │  └─ Rotación automática                                 │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  GOOGLE WORKSPACE APIs (Lectura directa)                              │
│  ├─ Gmail API: Webhooks push                                         │
│  ├─ Google Chat API: Webhooks push                                   │
│  ├─ Calendar API: Polling cada 15 min                                │
│  └─ Drive API: Polling cada hora                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SETUP GOOGLE CLOUD: PASO A PASO

### 3.1 Crear Proyecto GCP

```bash
# 1. Crear proyecto
gcloud projects create retarget-mcp --name="Retarget MCP"

# 2. Establecer proyecto activo
gcloud config set project retarget-mcp

# 3. Habilitar APIs necesarias
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
  drive.googleapis.com

# 4. Crear Cloud SQL (PostgreSQL)
gcloud sql instances create retarget-mcp-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --backup \
  --availability-type=REGIONAL

# 5. Crear base de datos
gcloud sql databases create retarget_mcp \
  --instance=retarget-mcp-db

# 6. Crear usuario
gcloud sql users create rails \
  --instance=retarget-mcp-db \
  --password=[GENERAR PASSWORD SEGURO]
```

### 3.2 Preparar Rails para Cloud Run

```dockerfile
# Dockerfile
FROM ruby:3.2-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
  build-essential \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# Copiar Gemfile
COPY Gemfile Gemfile.lock ./

# Instalar gemas
RUN bundle install --deployment --without development test

# Copiar código
COPY . .

# Precompilar assets
RUN bundle exec rake assets:precompile

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "8080"]
```

```yaml
# .gcloudignore
.git
.gitignore
node_modules
.env
.env.local
spec/
test/
log/
tmp/
```

### 3.3 Configurar Environment Variables

```bash
# Guardar en Secret Manager
gcloud secrets create DATABASE_URL \
  --replication-policy="automatic" \
  --data-file=- << EOF
postgresql://rails:PASSWORD@CLOUD_SQL_IP:5432/retarget_mcp
EOF

gcloud secrets create GOOGLE_CLIENT_ID \
  --replication-policy="automatic" \
  --data-file=- << EOF
YOUR_GOOGLE_CLIENT_ID
EOF

gcloud secrets create GOOGLE_CLIENT_SECRET \
  --replication-policy="automatic" \
  --data-file=- << EOF
YOUR_GOOGLE_CLIENT_SECRET
EOF

gcloud secrets create RAILS_MASTER_KEY \
  --replication-policy="automatic" \
  --data-file=- << EOF
YOUR_RAILS_MASTER_KEY
EOF
```

### 3.4 Crear Cloud Run Service

```bash
# 1. Build Docker image
gcloud builds submit --tag gcr.io/retarget-mcp/rails-mcp

# 2. Deploy a Cloud Run
gcloud run deploy retarget-mcp \
  --image gcr.io/retarget-mcp/rails-mcp \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars "RAILS_ENV=production" \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest \
  --set-secrets GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest \
  --set-secrets RAILS_MASTER_KEY=RAILS_MASTER_KEY:latest \
  --allow-unauthenticated

# 3. Obtener URL
gcloud run services describe retarget-mcp --region us-central1
```

---

## 4. CONFIGURACIÓN RAILS PARA GCP

### 4.1 Gemfile

```ruby
source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.0"

gem "rails", "~> 7.0.0"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"
gem "sass-rails", ">= 6"
gem "webpacker", "~> 5.0"
gem "turbolinks-rails"
gem "jbuilder", "~> 2.7"
gem "redis", "~> 4.0"
gem "bcrypt", "~> 3.1.7"
gem "image_processing", "~> 1.2"
gem "aws-sdk-s3", require: false

# Google Cloud
gem "google-api-client"
gem "google-auth-library-ruby"
gem "google-cloud-storage"
gem "google-cloud-tasks"
gem "google-cloud-logging"
gem "google-cloud-secret-manager"

# API
gem "rack-cors"
gem "active_model_serializers"

# Background jobs
gem "sidekiq"
gem "sidekiq-cron"

# Monitoring
gem "stackdriver"
gem "google-cloud-monitoring"

# Testing
group :development, :test do
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "rspec-rails"
  gem "factory_bot_rails"
end

group :development do
  gem "web-console", ">= 4.1.0"
  gem "listen", "~> 3.3"
end
```

### 4.2 config/database.yml

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
  
  # Cloud SQL Proxy
  host: /cloudsql/retarget-mcp:us-central1:retarget-mcp-db
  username: rails
  password: <%= ENV['DB_PASSWORD'] %>
  database: retarget_mcp
```

### 4.3 config/initializers/google_cloud.rb

```ruby
# Configuración Google Cloud
require "google/cloud/secret_manager"

# Secret Manager client
def get_secret(secret_id)
  client = Google::Cloud::SecretManager.secret_manager_service
  name = client.secret_version_path(
    project: ENV['GOOGLE_CLOUD_PROJECT'],
    secret: secret_id,
    secret_version: 'latest'
  )
  client.access_secret_version(request: { name: name }).payload.data
end

# Cargar secrets en producción
if Rails.env.production?
  ENV['GOOGLE_CLIENT_ID'] ||= get_secret('GOOGLE_CLIENT_ID')
  ENV['GOOGLE_CLIENT_SECRET'] ||= get_secret('GOOGLE_CLIENT_SECRET')
end

# Logging a Cloud Logging
if Rails.env.production?
  require "google/cloud/logging"
  
  logging = Google::Cloud::Logging.new(
    project_id: ENV['GOOGLE_CLOUD_PROJECT']
  )
  
  Rails.logger = logging.logger "retarget-mcp"
end

# Monitoring
if Rails.env.production?
  require "google/cloud/monitoring"
  
  @monitoring = Google::Cloud::Monitoring.metric_service
end
```

### 4.4 config/initializers/sidekiq.rb

```ruby
# Cloud Tasks para jobs
if Rails.env.production?
  require "google/cloud/tasks"
  
  Sidekiq.configure_server do |config|
    config.redis = { url: ENV['REDIS_URL'] }
  end
  
  Sidekiq.configure_client do |config|
    config.redis = { url: ENV['REDIS_URL'] }
  end
else
  Sidekiq.configure_server do |config|
    config.redis = { url: "redis://localhost:6379/1" }
  end
  
  Sidekiq.configure_client do |config|
    config.redis = { url: "redis://localhost:6379/1" }
  end
end
```

---

## 5. DEPLOYMENT AUTOMÁTICO CON CLOUD BUILD

### 5.1 cloudbuild.yaml

```yaml
steps:
  # 1. Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/rails-mcp', '.']
  
  # 2. Push a Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/rails-mcp']
  
  # 3. Deploy a Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=k8s/
      - --image=gcr.io/$PROJECT_ID/rails-mcp
      - --location=us-central1
      - --cluster=retarget-mcp
  
  # 4. Run migrations
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - exec
      - --
      - 'bundle exec rails db:migrate'

images:
  - 'gcr.io/$PROJECT_ID/rails-mcp'

options:
  machineType: 'N1_HIGHCPU_8'

timeout: '3600s'
```

### 5.2 Conectar GitHub a Cloud Build

```bash
# 1. Ir a Cloud Build en GCP Console
# 2. Conectar repositorio GitHub
# 3. Crear trigger:
#    - Branch: main
#    - Build config: cloudbuild.yaml
#    - Auto-deploy a Cloud Run

# Resultado: Cada push a main → Deploy automático
```

---

## 6. MONITOREO Y ALERTAS

### 6.1 Cloud Monitoring

```bash
# Crear alertas automáticas
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="MCP Error Rate High" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

### 6.2 Logs

```bash
# Ver logs en tiempo real
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format json

# Filtrar por severidad
gcloud logging read "severity=ERROR" \
  --limit 20 \
  --format json
```

---

## 7. COSTO ESTIMADO (Mensual)

```
DESGLOSE DE COSTOS
═══════════════════════════════════════════════════════════════

Cloud Run:
├─ 1M requests/mes @ $0.40 per 1M: $0.40
├─ 512MB memory, 1 CPU: ~$25/mes
└─ Subtotal: $25.40

Cloud SQL (PostgreSQL):
├─ db-f1-micro: $30/mes
├─ Storage 10GB: $1.70/mes
├─ Backups: $0.50/mes
└─ Subtotal: $32.20

Cloud Tasks:
├─ 100K tasks/mes: $0.40
└─ Subtotal: $0.40

Logging + Monitoring:
├─ 100GB logs: $0.50/mes
└─ Subtotal: $0.50

Secret Manager:
├─ 5 secrets: $0.06/mes
└─ Subtotal: $0.06

═══════════════════════════════════════════════════════════════
TOTAL ESTIMADO: $58.56/mes

(vs Railway: $200-500/mes)
(vs AWS: $150-400/mes)

NOTA: Escala automáticamente. Si uso ↑ → costo ↑
      Si uso ↓ → costo ↓
```

---

## 8. VENTAJAS GOOGLE CLOUD PARA RETARGET

```
1. INTEGRACIÓN NATIVA GOOGLE WORKSPACE
   ├─ OAuth directo con Google
   ├─ Webhooks push (no polling)
   ├─ APIs en la misma infraestructura
   └─ Latencia mínima

2. ESCALABILIDAD AUTOMÁTICA
   ├─ Picos de trabajo (campañas masivas)
   ├─ Escala a 0 cuando no hay uso
   ├─ Costo solo por lo que usas
   └─ Ideal para agencia

3. SEGURIDAD + COMPLIANCE
   ├─ Encriptación nativa
   ├─ GDPR, CCPA, SOC 2
   ├─ Auditoría integrada
   └─ Datos de clientes protegidos

4. HERRAMIENTAS MARKETING
   ├─ BigQuery: Análisis datos masivos
   ├─ Looker: Dashboards para clientes
   ├─ Vertex AI: IA para optimización
   └─ Pub/Sub: Eventos en tiempo real

5. COSTO OPTIMIZADO
   ├─ Pay-as-you-go
   ├─ Descuentos por uso sostenido
   ├─ Estimado: $50-200/mes
   └─ Escalable sin costos lineales
```

---

## 9. PRÓXIMOS PASOS

### Esta semana:
```
Lunes:
├─ Crear Google Cloud Project
├─ Habilitar APIs
└─ Crear Cloud SQL

Martes-Miércoles:
├─ Preparar Rails para GCP
├─ Crear Dockerfile
└─ Configurar Secret Manager

Jueves:
├─ Deploy inicial a Cloud Run
├─ Testing
└─ Configurar Cloud Build

Viernes:
├─ Reunión Necesidades con equipo
└─ Ajustes basados en feedback
```

### Próximas semanas:
```
├─ Integración Google Workspace APIs
├─ Webhook handlers
├─ Reportes y dashboards
└─ Go-live
```

---

## 10. CHECKLIST GOOGLE CLOUD

```
SETUP INICIAL
═══════════════════════════════════════════════════════════════

□ Google Cloud Project creado
□ APIs habilitadas (Run, SQL, Tasks, Logging, etc)
□ Cloud SQL PostgreSQL creado
□ Secret Manager configurado
□ Service Account creado
□ Dockerfile preparado
□ cloudbuild.yaml configurado
□ GitHub conectado a Cloud Build

DEPLOYMENT
═══════════════════════════════════════════════════════════════

□ Docker image buildeable
□ Cloud Run service creado
□ Migrations ejecutadas
□ Health check funcionando
□ Logs visibles en Cloud Logging
□ Alertas configuradas

SEGURIDAD
═══════════════════════════════════════════════════════════════

□ Secrets encriptados
□ Service Account con permisos mínimos
□ Cloud SQL con firewall
□ Cloud Run con autenticación
□ CORS configurado
□ Rate limiting implementado
```

---

**¿Empezamos con Google Cloud?**

Puedo crear el proyecto GCP y hacer el setup inicial esta semana.
