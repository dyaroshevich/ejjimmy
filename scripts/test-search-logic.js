function testSearch(text) {
  console.log(`Input: "${text}"`);
  const cleanSearch = text.replace(/kW|kw|ราคา|ชุด|โซลาร์|เซลล์/g, '').trim();
  const numericKw = parseInt(cleanSearch);
  
  if (!isNaN(numericKw)) {
    console.log(`  MATCH: power_kw == ${numericKw}`);
  } else {
    console.log(`  MATCH: name LIKE %${text}%`);
  }
}

testSearch("20kw");
testSearch("5 kw");
testSearch("ราคา 10");
testSearch("ชุดโซลาร์");
