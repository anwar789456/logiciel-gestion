#!/bin/bash
set -e

FRONT_DIR="/var/www/logiciel-front"

echo "Pulling the latest changes from GitHub..."
cd "$FRONT_DIR"
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

echo "✅ Frontend deployment complete!"
