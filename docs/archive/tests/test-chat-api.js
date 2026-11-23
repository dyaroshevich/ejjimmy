// Test script for /api/chat endpoint
import fetch from 'node-fetch';

async function testChatAPI() {
  console.log('🧪 Testing /api/chat endpoint...\n');

  const testMessages = [
    { role: 'user', content: 'สวัสดีครับ' }
  ];

  try {
    console.log('📤 Sending request to http://localhost:3001/api/chat');
    console.log('📝 Messages:', JSON.stringify(testMessages, null, 2));
    console.log('');

    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: testMessages
      })
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:');
      console.error(errorText);
      return;
    }

    // Read the stream
    console.log('📖 Reading streaming response...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;

      // Show first few chunks
      if (chunkCount <= 3) {
        console.log(`Chunk ${chunkCount}:`, chunk.substring(0, 100));
      }
    }

    console.log(`\n✅ Received ${chunkCount} chunks`);
    console.log(`✅ Total response length: ${fullResponse.length} bytes`);
    console.log('\n📝 Full response (first 500 chars):');
    console.log(fullResponse.substring(0, 500));

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error(error.stack);
  }
}

testChatAPI();
