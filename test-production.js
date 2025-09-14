const http = require('http');
const https = require('https');

// Test data
const testPayload = {
  name: "Anastasis Karniatis",
  email: "akarniatis@gmail.com",
  company: "AiAnchor",
  phone: "+1234567890",
  message: "Test booking request from production webhook",
  source: "AIAnchor Website"
};

// Configuration
const HOST = 'www.aianchor.online';
const PORT = 443; // HTTPS
const WEBHOOK_PATH = '4d0fe820-6feb-4aeb-96b6-1b980dcf7b83';

function testProductionWebhook() {
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

  console.log('🌐 Testing PRODUCTION webhook service...');
  console.log(`📡 Endpoint: https://${HOST}/webhook/${WEBHOOK_PATH}`);
  console.log(`📦 Payload:`, testPayload);
  console.log('');

  const req = https.request(options, (res) => {
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
          console.log('✅ Production webhook test successful!');
          console.log('🎉 Your webhook is ready for www.aianchor.online');
        } else {
          console.log('❌ Production webhook test failed:', response.error);
        }
      } catch (e) {
        console.log('⚠️  Could not parse response as JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
    console.log('');
    console.log('💡 Make sure your webhook service is deployed and running at:');
    console.log('   https://www.aianchor.online');
  });

  req.write(postData);
  req.end();
}

function testProductionHealthCheck() {
  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET'
  };

  console.log('🏥 Testing production health check...');
  console.log(`📡 Endpoint: https://${HOST}/health`);
  console.log('');

  const req = https.request(options, (res) => {
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
          console.log('✅ Production health check passed!');
        } else {
          console.log('❌ Production health check failed');
        }
      } catch (e) {
        console.log('⚠️  Could not parse health check response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Health check failed:', e.message);
    console.log('');
    console.log('💡 Make sure your webhook service is deployed at:');
    console.log('   https://www.aianchor.online');
  });

  req.end();
}

// Run tests
console.log('🚀 AiAnchor Production Webhook Tester');
console.log('=====================================');
console.log('');

// Test health check first
testProductionHealthCheck();

// Wait a moment, then test webhook
setTimeout(() => {
  console.log('');
  console.log('---');
  console.log('');
  testProductionWebhook();
}, 2000);
