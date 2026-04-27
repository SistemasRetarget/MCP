#!/bin/bash
# Extrae cookies de Instagram desde Chrome y las guarda para Playwright

echo "Extrayendo cookies de Instagram desde Chrome..."

# Ruta a las cookies de Chrome en macOS
COOKIES_DB="$HOME/Library/Application Support/Google/Chrome/Default/Cookies"

if [ ! -f "$COOKIES_DB" ]; then
    echo "❌ No se encontró la base de datos de cookies de Chrome"
    echo "Ruta esperada: $COOKIES_DB"
    exit 1
fi

echo "✅ Base de datos de cookies encontrada"

# Crear copia temporal (Chrome bloquea el archivo original)
TEMP_DB="/tmp/chrome_cookies_temp.db"
cp "$COOKIES_DB" "$TEMP_DB"

# Extraer cookies de Instagram usando SQLite
# Las cookies de Instagram tienen dominio '.instagram.com' o 'instagram.com'
echo "Extrayendo cookies de instagram.com..."

sqlite3 "$TEMP_DB" <<EOF
.headers off
.mode csv
SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly 
FROM cookies 
WHERE host_key LIKE '%instagram.com%'
ORDER BY host_key;
EOF

# Limpiar
rm "$TEMP_DB"

echo ""
echo "Cookies extraídas. Guardando en formato Playwright..."
