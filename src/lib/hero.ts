import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * WebP variants for a post hero image.
 *
 * `scripts/generate-webp-heroes.mjs` writes hero.webp (1200px) and hero-640.webp
 * next to each hero.png. The PNG stays as the <img> fallback and as the Open
 * Graph / JSON-LD image. Returns null (so callers render a plain <img>) when the
 * source is not a post hero PNG or the WebP files have not been generated.
 */
export function heroWebp(src: string): { large: string; small: string } | null {
  const match = src.match(/^(\/assets\/posts\/[^/]+\/)hero\.png$/);
  if (!match) return null;
  const dir = match[1];
  const large = `${dir}hero.webp`;
  const small = `${dir}hero-640.webp`;
  // Build runs from the repo root, where public/ lives.
  const exists = (p: string) => existsSync(join(process.cwd(), 'public', p));
  return exists(large) && exists(small) ? { large, small } : null;
}
