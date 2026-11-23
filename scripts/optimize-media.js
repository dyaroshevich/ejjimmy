const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const sourceBase = path.resolve(process.cwd(), 'media-source');
const outputBase = path.resolve(process.cwd(), 'public/content');
const productsPath = path.resolve(process.cwd(), 'data/solar-products/products.json');

async function optimizeImage(input, output, width = 800) {
  if (!fs.existsSync(path.dirname(output))) fs.mkdirSync(path.dirname(output), { recursive: true });
  
  // Normalize output path for comparison
  const normOutput = output.replace(/\\/g, '/');
  
  // 1. Always generate WebP for Web
  await sharp(input)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(output);

  // 2. Also generate PNG for LINE (if it's a product image)
  if (normOutput.includes('/products/')) {
    const pngOutput = output.replace(/\.webp$/, '.png');
    console.log(`  -> Generating PNG for LINE: ${path.basename(pngOutput)}`);
    await sharp(input)
      .resize(Math.min(width, 1024), null, { withoutEnlargement: true }) // LINE max 1024
      .png({ quality: 80, palette: true }) // Optimization for size
      .toFile(pngOutput);
  }
}

async function run() {
  console.log('🖼️ Starting UNIVERSAL Media Optimizer (WebP + LINE PNG)...');

  // 1. READ PRODUCTS DATA
  if (!fs.existsSync(productsPath)) {
    console.error('❌ Error: products.json not found');
    return;
  }
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  let totalProcessed = 0;

  // 2. PROCESS BRANDS (Logos)
  const brandsDir = path.join(sourceBase, 'brands');
  if (fs.existsSync(brandsDir)) {
    const brandFiles = fs.readdirSync(brandsDir).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
    for (const file of brandFiles) {
      const brandName = path.parse(file).name.toLowerCase();
      console.log(`- Optimizing Brand Logo: ${brandName}`);
      await optimizeImage(path.join(brandsDir, file), path.join(outputBase, 'brands', `${brandName}.webp`), 400);
    }
  }

  // 3. PROCESS SHOWCASE
  const showcaseDir = path.join(sourceBase, 'showcase');
  if (fs.existsSync(showcaseDir)) {
    const projects = fs.readdirSync(showcaseDir);
    for (const project of projects) {
      const projectPath = path.join(showcaseDir, project);
      if (!fs.statSync(projectPath).isDirectory()) continue;
      const files = fs.readdirSync(projectPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      for (let i = 0; i < files.length; i++) {
        console.log(`- Optimizing Showcase: ${project} (${i+1})`);
        await optimizeImage(path.join(projectPath, files[i]), path.join(outputBase, 'projects', project, `img-${i}.webp`), 1200);
      }
    }
  }

  // 4. PROCESS PRODUCTS
  const productCats = ['systems', 'inverters', 'panels', 'chargers', 'batteries', 'accessories'];
  for (const cat of productCats) {
    const catPath = path.join(sourceBase, cat);
    if (!fs.existsSync(catPath)) continue;

    const folders = fs.readdirSync(catPath);
    for (const pId of folders) {
      const pPath = path.join(catPath, pId);
      if (!fs.statSync(pPath).isDirectory()) continue;

      const files = fs.readdirSync(pPath).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f)).sort();
      if (files.length > 0) {
        console.log(`- Processing Product: ${pId} (${files.length} images)`);
        const gallery = [];
        for (let i = 0; i < files.length; i++) {
          const isMain = i === 0;
          const outName = isMain ? 'main.webp' : `img-${i}.webp`;
          const outPath = path.join(outputBase, 'products', pId, isMain ? '' : 'gallery', outName);
          const pubPath = `/content/products/${pId}/${isMain ? '' : 'gallery/'}${outName}`;
          
          await optimizeImage(path.join(pPath, files[i]), outPath, isMain ? 800 : 1200);
          gallery.push(pubPath);

          if (isMain) {
            const idx = products.findIndex(p => p.id === pId);
            if (idx !== -1) products[idx].image_url = pubPath;
          }
        }
        const idx = products.findIndex(p => p.id === pId);
        if (idx !== -1) products[idx].gallery = gallery;
        totalProcessed += files.length;
      }
    }
  }

  // 5. SAVE UPDATED DATA
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log(`\n✨ SUCCESS! Total processed: ${totalProcessed} product images with LINE-ready PNGs.`);
}

run();
