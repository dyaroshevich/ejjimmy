// Reachability sweep: which files under src/ are never imported from any route?
// Usage: node scripts/orphan-sweep.mjs [shots/orphans.json]
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const OUT = process.argv[2] || join(ROOT, 'shots/orphans.json');

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|mjs|js)$/.test(e) && !/\.(test|spec|d)\.tsx?$/.test(e)) acc.push(p);
  }
  return acc;
}

const all = walk(SRC);
// Line-oriented, not one clever regex: multi-line imports put `from 'x'` on its own line,
// and next/dynamic puts import('x') mid-line. Both cases are caught by scanning per line.
function specsOf(text) {
  const out = new Set();
  for (const line of text.split('\n')) {
    for (const m of line.matchAll(/\bfrom\s*(['"])([^'"]+)\1/g)) out.add(m[2]);
    for (const m of line.matchAll(/\bimport\s*(['"])([^'"]+)\1/g)) out.add(m[2]);
    for (const m of line.matchAll(/\b(?:import|require)\s*\(\s*(['"])([^'"]+)\1\s*\)/g)) out.add(m[2]);
  }
  return [...out];
}

function resolveSpec(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null;
  const cands = [base + '.tsx', base + '.ts', join(base, 'index.tsx'), join(base, 'index.ts'), base];
  for (const c of cands) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}

// Roots: Next's own entry files plus every route under src/app. Framework entries are never
// imported by app code, so leaving them out reports them as dead.
const FRAMEWORK = ['src/middleware.ts', 'src/instrumentation.ts', 'src/video/index.ts', 'src/video/Root.tsx'];
const roots = [
  ...all.filter((f) => f.startsWith(join(SRC, 'app'))),
  ...FRAMEWORK.map((f) => join(ROOT, f)).filter((f) => existsSync(f)),
];
const external = (() => {
  const dirs = [join(ROOT, 'scripts'), join(ROOT, 'remotion.config.ts')].filter((d) => existsSync(d));
  const out = [];
  for (const d of dirs) {
    if (statSync(d).isFile()) out.push(d);
    else for (const f of walk(d)) if (!f.startsWith(SRC)) out.push(f);
  }
  return out;
})();

const seen = new Set();
const queue = [...roots];
for (const f of queue) seen.add(f);

while (queue.length) {
  const f = queue.pop();
  for (const spec of specsOf(readFileSync(f, 'utf8'))) {
    const r = resolveSpec(spec, f);
    if (r && !seen.has(r)) {
      seen.add(r);
      queue.push(r);
    }
  }
}

// Anything never reached, but still referenced by text from a reached file (type-only imports,
// string paths) gets flagged "mentioned" rather than "unreferenced".
const reachedText = [...seen].map((f) => readFileSync(f, 'utf8')).join('\n');
const orphans = [];
for (const f of all) {
  if (seen.has(f)) continue;
  const base = relative(SRC, f).replace(/\\/g, '/').replace(/\.tsx?$/, '');
  const name = base.split('/').pop();
  const mentioned = new RegExp(`['"/]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(reachedText);
  const lines = readFileSync(f, 'utf8').split(/\r?\n/).length;
  const extRefs = external.filter((e) => readFileSync(e, 'utf8').includes(name));
  orphans.push({ file: relative(ROOT, f).replace(/\\/g, '/'), lines, mentionedByReached: mentioned, externalRefs: extRefs.map((e) => relative(ROOT, e).replace(/\\/g, '/')) });
}

orphans.sort((a, b) => b.lines - a.lines);
const dead = orphans.filter((o) => !o.mentionedByReached && o.externalRefs.length === 0);
const report = {
  generatedAt: new Date().toISOString(),
  filesScanned: all.length,
  reachable: seen.size,
  unreachable: orphans.length,
  unreachableAndUnmentioned: dead.reduce((s, o) => s + o.lines, 0),
  dead,
  unreachableButMentioned: orphans.filter((o) => o.mentionedByReached || o.externalRefs.length),
};
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`scanned ${all.length} · reachable ${seen.size} · unreachable ${orphans.length} · unmentioned ${report.unreachableAndUnmentioned} lines`);
console.log(`witness: ${relative(ROOT, OUT).replace(/\\/g, '/')}`);
for (const o of dead) console.log(`  DEAD  ${o.file}  (${o.lines} lines)`);
for (const o of report.unreachableButMentioned) console.log(`  mentioned  ${o.file} (${o.lines}) by=[${o.externalRefs.join(',')}]`);
