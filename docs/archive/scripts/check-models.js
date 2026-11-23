const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function check() {
  console.log('🔍 Checking available models for your API key...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log('\n✅ Available models:');
      data.models.forEach(m => {
        if (m.name.includes('embed')) {
          console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        }
      });
    } else {
      console.error('❌ Error fetching models:', JSON.stringify(data));
    }
  } catch (e) {
    console.error('❌ Connection error:', e.message);
  }
}

check();
