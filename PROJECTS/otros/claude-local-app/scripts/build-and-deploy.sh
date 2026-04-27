#!/bin/bash

# Build and Deploy Script for Gemini AI Local
# This script builds the Electron app and copies it to the Desktop

set -e

echo "=========================================="
echo "Gemini AI Local - Build & Deploy Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$HOME/Desktop"
APP_NAME="Gemini AI Local"

echo -e "${YELLOW}Project Directory:${NC} $PROJECT_DIR"
echo -e "${YELLOW}Desktop Directory:${NC} $DESKTOP_DIR"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This script is designed for macOS only${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
cd "$PROJECT_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi
echo -e "${GREEN}✓ Dependencies ready${NC}"
echo ""

# Check for API key
echo -e "${YELLOW}Step 2: Checking API key configuration...${NC}"
if [ -f ".env" ]; then
    if grep -q "GEMINI_API_KEY" .env; then
        echo -e "${GREEN}✓ API key found in .env${NC}"
    else
        echo -e "${RED}⚠ Warning: GEMINI_API_KEY not found in .env${NC}"
        echo "Please add your Gemini API key to .env file:"
        echo "GEMINI_API_KEY=your-api-key-here"
    fi
else
    echo -e "${RED}⚠ Warning: .env file not found${NC}"
    echo "Creating .env file..."
    echo "GEMINI_API_KEY=your-api-key-here" > .env
    echo "Please edit .env and add your API key"
fi
echo ""

# Create data directory
echo -e "${YELLOW}Step 3: Creating data directory...${NC}"
mkdir -p data
echo -e "${GREEN}✓ Data directory ready${NC}"
echo ""

# Build the Astro frontend
echo -e "${YELLOW}Step 4: Building Astro frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Build Electron app for macOS
echo -e "${YELLOW}Step 5: Building Electron app for macOS...${NC}"
npm run electron:build:mac
echo -e "${GREEN}✓ Electron app built${NC}"
echo ""

# Find the built app
APP_PATH="$PROJECT_DIR/dist-electron/mac/$APP_NAME.app"
DMG_PATH=$(find "$PROJECT_DIR/dist-electron" -name "*.dmg" -type f | head -1)

echo -e "${YELLOW}Step 6: Deploying to Desktop...${NC}"

# Remove old app from Desktop if exists
if [ -d "$DESKTOP_DIR/$APP_NAME.app" ]; then
    echo "Removing old app from Desktop..."
    rm -rf "$DESKTOP_DIR/$APP_NAME.app"
fi

# Copy new app to Desktop
if [ -d "$APP_PATH" ]; then
    echo "Copying app to Desktop..."
    cp -R "$APP_PATH" "$DESKTOP_DIR/"
    
    # Make it executable
    chmod +x "$DESKTOP_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME"
    
    echo -e "${GREEN}✓ App copied to Desktop${NC}"
else
    echo -e "${RED}✗ App not found at expected location:${NC} $APP_PATH"
    echo "Checking for .dmg file..."
    
    if [ -f "$DMG_PATH" ]; then
        echo -e "${GREEN}Found DMG:${NC} $DMG_PATH"
        echo "Copying DMG to Desktop..."
        cp "$DMG_PATH" "$DESKTOP_DIR/"
        echo -e "${GREEN}✓ DMG copied to Desktop${NC}"
        echo ""
        echo -e "${YELLOW}To install: Open the DMG and drag the app to Applications or Desktop${NC}"
    else
        echo -e "${RED}✗ Neither .app nor .dmg found${NC}"
        exit 1
    fi
fi

# Also copy DMG if it exists
if [ -f "$DMG_PATH" ]; then
    echo "Copying DMG installer to Desktop..."
    cp "$DMG_PATH" "$DESKTOP_DIR/"
    echo -e "${GREEN}✓ DMG installer copied to Desktop${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Build and Deploy Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}App Location:${NC} $DESKTOP_DIR/$APP_NAME.app"
echo ""
echo "You can now:"
echo "  1. Double-click the app on your Desktop to launch"
echo "  2. Or install from the DMG file"
echo ""
echo "First run:"
echo "  - Right-click the app and select 'Open' (to bypass Gatekeeper)"
echo "  - Or run: sudo xattr -rd com.apple.quarantine \"$DESKTOP_DIR/$APP_NAME.app\""
echo ""
echo "=========================================="
