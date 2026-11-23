const fs = require('fs');
const { execSync } = require('child_process');

try {
  const output = execSync('npx supabase gen types typescript --project-id odolxtryjmfpzfmuhngo', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    cwd: 'C:/Users/dy/Code/tawanpower'
  });

  fs.writeFileSync('C:/Users/dy/Code/tawanpower/src/lib/database.types.ts', output);
  console.log('Done. File size:', output.length);
} catch (e) {
  console.error('Error:', e.message);
  console.error('stderr:', e.stderr);
}