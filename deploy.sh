#!/bin/bash
set -e

FRONT_DIR="/var/www/logiciel-front"

echo "Pulling the latest changes from GitHub..."
cd "$FRONT_DIR"
git reset --hard HEAD
git pull origin main

echo "Installing needed dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

echo "✅ Frontend deployment complete!"
