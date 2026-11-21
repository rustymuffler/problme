/**
 * Strict SVG allowlist validator (roadmap item P1-2).
 *
 * The Image Creator is a model run, so its SVGs are untrusted. This module accepts an SVG only if
 * every element, attribute and value is on an allowlist, so the file cannot carry script, external
 * references, embedded HTML or anything else active. Colors must come from the brand palette and fonts
 * from the brand font stack. A file that passes is safe to rasterise and to commit as a source file.
 *
 * Pure function of the text: no file system, no parsing library. Every regular expression here is
 * linear: whitespace runs are capped first, tags are length-limited, and the tag pattern has no
 * overlapping quantifiers.
 */

/** Workshop palette from BRAND.md (the CSS tokens in src/styles/global.css). Hex values, upper case. */
export const BRAND_COLORS = new Set([
  '#15120E', // bg
  '#1C1812', // surface
  '#241E15', // surface-alt
  '#2E261B', // border
  '#3D3322', // border-strong
  '#F4EFE6', // text-primary
  '#B6A88F', // text-secondary
  '#9A8B74', // text-muted
  '#F2A24B', // amber
  '#E8674A', // terracotta
  '#9DB066', // olive
  '#7FB069', // success
  '#E8B04B', // warning
  '#D64933', // danger
]);

const ALLOWED_FONTS = new Set(['hanken grotesk', 'inter', 'jetbrains mono', 'sans-serif', 'monospace']);

// XML is case-sensitive, so names must be written exactly as listed (the renderer would otherwise
// ignore or reject them).
const ELEMENT_LIST = [
  'svg', 'g', 'defs', 'title', 'desc', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path',
  'text', 'tspan', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'marker',
];
const ELEMENTS = new Set(ELEMENT_LIST);

const ATTRIBUTE_LIST = [
  'xmlns', 'version', 'viewBox', 'width', 'height', 'x', 'y', 'dx', 'dy', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2',
  'd', 'points', 'transform', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-miterlimit', 'opacity', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'clip-rule',
  'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'letter-spacing',
  'id', 'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform', 'clip-path', 'clipPathUnits',
  'marker-start', 'marker-end', 'markerWidth', 'markerHeight', 'refX', 'refY', 'orient', 'markerUnits',
  'preserveAspectRatio', 'role', 'aria-label', 'aria-hidden', 'xml:space',
];
const ATTRIBUTES = new Set(ATTRIBUTE_LIST);

const COLOR_ATTRS = new Set(['fill', 'stroke', 'stop-color']);
const NUMBER_ATTRS = new Set(['opacity', 'fill-opacity', 'stroke-opacity', 'stop-opacity', 'stroke-width', 'font-size', 'offset']);

const MAX_BYTES = 150_000;
const MAX_TAG = 4000; // characters in one tag
const MAX_ELEMENTS = 2500;
const MAX_DEPTH = 14;
const MAX_DIMENSION = 4000;

/** Expand #abc to #AABBCC and upper-case. */
function normaliseHex(value) {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return ('#' + [...v.slice(1)].map((c) => c + c).join('')).toUpperCase();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  return null;
}

// name, optional attributes (each: whitespace, name, =, quoted value), optional slash. No lazy
// quantifier and no overlap between the whitespace and the attribute names, so matching is linear.
const TAG = /^<(\/?)([A-Za-z][A-Za-z0-9:-]*)((?:\s+[A-Za-z_:][-A-Za-z0-9_:.]*\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>$/;
const ATTR = /\s+([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * @param {string} svg
 * @param {{kind?: 'hero'|'diagram'}} [options] hero must be exactly 1200x630
 * @returns {{ok: boolean, problems: string[], width: number, height: number}}
 */
export function validateSvg(svg, options = {}) {
  const problems = [];
  const fail = (m) => {
    if (problems.length < 25) problems.push(m);
  };
  let width = 0;
  let height = 0;

  if (typeof svg !== 'string' || svg.length === 0) return { ok: false, problems: ['Empty SVG.'], width, height };
  if (Buffer.byteLength(svg) > MAX_BYTES) return { ok: false, problems: [`SVG is larger than ${MAX_BYTES} bytes.`], width, height };
  // Long whitespace runs are never needed and are what makes sloppy tag patterns slow.
  if (/\s{200,}/.test(svg)) return { ok: false, problems: ['SVG contains a run of 200 or more whitespace characters.'], width, height };
  if (/<!(?:DOCTYPE|ENTITY|\[CDATA\[)|<\?|<!--/i.test(svg)) fail('DOCTYPE, entity declarations, CDATA, processing instructions and comments are not allowed.');
  if (/&(?!(?:amp|lt|gt|quot|apos|#39|#x27);)[A-Za-z#][A-Za-z0-9#]*;/.test(svg)) fail('Only the basic XML entities (&amp; &lt; &gt; &quot; &apos;) are allowed.');

  const tokens = svg.match(/<[^<>]*>|<[^<>]*|[^<]+/g) ?? [];
  const stack = [];
  let elements = 0;
  let sawRoot = false;
  let inText = 0;

  for (const token of tokens) {
    if (!token.startsWith('<')) {
      if (stack.length === 0 && token.trim()) fail('Text outside the svg element.');
      if (/[<>]/.test(token)) fail('Unexpected markup characters in text.');
      continue;
    }
    if (token.length > MAX_TAG) {
      fail('A tag is longer than 4000 characters.');
      continue;
    }
    const m = TAG.exec(token);
    if (!m) {
      fail(`Malformed tag: ${token.slice(0, 40)}`);
      continue;
    }
    const [, closing, rawName, attrText, selfClose] = m;
    if (!ELEMENTS.has(rawName)) {
      fail(`Element <${rawName}> is not allowed (names are case-sensitive).`);
      continue;
    }
    const name = rawName;
    if (closing) {
      const top = stack.pop();
      if (top !== name) fail(`Mismatched closing tag </${rawName}>.`);
      if (name === 'text') inText -= 1;
      continue;
    }
    elements += 1;
    if (elements > MAX_ELEMENTS) {
      fail('Too many elements.');
      break;
    }
    if (!sawRoot) {
      sawRoot = true;
      if (name !== 'svg') fail('The root element must be <svg>.');
    } else if (stack.length === 0) {
      fail('Only one root element is allowed.');
    }
    if (name === 'svg' && stack.length > 0) fail('Nested <svg> elements are not allowed.');
    if (name === 'tspan' && !inText) fail('<tspan> must be inside <text>.');

    // Attributes: every name and value is checked; the tag pattern already guarantees nothing else is present.
    const attrs = {};
    for (const a of attrText.matchAll(ATTR)) {
      const key = a[1];
      const value = a[2] ?? a[3] ?? '';
      attrs[key] = value;
      if (!ATTRIBUTES.has(key)) {
        fail(`Attribute "${key}" is not allowed on <${rawName}> (names are case-sensitive).`);
        continue;
      }
      if (/javascript:|data:|vbscript:|https?:|\/\/|@import|expression\s*\(|&#|<|>/i.test(value) && key !== 'xmlns') fail(`Attribute ${key} has a forbidden value.`);
      if (/url\(/i.test(value) && !/^url\(#[A-Za-z0-9_-]{1,60}\)$/.test(value.trim())) fail(`Attribute ${key} may only reference a local #id.`);
      if (COLOR_ATTRS.has(key)) {
        const v = value.trim();
        if (v !== 'none' && !/^url\(#[A-Za-z0-9_-]{1,60}\)$/.test(v)) {
          const hex = normaliseHex(v);
          if (!hex) fail(`Color "${v}" must be a hex value from the brand palette.`);
          else if (!BRAND_COLORS.has(hex)) fail(`Color ${hex} is not in the brand palette (BRAND.md Workshop palette).`);
        }
      }
      if (NUMBER_ATTRS.has(key) && !/^-?\d{1,6}(\.\d{1,6})?(px|%)?$/.test(value.trim())) fail(`Attribute ${key} must be a number.`);
      if ((key === 'width' || key === 'height') && name === 'svg') {
        const n = Number(value.replace(/px$/, ''));
        if (!/^\d{1,5}(px)?$/.test(value.trim()) || n > MAX_DIMENSION) fail(`The root ${key} must be a plain number of at most ${MAX_DIMENSION}.`);
      }
      if (key === 'font-family') {
        for (const part of value.split(',')) {
          if (!ALLOWED_FONTS.has(part.replace(/["']/g, '').trim().toLowerCase())) fail(`Font "${part.trim()}" is not allowed; use Hanken Grotesk, Inter, JetBrains Mono, sans-serif or monospace.`);
        }
      }
      if (key === 'xmlns' && value !== 'http://www.w3.org/2000/svg') fail('xmlns must be the SVG namespace.');
      if (key === 'd' && /[^MmLlHhVvCcSsQqTtAaZz0-9eE+\-., \t\r\n]/.test(value)) fail('Path data has unexpected characters.');
    }

    if (name === 'svg' && stack.length === 0) {
      if (attrs.xmlns !== 'http://www.w3.org/2000/svg') fail('The root <svg> needs xmlns="http://www.w3.org/2000/svg".');
      const vb = /^0 0 (\d{2,4}) (\d{2,4})$/.exec((attrs.viewBox ?? '').trim());
      if (!vb) fail('The root <svg> needs viewBox="0 0 <width> <height>".');
      else {
        width = Number(vb[1]);
        height = Number(vb[2]);
        if (options.kind === 'hero') {
          if (width !== 1200 || height !== 630) fail('A hero must have viewBox="0 0 1200 630".');
        } else if (width < 600 || width > 1600 || height < 200 || height > 1600) {
          fail('A diagram viewBox must be 600 to 1600 wide and 200 to 1600 tall.');
        }
      }
    }
    if (!selfClose) {
      stack.push(name);
      if (stack.length > MAX_DEPTH) fail('Elements are nested too deeply.');
      if (name === 'text') inText += 1;
    }
  }
  if (stack.length) fail('Unclosed elements.');
  if (!sawRoot) fail('No <svg> element found.');
  return { ok: problems.length === 0, problems, width, height };
}
