import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublished } from '../src/lib/publish.ts';

const tuesday = new Date('2026-11-24'); // frontmatter dates parse as UTC midnight

test('past-dated post is published', () => {
  assert.equal(isPublished(tuesday, new Date('2026-11-25T08:00:00Z')), true);
});

test('future-dated post is hidden', () => {
  assert.equal(isPublished(tuesday, new Date('2026-11-23T23:59:59Z')), false);
});

test('post goes live at exactly 00:00 UTC on its date', () => {
  assert.equal(isPublished(tuesday, new Date('2026-11-24T00:00:00Z')), true);
});

test('includeFuture shows scheduled posts (dev and PR previews)', () => {
  assert.equal(isPublished(tuesday, new Date('2026-11-01T00:00:00Z'), true), true);
});

test('includeFuture defaults to false', () => {
  assert.equal(isPublished(new Date('2099-01-01'), new Date('2026-11-19')), false);
});
