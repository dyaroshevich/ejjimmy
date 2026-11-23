/**
 * Test PDF Generation Script
 * Usage: node scripts/test-pdf.js
 */

const fs = require('fs');
const path = require('path');

async function testPDF() {
  const data = {
    customerName: "Khun Somchai (Test)",
    systemKw: 5.2,
    location: "Ao Nang, Krabi",
    monthlyBill: 5500,
    monthlySavings: 2800,
    paybackYears: 4.2,
    totalCost: 185000,
    tiers: {
      eco: { name: "Standard Eco", price: 145000 },
      premium: { name: "Premium Performance", price: 185000 },
      ultra: { name: "Ultra 5-in-1 Hybrid", price: 295000 }
    },
    sofinCalculation: {
      downPayment: 18500,
      monthly36: 5400,
      monthly60: 3650
    }
  };

  console.log('Sending request to local PDF engine...');
  
  try {
    const response = await fetch('http://localhost:3001/api/pdf/proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Server responded with ${response.status}: ${err}`);
    }

    const buffer = await response.arrayBuffer();
    const filePath = path.join(process.cwd(), 'test-proposal.pdf');
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    console.log(`\n✅ SUCCESS! PDF saved to: ${filePath}`);
    console.log('Please open the file to verify the "Breezy Premium" design and 4-page structure.');
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.log('Note: Ensure "npm run dev" is running on port 3001 before running this test.');
  }
}

testPDF();
