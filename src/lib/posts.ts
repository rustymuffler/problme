import { getCollection } from 'astro:content';
import { isPublished } from './publish';

/**
 * All posts that should appear on the site right now, newest first.
 * Every page, feed and index must use this instead of calling
 * getCollection('posts') directly, so scheduled posts stay hidden until their
 * publish date (see src/lib/publish.ts).
 */
// One timestamp per build, so every page and feed agrees on what is published.
const now = new Date();

export async function getPublishedPosts() {
  const includeFuture =
    import.meta.env.DEV || process.env.INCLUDE_FUTURE_POSTS === 'true';
  return (await getCollection('posts'))
    .filter((post) => isPublished(post.data.date, now, includeFuture))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
