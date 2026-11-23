const fs = require('fs');
const path = require('path');

const productsPath = path.resolve(process.cwd(), 'data/solar-products/products.json');
const sourceBase = path.resolve(process.cwd(), 'media-source');

async function run() {
  console.log('📂 Creating SIMPLIFIED Media Structure...');

  // Create main folders
  const baseFolders = ['packages', 'inverters', 'panels', 'chargers', 'batteries', 'brands', 'showcase'];
  baseFolders.forEach(cat => {
    const catPath = path.join(sourceBase, cat);
    if (!fs.existsSync(catPath)) fs.mkdirSync(catPath, { recursive: true });
  });

  // Create a README for brands to explain the simple naming
  const brandsReadme = path.join(sourceBase, 'brands', 'README.txt');
  fs.writeFileSync(brandsReadme, `Simply place logo files here named after the brand.\nExample: huawei.png, jinko.svg, sigenergy.jpg`);

  console.log('✅ Created /media-source/brands/ (Place named logo files here)');
  console.log('✅ Created /media-source/showcase/ (Place project folders here)');

  console.log('\n✨ DONE! Structure is ready.');
}

run();
