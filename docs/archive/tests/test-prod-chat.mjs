
import fetch from 'node-fetch';

async function testChat() {
  console.log('Testing Production Chat API with CONTENT schema...');
  const url = 'https://tawanpower.vercel.app/api/chat';
  
  const body = {
    messages: [
      { 
        role: 'user', 
        content: 'สวัสดีครับ ช่วยแนะนำโซลาร์เซลล์หน่อย' 
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
    const text = await response.text();
    console.log('Response (first 500 chars):', text.substring(0, 500));
    
    if (response.status === 200) {
      console.log('✅ Chat API is working!');
    } else {
      console.log('❌ Chat API failed with status:', response.status);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testChat();
