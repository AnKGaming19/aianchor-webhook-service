const http = require('http');

// Test data
const testPayload = {
  name: "Anastasis Karniatis",
  email: "akarniatis@gmail.com",
  company: "Book",
  phone: "+1234567890",
  message: "Test booking request from webhook service",
  source: "AIAnchor Website"
};

// Configuration
const HOST = 'localhost';
const PORT = 3000;
const WEBHOOK_PATH = '4d0fe820-6feb-4aeb-96b6-1b980dcf7b83';

function testWebhook() {
  const postData = JSON.stringify(testPayload);
  
  const options = {
    hostname: HOST,
    port: PORT,
    path: `/webhook/${WEBHOOK_PATH}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testing webhook service...');
  console.log(`📡 Endpoint: http://${HOST}:${PORT}/webhook/${WEBHOOK_PATH}`);
  console.log(`📦 Payload:`, testPayload);
  console.log('');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);
      console.log(`📄 Response Body:`, data);
      
      try {
        const response = JSON.parse(data);
        if (response.ok) {
          console.log('✅ Webhook test successful!');
        } else {
          console.log('❌ Webhook test failed:', response.error);
        }
      } catch (e) {
        console.log('⚠️  Could not parse response as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
    console.log('');
    console.log('💡 Make sure the webhook service is running:');
    console.log('   npm start');
    console.log('   or');
    console.log('   npm run dev');
  });

  req.write(postData);
  req.end();
}

function testHealthCheck() {
  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET'
  };

  console.log('🏥 Testing health check...');
  console.log(`📡 Endpoint: http://${HOST}:${PORT}/health`);
  console.log('');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Health Check Status: ${res.statusCode}`);
      console.log(`📄 Response:`, data);
      
      try {
        const response = JSON.parse(data);
        if (response.ok) {
          console.log('✅ Health check passed!');
        } else {
          console.log('❌ Health check failed');
        }
      } catch (e) {
        console.log('⚠️  Could not parse health check response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Health check failed:', e.message);
    console.log('');
    console.log('💡 Make sure the webhook service is running:');
    console.log('   npm start');
  });

  req.end();
}

// Run tests
console.log('🚀 AiAnchor Webhook Service Tester');
console.log('=====================================');
console.log('');

// Test health check first
testHealthCheck();

// Wait a moment, then test webhook
setTimeout(() => {
  console.log('');
  console.log('---');
  console.log('');
  testWebhook();
}, 1000);
