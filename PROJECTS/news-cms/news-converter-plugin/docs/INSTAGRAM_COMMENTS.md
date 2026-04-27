# Instagram Comments Downloader

Script PHP para descargar comentarios de perfiles de Instagram usando Instagram Graph API.

## Requisitos

- **Cuenta de Instagram**: Debe ser Business Account o Creator Account (no funciona con cuentas personales)
- **App en Facebook Developers**: Aplicación registrada con permisos de Instagram
- **PHP**: 7.4 o superior con extensiones cURL y JSON
- **WordPress**: 5.0+ (para uso como plugin)

## Instalación

### Como parte del plugin News Converter

Los archivos ya están incluidos. Ve a **News Converter → Instagram Comments** en el admin de WordPress.

### Uso standalone (línea de comandos)

```bash
php scripts/download-instagram-comments.php --token=ACCESS_TOKEN --account_id=ACCOUNT_ID --limit=50
```

## Configuración de API

### 1. Crear App en Facebook Developers

1. Ir a [developers.facebook.com](https://developers.facebook.com/)
2. Crear nueva app → Tipo "Business"
3. Agregar producto **Instagram Graph API**

### 2. Configurar cuenta de Instagram

1. Convertir cuenta personal a Business o Creator
2. Conectar la cuenta a una página de Facebook
3. En Facebook Developers, agregar cuenta como "Tester" en Roles → Test Users

### 3. Obtener Access Token

**Método 1: Graph API Explorer**
1. Tools → Graph API Explorer
2. Seleccionar tu app
3. Get Token → Instagram Graph API Token
4. Permisos necesarios:
   - `instagram_basic`
   - `pages_read_engagement`

**Método 2: OAuth Redirect (producción)**
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id={app-id}
  &redirect_uri={redirect-uri}
  &scope=instagram_basic,pages_read_engagement
```

### 4. Obtener Instagram Account ID

**Desde Facebook Page ID:**
```php
GET /{page-id}?fields=instagram_business_account
```

**Desde username (no oficial):**
```
https://www.instagram.com/web/search/topsearch/?query={username}
```

## Uso

### Desde WordPress Admin

1. Ir a **News Converter → Instagram Comments**
2. Configurar Access Token y Account ID
3. Ajustar opciones:
   - Límite de posts
   - Rango de fechas (opcional)
   - Formato de exportación
   - Incluir/excluir respuestas
4. Click en "Descargar Comentarios"
5. Descargar archivos JSON/CSV generados

### Desde línea de comandos

```bash
# Opciones básicas
php scripts/download-instagram-comments.php \
  --token=EAAxxxxx \
  --account_id=178414xxxxx \
  --limit=25

# Con rango de fechas
php scripts/download-instagram-comments.php \
  --token=EAAxxxxx \
  --page_id=123456789 \
  --since="2026-04-01" \
  --until="2026-04-15" \
  --format=csv

# Solo JSON, sin respuestas
php scripts/download-instagram-comments.php \
  --token=EAAxxxxx \
  --account_id=178414xxxxx \
  --format=json \
  --include_replies=no
```

## Opciones de línea de comandos

| Opción | Requerida | Descripción |
|--------|-----------|-------------|
| `--token` | Sí | Access Token de Facebook/Instagram |
| `--account_id` | No* | ID de cuenta Instagram Business |
| `--page_id` | No* | ID de página Facebook (alternativa) |
| `--limit` | No | Máximo posts a procesar (default: 25) |
| `--since` | No | Fecha desde (YYYY-MM-DD) |
| `--until` | No | Fecha hasta (YYYY-MM-DD) |
| `--format` | No | json, csv, both (default: both) |
| `--include_replies` | No | yes/no (default: yes) |
| `--output` | No | Directorio de salida (default: ./output) |
| `--help` | No | Mostrar ayuda |

*Debe proporcionarse `--account_id` o `--page_id`

## Estructura de datos exportados

### JSON
```json
[
  {
    "comment_id": "1789xxxxx",
    "media_id": "1790xxxxx",
    "username": "usuario",
    "text": "Excelente post!",
    "timestamp": "2026-04-10T14:30:00+0000",
    "like_count": 5,
    "is_reply": false,
    "parent_comment_id": null,
    "post_permalink": "https://instagram.com/p/ABC123/",
    "post_caption": "Título del post...",
    "post_timestamp": "2026-04-10T12:00:00+0000"
  }
]
```

### CSV
Columnas:
- Comment ID
- Media ID
- Username
- Text
- Timestamp
- Like Count
- Is Reply
- Parent Comment ID
- Post Permalink
- Post Caption
- Post Timestamp

## Rate Limiting

Instagram Graph API tiene los siguientes límites:
- **200 calls/hour** por usuario (nivel estándar)
- **1000 calls/hour** por usuario (nivel business)

El script incluye:
- Delay de 1 segundo entre requests
- Paginación automática
- Manejo de errores con reintentos implícitos

## Troubleshooting

### "No se pudo obtener el Instagram Account ID"
- Verificar que la página de Facebook esté conectada a la cuenta de Instagram
- Verificar permisos del token

### "HTTP Error 400/403"
- Token expirado: regenerar en Graph API Explorer
- Permisos insuficientes: agregar `instagram_basic`
- Cuenta no es Business/Creator

### "Sin comentarios"
- Verificar que los posts tengan comentarios visibles
- Algunas cuentas tienen comentarios deshabilitados

### "Rate limit exceeded"
- Esperar 1 hora para reset del límite
- Reducir el parámetro `--limit`

## Limitaciones

- Solo funciona con cuentas **Business** o **Creator**
- No accede a cuentas personales (privacidad)
- Token de acceso expira cada 60 días (nivel estándar)
- No descarga comentarios de stories

## Consideraciones legales

- Respetar términos de servicio de Instagram
- Solo descargar comentarios de tu propia cuenta
- Obtener consentimiento si vas a analizar datos de usuarios
- Cumplir con GDPR/CCPA si aplica
