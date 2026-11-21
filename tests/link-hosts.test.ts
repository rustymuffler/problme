import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractHosts } from '../scripts/link-hosts.mjs';

test('markdown links, autolinks, bare urls, html attributes and reference definitions are all found', () => {
  const text = [
    'A [link](https://Docs.Example.org/a) and an <https://auto.example.net/x> autolink.',
    'Bare https://bare.example.com/path here, and HTTPS://UPPER.example.io/Z too.',
    '<a href="https://html.example.dev/q">x</a> <img src="https://img.example.app/a.png">',
    '[ref]: https://ref.example.co/page',
    'Spaced: ]( https://spaced.example.xyz/p)',
    'Port and userinfo: https://user:pw@evil.example.test:8080/p',
  ].join('\n');
  const hosts = extractHosts(text);
  for (const h of ['docs.example.org', 'auto.example.net', 'bare.example.com', 'upper.example.io', 'html.example.dev', 'img.example.app', 'ref.example.co', 'spaced.example.xyz']) {
    assert.ok(hosts.includes(h), h);
  }
  // userinfo hosts are captured as the text before the "@" (not as the real host), so they cannot match an allowlist
  assert.ok(!hosts.includes('evil.example.test'));
});

test('protocol-relative urls are found', () => {
  const hosts = extractHosts('See [x](//cdn.example.org/a) and <script src="//js.example.net/x.js"> and (//p.example.io/z)');
  for (const h of ['cdn.example.org', 'js.example.net', 'p.example.io']) assert.ok(hosts.includes(h), h);
});

test('code fences are skipped unless --all, and www is normalised', () => {
  const text = 'Outside https://www.outside.example.org/a\n\n```bash\ncurl https://inside.example.com/x\n```\n';
  assert.deepEqual(extractHosts(text), ['outside.example.org']);
  assert.deepEqual(extractHosts(text, { includeCode: true }), ['inside.example.com', 'outside.example.org']);
});

test('plain prose, comments and relative paths produce no hosts', () => {
  assert.deepEqual(extractHosts('Use // for comments, a/b paths, and ratios like 4.5:1.'), []);
  assert.deepEqual(extractHosts('[home](/blog/post/) and [anchor](#x)'), []);
});

test('hostile input stays fast', () => {
  const start = Date.now();
  extractHosts('https://' + 'a'.repeat(100000));
  extractHosts(']( //'.repeat(20000));
  extractHosts('x'.repeat(500000));
  assert.ok(Date.now() - start < 3000, `took ${Date.now() - start} ms`);
});
