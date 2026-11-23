// Prune the OpenDesign stylesheet (extracted from .audit.html) down to the rules
// the ported landing sections actually reference, keeping @media context.
// usage: USED="$(cat docs/design/opendesign/od-used-classes.txt)" node scripts/od-port.js > out.css

const fs = require('fs');
const css = fs.readFileSync('docs/design/opendesign/od-style.css', 'utf8');

const used = new Set(process.env.USED.split(' '));

function classesIn(sel) {
  return [...sel.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1]);
}

// tokenize top-level nodes: rules and at-rules with nested blocks
function parse(text) {
  const nodes = [];
  let i = 0;
  while (i < text.length) {
    const brace = text.indexOf('{', i);
    if (brace === -1) break;
    const head = text.slice(i, brace).trim();
    let depth = 0;
    let j = brace;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') {
        depth--;
        if (!depth) break;
      }
    }
    const body = text.slice(brace + 1, j);
    if (head.startsWith('@')) nodes.push({ at: head, body });
    else nodes.push({ sel: head, body });
    i = j + 1;
  }
  return nodes;
}

function emitRules(body, indent) {
  const out = [];
  for (const n of parse(body)) {
    if (n.at) {
      const inner = emitRules(n.body, indent + '  ');
      if (inner) out.push(indent + n.at + ' {\n' + inner + '\n' + indent + '}');
    } else if (classesIn(n.sel).some((c) => used.has(c))) {
      const decls = n.body.replace(/\s*\n\s*/g, '\n').trim();
      out.push(indent + n.sel + ' {\n' + decls.split(/;\s*\n?/).filter(Boolean).map((d) => indent + '  ' + d.trim() + ';').join('\n') + '\n' + indent + '}');
    }
  }
  return out.join('\n');
}

const result = emitRules(css, '');
const renamed = result
  .replace(/\.block--/g, '.section--')
  .replace(/\.block\b/g, '.section');
console.log(renamed);
console.error('kept bytes: ' + renamed.length);
