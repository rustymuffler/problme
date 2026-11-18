import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

// <lastmod> for blog posts, from frontmatter (updatedDate, else date). Only posts
// get a lastmod: other pages have no reliable modified date, and an inaccurate
// lastmod is worse than none.
const POSTS_DIR = new URL('./src/content/posts/', import.meta.url);
const postLastmod = new Map();
for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const src = readFileSync(new URL(`${entry.name}/index.mdx`, POSTS_DIR), 'utf8');
  // Hardcoded regexes (no RegExp built from variables), one per frontmatter field.
  const updated = src.match(/^updatedDate:\s*"?([0-9-]+)"?\s*$/m)?.[1];
  const published = src.match(/^date:\s*"?([0-9-]+)"?\s*$/m)?.[1];
  const date = updated ?? published;
  if (date) postLastmod.set(`https://probl.me/blog/${entry.name}/`, new Date(date).toISOString());
}

export default defineConfig({
  site: 'https://probl.me',
  // One URL per page: every canonical, sitemap entry, JSON-LD url and internal
  // link ends in a trailing slash (GitHub Pages 301s the slashless form).
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    // Tag pages are noindex (thin, near-duplicate listings), so keep them out of the sitemap.
    sitemap({
      filter: (page) => !page.includes('/blog/tag/'),
      serialize: (item) => {
        const lastmod = postLastmod.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      // External links open in a new tab; internal links are untouched.
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
    shikiConfig: {
      theme: 'material-theme-palenight',
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
