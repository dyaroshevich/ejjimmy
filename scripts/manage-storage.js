const https = require('https');

const PROJECT_REF = 'odolxtryjmfpzfmuhngo';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kb2x4dHJ5am1mcHpmbXVobmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzMjgxOCwiZXhwIjoyMDg4MDA4ODE4fQ.X_wvj6zxmquPmCV0jlAsAGPudjQn-Ej2Xe-suwUrgXE';

function createBucket(bucketId) {
  return new Promise((resolve, reject) => {
    const storageOptions = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/storage/v1/bucket',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    };

    const createBucketBody = {
      id: bucketId,
      name: bucketId,
      public: true,
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
    };

    const req = https.request(storageOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Bucket "${bucketId}" created successfully!`);
          resolve();
        } else if (res.statusCode === 409 || data.includes('already exists')) {
          console.log(`ℹ️ Bucket "${bucketId}" already exists.`);
          resolve();
        } else {
          console.error(`❌ Error creating bucket "${bucketId}":`, res.statusCode, data);
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(createBucketBody));
    req.end();
  });
}

async function run() {
  console.log('🚀 Starting storage setup...');
  try {
    await createBucket('products');
    await createBucket('marketing');
    console.log('✨ Storage setup complete!');
  } catch (err) {
    console.error('💥 Setup failed:', err);
  }
}

run();
