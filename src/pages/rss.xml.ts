import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_NAME } from '../lib/schema';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
