# 🚀 Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended - Free Tier Available)

**Steps:**
1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Connect your GitHub repository
4. Railway will auto-detect Node.js and deploy
5. Set environment variables in Railway dashboard:
   - `SMTP_PASS`: Your Zoho app password
   - All other variables are pre-configured

**Your webhook URL will be:**
```
https://www.aianchor.online/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83
```

### 2. Render (Free Tier Available)

**Steps:**
1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Connect your GitHub repository
4. Select "Web Service"
5. Use the included `render.yaml` configuration
6. Set `SMTP_PASS` environment variable

**Your webhook URL will be:**
```
https://www.aianchor.online/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83
```

### 3. VPS/Server Deployment

**Steps:**
1. Upload files to your server
2. Install Node.js 18+
3. Run: `npm install --production`
4. Install PM2: `npm install -g pm2`
5. Start service: `pm2 start server.js --name aianchor-webhook`
6. Configure reverse proxy (nginx/Apache)

**Your webhook URL will be:**
```
https://www.aianchor.online/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83
```

## Environment Variables

Set these in your deployment platform:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `WEBHOOK_PATH` | `4d0fe820-6feb-4aeb-96b6-1b980dcf7b83` | Webhook path |
| `SMTP_HOST` | `smtp.zoho.eu` | Zoho SMTP host |
| `SMTP_PORT` | `465` | Zoho SMTP port |
| `SMTP_SECURE` | `true` | Use SSL |
| `SMTP_USER` | `info@aianchor.online` | Zoho email |
| `SMTP_PASS` | `YOUR_APP_PASSWORD` | Zoho app password |
| `FROM_EMAIL` | `info@aianchor.online` | From address |
| `TEAM_REPLYTO` | `info@aianchor.com` | Reply-to address |
| `SMTP_DEBUG` | `false` | Debug mode |

## Testing Your Deployment

After deployment, test with:

```bash
curl -X POST https://www.aianchor.online/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83 \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "company":"Test Company",
    "source":"AIAnchor Website"
  }'
```

## Website Integration

Update your website's JavaScript to use your deployed webhook:

```javascript
const webhookUrl = 'https://www.aianchor.online/webhook/4d0fe820-6feb-4aeb-96b6-1b980dcf7b83';

// Your production webhook URL
fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## Monitoring

- **Health Check:** `GET /health`
- **Logs:** Check your platform's log viewer
- **PM2:** `pm2 logs aianchor-webhook` (if using PM2)

## Troubleshooting

1. **SMTP Issues:** Check your Zoho app password
2. **Port Issues:** Ensure port 3000 is open
3. **CORS Issues:** CORS is enabled for all origins
4. **Rate Limiting:** 60 requests/minute per IP
