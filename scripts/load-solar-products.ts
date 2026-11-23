import { loadSolarProducts } from '../src/lib/solar/loader';

loadSolarProducts()
  .then(() => {
    console.log('Loading completed successfully');
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error('Loading failed:', error);
    process.exit(1);
  });