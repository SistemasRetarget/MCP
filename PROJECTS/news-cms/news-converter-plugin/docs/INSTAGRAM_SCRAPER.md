# Instagram Public Scraper

Scraper para extraer comentarios de perfiles públicos de Instagram **sin usar API oficial**.

## 📋 Métodos Disponibles

| Método | Cuándo usar | Requiere login | Confiabilidad |
|--------|-------------|----------------|---------------|
| **PHP Scraper** | Posts públicos simples | A veces | Media |
| **Playwright** | Login requerido o posts privados | Opcional | Alta |

## ⚠️ Advertencias Importantes

- **Solo perfiles públicos**: No funciona con cuentas privadas
- **Bloqueo de IP**: Instagram puede bloquear tu IP si haces muchas peticiones
- **Fragilidad**: Si Instagram cambia su HTML, el scraper deja de funcionar
- **Legalidad**: Usar bajo tu propia responsabilidad, respetando términos de servicio
- **Login requerido**: Instagram a veces fuerza login para ver comentarios

---

## 🚀 Playwright Scraper (Recomendado)

Cuando Instagram bloquea el método PHP simple, usa **Playwright** - un browser real automatizado.

### Instalación

```bash
# 1. Verificar Node.js
node --version  # Debe mostrar v18+ o v20+

# 2. Instalar Playwright Scraper
cd /Users/spam11/Desktop/news-converter-plugin
php scripts/scrape-instagram-playwright.php --install

# O manualmente:
cd scripts/instagram-playwright
./install.sh
```

### Uso básico

```bash
# Post público (sin login)
php scripts/scrape-instagram-playwright.php \
  --url=https://www.instagram.com/p/DVq0LtYEdme/ \
  --max-comments=50

# Con login manual (abre ventana del browser)
php scripts/scrape-instagram-playwright.php \
  --url=https://instagram.com/p/ABC123/ \
  --login --headed

# Con login automático (cookies guardadas)
php scripts/scrape-instagram-playwright.php \
  --url=https://instagram.com/p/ABC123/ \
  --username=tuusuario \
  --password=tupassword
```

### Opciones de Playwright

| Opción | Descripción | Default |
|--------|-------------|---------|
| `--url` | URL del post Instagram (requerido) | - |
| `--max-comments` | Máximo comentarios a extraer | 50 |
| `--login` | Requiere login manual | false |
| `--headed` | Mostrar ventana del browser | false |
| `--username` | Username para login automático | - |
| `--password` | Password para login automático | - |
| `--install` | Instalar dependencias | - |
| `--debug` | Modo debug con logs | false |

---

## 🐘 PHP Scraper (Método Simple)

## Uso

### Sintaxis básica

```bash
php scripts/scrape-instagram.php --url=URL_PERFIL [opciones]
```

### Formas de especificar el perfil

```bash
# Con URL completa
php scrape-instagram.php --url=https://www.instagram.com/bbcnews/

# Solo username
php scrape-instagram.php --url=bbcnews

# Con @
php scrape-instagram.php --url=@bbcnews
```

### Opciones

| Opción | Descripción | Default |
|--------|-------------|---------|
| `--url` | URL o username del perfil (requerido) | - |
| `--posts` | Número de posts recientes a analizar | 5 |
| `--comments` | Máximo comentarios por post | 20 |
| `--output` | Directorio de salida | ./output |
| `--format` | json, csv, both | both |
| `--delay` | Segundos entre requests | 3 |
| `--help` | Mostrar ayuda | - |

## Ejemplos

### Básico - últimos 5 posts
```bash
cd /Users/spam11/Desktop/news-converter-plugin
php scripts/scrape-instagram.php --url=https://www.instagram.com/elpais/
```

### 10 posts, 50 comentarios por post, solo CSV
```bash
php scripts/scrape-instagram.php \
  --url=@cnn \
  --posts=10 \
  --comments=50 \
  --format=csv \
  --output=./descargas
```

### Con delay largo para evitar bloqueos
```bash
php scripts/scrape-instagram.php \
  --url=bbcnews \
  --posts=3 \
  --comments=10 \
  --delay=5
```

## Salida

El script genera archivos en `./output/` (o el directorio especificado):

```
instagram_bbcnews_2026-04-15_10-30-25.json
instagram_bbcnews_2026-04-15_10-30-25.csv
```

### Estructura JSON
```json
[
  {
    "comment_id": "1234567890",
    "username": "usuario_ejemplo",
    "text": "Excelente noticia!",
    "timestamp": 1713175800,
    "likes": 5,
    "is_reply": false,
    "parent_id": null,
    "post_shortcode": "ABC123xyz",
    "post_url": "https://www.instagram.com/p/ABC123xyz/",
    "post_caption": "Titulo del post...",
    "post_timestamp": 1713100000,
    "scraped_at": "2026-04-15 10:30:25"
  }
]
```

### Columnas CSV
- Comment ID
- Username
- Text
- Timestamp
- Likes
- Is Reply
- Parent ID
- Post Shortcode
- Post URL
- Post Caption
- Post Timestamp
- Scraped At

## Cómo funciona

1. **Fetch del perfil**: Descarga HTML del perfil público
2. **Parseo de datos**: Extrae `_sharedData` del JavaScript incrustado
3. **Obtiene posts**: Lista los últimos N posts con shortcodes
4. **Fetch de posts**: Por cada post, descarga su HTML
5. **Extrae comentarios**: Parsea comentarios del JSON o HTML
6. **Delay**: Espera N segundos entre requests
7. **Exporta**: Guarda en JSON/CSV

## Limitaciones conocidas

### Técnicas
- **Rate limiting**: Máximo ~50-100 requests/IP/hora
- **Login wall**: Instagram fuerza login aleatoriamente
- **Cambios HTML**: Instagram cambia estructura frecuentemente
- **CAPTCHA**: Puede aparecer después de varios requests

### De datos
- Solo comentarios visibles sin login (generalmente los primeros)
- No accede a:
  - Perfiles privados
  - Stories
  - Comentarios ocultos por el dueño
  - Comentarios eliminados

## Solución de problemas

### "No se pudo obtener el perfil"
- Verificar que el perfil sea público
- Intentar con delay mayor: `--delay=10`
- Verificar que el username existe

### "HTTP Error 429" (Too Many Requests)
- Esperar 30-60 minutos
- Usar VPN o proxy para cambiar IP
- Aumentar delay: `--delay=10`

### "No se encontraron posts"
- El perfil puede ser privado
- Instagram puede estar bloqueando requests
- Intentar acceder manualmente al perfil en navegador

### Datos incompletos
- Instagram a veces limita comentarios sin login
- El HTML puede no contener todos los datos
- Usar `--comments=10` para reducir y ev timeouts

## Alternativas si falla

1. **API oficial** (solo tu cuenta): Ver `INSTAGRAM_COMMENTS.md`
2. **Servicios comerciales**:
   - [RapidAPI Instagram](https://rapidapi.com/search/instagram)
   - [Apify Instagram Scraper](https://apify.com/apify/instagram-scraper)
   - [ScrapingBee](https://www.scrapingbee.com/)

3. **Selenium/Playwright**: Automatización de navegador real (más lento pero más robusto)

## Mejores prácticas

```bash
# 1. Empezar conservador
php scrape-instagram.php --url=MEDIA --posts=3 --comments=10

# 2. Si funciona, aumentar gradualmente
php scrape-instagram.php --url=MEDIA --posts=5 --comments=20

# 3. Nunca exceder 10 posts seguidos sin esperar
#    (Instagram detecta patrones)

# 4. Usar horarios de bajo tráfico
#    (madrugada en horario de USA)

# 5. Rotar IPs si es posible
#    (VPN o proxy residencial)
```

## Script avanzado para múltiples medios

```bash
#!/bin/bash

MEDIOS=("bbcnews" "cnn" "elpais" "lemondefr")
OUTPUT_DIR="./medios-$(date +%Y%m%d)"

mkdir -p "$OUTPUT_DIR"

for medio in "${MEDIOS[@]}"; do
    echo "Scrapeando: $medio"
    php scripts/scrape-instagram.php \
        --url=@$medio \
        --posts=3 \
        --comments=20 \
        --output="$OUTPUT_DIR" \
        --delay=5
    sleep 30  # Pausa larga entre medios
done
```
