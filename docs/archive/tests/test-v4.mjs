import { PRODUCT_CARD_VARIANTS } from './src/lib/line.ts';
import { sendLineFlexMessage } from './src/lib/line.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testV4() {
  const userId = process.env.LINE_ADMIN_USER_ID;
  if (!userId) {
    console.error('Error: LINE_ADMIN_USER_ID is not set');
    return;
  }

  const mockProduct = {
    name: 'Solar System X-Pro',
    price_thb: 150000,
    power_kw: 5,
    brand: 'Tawan Power'
  };

  console.log('Generating V4 variant...');
  const v4Content = PRODUCT_CARD_VARIANTS.V4(mockProduct);

  console.log('Sending V4 to LINE...');
  const result = await sendLineFlexMessage(userId, v4Content, 'Check out our new V4 minimalist design!');
  
  if (result.success) {
    console.log('✅ V4 variant sent successfully!');
  } else {
    console.error('❌ Failed to send V4:', result.error);
  }
}

testV4();
