// Simple test to debug the product Flex Message creation
const { createProductFlexMessage } = require('./src/lib/line');

console.log('Testing createProductFlexMessage...');

// Test data matching what we sent in the API call
const testProduct = {
  name: 'ทดสอบผลิตภัณฑ์',
  price_thb: 100000,
  power_kw: 5,
  type: 'system',
  brand: 'Tawan Power',
  description: 'ผลิตภัณฑ์ทดสอบ',
  image_url: 'https://example.com/image.jpg'
};

try {
  const result = createProductFlexMessage(testProduct);
  console.log('SUCCESS: Product Flex Message created');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('ERROR creating Product Flex Message:', error);
  console.error('Error details:', error.message);
  console.error('Error stack:', error.stack);
}