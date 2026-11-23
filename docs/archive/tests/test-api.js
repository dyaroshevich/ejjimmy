const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  phone: "0812345678",
  location: "กระบี่",
  segment: "home",
  monthly_bill: "3000",
  source: "Website Form"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/notify-line',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();