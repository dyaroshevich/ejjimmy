const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3001/chat...');
  await page.goto('http://localhost:3001/chat', { waitUntil: 'networkidle2' });

  // Wait for the chat to load
  await page.waitForSelector('textarea', { timeout: 10000 });
  
  console.log('Typing message about GoodWe 5 kW...');
  await page.type('textarea', 'ขอราคาชุด GoodWe 5 kW ครับ');
  await page.keyboard.press('Enter');

  console.log('Waiting for response...');
  
  try {
    // Wait for AI response containing 'ครับ' or price or error
    await page.waitForFunction(
      () => {
        const messages = document.querySelectorAll('.messages-container > div');
        if (messages.length < 2) return false;
        const lastMessage = messages[messages.length - 1];
        const text = lastMessage.innerText;
        return (text.includes('ครับ') || text.includes('฿') || text.includes('ราคา') || text.includes('ขออภัย')) && !text.includes('...');
      },
      { timeout: 30000, polling: 1000 }
    );

    const lastMessageText = await page.evaluate(() => {
      const messages = document.querySelectorAll('.messages-container > div');
      return messages[messages.length - 1].innerText;
    });

    console.log('AI Response:', lastMessageText);
    
    if (lastMessageText.includes('ขออภัย')) {
      console.log('❌ ERROR: API Error or Quota issue.');
    } else {
      console.log('✅ SUCCESS: AI responded. Checking for product info...');
      if (lastMessageText.includes('GoodWe') || lastMessageText.includes('5') || lastMessageText.includes('฿')) {
        console.log('🎯 RAG WORKING: Found product info in response.');
      } else {
        console.log('⚠️ RAG UNCERTAIN: Response seems generic.');
      }
    }
  } catch (e) {
    console.log('❌ TIMEOUT or Error:', e.message);
  }

  await browser.close();
})();
