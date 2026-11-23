// Test what Flex Message is generated
const leadData = {
  name: "Test User",
  phone: "0812345678",
  location: "Test",
  source: "Chat"
};

// Simple check - print what fields are missing
console.log('Lead data received:', JSON.stringify(leadData, null, 2));

// Check which fields createLeadFlexMessage expects
const needed = ['name', 'phone', 'location', 'segment', 'monthly_bill', 'source', 'leadId'];
console.log('\nNeeded fields:', needed.join(', '));

needed.forEach(field => {
  console.log(`  ${field}:`, leadData[field] === undefined ? 'MISSING' : (leadData[field] || 'empty string'));
});