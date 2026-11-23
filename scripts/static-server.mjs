/**
 * Serve a directory over plain HTTP so the approved Open Design mock can be opened
 * in a browser (its tokens.css and crew/ images are relative paths).
 *   node scripts/static-server.mjs <dir> <port>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const [dir, port] = [process.argv[2], Number(process.argv[3])];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const p = normalize(join(dir, rel === '/' ? '/index.html' : rel));
  if (!p.startsWith(normalize(dir))) { res.writeHead(403).end('forbidden'); return; }
  try {
    const buf = await readFile(p);
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`serving ${dir} at http://127.0.0.1:${port}/`));
