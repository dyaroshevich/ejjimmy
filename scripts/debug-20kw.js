import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.production' });

const SITE_URL = 'http://localhost:3001'; // Or your deployed URL

async function test(query) {
  console.log(`\nTesting query: "${query}"`);
  try {
    const res = await fetch(`${SITE_URL}/api/chat/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }]
      })
    });
    const data = await res.json();
    console.log('AI Response:', data.text);
    
    const productIds = [];
    const productRegex = /\[PRODUCT_ID:([\s\S]*?)\]/g;
    let match;
    while ((match = productRegex.exec(data.text)) !== null) {
      productIds.push(match[1].trim());
    }
    console.log('Detected Product IDs:', productIds);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Since we can't run a local server here easily, I'll just check the code
// But I will prepare the fixes.
console.log('Reproduction logic prepared.');
