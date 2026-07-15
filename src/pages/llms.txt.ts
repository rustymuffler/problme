import { getCollection } from 'astro:content';

/**
 * llms.txt — a curated, markdown-formatted site summary for AI crawlers,
 * served at https://probl.me/llms.txt (spec: https://llmstxt.org).
 * Generated at build time from the posts collection, same pattern as rss.xml.
 */
export async function GET() {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const postLines = posts
    .map((post) => {
      const slug = post.id.replace(/\.(md|mdx)$/, '');
      return `- [${post.data.title}](https://probl.me/blog/${slug}/): ${post.data.description}`;
    })
    .join('\n');

  const body = `# probl.me

> The personal blog of Richard Muffler, a cybersecurity and SaaS product manager building software in public. Two posts a week on product management craft, AI-assisted development, and the tech stack that runs the site. Every article is first-person and based on firsthand experience, including what did not work.

Content is licensed CC BY 4.0. Site code is MIT licensed.

## Posts

${postLines}

## Pages

- [About Richard Muffler](https://probl.me/about/): Author credentials, work history, and background
- [Blog index](https://probl.me/blog/): All posts by date and category
- [RSS feed](https://probl.me/rss.xml): Machine-readable feed of all posts
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
