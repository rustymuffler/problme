import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSvg } from '../scripts/lib/svg-safety.mjs';

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const hero = (inner: string) => `<svg ${NS} viewBox="0 0 1200 630">${inner}</svg>`;
const diagram = (inner: string) => `<svg ${NS} viewBox="0 0 800 400">${inner}</svg>`;
const good = '<rect x="0" y="0" width="1200" height="630" fill="#15120E"/><text x="60" y="100" font-family="Hanken Grotesk, sans-serif" font-size="40" fill="#F4EFE6">Hello &amp; welcome</text>';

test('a clean hero and a clean diagram pass', () => {
  assert.deepEqual(validateSvg(hero(good), { kind: 'hero' }).problems, []);
  const d = validateSvg(diagram('<g><rect x="10" y="10" width="100" height="40" rx="4" fill="#241E15" stroke="#F2A24B"/><path d="M 10 10 L 100 100 Z" stroke="#9DB066" fill="none"/></g>'), { kind: 'diagram' });
  assert.equal(d.ok, true, d.problems.join('; '));
  assert.equal(d.width, 800);
});

test('active content is rejected', () => {
  const bad: Record<string, string> = {
    script: hero('<script>alert(1)</script>'),
    foreignObject: hero('<foreignObject><div>x</div></foreignObject>'),
    iframe: hero('<iframe src="x"></iframe>'),
    image: hero('<image href="https://evil.test/a.png"/>'),
    use: hero('<use href="#a"/>'),
    style: hero('<style>@import url(https://evil.test/x.css);</style>'),
    onload: hero('<rect onload="alert(1)" width="1" height="1" fill="#15120E"/>'),
    javascriptHref: hero('<g xlink:href="javascript:alert(1)"/>'),
    externalUrlFill: hero('<rect width="1" height="1" fill="url(https://evil.test/p)"/>'),
    animate: hero('<animate attributeName="x" from="0" to="1"/>'),
    doctype: '<!DOCTYPE svg [<!ENTITY x "y">]>' + hero(''),
    comment: hero('<!-- hidden -->'),
    cdata: hero('<text><![CDATA[x]]></text>'),
    entity: hero('<text>&xxe;</text>'),
  };
  for (const [name, svg] of Object.entries(bad)) {
    assert.equal(validateSvg(svg, { kind: 'hero' }).ok, false, name);
  }
});

test('colors must be from the brand palette; fonts from the brand stack', () => {
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="#FF00FF"/>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="red"/>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="rgb(1,2,3)"/>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="none" stroke="#f2a24b"/>'), { kind: 'hero' }).ok, true);
  assert.equal(validateSvg(hero('<text font-family="Comic Sans MS" fill="#F4EFE6">x</text>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<text font-family="JetBrains Mono, monospace" fill="#F4EFE6">x</text>'), { kind: 'hero' }).ok, true);
});

test('local gradient references are allowed, external ones are not', () => {
  const grad = '<defs><linearGradient id="g1"><stop offset="0" stop-color="#15120E"/><stop offset="1" stop-color="#241E15"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g1)"/>';
  assert.equal(validateSvg(hero(grad), { kind: 'hero' }).ok, true);
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="url(#a); x"/>'), { kind: 'hero' }).ok, false);
});

test('dimensions: hero must be exactly 1200x630; diagrams within bounds', () => {
  assert.equal(validateSvg(`<svg ${NS} viewBox="0 0 1000 500"></svg>`, { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} viewBox="0 0 300 100"></svg>`, { kind: 'diagram' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} viewBox="0 0 1200 630"></svg>`, { kind: 'diagram' }).ok, true);
  assert.equal(validateSvg('<svg viewBox="0 0 1200 630"></svg>', { kind: 'hero' }).ok, false); // missing xmlns
});

test('structure: nesting, mismatches, size and element limits', () => {
  assert.equal(validateSvg(hero('<svg ' + NS + ' viewBox="0 0 10 10"></svg>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<g><rect width="1" height="1" fill="#15120E"/></rect></g>'), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<g>'.repeat(30) + '</g>'.repeat(30)), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('<rect width="1" height="1" fill="#15120E"/>'.repeat(3000)), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(hero('x'.repeat(200000)), { kind: 'hero' }).ok, false);
  assert.equal(validateSvg('', { kind: 'hero' }).ok, false);
});

test('hostile input is rejected quickly', () => {
  const start = Date.now();
  validateSvg(hero('<' + 'a '.repeat(50000)), { kind: 'hero' });
  validateSvg(hero('<g ' + 'x="1" '.repeat(20000) + '>'), { kind: 'hero' });
  validateSvg('<svg ' + NS + ' viewBox="0 0 1200 630">' + '<text>'.repeat(5000), { kind: 'hero' });
  assert.ok(Date.now() - start < 3000, `took ${Date.now() - start} ms`);
});

test('whitespace and unterminated-tag input cannot hang the validator (ReDoS regression)', () => {
  const start = Date.now();
  for (const n of [1000, 10000, 100000]) {
    const svg = '<svg ' + NS + ' viewBox="0 0 1200 630"><g' + ' '.repeat(n) + '<></g></svg>';
    assert.equal(validateSvg(svg, { kind: 'hero' }).ok, false);
  }
  assert.equal(validateSvg('<svg ' + NS + ' viewBox="0 0 1200 630"><rect' + ' x="1"'.repeat(5000) + '/></svg>', { kind: 'hero' }).ok, false);
  assert.ok(Date.now() - start < 1500, `took ${Date.now() - start} ms`);
});

test('names are case-sensitive and the root size is bounded', () => {
  assert.equal(validateSvg(`<SVG ${NS} viewBox="0 0 1200 630"></SVG>`, { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} viewbox="0 0 1200 630"></svg>`, { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} viewBox="0 0 1200 630"><G></G></svg>`, { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} width="60000" height="60000" viewBox="0 0 1200 630"></svg>`, { kind: 'hero' }).ok, false);
  assert.equal(validateSvg(`<svg ${NS} width="1200" height="630" viewBox="0 0 1200 630"></svg>`, { kind: 'hero' }).ok, true);
});
