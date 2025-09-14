# AiAnchor Webhook Service

A minimal local service that replicates the n8n flow for AiAnchor booking requests. This service receives webhook payloads, logs them to JSON files, and sends transactional emails via SMTP.

## Features

- ✅ Express.js webhook endpoint
- ✅ JSON payload logging with sanitized filenames
- ✅ SMTP email sending via Nodemailer
- ✅ Rate limiting (60 requests/minute per IP)
- ✅ Input validation and error handling
- ✅ Health check endpoint
- ✅ CORS support
- ✅ Request logging with Morgan
- ✅ Environment-based configuration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration (defaults work for local development with Mailhog).

### 3. Start Mailhog (for local email testing)

```bash
docker run --rm -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

- SMTP server: `localhost:1025`
- Web UI: `http://localhost:8025`

### 4. Start the Service

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The service will start on `http://localhost:3000` by default.

## API Endpoints

### POST /webhook/{webhook-path}

Receives booking request payloads and sends confirmation emails.

**Required fields:**
- `name` (string)
- `email` (string, valid email format)

**Optional fields:**
- `company` (string)
- `phone` (string)
- `message` (string)
- `source` (string)

**Response:**
```json
{
  "ok": true,
  "message": "Email queued/sent"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## Testing

Test the webhook with curl:

```bash
curl -X POST http://localhost:3000/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83 \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Anastasis Karniatis",
    "email":"akarniatis@gmail.com",
    "company":"Book",
    "phone":"",
    "message":"Test",
    "source":"AIAnchor Website"
  }'
```

## Email Template

The service sends emails with the following template:

**Subject:** We received your booking request — AiAnchor

**Body:**
```
Hi {name},

Thanks for requesting a free AI Strategy Call with AiAnchor. 🎯
We've received your request and our team will reply within 24 hours with 2–3 available time slots.

What happens next:
1) You'll get a confirmation with your chosen time.
2) You'll receive a calendar invite with all the details.
3) On the call, we'll explore how AI can streamline your business and uncover quick wins.

If your request is urgent, just reply to this email with "URGENT" in the subject line.

Best regards,
The AiAnchor Team ⚓
info@aianchor.online
https://www.aianchor.online/
```

## Logging

Each webhook request is logged to `./logs/{timestamp}-{email}.json` with:
- Request timestamp
- Full payload
- Client IP
- User agent

## Production Setup

### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables in Railway dashboard:
   - `SMTP_PASS`: Your Zoho app password
   - All other variables are pre-configured
4. Deploy automatically

### Option 2: Render
1. Connect your GitHub repo to Render
2. Use the included `render.yaml` configuration
3. Set `SMTP_PASS` environment variable
4. Deploy

### Option 3: VPS/Server
1. Upload files to your server
2. Run `npm install --production`
3. Set up PM2: `pm2 start server.js --name webhook`
4. Configure reverse proxy (nginx/Apache)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
WEBHOOK_PATH=4d0fe820-6feb-4aeb-96b6-1b980dcf7b83
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@aianchor.online
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
FROM_EMAIL=info@aianchor.online
TEAM_REPLYTO=info@aianchor.com
SMTP_DEBUG=false
```

**Important:** Replace `YOUR_ZOHO_APP_PASSWORD` with your actual Zoho app-specific password.

## Docker Compose (Optional)

Use the included `docker-compose.yml` for easy local development:

```bash
docker-compose up
```

This starts both Mailhog and the webhook service.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `WEBHOOK_PATH` | Webhook path segment | `4d0fe820-6feb-4aeb-96b6-1b980dcf7b83` |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `SMTP_PORT` | SMTP server port | `1025` |
| `SMTP_SECURE` | Use SSL/TLS | `false` |
| `SMTP_USER` | SMTP username (optional) | - |
| `SMTP_PASS` | SMTP password (optional) | - |
| `FROM_EMAIL` | From email address | `info@aianchor.online` |
| `TEAM_REPLYTO` | Reply-to email address | `info@aianchor.com` |

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request:** Missing required fields or invalid email format
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side errors

All errors return JSON responses with `ok: false` and an `error` message.
