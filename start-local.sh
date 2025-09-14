#!/bin/bash

echo "🚀 Starting AiAnchor Webhook Service for Local Testing"
echo "====================================================="
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo
    echo "📝 Please edit .env file with your Zoho SMTP credentials"
    echo "   or uncomment the Mailhog settings for local testing"
    echo
    read -p "Press Enter to continue..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo
fi

echo "🏥 Starting Mailhog for email testing..."
docker run --rm -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog

echo
echo "⏳ Waiting for Mailhog to start..."
sleep 3

echo
echo "🚀 Starting webhook service..."
echo "📡 Webhook URL: http://localhost:3000/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83"
echo "🏥 Health check: http://localhost:3000/health"
echo "📧 Mailhog UI: http://localhost:8025"
echo

npm run dev
