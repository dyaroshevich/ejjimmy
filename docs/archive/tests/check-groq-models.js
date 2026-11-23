const fs = require('fs');

// Читаем .env.local вручную
const envContent = fs.readFileSync('.env.local', 'utf-8');
const GROQ_API_KEY = envContent
  .split('\n')
  .find(line => line.startsWith('GROQ_API_KEY='))
  ?.split('=')[1]
  ?.trim();

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY не найден в .env.local');
  process.exit(1);
}

const url = 'https://api.groq.com/openai/v1/models';

const headers = {
  'Authorization': `Bearer ${GROQ_API_KEY}`,
  'Content-Type': 'application/json'
};

fetch(url, { headers })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('\n✅ Доступные модели Groq:\n');
    console.log('='.repeat(70));
    
    const models = data.data || [];
    models.forEach(model => {
      console.log(`📦 ${model.id}`);
    });
    
    console.log('='.repeat(70));
    console.log(`\nВсего моделей: ${models.length}\n`);
    
    // Фильтруем Llama модели для удобства
    const llamaModels = models.filter(m => m.id.toLowerCase().includes('llama'));
    if (llamaModels.length > 0) {
      console.log('🦙 Llama модели:');
      llamaModels.forEach(m => console.log(`   - ${m.id}`));
      console.log('');
    }
  })
  .catch(error => {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  });
