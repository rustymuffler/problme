import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/schema';

// Why description-only items: feed readers show the summary and link to the
// post. Rendering full MDX bodies would need extra dependencies (markdown
// renderer + HTML sanitizer), and MDX components do not render through a
// plain markdown pipeline, so full content is deliberately not included.
export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    // Atom namespace so the feed can declare its own URL (rel="self"), which
    // feed validators and some readers expect.
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      // One RSS <category> per topic: the content category first, then tags.
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: [
      '<language>en-us</language>',
      `<atom:link href="${new URL('/rss.xml', context.site!).href}" rel="self" type="application/rss+xml" />`,
    ].join(''),
  });
}
