import { getCollection } from 'astro:content';
import { SITE_URL } from '../lib/schema';

/**
 * llms.txt — a curated, markdown-formatted site summary for AI crawlers,
 * served at https://probl.me/llms.txt (spec: https://llmstxt.org).
 * Generated at build time from the posts collection, same pattern as rss.xml.
 */

// Keep each entry a valid one-line markdown link: escape square brackets in
// link text and collapse any whitespace runs (multi-line YAML descriptions).
const mdText = (text: string) => text.replace(/[[\]]/g, '\\$&').replace(/\s+/g, ' ').trim();

export async function GET() {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const postLines = posts
    .map((post) => {
      const slug = post.id.replace(/\.(md|mdx)$/, '');
      return `- [${mdText(post.data.title)}](${SITE_URL}/blog/${slug}/): ${mdText(post.data.description)}`;
    })
    .join('\n');

  const body = `# probl.me

> The personal blog of Richard Muffler, a cybersecurity and SaaS product manager building software in public. Two posts a week on product management craft, AI-assisted development, and the tech stack that runs the site. Every article is first-person and based on firsthand experience, including what did not work.

Content is licensed CC BY 4.0. Site code is MIT licensed.

## Posts

${postLines}

## Pages

- [About Richard Muffler](${SITE_URL}/about/): Author credentials, work history, and background
- [Blog index](${SITE_URL}/blog/): All posts by date and category
- [RSS feed](${SITE_URL}/rss.xml): Machine-readable feed of all posts
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
