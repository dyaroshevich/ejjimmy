/**
 * Test script to send all 3 experimental LINE variants to admin
 */

import { sendLineFlexMessage, PRODUCT_CARD_VARIANTS } from './src/lib/line.ts';

// Test product data
const testProduct = {
  id: 'test-solar-001',
  name: 'ระบบโซล่าร์พลังงาน 5kW',
  brand: 'TAWAN POWER',
  price_thb: 299000,
  power_kw: 5,
  specifications: {
    panels: '12 แผ่น',
    inverter: 'Huawei 5kW',
    warranty: '10 ปี'
  },
  system_components: [
    { item: 'แผงโซล่าร์ 540W', qty: 12 },
    { item: 'อินเวอร์เตอร์ 5kW', qty: 1 },
    { item: 'แร็คมายน์', qty: 1 }
  ]
};

// LINE Admin User ID from .env.local
const LINE_ADMIN_USER_ID = "Uf63c5b44a3ac7aad18153620fac57126";

async function testAllVariants() {
  console.log('🚀 Testing all 3 LINE Flex Message variants...');
  
  const results = [];
  
  // Test Variant 1: Hero + Large Typography
  console.log('\n📱 Testing V1: Hero + Large Typography');
  try {
    const v1Result = await sendLineFlexMessage(
      LINE_ADMIN_USER_ID,
      PRODUCT_CARD_VARIANTS.V1(testProduct),
      '🔥 ทดสอบ V1: Hero + Large Typography'
    );
    results.push({ variant: 'V1', success: v1Result.success, data: v1Result });
    console.log('✅ V1 sent successfully:', v1Result);
  } catch (error) {
    console.error('❌ V1 failed:', error);
    results.push({ variant: 'V1', success: false, error });
  }
  
  // Wait 2 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Variant 2: Staggered Layout
  console.log('\n📱 Testing V2: Staggered Layout');
  try {
    const v2Result = await sendLineFlexMessage(
      LINE_ADMIN_USER_ID,
      PRODUCT_CARD_VARIANTS.V2(testProduct),
      '🔥 ทดสอบ V2: Staggered Layout'
    );
    results.push({ variant: 'V2', success: v2Result.success, data: v2Result });
    console.log('✅ V2 sent successfully:', v2Result);
  } catch (error) {
    console.error('❌ V2 failed:', error);
    results.push({ variant: 'V2', success: false, error });
  }
  
  // Wait 2 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Variant 3: Card-based Details
  console.log('\n📱 Testing V3: Card-based Details');
  try {
    const v3Result = await sendLineFlexMessage(
      LINE_ADMIN_USER_ID,
      PRODUCT_CARD_VARIANTS.V3(testProduct),
      '🔥 ทดสอบ V3: Card-based Details'
    );
    results.push({ variant: 'V3', success: v3Result.success, data: v3Result });
    console.log('✅ V3 sent successfully:', v3Result);
  } catch (error) {
    console.error('❌ V3 failed:', error);
    results.push({ variant: 'V3', success: false, error });
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  results.forEach(result => {
    console.log(`${result.variant}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!result.success && result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  // Calculate success rate
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  console.log(`\n🎯 Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  return results;
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllVariants()
    .then(results => {
      console.log('\n🎉 Test completed!');
      process.exit(results.every(r => r.success) ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testAllVariants };