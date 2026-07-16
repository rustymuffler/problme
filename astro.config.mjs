import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://probl.me',
  integrations: [mdx(), sitemap()],
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
