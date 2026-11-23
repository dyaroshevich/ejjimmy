
import fetch from 'node-fetch';

async function testLocalChat() {
  console.log('Testing Local Chat API (port 3002) with Failover...');
  const url = 'http://localhost:3002/api/chat';
  
  const body = {
    messages: [
      { 
        id: 'test-local-1',
        role: 'user', 
        parts: [{ type: 'text', text: 'Hello, testing multi-provider setup on port 3002' }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Local Chat API is working!');
      const reader = response.body;
      if (reader) {
         console.log('Streaming response received...');
         for await (const chunk of reader) {
            process.stdout.write(chunk.toString().substring(0, 50));
            break; 
         }
         console.log('\n--- Stream Verified ---');
      }
    } else {
      const text = await response.text();
      console.log('❌ Local Chat API failed:', text);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testLocalChat();
