#!/bin/bash
set -e

REPO_DIR="/var/www/logiciel-front"
FRONT_DIR="$REPO_DIR/logiciel-samet-front"

echo "📦 Pulling latest changes from GitHub..."
cd "$REPO_DIR"
git pull origin main

echo "📦 Installing dependencies..."
cd "$FRONT_DIR"
npm install

echo "🔨 Building frontend..."
npm run build

echo "✅ Frontend deployment complete!"
