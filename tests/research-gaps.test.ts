import { test } from 'node:test';
import assert from 'node:assert/strict';
import { researchGaps } from '../scripts/research-gaps.mjs';

const bullets = (n: number) => Array.from({ length: n }, (_, i) => `- item ${i + 1} | https://example.com/${i}`).join('\n');
const brief = (o: { scan?: number; cite?: number; counter?: number; target?: boolean; extra?: string } = {}) => `# Research Brief: X
Date: 2026-11-21

## Key Statistics and Data
- 42 percent (source: https://example.com/s, published 2026-01-01)${o.extra ?? ''}

## Competitive Content Scan
${bullets(o.scan ?? 3)}
${o.target === false ? '' : 'Recommended target length for this article: 1,500 words'}

## Credible Sources to Cite
${bullets(o.cite ?? 3)}

## Counterarguments to Address
${bullets(o.counter ?? 2)}

## Flagged content
- none
`;

test('a complete brief has no gaps', () => {
  assert.deepEqual(researchGaps(brief()), []);
});

test('thin sections are reported with their counts', () => {
  const gaps = researchGaps(brief({ scan: 1, cite: 0, counter: 1 }));
  assert.equal(gaps.length, 3);
  assert.match(gaps[0], /competitive scan.*found 1/);
  assert.match(gaps[1], /credible sources.*found 0/);
  assert.match(gaps[2], /counterarguments.*found 1/);
});

test('"none" placeholder bullets do not count', () => {
  const text = brief({ counter: 0 }).replace('## Counterarguments to Address\n\n', '## Counterarguments to Address\n- none\n- N/A\n\n');
  const gaps = researchGaps(text);
  assert.equal(gaps.length, 1);
  assert.match(gaps[0], /counterarguments.*found 0/);
});

test('unverified markers and a missing target length are reported', () => {
  const gaps = researchGaps(brief({ target: false, extra: ' [UNVERIFIED - needs source]\n- another [UNVERIFIED - needs source]' }));
  assert.ok(gaps.some((g) => /2 claim/.test(g)));
  assert.ok(gaps.some((g) => /target length/.test(g)));
});

test('missing sections count as gaps; hostile input stays fast', () => {
  assert.equal(researchGaps('# Research Brief: X\n').length, 4);
  const start = Date.now();
  researchGaps(`## Credible Sources to Cite\n${'- '.repeat(200000)}`);
  assert.ok(Date.now() - start < 1000);
});
