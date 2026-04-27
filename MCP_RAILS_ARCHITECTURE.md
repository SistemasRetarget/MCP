# MCP en Rails — Arquitectura Agnóstica Multi-IA
## Sistema Colaborativo para Retarget

**Fecha:** 2026-04-27  
**Stack:** Rails 7 + PostgreSQL + Google Workspace APIs  
**Usuarios IA:** Barbana, Mauricio, Luis, Daniel, Alejandra  
**Objetivo:** Contexto compartido sin alterar flujos existentes

---

## 1. VISIÓN GENERAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA MCP AGNÓSTICA                              │
│                                                                             │
│  USUARIOS RETARGET                    MCP RAILS SERVER                    │
│  ┌──────────────┐                     ┌──────────────────────────────┐    │
│  │ Barbana      │                     │                              │    │
│  │ (Gemini)     │──┐                  │  ┌────────────────────────┐  │    │
│  │              │  │                  │  │  Context Manager       │  │    │
│  └──────────────┘  │                  │  │  • Proyectos           │  │    │
│                    │                  │  │  • Tasks               │  │    │
│  ┌──────────────┐  │                  │  │  • Decisiones          │  │    │
│  │ Mauricio     │  │                  │  │  • Métricas            │  │    │
│  │ (ChatGPT)    │──┼─ Google OAuth ──►│  └────────────────────────┘  │    │
│  │              │  │                  │                              │    │
│  └──────────────┘  │                  │  ┌────────────────────────┐  │    │
│                    │                  │  │  Data Aggregator       │  │    │
│  ┌──────────────┐  │                  │  │  • Gmail               │  │    │
│  │ Luis         │  │                  │  │  • Calendar            │  │    │
│  │ (Claude)     │──┼─ API Key ───────►│  │  • Chat                │  │    │
│  │              │  │                  │  │  • Drive               │  │    │
│  └──────────────┘  │                  │  └────────────────────────┘  │    │
│                    │                  │                              │    │
│  ┌──────────────┐  │                  │  ┌────────────────────────┐  │    │
│  │ Daniel       │  │                  │  │  Feedback Collector    │  │    │
│  │ (Gemini)     │──┼─ Webhook ───────►│  │  • Ratings             │  │    │
│  │              │  │                  │  │  • Suggestions         │  │    │
│  └──────────────┘  │                  │  │  • Usage patterns      │  │    │
│                    │                  │  └────────────────────────┘  │    │
│  ┌──────────────┐  │                  │                              │    │
│  │ Alejandra    │  │                  │  ┌────────────────────────┐  │    │
│  │ (Claude)     │──┘                  │  │  Report Generator      │  │    │
│  │              │                     │  │  • Adoption metrics    │  │    │
│  └──────────────┘                     │  │  • MCP improvements    │  │    │
│                                       │  │  • ROI analysis        │  │    │
│                                       │  └────────────────────────┘  │    │
│                                       │                              │    │
│                                       └──────────────────────────────┘    │
│                                                                             │
│  GOOGLE WORKSPACE (Sin cambios)                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Gmail        │ │ Calendar     │ │ Chat         │ │ Drive        │    │
│  │ (normal)     │ │ (normal)     │ │ (normal)     │ │ (normal)     │    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUJO DE DATOS: SIN ALTERAR NADA

### 2.1 Escenario Real: Barbana usa Gemini

```
BARBANA TRABAJA NORMALMENTE
═══════════════════════════════════════════════════════════════

1. Abre Gmail (normal)
   ├─ Lee email cliente
   └─ MCP detecta automáticamente (webhook)
      └─ Extrae: remitente, asunto, urgencia
      └─ Guarda en contexto compartido

2. Abre Google Chat (normal)
   ├─ Escribe: "Leig, qué tareas tenemos hoy"
   └─ MCP detecta (API polling)
      └─ Extrae: conversación, contexto
      └─ Guarda en contexto compartido

3. Abre Gemini (su herramienta)
   ├─ Escribe: "Qué tengo pendiente hoy"
   └─ Gemini hace request a MCP Rails
      └─ MCP retorna: contexto completo de Barbana
      └─ Gemini responde con info actualizada

4. Barbana actúa (normal)
   ├─ Responde email
   ├─ Asigna tareas
   └─ MCP registra acciones (feedback)

RESULTADO:
✅ Barbana no cambió su flujo
✅ Gemini tiene contexto completo
✅ MCP aprendió de la interacción
✅ Datos disponibles para reportes
```

### 2.2 Escenario Real: Luis usa Claude

```
LUIS TRABAJA NORMALMENTE
═══════════════════════════════════════════════════════════════

1. Recibe tarea por Chat (normal)
   └─ MCP detecta (webhook)
      └─ Extrae: descripción, urgencia, solicitante
      └─ Guarda en contexto compartido

2. Abre Claude (su herramienta)
   ├─ Escribe: "Tengo una tarea nueva, cuál es"
   └─ Claude hace request a MCP Rails
      └─ MCP retorna: contexto completo de Luis
      └─ Claude sugiere plan de trabajo

3. Luis desarrolla (normal)
   ├─ Código en VS Code
   ├─ Commit a GitHub
   └─ MCP detecta (webhook GitHub)
      └─ Extrae: cambios, tests, deploy status
      └─ Guarda en contexto compartido

4. Luis completa tarea
   └─ MCP registra: tiempo, calidad, feedback
      └─ Datos para reportes de productividad

RESULTADO:
✅ Luis no cambió su flujo
✅ Claude tiene contexto completo
✅ MCP aprendió de la interacción
✅ Datos disponibles para reportes
```

---

## 3. ARQUITECTURA RAILS

### 3.1 Estructura de Carpetas

```
retarget-mcp/
├── app/
│   ├── models/
│   │   ├── user.rb                    # Usuarios Retarget
│   │   ├── context_snapshot.rb        # Contexto por usuario
│   │   ├── task.rb                    # Tasks detectadas
│   │   ├── feedback.rb                # Feedback de usuarios
│   │   ├── integration.rb             # Integraciones (Gmail, Chat, etc)
│   │   └── mcp_interaction.rb         # Log de interacciones MCP
│   │
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── context_controller.rb  # GET contexto por usuario
│   │   │   ├── feedback_controller.rb # POST feedback
│   │   │   ├── webhooks_controller.rb # Webhooks Google
│   │   │   └── reports_controller.rb  # Reportes MCP
│   │   └── admin/
│   │       └── dashboard_controller.rb
│   │
│   ├── services/
│   │   ├── context_builder.rb         # Arma contexto completo
│   │   ├── google_sync.rb             # Sincroniza Google Workspace
│   │   ├── feedback_analyzer.rb       # Analiza feedback
│   │   └── report_generator.rb        # Genera reportes
│   │
│   └── jobs/
│       ├── sync_google_data_job.rb    # Polling Google APIs
│       ├── aggregate_context_job.rb   # Actualiza contexto
│       └── generate_reports_job.rb    # Reportes periódicos
│
├── config/
│   ├── routes.rb
│   └── initializers/
│       └── google_oauth.rb
│
├── db/
│   └── migrate/
│       ├── create_users.rb
│       ├── create_context_snapshots.rb
│       ├── create_tasks.rb
│       ├── create_feedback.rb
│       └── create_mcp_interactions.rb
│
└── spec/
    └── ...
```

### 3.2 Modelos de Datos

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_many :context_snapshots
  has_many :feedbacks
  has_many :integrations
  
  enum role: { jefe: 0, dev: 1, cm: 2, designer: 3, seo: 4, media: 5 }
  enum ai_tool: { claude: 0, gemini: 1, chatgpt: 2 }
  
  # Usuarios IA activos
  scope :ai_users, -> { where(is_ai_user: true) }
  
  validates :email, :role, :ai_tool, presence: true
  validates :email, uniqueness: true
end

# app/models/context_snapshot.rb
class ContextSnapshot < ApplicationRecord
  belongs_to :user
  
  # Datos estructurados del contexto
  store :data, accessors: [
    :active_tasks,
    :recent_emails,
    :calendar_events,
    :chat_messages,
    :current_projects,
    :decisions_pending,
    :metrics
  ]
  
  # Timestamp para versionado
  validates :user_id, presence: true
end

# app/models/feedback.rb
class Feedback < ApplicationRecord
  belongs_to :user
  
  enum feedback_type: { 
    suggestion: 0,      # "Podrías mejorar X"
    rating: 1,          # "Esto fue útil: 4/5"
    issue: 2,           # "Esto no funcionó"
    usage_pattern: 3    # Datos de cómo usó MCP
  }
  
  validates :user_id, :feedback_type, presence: true
end

# app/models/mcp_interaction.rb
class McpInteraction < ApplicationRecord
  belongs_to :user
  
  # Log de cada interacción
  # {
  #   "timestamp": "2026-04-27T14:30:00Z",
  #   "ai_tool": "claude",
  #   "request": "Qué tengo pendiente hoy",
  #   "context_provided": { ... },
  #   "response_quality": 4.5,
  #   "time_to_response": 1.2,
  #   "user_action_after": "implemented_suggestion"
  # }
  
  store :data, accessors: [
    :ai_tool,
    :request,
    :context_provided,
    :response_quality,
    :time_to_response,
    :user_action_after
  ]
end
```

### 3.3 API Endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # MCP Endpoints (consumidos por IA)
      get '/context/:user_id', to: 'context#show'
      post '/feedback', to: 'feedback#create'
      get '/context/:user_id/history', to: 'context#history'
      
      # Webhooks (desde Google)
      post '/webhooks/gmail', to: 'webhooks#gmail'
      post '/webhooks/chat', to: 'webhooks#chat'
      post '/webhooks/calendar', to: 'webhooks#calendar'
      post '/webhooks/drive', to: 'webhooks#drive'
      
      # Reportes (para Mauricio/Barbana)
      get '/reports/adoption', to: 'reports#adoption'
      get '/reports/mcp-improvements', to: 'reports#improvements'
      get '/reports/roi', to: 'reports#roi'
    end
  end
  
  namespace :admin do
    root 'dashboard#index'
    resources :users
    resources :integrations
    resources :feedback
  end
end
```

### 3.4 Servicio Principal: Context Builder

```ruby
# app/services/context_builder.rb
class ContextBuilder
  def initialize(user)
    @user = user
  end
  
  def build_context
    {
      user: user_data,
      active_tasks: fetch_tasks,
      recent_communications: fetch_communications,
      calendar: fetch_calendar,
      current_projects: fetch_projects,
      decisions_pending: fetch_decisions,
      metrics: fetch_metrics,
      timestamp: Time.current
    }
  end
  
  private
  
  def user_data
    {
      id: @user.id,
      name: @user.name,
      email: @user.email,
      role: @user.role,
      ai_tool: @user.ai_tool,
      team: @user.team_members
    }
  end
  
  def fetch_tasks
    # Detecta tareas activas de:
    # - Chat (webhooks)
    # - Email (webhooks)
    # - Proyectos internos
    Task.where(assigned_to: @user, status: [:todo, :in_progress])
        .order(created_at: :desc)
        .limit(10)
        .map { |t| task_to_context(t) }
  end
  
  def fetch_communications
    # Últimos 24h de:
    # - Emails importantes
    # - Mensajes Chat
    # - Menciones
    {
      emails: fetch_recent_emails,
      chat_messages: fetch_recent_chat,
      mentions: fetch_mentions
    }
  end
  
  def fetch_recent_emails
    # Usa Gmail API
    gmail_service = GoogleSync.new(@user)
    gmail_service.fetch_recent_emails(limit: 5)
  end
  
  def fetch_recent_chat
    # Usa Google Chat API
    chat_service = GoogleSync.new(@user)
    chat_service.fetch_recent_messages(limit: 10)
  end
  
  def fetch_calendar
    # Próximos 7 días
    calendar_service = GoogleSync.new(@user)
    calendar_service.fetch_events(days: 7)
  end
  
  def fetch_projects
    # Proyectos activos donde participa
    Project.where('team_members @> ?', [@user.id].to_json)
           .where(status: :active)
  end
  
  def fetch_decisions
    # Decisiones pendientes que requieren su input
    Decision.where(required_from: @user, status: :pending)
  end
  
  def fetch_metrics
    # KPIs personalizados por rol
    MetricsService.new(@user).calculate
  end
end
```

---

## 4. FLUJO DE INTEGRACIÓN: PASO A PASO

### 4.1 Setup Inicial (Semana 1)

```bash
# 1. Crear proyecto Rails
rails new retarget-mcp --database=postgresql

# 2. Agregar gemas
bundle add google-api-client
bundle add google-auth-library-ruby
bundle add google-auth-httplib2
bundle add sidekiq  # Para jobs async
bundle add redis

# 3. Crear modelos
rails generate model User email:string role:integer ai_tool:integer
rails generate model ContextSnapshot user:references data:jsonb
rails generate model Feedback user:references feedback_type:integer content:text
rails generate model McpInteraction user:references data:jsonb
rails generate model Integration user:references service:string token:text

# 4. Migrations
rails db:migrate

# 5. Setup Google OAuth
# - Crear OAuth credentials en Google Cloud Console
# - Agregar a config/initializers/google_oauth.rb
```

### 4.2 Integración Google Workspace (Semana 1-2)

```ruby
# app/services/google_sync.rb
class GoogleSync
  def initialize(user)
    @user = user
    @gmail = setup_gmail
    @calendar = setup_calendar
    @chat = setup_chat
  end
  
  def setup_gmail
    Google::Apis::GmailV1::GmailService.new.tap do |service|
      service.authorization = get_authorization(:gmail)
    end
  end
  
  def fetch_recent_emails(limit: 5)
    # Query: últimos 24h, no spam, no promotions
    results = @gmail.list_user_messages(
      'me',
      q: 'newer_than:1d -category:promotions -category:social',
      max_results: limit
    )
    
    results.messages&.map do |msg|
      full_msg = @gmail.get_user_message('me', msg.id)
      {
        id: msg.id,
        from: extract_header(full_msg, 'From'),
        subject: extract_header(full_msg, 'Subject'),
        snippet: full_msg.snippet,
        timestamp: full_msg.internal_date,
        labels: full_msg.label_ids
      }
    end || []
  end
  
  def fetch_recent_messages(limit: 10)
    # Google Chat API
    # Últimos 10 mensajes en espacios donde participa
    spaces = @chat.list_spaces
    
    spaces.spaces&.flat_map do |space|
      @chat.list_messages(space.name, page_size: limit)
           .messages&.map { |msg| format_chat_message(msg) }
    end || []
  end
  
  def fetch_events(days: 7)
    # Calendar API
    # Próximos N días
    time_min = Time.current.iso8601
    time_max = (Time.current + days.days).iso8601
    
    events = @calendar.list_events(
      'primary',
      time_min: time_min,
      time_max: time_max,
      single_events: true,
      order_by: 'startTime'
    )
    
    events.items&.map { |event| format_event(event) } || []
  end
  
  private
  
  def get_authorization(service)
    # Usa tokens guardados en DB
    integration = @user.integrations.find_by(service: service)
    Google::Auth::ServiceAccountCredentials.make_authorized_user_credentials(
      json_key_io: StringIO.new(integration.token),
      scopes: scopes_for(service)
    )
  end
  
  def scopes_for(service)
    case service
    when :gmail
      ['https://www.googleapis.com/auth/gmail.readonly']
    when :calendar
      ['https://www.googleapis.com/auth/calendar.readonly']
    when :chat
      ['https://www.googleapis.com/auth/chat.messages.readonly']
    end
  end
end
```

### 4.3 Webhook Handlers (Detección Automática)

```ruby
# app/controllers/api/webhooks_controller.rb
class Api::WebhooksController < ApplicationController
  skip_forgery_protection
  
  def gmail
    # Google envía notificación cuando hay email nuevo
    user = User.find_by(email: params[:email])
    
    GoogleSync.new(user).fetch_recent_emails(limit: 1).each do |email|
      ContextSnapshot.create(
        user: user,
        data: {
          type: 'email',
          from: email[:from],
          subject: email[:subject],
          timestamp: Time.current
        }
      )
      
      # Trigger job para actualizar contexto
      AggregateContextJob.perform_later(user.id)
    end
    
    render json: { status: 'ok' }
  end
  
  def chat
    # Google Chat envía notificación de mensaje
    user = User.find_by(email: params[:user_email])
    
    ContextSnapshot.create(
      user: user,
      data: {
        type: 'chat_message',
        from: params[:from],
        message: params[:message],
        timestamp: Time.current
      }
    )
    
    AggregateContextJob.perform_later(user.id)
    render json: { status: 'ok' }
  end
  
  def calendar
    # Cambios en calendario
    user = User.find_by(email: params[:user_email])
    
    ContextSnapshot.create(
      user: user,
      data: {
        type: 'calendar_event',
        event: params[:event_title],
        time: params[:event_time],
        timestamp: Time.current
      }
    )
    
    AggregateContextJob.perform_later(user.id)
    render json: { status: 'ok' }
  end
end
```

---

## 5. ENDPOINTS MCP: CONSUMIDOS POR IA

### 5.1 GET /api/v1/context/:user_id

```ruby
# app/controllers/api/context_controller.rb
class Api::ContextController < ApplicationController
  def show
    user = User.find(params[:user_id])
    context = ContextBuilder.new(user).build_context
    
    # Log interacción
    McpInteraction.create(
      user: user,
      data: {
        ai_tool: request.headers['X-AI-Tool'],
        request: request.headers['X-Request-Summary'],
        timestamp: Time.current
      }
    )
    
    render json: context
  end
  
  def history
    user = User.find(params[:user_id])
    snapshots = user.context_snapshots
                    .order(created_at: :desc)
                    .limit(50)
    
    render json: snapshots.map(&:data)
  end
end
```

**Ejemplo de respuesta:**
```json
{
  "user": {
    "id": 1,
    "name": "Luis",
    "email": "luis@retarget.cl",
    "role": "dev",
    "ai_tool": "claude"
  },
  "active_tasks": [
    {
      "id": "WP-284",
      "title": "Fix header responsive móvil",
      "from": "Leig",
      "status": "in_progress",
      "created_at": "2026-04-27T10:30:00Z",
      "priority": "medium"
    }
  ],
  "recent_communications": {
    "emails": [
      {
        "from": "cliente@hotel.cl",
        "subject": "Cambios en landing",
        "snippet": "Necesitamos que el logo sea más grande...",
        "timestamp": "2026-04-27T14:15:00Z"
      }
    ],
    "chat_messages": [
      {
        "from": "Leig",
        "message": "Luis, el header se ve mal en móvil",
        "timestamp": "2026-04-27T14:10:00Z"
      }
    ]
  },
  "calendar": [
    {
      "title": "Reunión cliente Hotel",
      "start": "2026-04-28T10:00:00Z",
      "duration": 60
    }
  ],
  "current_projects": ["puebloladehesa-rediseno", "news-ai-cms"],
  "decisions_pending": [],
  "metrics": {
    "tasks_completed_week": 10,
    "avg_time_per_task": 2.5,
    "productivity_score": 0.92
  },
  "timestamp": "2026-04-27T14:30:00Z"
}
```

### 5.2 POST /api/v1/feedback

```ruby
# app/controllers/api/feedback_controller.rb
class Api::FeedbackController < ApplicationController
  def create
    user = User.find(params[:user_id])
    
    feedback = Feedback.create(
      user: user,
      feedback_type: params[:type],  # suggestion, rating, issue, usage_pattern
      content: params[:content],
      data: {
        ai_tool: params[:ai_tool],
        context_used: params[:context_used],
        helpful: params[:helpful],
        timestamp: Time.current
      }
    )
    
    # Analizar feedback para mejorar MCP
    FeedbackAnalyzerJob.perform_later(feedback.id)
    
    render json: { status: 'ok', feedback_id: feedback.id }
  end
end
```

**Ejemplo de feedback:**
```json
{
  "user_id": 1,
  "type": "suggestion",
  "ai_tool": "claude",
  "content": "Sería útil que el contexto incluya últimos commits de GitHub",
  "context_used": ["active_tasks", "recent_communications"],
  "helpful": 4.5
}
```

---

## 6. REPORTES: DATOS PARA MEJORAR

### 6.1 GET /api/v1/reports/adoption

```ruby
# app/controllers/api/reports_controller.rb
class Api::ReportsController < ApplicationController
  def adoption
    # Quién usa MCP, con qué frecuencia, con qué herramienta
    report = {
      total_users: User.ai_users.count,
      active_users_week: User.ai_users.joins(:mcp_interactions)
                              .where('mcp_interactions.created_at > ?', 1.week.ago)
                              .distinct.count,
      by_ai_tool: User.ai_users.group(:ai_tool).count,
      by_role: User.ai_users.group(:role).count,
      interactions_per_user: McpInteraction.group(:user_id).count,
      average_response_quality: McpInteraction.average(:response_quality),
      most_used_contexts: ContextSnapshot.group(:data)
                                         .count
                                         .sort_by { |_, v| -v }
                                         .first(10)
    }
    
    render json: report
  end
  
  def improvements
    # Qué feedback recibimos, qué mejorar
    report = {
      feedback_summary: {
        total: Feedback.count,
        by_type: Feedback.group(:feedback_type).count,
        average_rating: Feedback.where(feedback_type: :rating)
                               .average(:content)
      },
      top_suggestions: Feedback.where(feedback_type: :suggestion)
                              .order(created_at: :desc)
                              .limit(10)
                              .map { |f| f.content },
      reported_issues: Feedback.where(feedback_type: :issue)
                              .order(created_at: :desc)
                              .limit(10)
                              .map { |f| f.content },
      usage_patterns: analyze_usage_patterns
    }
    
    render json: report
  end
  
  def roi
    # Impacto del MCP en productividad
    report = {
      time_saved_per_user: calculate_time_saved,
      tasks_completed_with_mcp: Task.where('context_used = true').count,
      average_task_time_reduction: calculate_time_reduction,
      estimated_cost_savings: calculate_savings,
      adoption_trend: adoption_trend_data
    }
    
    render json: report
  end
end
```

---

## 7. REUNIONES CON EQUIPO: ESTRUCTURA

### 7.1 Sesión 1: Necesidades Específicas (Semana 1)

```
AGENDA:
═══════════════════════════════════════════════════════════════

Barbana (COO):
├─ ¿Qué información necesitas en tiempo real?
├─ ¿Qué decisiones tomas basado en datos?
└─ ¿Cómo Gemini podría ayudarte mejor?

Mauricio (CEO):
├─ ¿Qué métricas ves hoy?
├─ ¿Qué falta para decisiones estratégicas?
└─ ¿Cómo ChatGPT podría acelerar tu visión?

Luis (Dev):
├─ ¿Qué contexto necesitas para cada tarea?
├─ ¿Qué información te falta?
└─ ¿Cómo Claude podría ser más útil?

Daniel (SEO):
├─ ¿Qué datos necesitas para reportes?
├─ ¿Qué análisis haces manualmente?
└─ ¿Cómo Gemini podría automatizar?

Alejandra (Diseño):
├─ ¿Qué feedback necesitas de otros?
├─ ¿Qué contexto de marca es crítico?
└─ ¿Cómo Claude podría mejorar validaciones?

RESULTADO:
└─ Documento: "Necesidades MCP por Rol"
```

### 7.2 Sesión 2: Habilidades + Formación (Semana 2)

```
AGENDA:
═══════════════════════════════════════════════════════════════

1. Cómo hacer requests efectivos a MCP
   └─ Ejemplos por rol

2. Cómo dar feedback útil
   └─ Qué información nos ayuda a mejorar

3. Cómo interpretar reportes MCP
   └─ Qué significan las métricas

4. Casos de uso avanzados
   └─ Cómo combinar contexto + IA para máximo valor

RESULTADO:
└─ Cada usuario sabe cómo usar MCP profesionalmente
```

---

## 8. IMPLEMENTACIÓN: TIMELINE

### Semana 1: Setup Rails + Google Integration
```
Lunes:
├─ Rails project setup
├─ Database models
└─ Google OAuth config

Martes-Miércoles:
├─ Google Workspace APIs (Gmail, Chat, Calendar)
├─ Webhook handlers
└─ Context builder

Jueves:
├─ API endpoints
├─ Testing
└─ Documentación

Viernes:
├─ Reunión Necesidades con equipo
└─ Ajustes basados en feedback
```

### Semana 2: Integración + Feedback
```
Lunes-Martes:
├─ Feedback collection system
├─ Reportes básicos
└─ Admin dashboard

Miércoles:
├─ Testing con usuarios reales
├─ Ajustes de UX
└─ Documentación

Jueves:
├─ Reunión Formación con equipo
└─ Capacitación

Viernes:
├─ Go-live
├─ Monitoreo
└─ Soporte inicial
```

### Semana 3-4: Optimización Continua
```
├─ Análisis de feedback
├─ Mejoras MCP basadas en datos
├─ Reportes de ROI
└─ Iteraciones según uso real
```

---

## 9. CHECKLIST TÉCNICO

```
SETUP INICIAL
═══════════════════════════════════════════════════════════════

□ Rails 7 project
□ PostgreSQL database
□ Google Cloud Project con OAuth
□ Google Workspace API credentials
□ Sidekiq + Redis para jobs async
□ Models: User, ContextSnapshot, Feedback, McpInteraction
□ Migrations ejecutadas
□ Google OAuth flow funcionando

INTEGRACIONES
═══════════════════════════════════════════════════════════════

□ Gmail API (read emails)
□ Google Chat API (read messages)
□ Google Calendar API (read events)
□ Google Drive API (read files)
□ Webhooks configurados en Google

API ENDPOINTS
═══════════════════════════════════════════════════════════════

□ GET /api/v1/context/:user_id
□ POST /api/v1/feedback
□ GET /api/v1/context/:user_id/history
□ POST /api/v1/webhooks/gmail
□ POST /api/v1/webhooks/chat
□ POST /api/v1/webhooks/calendar
□ GET /api/v1/reports/adoption
□ GET /api/v1/reports/mcp-improvements
□ GET /api/v1/reports/roi

TESTING
═══════════════════════════════════════════════════════════════

□ Unit tests para services
□ Integration tests para API
□ End-to-end test con usuario real
□ Load testing (Barbana, Mauricio, Luis, Daniel, Alejandra)

SEGURIDAD
═══════════════════════════════════════════════════════════════

□ Tokens Google encriptados en DB
□ Rate limiting en endpoints
□ CORS configurado
□ Validación de permisos por rol
□ Audit log de accesos
```

---

## 10. PRÓXIMO PASO

**Esta semana:**
1. Confirmar stack Rails + PostgreSQL
2. Crear Google Cloud Project
3. Agendar reunión Necesidades (Barbana, Mauricio, Luis, Daniel, Alejandra)
4. Empezar setup Rails

**¿Empezamos?**
