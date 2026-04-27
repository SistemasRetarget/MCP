#!/bin/bash
# Instalador de Playwright Scraper para Instagram

set -e

echo "============================================"
echo "Instagram Playwright Scraper - Instalador"
echo "============================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo ""
    echo "Instala Node.js:"
    echo "  macOS:    brew install node"
    echo "  Ubuntu:   sudo apt update && sudo apt install nodejs npm"
    echo "  Windows:  https://nodejs.org/ (descargar instalador)"
    exit 1
fi

echo "✓ Node.js encontrado: $(node --version)"
echo ""

# Directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Instalar dependencias npm
echo "Instalando dependencias npm..."
npm install

# Instalar browsers de Playwright
echo ""
echo "Descargando browsers de Playwright..."
echo "(Esto puede tardar 2-5 minutos y descargar ~100MB)"
npx playwright install chromium

echo ""
echo "============================================"
echo "✓ Instalación completada"
echo "============================================"
echo ""
echo "Prueba con:"
echo "  node scraper.js --url=https://instagram.com/p/DVq0LtYEdme/"
echo ""
echo "Ver ayuda:"
echo "  node scraper.js --help"
echo ""
