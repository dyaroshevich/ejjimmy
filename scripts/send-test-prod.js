const https = require('https');

const data = JSON.stringify({ type: 'test' });

const options = {
  hostname: 'tawanpower.vercel.app',
  port: 443,
  path: '/api/notify-line',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();

console.log('Sending test to production...');