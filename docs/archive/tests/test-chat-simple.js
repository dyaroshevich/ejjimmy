// Simple test for /api/chat endpoint
import http from 'http';

const postData = JSON.stringify({
  messages: [
    { role: 'user', content: 'สวัสดีครับ' }
  ]
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing /api/chat endpoint...\n');
console.log('📤 Sending POST request to http://localhost:3001/api/chat\n');

const req = http.request(options, (res) => {
  console.log(`📥 Response status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📥 Content-Type: ${res.headers['content-type']}`);
  console.log(`📥 Vercel AI Data Stream: ${res.headers['x-vercel-ai-data-stream'] || 'N/A'}`);
  console.log('');

  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Response complete`);
    console.log(`✅ Total chunks received: ${data.length} bytes`);
    console.log('\n📝 Raw response (first 1000 chars):');
    console.log(data.substring(0, 1000));
    console.log('\n✅ API endpoint is working!');
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.write(postData);
req.end();
