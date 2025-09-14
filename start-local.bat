@echo off
echo 🚀 Starting AiAnchor Webhook Service for Local Testing
echo =====================================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo.
    echo 📝 Please edit .env file with your Zoho SMTP credentials
    echo    or uncomment the Mailhog settings for local testing
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

echo 🏥 Starting Mailhog for email testing...
start "Mailhog" cmd /k "docker run --rm -p 1025:1025 -p 8025:8025 mailhog/mailhog"

echo.
echo ⏳ Waiting for Mailhog to start...
timeout /t 3 /nobreak > nul

echo.
echo 🚀 Starting webhook service...
echo 📡 Webhook URL: http://localhost:3000/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83
echo 🏥 Health check: http://localhost:3000/health
echo 📧 Mailhog UI: http://localhost:8025
echo.

npm run dev
