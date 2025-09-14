const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '4d0fe820-6feb-4aeb-96b6-1b980dcf7b83';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: {
    ok: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sanitize filename for logging
function sanitizeFilename(str) {
  return str.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}

// Create Nodemailer transporter
function createTransporter() {
  const SMTP_PORT_NUM = Number(process.env.SMTP_PORT || 465);
  const useSSL = SMTP_PORT_NUM === 465;

  const config = {
    host: process.env.SMTP_HOST || 'smtp.zoho.eu',
    port: SMTP_PORT_NUM,
    secure: useSSL,                 // true for 465 SSL, false for 587
    requireTLS: !useSSL,            // STARTTLS only when 587
    auth: { 
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS 
    },
    tls: {
      minVersion: 'TLSv1.2',
      servername: process.env.SMTP_HOST || 'smtp.zoho.eu', // SNI
      rejectUnauthorized: true
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    logger: process.env.SMTP_DEBUG === 'true',
    debug: process.env.SMTP_DEBUG === 'true',
  };

  console.log(`📧 SMTP Config: ${config.host}:${config.port} (secure: ${config.secure})`);
  console.log(`🔐 SMTP Auth: ${config.auth.user}`);
  console.log(`🔒 TLS: ${useSSL ? 'SSL' : 'STARTTLS'}`);

  const transporter = nodemailer.createTransport(config);

  // Verify SMTP connection on startup
  transporter.verify((err, ok) => {
    if (err) {
      console.error('❌ SMTP verify failed:', err.message);
    } else {
      console.log('✅ SMTP ready:', ok);
    }
  });

  return transporter;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Webhook endpoint
app.post(`/webhook/${WEBHOOK_PATH}`, async (req, res) => {
  try {
    const { name, email, company, phone, message, source } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        ok: false,
        error: 'Name and email are required'
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email format'
      });
    }

    // Create log entry
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedEmail = sanitizeFilename(email);
    const logFilename = `${timestamp}-${sanitizedEmail}.json`;
    const logPath = path.join(logsDir, logFilename);

    const logData = {
      timestamp: new Date().toISOString(),
      payload: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Write log file
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));

    // Prepare email content
    const emailSubject = 'We received your booking request — AiAnchor';
    const emailBody = `Hi ${name},

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
https://www.aianchor.online/`;

    // Prepare email headers
    const headers = {
      'X-AIAnchor-Source': source || 'Unknown'
    };
    
    if (company) {
      headers['X-AIAnchor-Company'] = company;
    }

    // Send email
    const transporter = createTransporter();
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
    
    const mailOptions = {
      from: from,
      to: email,
      replyTo: process.env.TEAM_REPLYTO,
      subject: emailSubject,
      text: emailBody,
      headers: headers
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${email} for ${name}`);
    console.log(`📝 Log saved: ${logFilename}`);

    res.json({
      ok: true,
      message: 'Email queued/sent'
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
});

// Debug route to show available endpoints
app.get('/debug', (req, res) => {
  res.json({
    ok: true,
    message: 'Debug info',
    webhookPath: WEBHOOK_PATH,
    fullWebhookUrl: `/webhook/${WEBHOOK_PATH}`,
    environment: process.env.NODE_ENV || 'development',
    availableEndpoints: [
      'GET /health',
      `POST /webhook/${WEBHOOK_PATH}`,
      'GET /debug'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /health',
      `POST /webhook/${WEBHOOK_PATH}`,
      'GET /debug'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AiAnchor Webhook Service running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: POST /webhook/${WEBHOOK_PATH}`);
  console.log(`🏥 Health check: GET /health`);
  console.log(`📧 SMTP configured for: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📝 Logs will be saved to: ./logs/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 WEBHOOK_PATH: ${WEBHOOK_PATH}`);
});
