async function testChatApi() {
  console.log('--- Testing /api/chat RAG (using native fetch) ---');
  
  const payload = {
    messages: [
      { role: 'user', content: 'ขอราคาชุด GoodWe 5 kW ครับ' }
    ]
  };

  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      return;
    }

    const text = await response.text();
    console.log('--- Raw Stream Response ---');
    console.log(text);
    console.log('---------------------------');

    if (text.includes('ชุดโซลาร์ 5 kW (GoodWe)') || text.includes('169,000')) {
      console.log('✅ SUCCESS: RAG is working and found product data!');
    } else {
      console.log('⚠️ Response received but check raw output for product data.');
    }
  } catch (e) {
    console.error('❌ Fetch Error:', e.message);
  }
}

testChatApi();
