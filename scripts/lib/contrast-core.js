// WCAG contrast walk, shared by two instruments: scripts/landing-shots.mjs (per-viewport
// regression) and scripts/contrast-audit.mjs (live page vs the approved mock). Kept in one
// file because the two must never report different numbers for the same page.
//
// This text is injected verbatim into a `Runtime.evaluate` expression, so it runs in the page,
// not in Node: no imports, and no template literals that would collide with the host script's
// own escaping.
//
// It returns EVERY text leaf it measured, with its ratio and the `large` flag — the caller
// applies the AA threshold (4.5:1 body, 3:1 large). The audit needs the passing nodes too: to
// tell "the sheet paints this class badly and we copied it" apart from "the sheet paints this
// class well and we do not", it has to see what the reference actually resolves to.
//
// Foreground and background are resolved against each other after compositing any translucent
// layers in between; a gradient background contributes one candidate per stop, and
// `background-clip: text` is measured by its stops, not by the (invisible) colour.
const all = [];
const lum = (rgb) => {
  const m = rgb.match(/\d+/g);
  if (!m) return 0;
  const [r, g, b] = m.slice(0, 3).map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const parseColors = (str) => {
  if (!str) return [];
  const out = [];
  const re = /#([0-9a-fA-F]{3,8})|rgba?\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(str))) {
    if (m[1]) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map((x) => x + x).join('');
      out.push('rgb(' + [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)].join(',') + ')');
    } else {
      const p = m[2].split(',').map((x) => parseFloat(x));
      if (p.length >= 4 && p[3] === 0) continue;
      out.push('rgb(' + p.slice(0, 3).join(',') + ')');
    }
  }
  return out;
};
// Semi-transparent text is composited over its backdrop before measuring.
const rgbaOf = (s) => {
  const m = /rgba?\(([^)]*)\)/.exec(s);
  if (!m) return null;
  const p = m[1].split(',').map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p.length >= 4 ? p[3] : 1 };
};
const overC = (c, base) => ({ r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a), a: 1 });
const strOf = (c) => 'rgb(' + [c.r, c.g, c.b].map(Math.round).join(',') + ')';
// Background candidates = solid/translucent colours and gradient stops found up the tree.
// Effective background: alpha-composite translucent layers onto the first opaque
// solid or gradient stop found walking up. Gradient stops yield one candidate each.
const bgStack = (el, skipOwnImage) => {
  const acc = [];
  let bases = null;
  for (let n = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const solid = rgbaOf(cs.backgroundColor);
    const grads = (!skipOwnImage || n !== el) && /gradient/.test(cs.backgroundImage)
      ? parseColors(cs.backgroundImage).map(rgbaOf).filter(Boolean) : [];
    if (solid && solid.a >= 0.99) { bases = [solid]; break; }
    if (grads.length && grads.every((g) => g.a >= 0.99)) { bases = grads; break; }
    if (solid && solid.a > 0) acc.push(solid);
    acc.push(...grads);
  }
  if (!bases) bases = [{ r: 255, g: 255, b: 255, a: 1 }];
  return bases.map((b) => {
    let c = { r: b.r, g: b.g, b: b.b, a: 1 };
    for (let i = acc.length - 1; i >= 0; i--) c = overC(acc[i], c);
    return strOf(c);
  });
};
const ratioOf = (fg, bg) => {
  const l1 = lum(fg), l2 = lum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const ratioPair = (fgStr, bgStr) => {
  const b = rgbaOf(bgStr) || { r: 255, g: 255, b: 255, a: 1 };
  const f = rgbaOf(fgStr);
  if (!f) return ratioOf(fgStr, bgStr);
  return ratioOf(strOf(f.a >= 0.99 ? f : overC(f, b)), strOf(b));
};
const hasTextChild = (el) => [...el.children].some((k) => k.textContent.trim().length > 0);
for (const el of document.querySelectorAll('body *')) {
  if (hasTextChild(el) || el.textContent.trim().length <= 2 || el.offsetParent === null) continue;
  const c = getComputedStyle(el);
  const clipped = (c.webkitBackgroundClip || c.backgroundClip) === 'text';
  const stops = clipped ? parseColors(c.backgroundImage) : [];
  const fgs = stops.length ? stops : [c.color];
  const cands = bgStack(el, clipped);
  let ratio = Infinity, used = '';
  for (const f of fgs) for (const b of cands) {
    const r = ratioPair(f, b);
    if (r < ratio) { ratio = r; used = b; }
  }
  const large = parseFloat(c.fontSize) >= 24 || (parseFloat(c.fontSize) >= 18.66 && parseInt(c.fontWeight) >= 700);
  // Which band the node lives in — a failure in a band the sheet does not paint white is ours,
  // not the sheet's.
  const band = el.closest('section[id], footer, header');
  all.push({ sec: band ? (band.id || band.tagName.toLowerCase()) : '', cls: (el.className || '').toString().slice(0, 32), size: c.fontSize, weight: c.fontWeight, ratio: +ratio.toFixed(2), large, on: used, fg: fgs.join('|').slice(0, 40), text: el.textContent.trim().slice(0, 28) });
}
return all.sort((a, b) => a.ratio - b.ratio);
