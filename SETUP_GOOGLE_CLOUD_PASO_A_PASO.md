# Setup Google Cloud — Pasos Exactos
## Crear Cuenta + Proyecto + Infraestructura

**Fecha:** 2026-04-27  
**Objetivo:** Tener Google Cloud listo para despliegue MCP  
**Tiempo estimado:** 30-45 minutos

---

## PASO 1: Crear Cuenta Google Cloud (5 minutos)

### 1.1 Ir al sitio

```
1. Abre navegador
2. Ve a: https://cloud.google.com/free
3. Click en botón azul "Get started for free"
```

### 1.2 Ingresar Google Account

```
1. Si tienes Gmail: usa ese email
2. Si no tienes: crea uno nuevo en gmail.com
   
RECOMENDACIÓN: Usa email de la empresa
Ejemplo: luis@retarget.cl (si tienes Google Workspace)
```

### 1.3 Completar Formulario

```
Pantalla 1: Información Personal
├─ Nombre: Tu nombre completo
├─ Email: luis@retarget.cl (o tu Gmail)
├─ Contraseña: Crea una segura
└─ Click "Next"

Pantalla 2: Verificación
├─ Google te envía código a tu email
├─ Ingresa el código
└─ Click "Verify"

Pantalla 3: Información de Cuenta
├─ País: Chile
├─ Zona horaria: America/Santiago
├─ Aceptar términos
└─ Click "Agree and continue"
```

### 1.4 Ingresar Tarjeta de Crédito

```
⚠️ IMPORTANTE: No se cobra nada
   Solo verifican que eres persona real

1. Click "Add a payment method"
2. Selecciona "Credit or debit card"
3. Ingresa datos:
   ├─ Nombre en tarjeta
   ├─ Número tarjeta
   ├─ Fecha vencimiento
   ├─ CVV
   └─ Código postal
4. Click "Save"

RESULTADO:
✅ $300 USD de créditos gratis
✅ Válidos 90 días
✅ Sin cargo automático
```

### 1.5 Verificación Teléfono (Opcional pero Recomendado)

```
1. Google puede pedir verificación por SMS
2. Ingresa número celular
3. Recibirás código por SMS
4. Ingresa código
5. Click "Verify"
```

### 1.6 Confirmación Final

```
Google te mostrará:
✅ $300 USD de créditos
✅ Acceso a todas las APIs
✅ Período de prueba: 90 días

Click "Start my free trial"

RESULTADO: Acceso a Google Cloud Console
```

---

## PASO 2: Crear Proyecto GCP (5 minutos)

### 2.1 Acceder a Google Cloud Console

```
1. Ve a: https://console.cloud.google.com
2. Deberías ver el dashboard
3. En la parte superior, busca "Select a project"
```

### 2.2 Crear Nuevo Proyecto

```
1. Click en "Select a project" (arriba a la izquierda)
2. Se abre popup
3. Click en botón "NEW PROJECT"
4. Completa:
   ├─ Project name: "retarget-mcp"
   ├─ Organization: (dejar en blanco)
   └─ Location: (dejar por defecto)
5. Click "CREATE"

ESPERAR: 30-60 segundos mientras crea el proyecto
```

### 2.3 Seleccionar Proyecto

```
1. Después de crear, verás notificación
2. Click en "Select the project" o en "retarget-mcp"
3. Ahora estás dentro del proyecto

VERIFICAR: En la parte superior debe decir "retarget-mcp"
```

---

## PASO 3: Habilitar APIs Necesarias (10 minutos)

### 3.1 Ir a APIs & Services

```
1. En el menú izquierdo, busca "APIs & Services"
2. Click en "APIs & Services"
3. Luego click en "Enabled APIs & services"
```

### 3.2 Habilitar APIs una por una

```
MÉTODO A: Buscar y habilitar (Recomendado)

Para cada API:
1. Click en "+ ENABLE APIS AND SERVICES"
2. Busca el nombre de la API
3. Click en el resultado
4. Click en botón azul "ENABLE"
5. Espera confirmación
6. Vuelve atrás y repite

APIs A HABILITAR:
├─ Cloud Run API
├─ Cloud SQL Admin API
├─ Cloud Tasks API
├─ Cloud Logging API
├─ Cloud Monitoring API
├─ Secret Manager API
├─ Gmail API
├─ Google Calendar API
├─ Google Chat API
└─ Google Drive API

TIEMPO: ~2 minutos por API
```

### 3.3 Verificar APIs Habilitadas

```
1. Ve a "Enabled APIs & services"
2. Deberías ver todas las APIs listadas
3. Si falta alguna, repite paso 3.2

RESULTADO: Todas las APIs habilitadas ✅
```

---

## PASO 4: Crear Cloud SQL (PostgreSQL) (10 minutos)

### 4.1 Ir a Cloud SQL

```
1. En el menú izquierdo, busca "Cloud SQL"
2. Click en "Cloud SQL"
3. Click en botón azul "CREATE INSTANCE"
```

### 4.2 Seleccionar PostgreSQL

```
1. Se abre pantalla con opciones
2. Selecciona "PostgreSQL"
3. Click "NEXT"
```

### 4.3 Configurar Instancia

```
Pantalla de Configuración:

Instance ID:
└─ retarget-mcp-db

Password:
└─ Genera contraseña segura
   Copia y guarda en lugar seguro
   Ejemplo: Abre Notepad y guarda

Database version:
└─ PostgreSQL 15

Region:
└─ us-central1 (cercano a clientes)

Zonal availability:
└─ Single zone (es gratis)

Machine type:
└─ Shared core (db-f1-micro) ← IMPORTANTE: Esto es gratis

Storage type:
└─ SSD

Storage capacity:
└─ 10 GB (gratis)

Backups:
└─ Habilitar (recomendado)

Click "CREATE INSTANCE"

ESPERAR: 3-5 minutos mientras crea la BD
```

### 4.4 Obtener Información de Conexión

```
1. Cuando termine, verás la instancia listada
2. Click en "retarget-mcp-db"
3. Busca la sección "Connection name"
4. Copia el valor (ejemplo: retarget-mcp:us-central1:retarget-mcp-db)
5. Guarda en Notepad

TAMBIÉN NECESITARÁS:
├─ IP pública: Busca en "Public IP address"
├─ Usuario: "postgres" (por defecto)
└─ Contraseña: La que generaste arriba
```

### 4.5 Crear Base de Datos

```
1. En la instancia, busca pestaña "Databases"
2. Click en "+ CREATE DATABASE"
3. Nombre: retarget_mcp
4. Click "CREATE"

RESULTADO: Base de datos creada ✅
```

### 4.6 Crear Usuario Rails

```
1. En la instancia, busca pestaña "Users"
2. Click en "+ CREATE USER"
3. Completa:
   ├─ User name: rails
   ├─ Password: Genera nueva contraseña segura
   └─ Click "CREATE"

GUARDA ESTA CONTRASEÑA: La necesitarás después
```

---

## PASO 5: Crear Secret Manager (5 minutos)

### 5.1 Ir a Secret Manager

```
1. En el menú izquierdo, busca "Secret Manager"
2. Click en "Secret Manager"
3. Click en botón azul "CREATE SECRET"
```

### 5.2 Crear Secret: DATABASE_URL

```
1. Name: DATABASE_URL
2. Secret value: Copia y pega esto (reemplaza valores):

postgresql://rails:PASSWORD_RAILS@IP_PUBLICA:5432/retarget_mcp

Donde:
├─ PASSWORD_RAILS = contraseña que creaste para usuario "rails"
├─ IP_PUBLICA = IP pública de Cloud SQL
└─ retarget_mcp = nombre de la BD

Ejemplo real:
postgresql://rails:MySecurePass123@34.123.45.67:5432/retarget_mcp

3. Click "CREATE SECRET"
```

### 5.3 Crear Secret: GOOGLE_CLIENT_ID

```
1. Click "+ CREATE SECRET"
2. Name: GOOGLE_CLIENT_ID
3. Secret value: (dejaremos vacío por ahora, lo llenaremos después)
4. Click "CREATE SECRET"
```

### 5.4 Crear Secret: GOOGLE_CLIENT_SECRET

```
1. Click "+ CREATE SECRET"
2. Name: GOOGLE_CLIENT_SECRET
3. Secret value: (dejaremos vacío por ahora)
4. Click "CREATE SECRET"
```

### 5.5 Crear Secret: RAILS_MASTER_KEY

```
1. Click "+ CREATE SECRET"
2. Name: RAILS_MASTER_KEY
3. Secret value: Genera una clave aleatoria
   
   Opción A: Usa este comando en terminal:
   openssl rand -hex 32
   
   Opción B: Copia esto:
   a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   
4. Click "CREATE SECRET"
```

---

## PASO 6: Crear Service Account (5 minutos)

### 6.1 Ir a Service Accounts

```
1. En el menú izquierdo, busca "Service Accounts"
2. Click en "Service Accounts"
3. Click en botón azul "CREATE SERVICE ACCOUNT"
```

### 6.2 Crear Service Account

```
Pantalla 1: Service account details
├─ Service account name: retarget-mcp-sa
├─ Service account ID: (se genera automático)
└─ Click "CREATE AND CONTINUE"

Pantalla 2: Grant this service account access to project
├─ Role: "Editor" (para desarrollo, después restringir)
└─ Click "CONTINUE"

Pantalla 3: Grant users access to this service account
├─ (dejar en blanco)
└─ Click "DONE"
```

### 6.3 Crear Key

```
1. Verás la service account listada
2. Click en "retarget-mcp-sa"
3. Busca pestaña "KEYS"
4. Click en "+ ADD KEY"
5. Selecciona "Create new key"
6. Elige "JSON"
7. Click "CREATE"

IMPORTANTE: Se descargará un archivo JSON
├─ Guarda en lugar seguro
├─ NO lo compartas
└─ Lo necesitarás para autenticación
```

---

## PASO 7: Configurar OAuth (Google Workspace) (10 minutos)

### 7.1 Crear OAuth Credentials

```
1. Ve a "APIs & Services" > "Credentials"
2. Click en "+ CREATE CREDENTIALS"
3. Selecciona "OAuth client ID"
4. Si pide, primero configura "OAuth consent screen":
   ├─ Click "CONFIGURE CONSENT SCREEN"
   ├─ Selecciona "External"
   ├─ Click "CREATE"
   └─ Completa información básica
```

### 7.2 Crear OAuth Client ID

```
1. De nuevo en "CREATE CREDENTIALS" > "OAuth client ID"
2. Application type: "Web application"
3. Name: "retarget-mcp"
4. Authorized JavaScript origins:
   ├─ http://localhost:3000
   ├─ http://localhost:8080
   └─ https://retarget-mcp-XXXX.run.app (después)
5. Authorized redirect URIs:
   ├─ http://localhost:3000/auth/google/callback
   ├─ http://localhost:8080/auth/google/callback
   └─ https://retarget-mcp-XXXX.run.app/auth/google/callback
6. Click "CREATE"

RESULTADO: Se genera Client ID y Client Secret
├─ Copia Client ID
├─ Copia Client Secret
└─ Guarda en Notepad (los necesitarás después)
```

### 7.3 Guardar en Secret Manager

```
1. Ve a Secret Manager
2. Click en "GOOGLE_CLIENT_ID"
3. Click en "ADD NEW VERSION"
4. Pega tu Client ID
5. Click "ADD NEW VERSION"

Repite para GOOGLE_CLIENT_SECRET:
1. Click en "GOOGLE_CLIENT_SECRET"
2. Click en "ADD NEW VERSION"
3. Pega tu Client Secret
4. Click "ADD NEW VERSION"
```

---

## PASO 8: Verificar Todo (5 minutos)

### 8.1 Checklist de Verificación

```
En Google Cloud Console, verifica:

□ Proyecto "retarget-mcp" creado
  └─ Visible en selector de proyectos arriba

□ APIs habilitadas
  └─ Ve a "APIs & Services" > "Enabled APIs & services"
  └─ Deberías ver todas las APIs listadas

□ Cloud SQL
  └─ Ve a "Cloud SQL"
  └─ Deberías ver "retarget-mcp-db" con estado "Available"

□ Secret Manager
  └─ Ve a "Secret Manager"
  └─ Deberías ver 4 secrets:
     ├─ DATABASE_URL
     ├─ GOOGLE_CLIENT_ID
     ├─ GOOGLE_CLIENT_SECRET
     └─ RAILS_MASTER_KEY

□ Service Account
  └─ Ve a "Service Accounts"
  └─ Deberías ver "retarget-mcp-sa"

□ OAuth Credentials
  └─ Ve a "APIs & Services" > "Credentials"
  └─ Deberías ver "retarget-mcp" OAuth client
```

---

## PASO 9: Instalar gcloud CLI (10 minutos)

### 9.1 Descargar e Instalar

```
1. Ve a: https://cloud.google.com/sdk/docs/install
2. Descarga para tu sistema operativo (macOS)
3. Sigue las instrucciones de instalación
4. Abre Terminal

En Terminal, ejecuta:
gcloud init

Sigue los pasos:
├─ Elige "Y" para login
├─ Selecciona tu cuenta Google
├─ Selecciona proyecto "retarget-mcp"
└─ Elige región "us-central1"
```

### 9.2 Verificar Instalación

```
En Terminal, ejecuta:
gcloud config list

Deberías ver:
├─ account = tu email
├─ project = retarget-mcp
└─ compute/region = us-central1
```

---

## PASO 10: Guardar Información Importante (2 minutos)

### 10.1 Crear Archivo de Configuración

```
Abre Notepad y crea archivo: GCP_CONFIG.txt

Guarda esto (reemplaza con tus valores):

═══════════════════════════════════════════════════════════════
GOOGLE CLOUD CONFIGURATION
═══════════════════════════════════════════════════════════════

PROJECT ID: retarget-mcp
REGION: us-central1

CLOUD SQL:
├─ Instance: retarget-mcp-db
├─ Database: retarget_mcp
├─ User: rails
├─ Password: [TU_PASSWORD_RAILS]
├─ Public IP: [IP_PUBLICA]
└─ Connection String: postgresql://rails:[PASSWORD]@[IP]:5432/retarget_mcp

OAUTH:
├─ Client ID: [TU_CLIENT_ID]
├─ Client Secret: [TU_CLIENT_SECRET]
└─ Redirect URI: https://retarget-mcp-XXXX.run.app/auth/google/callback

SERVICE ACCOUNT:
├─ Email: retarget-mcp-sa@retarget-mcp.iam.gserviceaccount.com
├─ Key file: (descargado como JSON)
└─ Location: [DONDE_GUARDASTE]

SECRETS (en Secret Manager):
├─ DATABASE_URL: ✅
├─ GOOGLE_CLIENT_ID: ✅
├─ GOOGLE_CLIENT_SECRET: ✅
└─ RAILS_MASTER_KEY: ✅

═══════════════════════════════════════════════════════════════

Guarda este archivo en lugar seguro.
```

---

## RESUMEN: QUÉ HICIMOS

```
✅ Paso 1: Cuenta Google Cloud creada
   └─ $300 USD de créditos gratis

✅ Paso 2: Proyecto "retarget-mcp" creado
   └─ Listo para desarrollo

✅ Paso 3: APIs habilitadas
   └─ Cloud Run, Cloud SQL, Cloud Tasks, etc.

✅ Paso 4: Cloud SQL (PostgreSQL) creado
   └─ Base de datos lista para Rails

✅ Paso 5: Secret Manager configurado
   └─ Credenciales encriptadas

✅ Paso 6: Service Account creado
   └─ Para autenticación Cloud

✅ Paso 7: OAuth configurado
   └─ Para Google Workspace

✅ Paso 8: Todo verificado
   └─ Listo para despliegue

✅ Paso 9: gcloud CLI instalado
   └─ Herramienta de línea de comandos

✅ Paso 10: Información guardada
   └─ Configuración segura
```

---

## PRÓXIMO PASO

Una vez completados estos 10 pasos:

1. **Envíame screenshot** de:
   - Google Cloud Console mostrando proyecto "retarget-mcp"
   - Cloud SQL mostrando "retarget-mcp-db" disponible
   - Secret Manager mostrando los 4 secrets

2. **Comparte el archivo GCP_CONFIG.txt** (sin contraseñas reales)

3. **Confirma que tienes:**
   - gcloud CLI instalado
   - Acceso a Google Cloud Console
   - Credenciales OAuth guardadas

Entonces podemos:
- Preparar Rails
- Crear Dockerfile
- Deploy a Cloud Run

**¿Empezamos? ¿Necesitas ayuda en algún paso?**
