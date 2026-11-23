// Is this repository actually a template?
// usage: node scripts/template-check.mjs [--dry-run]
//
// Stage 5 / B11 of docs/plans/BRAND_TEMPLATE_STRATEGY_2026-11-07.md. The claim "a franchisee changes the
// config, not the code" is only worth something if it is measured, so this script performs the acceptance
// test itself: rename the brand to a shop that does not exist, then run every gate. If a gate fails after a
// rename, the template is not a template — some file still holds the old brand, and the failure names it.
//
// It refuses to run when the files it rewrites already carry local edits. The rename touches exactly four
// paths, and the only honest way back is `git checkout` on those — so the precondition is narrowed to them
// rather than the whole tree, which lets the script be run before its own commit.
//
// `--dry-run` prints what it would do and touches nothing.
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');

// A brand sharing no substring with the live one, so a leftover literal cannot accidentally match.
const STRANGER = {
  name: 'Nordlys Sol',
  nameTh: 'ทีมงาน Nordlys Sol',
  line: '@nordlys',
  phone: '089-771-2233',
  email: 'hei@nordlys.example',
  city: 'Trondheim',
  site: 'https://nordlys.example',
};

const rename = [
  `node "${join(ROOT, 'scripts/brand-new.mjs')}"`,
  `--name "${STRANGER.name}"`,
  `--name-th "${STRANGER.nameTh}"`,
  `--line ${STRANGER.line}`,
  `--phone ${STRANGER.phone}`,
  `--email ${STRANGER.email}`,
  `--city ${STRANGER.city}`,
  `--site ${STRANGER.site}`,
].join(' ');

const STEPS = [
  ['brand:new', rename],
  ['brand:check', 'npm run brand:check'],
  ['tsc', 'npx tsc --noEmit'],
  ['jest', 'npx jest --ci --silent'],
];

const TOUCHED = ['brand.json', 'src/lib/site.config.ts', 'public/manifest.json', 'public/admin-manifest.json'];
const dirty = execSync(`git status --porcelain -- ${TOUCHED.join(' ')}`, { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter((line) => line.trim());

if (dirty.length) {
  console.error('template-check · a file the rename rewrites has local edits, refusing to run:');
  for (const line of dirty) console.error(`  ${line}`);
  console.error('  commit or stash it first; this script restores those four files with `git checkout`.');
  process.exit(1);
}

console.log(`template-check · renaming to "${STRANGER.name}" (${STRANGER.city}) and running every gate`);
if (DRY) {
  for (const [label] of STEPS) console.log(`  would run  ${label}`);
  console.log('dry-run · nothing written');
  process.exit(0);
}

const failed = [];
for (const [label, command] of STEPS) {
  try {
    execSync(command, { cwd: ROOT, stdio: 'inherit' });
    console.log(`  PASS  ${label}`);
  } catch (err) {
    // Keep going: the useful report is *all* the gates a rename breaks, not the first one.
    failed.push(label);
    console.error(`  FAIL  ${label}${err?.message ? ` — ${String(err.message).split('\n')[0]}` : ''}`);
  }
}

// Always restore: the run is a measurement, and the repository must come back unchanged.
execSync(`git checkout -- ${TOUCHED.join(' ')}`, { cwd: ROOT, stdio: 'inherit' });

if (failed.length === 0) {
  console.log("template-check · a stranger's brand passes every gate with 0 edits in src/**");
  console.log(`  (renamed by config only: ${STRANGER.name}, ${STRANGER.line}, ${STRANGER.phone}, ${STRANGER.site})`);
} else {
  console.error(`template-check · ${failed.length} gate(s) failed after the rename: ${failed.join(', ')}`);
}
process.exit(failed.length === 0 ? 0 : 1);
