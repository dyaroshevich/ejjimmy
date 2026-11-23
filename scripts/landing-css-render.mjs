/**
 * Render the captured landing DOM against a CSS file you choose, with no dev server.
 *   npx tailwindcss -i src/app/globals.css -o shots/layout-new.css --minify
 *   node scripts/landing-css-render.mjs <port> [newCss] [oldCss]
 *   node scripts/render.mjs --url http://127.0.0.1:<port>/ --out shots/new.jpeg --width 1280 --height 900
 *   node scripts/render.mjs --url http://127.0.0.1:<port>/old --out shots/old.jpeg --width 1280 --height 900
 *
 * Why: `next dev` needs minutes to answer `/` again after globals.css changes (and longer
 * once the image optimizer is in the loop), so a CSS-only edit is cheaper to judge offline.
 * The DOM comes from shots/landing/probe.html, written by scripts/landing-shots.mjs — a
 * CSS change does not move the DOM, so whatever shifts here shifts in the real page too.
 * Anything that changes markup, data or scripts must still be checked on the dev server.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const [, , portArg, newCss = 'shots/layout-new.css', oldCss = 'shots/layout-old.css'] = process.argv;
const port = Number(portArg);
if (!port) { console.error('usage: node scripts/landing-css-render.mjs <port> [newCss] [oldCss]'); process.exit(1); }

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

// probe.html is a streaming snapshot: the sections sit in `<div hidden id="S:n">` boundaries
// that Next's inline scripts reveal. The scripts are dropped, so unhide the boundaries and
// delete the spinner fallbacks they would have replaced.
const materialize = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<!--\$\?-->[\s\S]*?<!--\/\$-->/g, '')
  .replace(/<div hidden id="S:/g, '<div id="S:');

createServer(async (req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const send = (buf, type) => res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }).end(buf);
  const page = async (href) => {
    const html = materialize(await readFile('shots/landing/probe.html', 'utf8'))
      .replace(/\/_next\/static\/css\/app\/layout\.css\?v=\d+/, href);
    send(Buffer.from(html), 'text/html');
  };
  try {
    if (rel === '/layout.css') return send(await readFile(req.url.includes('old=1') ? oldCss : newCss), 'text/css');
    if (rel === '/old') return page('/layout.css?old=1');
    if (rel === '/' || rel === '') return page('/layout.css');
    // next/image rewrites in the snapshot point at the dev optimizer; answer them from public/.
    const orig = rel.startsWith('/_next/image') ? new URL(req.url, 'http://x').searchParams.get('url') : null;
    const p = normalize(join('public', orig || rel));
    if (!p.startsWith(normalize('public'))) { res.writeHead(403).end('forbidden'); return; }
    send(await readFile(p), TYPES[extname(p)] || 'application/octet-stream');
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`landing css render: http://127.0.0.1:${port}/  (and /old)`));
