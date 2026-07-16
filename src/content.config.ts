import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/index.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['pm-craft', 'ai-development', 'tech-tools']),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    readTime: z.string(),
    heroImage: z.string().optional(),
    imageCredit: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { posts };
